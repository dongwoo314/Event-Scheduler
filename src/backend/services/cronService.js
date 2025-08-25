const cron = require('node-cron');
const notificationService = require('./notificationService');

class CronService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * 모든 크론 작업 시작
   */
  startAllJobs() {
    if (this.isRunning) {
      console.log('⚠️  Cron jobs are already running');
      return;
    }

    try {
      // 매분마다 보낼 알림 확인 및 전송
      this.scheduleNotificationProcessor();
      
      // 매 5분마다 실패한 알림 재시도
      this.scheduleNotificationRetry();
      
      // 매일 자정에 오래된 알림 정리
      this.scheduleNotificationCleanup();
      
      // 매 30분마다 시스템 상태 체크
      this.scheduleHealthCheck();

      this.isRunning = true;
      console.log('✅ All cron jobs started successfully');
    } catch (error) {
      console.error('❌ Error starting cron jobs:', error);
      throw error;
    }
  }

  /**
   * 모든 크론 작업 중지
   */
  stopAllJobs() {
    try {
      this.jobs.forEach((job, name) => {
        job.stop();
        console.log(`🛑 Stopped cron job: ${name}`);
      });
      
      this.jobs.clear();
      this.isRunning = false;
      console.log('✅ All cron jobs stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping cron jobs:', error);
      throw error;
    }
  }

  /**
   * 알림 처리기 - 매분마다 실행
   */
  scheduleNotificationProcessor() {
    const job = cron.schedule('* * * * *', async () => {
      try {
        console.log(`🔄 [${new Date().toISOString()}] Processing pending notifications...`);
        
        const processedCount = await notificationService.processPendingNotifications();
        
        if (processedCount > 0) {
          console.log(`✅ Processed ${processedCount} notifications`);
        }
      } catch (error) {
        console.error('❌ Error in notification processor:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    job.start();
    this.jobs.set('notificationProcessor', job);
    console.log('📬 Notification processor scheduled (every minute)');
  }

  /**
   * 실패한 알림 재시도 - 매 5분마다 실행
   */
  scheduleNotificationRetry() {
    const job = cron.schedule('*/5 * * * *', async () => {
      try {
        console.log(`🔄 [${new Date().toISOString()}] Retrying failed notifications...`);
        
        const { Notification } = require('../models');
        const { Op } = require('sequelize');
        
        // 재시도 가능한 실패한 알림들 조회
        const failedNotifications = await Notification.findAll({
          where: {
            status: 'failed',
            retry_count: {
              [Op.lt]: require('sequelize').col('max_retries')
            },
            failed_at: {
              [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) // 1시간 이내 실패
            }
          },
          include: [
            { model: require('../models').User, as: 'user' },
            { model: require('../models').Event, as: 'event' }
          ],
          limit: 50 // 한 번에 최대 50개만 재시도
        });

        let retryCount = 0;
        for (const notification of failedNotifications) {
          try {
            // 재시도 카운트 증가
            notification.retry_count += 1;
            notification.status = 'pending';
            await notification.save();

            // 알림 재전송
            await notificationService.sendNotification(notification);
            retryCount++;
            
          } catch (retryError) {
            console.error(`Failed to retry notification ${notification.id}:`, retryError);
            await notification.markAsFailed(retryError.message);
          }
        }

        if (retryCount > 0) {
          console.log(`🔄 Retried ${retryCount} failed notifications`);
        }
      } catch (error) {
        console.error('❌ Error in notification retry:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    job.start();
    this.jobs.set('notificationRetry', job);
    console.log('🔄 Notification retry scheduled (every 5 minutes)');
  }

  /**
   * 알림 정리 - 매일 자정 실행
   */
  scheduleNotificationCleanup() {
    const job = cron.schedule('0 0 * * *', async () => {
      try {
        console.log(`🧹 [${new Date().toISOString()}] Cleaning up old notifications...`);
        
        const { Notification } = require('../models');
        const { Op } = require('sequelize');
        
        // 30일 이전의 완료된/실패한 알림 삭제
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const deletedCount = await Notification.destroy({
          where: {
            status: {
              [Op.in]: ['sent', 'acknowledged', 'failed', 'cancelled']
            },
            created_at: {
              [Op.lt]: thirtyDaysAgo
            }
          }
        });

        console.log(`🗑️ Deleted ${deletedCount} old notifications`);

        // 통계 정보 로깅
        const stats = await this.getNotificationStats();
        console.log('📊 Current notification stats:', stats);

      } catch (error) {
        console.error('❌ Error in notification cleanup:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    job.start();
    this.jobs.set('notificationCleanup', job);
    console.log('🧹 Notification cleanup scheduled (daily at midnight)');
  }

  /**
   * 시스템 상태 체크 - 매 30분마다 실행
   */
  scheduleHealthCheck() {
    const job = cron.schedule('*/30 * * * *', async () => {
      try {
        console.log(`💗 [${new Date().toISOString()}] System health check...`);
        
        const { sequelize } = require('../models');
        
        // 데이터베이스 연결 체크
        await sequelize.authenticate();
        
        // 메모리 사용량 체크
        const memUsage = process.memoryUsage();
        const memUsageMB = {
          rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
          external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100
        };

        // CPU 사용량 체크 (간단한 방식)
        const cpuUsage = process.cpuUsage();
        
        console.log('💻 System metrics:', {
          memory: memUsageMB,
          uptime: Math.round(process.uptime()),
          pid: process.pid,
          nodeVersion: process.version
        });

        // 메모리 사용량이 500MB 초과시 경고
        if (memUsageMB.heapUsed > 500) {
          console.warn(`⚠️ High memory usage detected: ${memUsageMB.heapUsed}MB`);
        }

        // 활성 크론 작업 수 체크
        const activeJobsCount = Array.from(this.jobs.values()).filter(job => job.running).length;
        console.log(`⚙️ Active cron jobs: ${activeJobsCount}/${this.jobs.size}`);

      } catch (error) {
        console.error('❌ System health check failed:', error);
        
        // 중요한 시스템 오류는 별도 알림을 보낼 수 있음
        // await this.sendSystemAlert(error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    job.start();
    this.jobs.set('healthCheck', job);
    console.log('💗 Health check scheduled (every 30 minutes)');
  }

  /**
   * 반복 이벤트 처리 - 매일 오전 6시 실행
   */
  scheduleRecurringEventProcessor() {
    const job = cron.schedule('0 6 * * *', async () => {
      try {
        console.log(`🔄 [${new Date().toISOString()}] Processing recurring events...`);
        
        const { Event } = require('../models');
        const moment = require('moment-timezone');
        
        // 오늘 생성되어야 할 반복 이벤트들 조회
        const recurringEvents = await Event.findAll({
          where: {
            is_recurring: true,
            status: 'published'
          }
        });

        let createdCount = 0;
        
        for (const event of recurringEvents) {
          try {
            const nextOccurrences = this.calculateNextOccurrences(event);
            
            for (const occurrence of nextOccurrences) {
              // 이미 생성된 이벤트가 있는지 확인
              const existingEvent = await Event.findOne({
                where: {
                  title: event.title,
                  start_time: occurrence.start_time,
                  user_id: event.user_id
                }
              });

              if (!existingEvent) {
                // 새 이벤트 인스턴스 생성
                const newEvent = await Event.create({
                  ...event.dataValues,
                  id: undefined, // 새 ID 생성
                  start_time: occurrence.start_time,
                  end_time: occurrence.end_time,
                  is_recurring: false, // 인스턴스는 반복 이벤트가 아님
                  metadata: {
                    ...event.metadata,
                    parent_recurring_event_id: event.id,
                    occurrence_date: occurrence.start_time
                  }
                });

                // 알림 스케줄링
                await notificationService.scheduleEventNotifications(newEvent, event.user_id);
                createdCount++;
              }
            }
          } catch (eventError) {
            console.error(`Error processing recurring event ${event.id}:`, eventError);
          }
        }

        if (createdCount > 0) {
          console.log(`📅 Created ${createdCount} recurring event instances`);
        }

      } catch (error) {
        console.error('❌ Error in recurring event processor:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    job.start();
    this.jobs.set('recurringEventProcessor', job);
    console.log('📅 Recurring event processor scheduled (daily at 6 AM)');
  }

  /**
   * 유틸리티 메소드들
   */

  async getNotificationStats() {
    try {
      const { Notification } = require('../models');
      const { Op } = require('sequelize');
      
      const stats = await Notification.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      return stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {};
    }
  }

  calculateNextOccurrences(event) {
    const moment = require('moment-timezone');
    const occurrences = [];
    const pattern = event.recurring_pattern;
    
    if (!pattern) return occurrences;

    const today = moment.tz(event.timezone).startOf('day');
    const eventStart = moment.tz(event.start_time, event.timezone);
    const eventEnd = event.end_time ? moment.tz(event.end_time, event.timezone) : null;
    const duration = eventEnd ? eventEnd.diff(eventStart) : 0;

    // 향후 7일간의 발생 계산
    for (let i = 0; i < 7; i++) {
      const checkDate = today.clone().add(i, 'days');
      
      if (this.shouldCreateOccurrence(checkDate, pattern, eventStart)) {
        const occurrenceStart = checkDate.clone()
          .hour(eventStart.hour())
          .minute(eventStart.minute())
          .second(eventStart.second());
          
        const occurrenceEnd = duration > 0 ? 
          occurrenceStart.clone().add(duration, 'milliseconds') : null;

        occurrences.push({
          start_time: occurrenceStart.toDate(),
          end_time: occurrenceEnd ? occurrenceEnd.toDate() : null
        });
      }
    }

    return occurrences;
  }

  shouldCreateOccurrence(date, pattern, originalStart) {
    const moment = require('moment-timezone');
    
    switch (pattern.type) {
      case 'daily':
        return pattern.interval ? 
          date.diff(moment(originalStart).startOf('day'), 'days') % pattern.interval === 0 : 
          true;
          
      case 'weekly':
        const weekDay = date.day(); // 0=Sunday, 1=Monday, etc.
        return pattern.days_of_week ? pattern.days_of_week.includes(weekDay) : false;
        
      case 'monthly':
        const dayOfMonth = date.date();
        return pattern.day_of_month ? pattern.day_of_month === dayOfMonth : false;
        
      default:
        return false;
    }
  }

  /**
   * 특정 크론 작업 상태 조회
   */
  getJobStatus(jobName) {
    const job = this.jobs.get(jobName);
    return job ? {
      name: jobName,
      running: job.running,
      scheduled: job.scheduled
    } : null;
  }

  /**
   * 모든 크론 작업 상태 조회
   */
  getAllJobsStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }

  /**
   * 시스템 알림 전송 (관리자용)
   */
  async sendSystemAlert(error) {
    try {
      // 여기서 관리자에게 시스템 오류 알림을 보낼 수 있음
      // 예: Slack, Discord, 이메일 등
      console.error('🚨 System Alert:', {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      });
    } catch (alertError) {
      console.error('Failed to send system alert:', alertError);
    }
  }
}

module.exports = new CronService();
