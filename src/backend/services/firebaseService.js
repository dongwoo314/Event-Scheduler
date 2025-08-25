const admin = require('firebase-admin');

class FirebaseService {
  constructor() {
    this.initialized = false;
    this.deviceTokens = new Map(); // userId -> deviceToken mapping
  }

  /**
   * Firebase Admin SDK 초기화
   */
  async initialize() {
    try {
      if (this.initialized) return;

      // Firebase 서비스 계정 키 설정
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }

      this.initialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw error;
    }
  }

  /**
   * 디바이스 토큰 등록
   */
  async registerDeviceToken(userId, deviceToken) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // 토큰 유효성 검증
      await admin.messaging().send({
        token: deviceToken,
        data: { test: 'validation' }
      }, true); // dry run

      this.deviceTokens.set(userId, deviceToken);
      console.log(`✅ Device token registered for user: ${userId}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error registering device token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 푸시 알림 전송
   */
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const deviceToken = this.deviceTokens.get(userId);
      if (!deviceToken) {
        throw new Error(`No device token found for user: ${userId}`);
      }

      const message = {
        token: deviceToken,
        notification: {
          title,
          body
        },
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          userId: userId.toString()
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_notification',
            color: '#3B82F6',
            sound: 'default',
            channelId: 'event_reminders'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              category: data.allowActions ? 'EVENT_REMINDER_ACTIONS' : 'EVENT_REMINDER'
            }
          }
        },
        webpush: {
          headers: {
            'TTL': '86400' // 24 hours
          },
          notification: {
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            requireInteraction: data.allowActions || false,
            actions: data.actions ? data.actions.map(action => ({
              action: action.id,
              title: action.label,
              icon: `/icons/${action.id}-icon.png`
            })) : undefined
          }
        }
      };

      const response = await admin.messaging().send(message);
      
      console.log(`✅ Push notification sent successfully: ${response}`);
      return { success: true, messageId: response };

    } catch (error) {
      console.error('Error sending push notification:', error);
      
      // 토큰이 무효한 경우 제거
      if (error.code === 'messaging/registration-token-not-registered' ||
          error.code === 'messaging/invalid-registration-token') {
        this.deviceTokens.delete(userId);
        console.log(`🗑️ Removed invalid device token for user: ${userId}`);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * 다중 푸시 알림 전송
   */
  async sendMulticastNotification(userIds, title, body, data = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tokens = userIds
        .map(userId => this.deviceTokens.get(userId))
        .filter(token => token);

      if (tokens.length === 0) {
        throw new Error('No valid device tokens found');
      }

      const message = {
        tokens,
        notification: {
          title,
          body
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_notification',
            color: '#3B82F6',
            sound: 'default',
            channelId: 'event_reminders'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().sendMulticast(message);
      
      // 실패한 토큰들 제거
      if (response.failureCount > 0) {
        response.responses.forEach((result, index) => {
          if (!result.success) {
            const failedToken = tokens[index];
            const userId = Array.from(this.deviceTokens.entries())
              .find(([, token]) => token === failedToken)?.[0];
            
            if (userId && (
              result.error?.code === 'messaging/registration-token-not-registered' ||
              result.error?.code === 'messaging/invalid-registration-token'
            )) {
              this.deviceTokens.delete(userId);
              console.log(`🗑️ Removed invalid device token for user: ${userId}`);
            }
          }
        });
      }

      console.log(`✅ Multicast notification sent. Success: ${response.successCount}, Failed: ${response.failureCount}`);
      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };

    } catch (error) {
      console.error('Error sending multicast notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 토픽 구독
   */
  async subscribeToTopic(userIds, topic) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tokens = userIds
        .map(userId => this.deviceTokens.get(userId))
        .filter(token => token);

      if (tokens.length === 0) {
        throw new Error('No valid device tokens found');
      }

      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      
      console.log(`✅ Subscribed ${response.successCount} devices to topic: ${topic}`);
      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount
      };

    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 토픽 구독 해제
   */
  async unsubscribeFromTopic(userIds, topic) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tokens = userIds
        .map(userId => this.deviceTokens.get(userId))
        .filter(token => token);

      if (tokens.length === 0) {
        throw new Error('No valid device tokens found');
      }

      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      
      console.log(`✅ Unsubscribed ${response.successCount} devices from topic: ${topic}`);
      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount
      };

    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 토픽으로 알림 전송
   */
  async sendTopicNotification(topic, title, body, data = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const message = {
        topic,
        notification: {
          title,
          body
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_notification',
            color: '#3B82F6',
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      
      console.log(`✅ Topic notification sent successfully: ${response}`);
      return { success: true, messageId: response };

    } catch (error) {
      console.error('Error sending topic notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 디바이스 토큰 제거
   */
  removeDeviceToken(userId) {
    this.deviceTokens.delete(userId);
    console.log(`🗑️ Device token removed for user: ${userId}`);
  }

  /**
   * 등록된 디바이스 수 조회
   */
  getRegisteredDeviceCount() {
    return this.deviceTokens.size;
  }
}

module.exports = new FirebaseService();
