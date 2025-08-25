const { Notification, Event, User, UserPreference } = require('../models');
const firebase = require('./firebaseService');
const emailService = require('./emailService');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

class NotificationService {
  constructor() {
    this.retryQueue = new Map();
    this.io = null; // Will be set by server.js
  }

  setSocketIO(io) {
    this.io = io;
  }

  /**
   * 이벤트 생성 시 자동으로 알림 스케줄 생성
   * @param {Object} event - 이벤트 객체
   * @param {string} userId - 사용자 ID
   */
  async scheduleEventNotifications(event, userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: UserPreference, as: 'preferences' }]
      });

      if (!user || !user.preferences) {
        throw new Error('User or preferences not found');
      }

      const { notification_preferences } = user.preferences;
      
      // 알림이 비활성화된 경우 스킵
      if (!notification_preferences.email_notifications && 
          !notification_preferences.push_notifications) {
        return [];
      }

      const notifications = [];
      const eventStartTime = moment.tz(event.start_time, event.timezone);
      
      // 사전 알림 생성 (15분 전, 1시간 전 등)
      const advanceNotificationTimes = notification_preferences.advance_notification_times || [15, 60];
      
      for (const minutesBefore of advanceNotificationTimes) {
        const scheduledTime = eventStartTime.clone().subtract(minutesBefore, 'minutes');
        
        // 이미 지난 시간이면 스킵
        if (scheduledTime.isBefore(moment())) {
          continue;
        }

        // 조용한 시간 체크
        if (this.isQuietHours(scheduledTime, notification_preferences.quiet_hours)) {
          continue;
        }

        const notification = await Notification.create({
          user_id: userId,
          event_id: event.id,
          type: 'advance_reminder',
          title: `${event.title} 시작 ${minutesBefore}분 전`,
          message: `"${event.title}" 이벤트가 ${minutesBefore}분 후에 시작됩니다. 어떻게 하시겠어요?`,
          scheduled_time: scheduledTime.toDate(),
          notification_channels: this.getEnabledChannels(notification_preferences),
          metadata: {
            minutes_before: minutesBefore,
            allow_user_actions: true,
            actions: [
              { id: 'confirmed', label: '확인', description: '정시 알림을 받겠습니다' },
              { id: 'snooze', label: '10분 후', description: '10분 후에 다시 알려주세요' },
              { id: 'ready', label: '준비완료', description: '이미 준비됐으니 정시 알림은 취소해주세요' }
            ]
          }
        });

        notifications.push(notification);
      }

      // 정시 알림 생성 (이벤트 시작 시간)
      if (!this.isQuietHours(eventStartTime, notification_preferences.quiet_hours)) {
        const exactTimeNotification = await Notification.create({
          user_id: userId,
          event_id: event.id,
          type: 'event_start',
          title: `${event.title} 시작!`,
          message: `"${event.title}" 이벤트가 지금 시작됩니다!`,
          scheduled_time: eventStartTime.toDate(),
          notification_channels: this.getEnabledChannels(notification_preferences),
          metadata: {
            is_exact_time: true,
            can_be_cancelled_by_advance_action: true
          }
        });

        notifications.push(exactTimeNotification);
      }

      console.log(`✅ Created ${notifications.length} notifications for event: ${event.title}`);
      return notifications;

    } catch (error) {
      console.error('Error scheduling event notifications:', error);
      throw error;
    }
  }

  /**
   * 사전 알림에 대한 사용자 액션 처리 (핵심 혁신 기능!)
   * @param {Object} notificationData - 알림 데이터
   */
  async handleNotificationAck(notificationData) {
    try {
      const { notificationId, action, snoozeMinutes } = notificationData;
      
      const notification = await Notification.findByPk(notificationId, {
        include: [{ model: Event, as: 'event' }]
      });

      if (!notification || !notification.event) {
        throw new Error('Notification or event not found');
      }

      // 사전 알림이 아니면 단순 확인만 처리
      if (notification.type !== 'advance_reminder') {
        await notification.markAsAcknowledged(action);
        return;
      }

      // 사용자 액션에 따른 처리
      switch (action) {
        case 'confirmed':
          // 정시 알림 유지, 사전 알림만 확인 처리
          await notification.markAsAcknowledged('confirmed');
          console.log(`✅ User confirmed advance reminder for event: ${notification.event.title}`);
          break;

        case 'snooze':
          // 스누즈 알림 생성 (기본 10분 후)
          const snoozeTime = moment().add(snoozeMinutes || 10, 'minutes');
          
          await Notification.create({
            user_id: notification.user_id,
            event_id: notification.event_id,
            type: 'snooze_reminder',
            title: `${notification.event.title} 다시 알림`,
            message: `"${notification.event.title}" 이벤트가 곧 시작됩니다!`,
            scheduled_time: snoozeTime.toDate(),
            notification_channels: notification.notification_channels,
            metadata: {
              original_notification_id: notificationId,
              snooze_count: (notification.metadata?.snooze_count || 0) + 1
            }
          });

          await notification.markAsAcknowledged('snooze');
          console.log(`⏰ Created snooze reminder for event: ${notification.event.title}`);
          break;

        case 'ready':
          // 혁신적 기능: 정시 알림 자동 취소!
          await this.cancelEventStartNotification(notification.event_id, notification.user_id);
          await notification.markAsAcknowledged('ready');
          console.log(`🎯 User is ready - cancelled exact time notification for: ${notification.event.title}`);
          break;

        default:
          await notification.markAsAcknowledged('dismissed');
      }

      // 실시간으로 클라이언트에 응답 전송
      if (this.io) {
        this.io.to(`user_${notification.user_id}`).emit('notification_response', {
          notificationId,
          action,
          message: this.getActionResponseMessage(action, notification.event.title)
        });
      }

    } catch (error) {
      console.error('Error handling notification acknowledgment:', error);
      throw error;
    }
  }

  /**
   * 정시 알림 취소 (사용자가 "준비완료"를 선택했을 때)
   */
  async cancelEventStartNotification(eventId, userId) {
    try {
      const exactTimeNotification = await Notification.findOne({
        where: {
          event_id: eventId,
          user_id: userId,
          type: 'event_start',
          status: 'pending'
        }
      });

      if (exactTimeNotification) {
        exactTimeNotification.status = 'cancelled';
        await exactTimeNotification.save();
        console.log(`❌ Cancelled exact time notification for event ID: ${eventId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error cancelling event start notification:', error);
      throw error;
    }
  }

  /**
   * 보낼 알림 가져오기 및 전송
   */
  async processPendingNotifications() {
    try {
      const pendingNotifications = await Notification.getPendingNotifications();
      
      console.log(`📬 Processing ${pendingNotifications.length} pending notifications`);

      for (const notification of pendingNotifications) {
        await this.sendNotification(notification);
      }

      return pendingNotifications.length;
    } catch (error) {
      console.error('Error processing pending notifications:', error);
      throw error;
    }
  }

  /**
   * 개별 알림 전송
   */
  async sendNotification(notification) {
    try {
      const results = {};

      // 푸시 알림 전송
      if (notification.notification_channels.includes('push')) {
        try {
          const pushResult = await firebase.sendPushNotification(
            notification.user.id,
            notification.title,
            notification.message,
            {
              notificationId: notification.id,
              eventId: notification.event_id,
              type: notification.type,
              allowActions: notification.metadata?.allow_user_actions || false,
              actions: notification.metadata?.actions || []
            }
          );
          results.push = pushResult;
        } catch (error) {
          console.error('Push notification failed:', error);
          results.push = { success: false, error: error.message };
        }
      }

      // 이메일 알림 전송
      if (notification.notification_channels.includes('email')) {
        try {
          const emailResult = await emailService.sendEventNotification(
            notification.user,
            notification.event,
            notification
          );
          results.email = emailResult;
        } catch (error) {
          console.error('Email notification failed:', error);
          results.email = { success: false, error: error.message };
        }
      }

      // 웹소켓으로 실시간 알림 전송
      if (this.io) {
        this.io.to(`user_${notification.user_id}`).emit('real_time_notification', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          eventId: notification.event_id,
          allowActions: notification.metadata?.allow_user_actions || false,
          actions: notification.metadata?.actions || [],
          timestamp: new Date()
        });
        results.socket = { success: true };
      }

      // 전송 결과 저장
      notification.delivery_receipt = results;
      
      // 성공/실패 여부 결정
      const hasSuccessfulDelivery = Object.values(results).some(result => result.success);
      
      if (hasSuccessfulDelivery) {
        await notification.markAsSent();
        console.log(`✅ Notification sent successfully: ${notification.title}`);
      } else {
        await notification.markAsFailed('All delivery methods failed');
        console.log(`❌ Notification failed: ${notification.title}`);
      }

    } catch (error) {
      console.error('Error sending notification:', error);
      await notification.markAsFailed(error.message);
    }
  }

  /**
   * 알림 통계 조회
   */
  async getNotificationStats(userId, days = 30) {
    try {
      const startDate = moment().subtract(days, 'days').toDate();
      
      const stats = await Notification.findAll({
        where: {
          user_id: userId,
          created_at: { [Op.gte]: startDate }
        },
        attributes: [
          'status',
          'type',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status', 'type'],
        raw: true
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }

  /**
   * 유틸리티 메소드들
   */
  
  isQuietHours(time, quietHours) {
    if (!quietHours || !quietHours.enabled) return false;
    
    const timeStr = time.format('HH:mm');
    const start = quietHours.start_time;
    const end = quietHours.end_time;
    
    if (start < end) {
      return timeStr >= start && timeStr <= end;
    } else {
      // 자정을 넘나드는 경우 (예: 22:00 ~ 08:00)
      return timeStr >= start || timeStr <= end;
    }
  }

  getEnabledChannels(preferences) {
    const channels = [];
    if (preferences.push_notifications) channels.push('push');
    if (preferences.email_notifications) channels.push('email');
    if (preferences.sms_notifications) channels.push('sms');
    return channels;
  }

  getActionResponseMessage(action, eventTitle) {
    const messages = {
      confirmed: `"${eventTitle}" 정시 알림을 유지합니다.`,
      snooze: `"${eventTitle}" 10분 후에 다시 알려드리겠습니다.`,
      ready: `"${eventTitle}" 준비가 완료되어 정시 알림을 취소했습니다.`,
      dismissed: `"${eventTitle}" 알림을 확인했습니다.`
    };
    return messages[action] || '알림을 처리했습니다.';
  }

  /**
   * 그룹 이벤트 알림 생성
   */
  async scheduleGroupEventNotifications(event, groupMemberIds) {
    try {
      const notifications = [];
      
      for (const userId of groupMemberIds) {
        const userNotifications = await this.scheduleEventNotifications(event, userId);
        notifications.push(...userNotifications);
      }

      return notifications;
    } catch (error) {
      console.error('Error scheduling group event notifications:', error);
      throw error;
    }
  }

  /**
   * 이벤트 취소 알림
   */
  async sendEventCancellationNotifications(event, participantIds) {
    try {
      const notifications = [];

      for (const userId of participantIds) {
        // 해당 이벤트의 기존 pending 알림들 취소
        await Notification.update(
          { status: 'cancelled' },
          {
            where: {
              event_id: event.id,
              user_id: userId,
              status: 'pending'
            }
          }
        );

        // 취소 알림 즉시 전송
        const cancellationNotification = await Notification.create({
          user_id: userId,
          event_id: event.id,
          type: 'event_cancellation',
          title: `${event.title} 이벤트 취소`,
          message: `"${event.title}" 이벤트가 취소되었습니다.`,
          scheduled_time: new Date(),
          notification_channels: ['push', 'email'],
          priority: 'high'
        });

        await this.sendNotification(cancellationNotification);
        notifications.push(cancellationNotification);
      }

      return notifications;
    } catch (error) {
      console.error('Error sending event cancellation notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
