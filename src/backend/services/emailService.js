const nodemailer = require('nodemailer');
const moment = require('moment-timezone');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * 이메일 전송기 초기화
   */
  async initialize() {
    try {
      if (this.initialized) return;

      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // 연결 테스트
      await this.transporter.verify();
      
      this.initialized = true;
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      throw error;
    }
  }

  /**
   * 이벤트 알림 이메일 전송
   */
  async sendEventNotification(user, event, notification) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const subject = this.getEmailSubject(notification.type, event.title);
      const htmlContent = this.generateEventNotificationHTML(user, event, notification);
      const textContent = this.generateEventNotificationText(user, event, notification);

      const mailOptions = {
        from: {
          name: 'Event Scheduler',
          address: process.env.EMAIL_USER
        },
        to: user.email,
        subject,
        text: textContent,
        html: htmlContent,
        headers: {
          'X-Priority': this.getPriority(notification.priority),
          'X-Event-ID': event.id,
          'X-Notification-ID': notification.id
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Event notification email sent to: ${user.email}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Error sending event notification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 사용자 환영 이메일
   */
  async sendWelcomeEmail(user) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const subject = `Event Scheduler에 오신 것을 환영합니다, ${user.first_name}님!`;
      const htmlContent = this.generateWelcomeHTML(user);
      const textContent = this.generateWelcomeText(user);

      const mailOptions = {
        from: {
          name: 'Event Scheduler',
          address: process.env.EMAIL_USER
        },
        to: user.email,
        subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Welcome email sent to: ${user.email}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 비밀번호 재설정 이메일
   */
  async sendPasswordResetEmail(user, resetToken) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const subject = '비밀번호 재설정 요청';
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const htmlContent = this.generatePasswordResetHTML(user, resetUrl);
      const textContent = this.generatePasswordResetText(user, resetUrl);

      const mailOptions = {
        from: {
          name: 'Event Scheduler',
          address: process.env.EMAIL_USER
        },
        to: user.email,
        subject,
        text: textContent,
        html: htmlContent,
        headers: {
          'X-Priority': '1' // High priority
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Password reset email sent to: ${user.email}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 이메일 인증 메일
   */
  async sendEmailVerification(user, verificationToken) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const subject = '이메일 주소 인증';
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const htmlContent = this.generateEmailVerificationHTML(user, verificationUrl);
      const textContent = this.generateEmailVerificationText(user, verificationUrl);

      const mailOptions = {
        from: {
          name: 'Event Scheduler',
          address: process.env.EMAIL_USER
        },
        to: user.email,
        subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email verification sent to: ${user.email}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Error sending email verification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * HTML 템플릿 생성 메소드들
   */

  generateEventNotificationHTML(user, event, notification) {
    const eventTime = moment.tz(event.start_time, event.timezone);
    const formattedDate = eventTime.format('YYYY년 MM월 DD일 (dddd)');
    const formattedTime = eventTime.format('HH:mm');
    
    const actionButtons = notification.metadata?.allow_user_actions ? `
      <div style="text-align: center; margin: 30px 0;">
        <h3 style="color: #374151; margin-bottom: 20px;">어떻게 하시겠어요?</h3>
        <div style="display: inline-block;">
          <a href="${process.env.FRONTEND_URL}/notifications/${notification.id}/action?type=confirmed" 
             style="display: inline-block; margin: 0 10px; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            ✓ 확인
          </a>
          <a href="${process.env.FRONTEND_URL}/notifications/${notification.id}/action?type=snooze" 
             style="display: inline-block; margin: 0 10px; padding: 12px 24px; background-color: #F59E0B; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            ⏰ 10분 후
          </a>
          <a href="${process.env.FRONTEND_URL}/notifications/${notification.id}/action?type=ready" 
             style="display: inline-block; margin: 0 10px; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            🎯 준비완료
          </a>
        </div>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Scheduler 알림</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Event Scheduler</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">스마트 이벤트 알림</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1F2937; margin-top: 0; font-size: 24px;">${notification.title}</h2>
          
          <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0; font-size: 20px;">${event.title}</h3>
            <p style="color: #6B7280; margin: 10px 0;"><strong>📅 날짜:</strong> ${formattedDate}</p>
            <p style="color: #6B7280; margin: 10px 0;"><strong>🕒 시간:</strong> ${formattedTime}</p>
            ${event.location ? `<p style="color: #6B7280; margin: 10px 0;"><strong>📍 장소:</strong> ${event.location}</p>` : ''}
            ${event.description ? `<p style="color: #6B7280; margin: 15px 0 0 0;">${event.description}</p>` : ''}
          </div>

          <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1E40AF;">${notification.message}</p>
          </div>

          ${actionButtons}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/events/${event.id}" 
               style="display: inline-block; padding: 14px 28px; background-color: #6366F1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              이벤트 상세보기
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6B7280; font-size: 14px;">
          <p>이 이메일은 Event Scheduler에서 자동으로 발송된 알림입니다.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/settings/notifications" style="color: #6366F1;">알림 설정</a> | 
            <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #6366F1;">구독 해지</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  generateEventNotificationText(user, event, notification) {
    const eventTime = moment.tz(event.start_time, event.timezone);
    const formattedDateTime = eventTime.format('YYYY년 MM월 DD일 (dddd) HH:mm');
    
    return `
Event Scheduler 알림

${notification.title}

이벤트: ${event.title}
일시: ${formattedDateTime}
${event.location ? `장소: ${event.location}` : ''}

${notification.message}

${event.description ? `\n상세내용:\n${event.description}` : ''}

이벤트 상세보기: ${process.env.FRONTEND_URL}/events/${event.id}

---
이 이메일은 Event Scheduler에서 자동으로 발송된 알림입니다.
알림 설정: ${process.env.FRONTEND_URL}/settings/notifications
    `.trim();
  }

  generateWelcomeHTML(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Scheduler에 오신 것을 환영합니다!</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300;">환영합니다! 🎉</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">${user.first_name}님, Event Scheduler에 가입해주셔서 감사합니다.</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1F2937; margin-top: 0;">스마트한 일정 관리가 시작됩니다</h2>
          
          <div style="margin: 30px 0;">
            <div style="display: flex; align-items: center; margin: 20px 0;">
              <div style="width: 40px; height: 40px; background: #EFF6FF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                🔔
              </div>
              <div>
                <h3 style="margin: 0; color: #374151;">혁신적인 스마트 알림</h3>
                <p style="margin: 5px 0 0 0; color: #6B7280;">사전 알림으로 정시 알림을 제어하세요</p>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; margin: 20px 0;">
              <div style="width: 40px; height: 40px; background: #F0FDF4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                👥
              </div>
              <div>
                <h3 style="margin: 0; color: #374151;">그룹 이벤트 관리</h3>
                <p style="margin: 5px 0 0 0; color: #6B7280;">팀과 함께하는 스마트한 일정 관리</p>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; margin: 20px 0;">
              <div style="width: 40px; height: 40px; background: #FEF3C7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                🌙
              </div>
              <div>
                <h3 style="margin: 0; color: #374151;">다크 테마 UI</h3>
                <p style="margin: 5px 0 0 0; color: #6B7280;">눈의 피로를 줄이는 모던한 디자인</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 40px 0 20px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="display: inline-block; padding: 16px 32px; background-color: #6366F1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
              지금 시작하기
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6B7280; font-size: 14px;">
          <p>궁금한 점이 있으시면 언제든 문의해주세요!</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/help" style="color: #6366F1;">도움말</a> | 
            <a href="mailto:support@eventscheduler.com" style="color: #6366F1;">고객지원</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeText(user) {
    return `
Event Scheduler에 오신 것을 환영합니다!

안녕하세요 ${user.first_name}님,

Event Scheduler에 가입해주셔서 감사합니다. 이제 스마트한 일정 관리를 시작하실 수 있습니다.

주요 기능:
• 혁신적인 스마트 알림 - 사전 알림으로 정시 알림을 제어
• 그룹 이벤트 관리 - 팀과 함께하는 일정 관리
• 다크 테마 UI - 눈의 피로를 줄이는 모던한 디자인

지금 시작하기: ${process.env.FRONTEND_URL}/dashboard

궁금한 점이 있으시면 언제든 문의해주세요.
고객지원: support@eventscheduler.com
    `.trim();
  }

  generatePasswordResetHTML(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>비밀번호 재설정</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #DC2626; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">🔒 비밀번호 재설정</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1F2937; margin-top: 0;">안녕하세요 ${user.first_name}님,</h2>
          
          <p style="color: #374151; font-size: 16px;">비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정하세요.</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 16px 32px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
              비밀번호 재설정
            </a>
          </div>
          
          <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #B91C1C;"><strong>보안 알림:</strong> 이 링크는 1시간 후에 만료됩니다.</p>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다. 비밀번호는 변경되지 않습니다.</p>
          
          <p style="color: #6B7280; font-size: 14px;">링크가 작동하지 않는경우 다음 URL을 복사하여 브라우저에 붙여넣으세요:<br>
          <span style="word-break: break-all;">${resetUrl}</span></p>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetText(user, resetUrl) {
    return `
비밀번호 재설정

안녕하세요 ${user.first_name}님,

비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 새로운 비밀번호를 설정하세요.

${resetUrl}

보안상 이 링크는 1시간 후에 만료됩니다.

만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.

Event Scheduler
    `.trim();
  }

  generateEmailVerificationHTML(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>이메일 주소 인증</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #059669; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">✉️ 이메일 인증</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1F2937; margin-top: 0;">안녕하세요 ${user.first_name}님,</h2>
          
          <p style="color: #374151; font-size: 16px;">Event Scheduler 회원가입을 완료하려면 이메일 주소를 인증해주세요.</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; padding: 16px 32px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
              이메일 주소 인증
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">링크가 작동하지 않는경우 다음 URL을 복사하여 브라우저에 붙여넣으세요:<br>
          <span style="word-break: break-all;">${verificationUrl}</span></p>
        </div>
      </body>
      </html>
    `;
  }

  generateEmailVerificationText(user, verificationUrl) {
    return `
이메일 주소 인증

안녕하세요 ${user.first_name}님,

Event Scheduler 회원가입을 완료하려면 아래 링크를 클릭하여 이메일 주소를 인증해주세요.

${verificationUrl}

Event Scheduler
    `.trim();
  }

  /**
   * 유틸리티 메소드들
   */

  getEmailSubject(notificationType, eventTitle) {
    const subjects = {
      advance_reminder: `[알림] ${eventTitle} 곧 시작`,
      event_start: `[시작] ${eventTitle}`,
      event_reminder: `[리마인더] ${eventTitle}`,
      event_invitation: `[초대] ${eventTitle}`,
      event_update: `[변경] ${eventTitle}`,
      event_cancellation: `[취소] ${eventTitle}`,
      snooze_reminder: `[다시알림] ${eventTitle}`
    };
    
    return subjects[notificationType] || `[Event Scheduler] ${eventTitle}`;
  }

  getPriority(priority) {
    const priorities = {
      urgent: '1',
      high: '2',
      medium: '3',
      low: '4'
    };
    return priorities[priority] || '3';
  }
}

module.exports = new EmailService();
