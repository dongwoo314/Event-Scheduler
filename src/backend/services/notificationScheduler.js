const cron = require('node-cron');
const { Event, User, UserPreference, Group, GroupMember, GroupEvent } = require('../models');
const { Op } = require('sequelize');
const emailService = require('./emailService');

class NotificationScheduler {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
    this.sentNotifications = new Set(); // 중복 알림 방지
  }

  /**
   * 스케줄러 시작
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Notification scheduler is already running');
      return;
    }

    console.log('🚀 Starting notification scheduler...');

    // 매 분마다 이벤트 알림 확인
    const eventNotificationTask = cron.schedule('* * * * *', async () => {
      await this.checkUpcomingEvents();
    });

    // 매 시간마다 중복 알림 방지 캐시 정리
    const cleanupTask = cron.schedule('0 * * * *', () => {
      this.sentNotifications.clear();
      console.log('🧹 Notification cache cleared');
    });

    this.tasks.push(eventNotificationTask, cleanupTask);
    this.isRunning = true;

    console.log('✅ Notification scheduler started');
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Notification scheduler is not running');
      return;
    }

    console.log('🛑 Stopping notification scheduler...');

    this.tasks.forEach(task => task.stop());
    this.tasks = [];
    this.isRunning = false;

    console.log('✅ Notification scheduler stopped');
  }

  /**
   * 다가오는 이벤트 확인 및 알림 발송
   */
  async checkUpcomingEvents() {
    try {
      const now = new Date();
      
      // 15분 후, 1시간 후, 1일 후 시간 계산
      const notifications = [
        { minutes: 15, label: '15분' },
        { minutes: 60, label: '1시간' },
        { minutes: 1440, label: '1일' }
      ];

      for (const notification of notifications) {
        const targetTime = new Date(now.getTime() + notification.minutes * 60000);
        const startWindow = new Date(targetTime.getTime() - 30000); // 30초 전
        const endWindow = new Date(targetTime.getTime() + 30000); // 30초 후

        // 개인 이벤트 찾기
        await this.processPersonalEvents(startWindow, endWindow, notification.minutes);

        // 그룹 이벤트 찾기
        await this.processGroupEvents(startWindow, endWindow, notification.minutes);
      }
    } catch (error) {
      console.error('❌ Error checking upcoming events:', error);
    }
  }

  /**
   * 개인 이벤트 처리
   */
  async processPersonalEvents(startWindow, endWindow, minutesBefore) {
    try {
      const upcomingEvents = await Event.findAll({
        where: {
          start_time: {
            [Op.between]: [startWindow, endWindow]
          },
          status: 'published',
          group_id: null // 개인 이벤트만
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
            include: [
              {
                model: UserPreference,
                as: 'preferences',
                attributes: ['notification_settings']
              }
            ]
          }
        ]
      });

      for (const event of upcomingEvents) {
        const notificationKey = `event-${event.id}-${minutesBefore}`;
        
        // 이미 발송된 알림인지 확인
        if (this.sentNotifications.has(notificationKey)) {
          continue;
        }

        const user = event.user;
        if (!user) continue;

        // 사용자의 알림 설정 확인
        const notificationSettings = user.preferences?.notification_settings || {};
        if (notificationSettings.email_notifications !== false) {
          try {
            await emailService.sendEventNotification(user, event, minutesBefore);
            this.sentNotifications.add(notificationKey);
            console.log(`📧 Event notification sent to ${user.email} for event: ${event.title}`);
          } catch (error) {
            console.error(`❌ Failed to send notification to ${user.email}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error processing personal events:', error);
    }
  }

  /**
   * 그룹 이벤트 처리
   */
  async processGroupEvents(startWindow, endWindow, minutesBefore) {
    try {
      const upcomingGroupEvents = await GroupEvent.findAll({
        where: {
          start_time: {
            [Op.between]: [startWindow, endWindow]
          }
        },
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'description'],
            include: [
              {
                model: GroupMember,
                as: 'members',
                where: { status: 'active' },
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'first_name', 'last_name'],
                    include: [
                      {
                        model: UserPreference,
                        as: 'preferences',
                        attributes: ['notification_settings']
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      for (const groupEvent of upcomingGroupEvents) {
        if (!groupEvent.group || !groupEvent.group.members) continue;

        for (const member of groupEvent.group.members) {
          const notificationKey = `group-event-${groupEvent.id}-${member.user.id}-${minutesBefore}`;
          
          // 이미 발송된 알림인지 확인
          if (this.sentNotifications.has(notificationKey)) {
            continue;
          }

          const user = member.user;
          if (!user) continue;

          // 사용자의 알림 설정 확인
          const notificationSettings = user.preferences?.notification_settings || {};
          if (notificationSettings.email_notifications !== false) {
            try {
              await emailService.sendEventNotification(user, groupEvent, minutesBefore);
              this.sentNotifications.add(notificationKey);
              console.log(`📧 Group event notification sent to ${user.email} for event: ${groupEvent.title}`);
            } catch (error) {
              console.error(`❌ Failed to send notification to ${user.email}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error processing group events:', error);
    }
  }

  /**
   * 그룹 초대 알림 발송
   */
  async sendGroupInvitationNotification(inviteeId, inviterId, groupId) {
    try {
      const invitee = await User.findByPk(inviteeId, {
        attributes: ['id', 'email', 'first_name', 'last_name'],
        include: [
          {
            model: UserPreference,
            as: 'preferences',
            attributes: ['notification_settings']
          }
        ]
      });

      const inviter = await User.findByPk(inviterId, {
        attributes: ['id', 'first_name', 'last_name']
      });

      const group = await Group.findByPk(groupId, {
        attributes: ['id', 'name', 'description']
      });

      if (!invitee || !inviter || !group) {
        console.error('❌ Invalid data for group invitation notification');
        return;
      }

      // 사용자의 알림 설정 확인
      const notificationSettings = invitee.preferences?.notification_settings || {};
      if (notificationSettings.email_notifications !== false) {
        await emailService.sendGroupInvitation(invitee, inviter, group);
        console.log(`📧 Group invitation sent to ${invitee.email} for group: ${group.name}`);
      }
    } catch (error) {
      console.error('❌ Error sending group invitation:', error);
    }
  }

  /**
   * 새 그룹 이벤트 생성 알림
   */
  async sendNewGroupEventNotification(groupEventId, creatorId) {
    try {
      const groupEvent = await GroupEvent.findByPk(groupEventId, {
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'description'],
            include: [
              {
                model: GroupMember,
                as: 'members',
                where: { 
                  status: 'active',
                  user_id: { [Op.ne]: creatorId } // 생성자 제외
                },
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'first_name', 'last_name'],
                    include: [
                      {
                        model: UserPreference,
                        as: 'preferences',
                        attributes: ['notification_settings']
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!groupEvent || !groupEvent.group || !groupEvent.group.members) {
        console.error('❌ Invalid data for group event notification');
        return;
      }

      for (const member of groupEvent.group.members) {
        const user = member.user;
        if (!user) continue;

        // 사용자의 알림 설정 확인
        const notificationSettings = user.preferences?.notification_settings || {};
        if (notificationSettings.email_notifications !== false) {
          try {
            await emailService.sendGroupEventNotification(user, groupEvent, groupEvent.group);
            console.log(`📧 New group event notification sent to ${user.email}`);
          } catch (error) {
            console.error(`❌ Failed to send notification to ${user.email}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error sending new group event notification:', error);
    }
  }

  /**
   * 그룹 이벤트 수정 알림
   */
  async sendGroupEventUpdateNotification(groupEventId, updaterId) {
    try {
      const groupEvent = await GroupEvent.findByPk(groupEventId, {
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'description'],
            include: [
              {
                model: GroupMember,
                as: 'members',
                where: { 
                  status: 'active',
                  user_id: { [Op.ne]: updaterId } // 수정자 제외
                },
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'first_name', 'last_name'],
                    include: [
                      {
                        model: UserPreference,
                        as: 'preferences',
                        attributes: ['notification_settings']
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!groupEvent || !groupEvent.group || !groupEvent.group.members) {
        console.error('❌ Invalid data for group event update notification');
        return;
      }

      for (const member of groupEvent.group.members) {
        const user = member.user;
        if (!user) continue;

        // 사용자의 알림 설정 확인
        const notificationSettings = user.preferences?.notification_settings || {};
        if (notificationSettings.email_notifications !== false) {
          try {
            await emailService.sendGroupEventUpdateNotification(user, groupEvent, groupEvent.group);
            console.log(`📧 Group event update notification sent to ${user.email}`);
          } catch (error) {
            console.error(`❌ Failed to send notification to ${user.email}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error sending group event update notification:', error);
    }
  }
}

// 싱글톤 인스턴스
const notificationScheduler = new NotificationScheduler();

module.exports = notificationScheduler;
