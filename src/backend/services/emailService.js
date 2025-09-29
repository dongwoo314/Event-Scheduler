const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

class EmailService {
  constructor() {
    // 이메일 전송을 위한 transporter 설정
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 개발 환경에서는 Ethereal Email 사용 (테스트용)
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
      this.setupTestAccount();
    }
  }

  /**
   * 테스트 계정 설정 (개발용)
   */
  async setupTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 Test email account created:');
      console.log('   User:', testAccount.user);
      console.log('   Pass:', testAccount.pass);
    } catch (error) {
      console.error('Failed to create test account:', error);
    }
  }

  /**
   * 이메일 전송
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"일정 관리 시스템" <${process.env.SMTP_USER || 'noreply@scheduler.com'}>`,
        to,
        subject,
        text,
        html,
      });

      console.log('📧 Email sent:', info.messageId);
      
      // 테스트 환경에서는 미리보기 URL 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * 이벤트 알림 이메일
   */
  async sendEventNotification(user, event, minutesBefore) {
    const subject = `🔔 곧 시작되는 이벤트: ${event.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #667eea; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 이벤트 알림</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${user.first_name}님!</p>
            <p><strong>${minutesBefore}분 후</strong>에 다음 이벤트가 시작됩니다:</p>
            
            <div class="event-details">
              <h2>${event.title}</h2>
              ${event.description ? `<p>${event.description}</p>` : ''}
              
              <div class="detail-row">
                <span class="label">시작 시간:</span>
                ${new Date(event.start_time).toLocaleString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              ${event.end_time ? `
                <div class="detail-row">
                  <span class="label">종료 시간:</span>
                  ${new Date(event.end_time).toLocaleString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              ` : ''}
              
              ${event.location ? `
                <div class="detail-row">
                  <span class="label">장소:</span>
                  ${event.location}
                </div>
              ` : ''}
              
              ${event.category ? `
                <div class="detail-row">
                  <span class="label">카테고리:</span>
                  ${event.category}
                </div>
              ` : ''}
            </div>
            
            <p>일정을 확인하고 준비하세요!</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar" class="button">
              캘린더에서 보기
            </a>
          </div>
          
          <div class="footer">
            <p>이 이메일은 자동으로 발송되었습니다.</p>
            <p>알림 설정은 <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings">여기</a>에서 변경할 수 있습니다.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      안녕하세요, ${user.first_name}님!
      
      ${minutesBefore}분 후에 다음 이벤트가 시작됩니다:
      
      제목: ${event.title}
      ${event.description ? `설명: ${event.description}` : ''}
      시작 시간: ${new Date(event.start_time).toLocaleString('ko-KR')}
      ${event.end_time ? `종료 시간: ${new Date(event.end_time).toLocaleString('ko-KR')}` : ''}
      ${event.location ? `장소: ${event.location}` : ''}
      
      일정을 확인하고 준비하세요!
      
      캘린더에서 보기: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/calendar
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  }

  /**
   * 그룹 초대 이메일
   */
  async sendGroupInvitation(invitee, inviter, group) {
    const subject = `📨 그룹 초대: ${group.name}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .group-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .button-secondary { background: #6c757d; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📨 그룹 초대</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${invitee.first_name}님!</p>
            <p><strong>${inviter.first_name} ${inviter.last_name}</strong>님이 회원님을 그룹에 초대했습니다.</p>
            
            <div class="group-card">
              <h2>${group.name}</h2>
              ${group.description ? `<p>${group.description}</p>` : ''}
              
              <p><strong>멤버 수:</strong> ${group.member_count || 1}명</p>
            </div>
            
            <p>그룹에 참여하여 일정을 함께 관리하세요!</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups" class="button">
                초대 확인하기
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>이 이메일은 자동으로 발송되었습니다.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      안녕하세요, ${invitee.first_name}님!
      
      ${inviter.first_name} ${inviter.last_name}님이 회원님을 그룹에 초대했습니다.
      
      그룹 이름: ${group.name}
      ${group.description ? `설명: ${group.description}` : ''}
      
      그룹에 참여하여 일정을 함께 관리하세요!
      
      초대 확인하기: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups
    `;

    return await this.sendEmail({
      to: invitee.email,
      subject,
      html,
      text,
    });
  }

  /**
   * 그룹 이벤트 생성 알림
   */
  async sendGroupEventNotification(user, event, group) {
    const subject = `📅 새로운 그룹 이벤트: ${event.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #667eea; }
          .badge { display: inline-block; padding: 5px 10px; background: #667eea; color: white; border-radius: 5px; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 새로운 그룹 이벤트</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${user.first_name}님!</p>
            <p><strong>${group.name}</strong> 그룹에 새로운 이벤트가 추가되었습니다.</p>
            
            <div class="event-details">
              <div style="margin-bottom: 15px;">
                <span class="badge">그룹 이벤트</span>
              </div>
              
              <h2>${event.title}</h2>
              ${event.description ? `<p>${event.description}</p>` : ''}
              
              <div class="detail-row">
                <span class="label">시작 시간:</span>
                ${new Date(event.start_time).toLocaleString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              ${event.end_time ? `
                <div class="detail-row">
                  <span class="label">종료 시간:</span>
                  ${new Date(event.end_time).toLocaleString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              ` : ''}
              
              ${event.location ? `
                <div class="detail-row">
                  <span class="label">장소:</span>
                  ${event.location}
                </div>
              ` : ''}
            </div>
            
            <p>그룹 캘린더에서 자세한 내용을 확인하세요!</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups/${group.id}" class="button">
              그룹 보기
            </a>
          </div>
          
          <div class="footer">
            <p>이 이메일은 자동으로 발송되었습니다.</p>
            <p>알림 설정은 <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings">여기</a>에서 변경할 수 있습니다.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      안녕하세요, ${user.first_name}님!
      
      ${group.name} 그룹에 새로운 이벤트가 추가되었습니다.
      
      제목: ${event.title}
      ${event.description ? `설명: ${event.description}` : ''}
      시작 시간: ${new Date(event.start_time).toLocaleString('ko-KR')}
      ${event.end_time ? `종료 시간: ${new Date(event.end_time).toLocaleString('ko-KR')}` : ''}
      ${event.location ? `장소: ${event.location}` : ''}
      
      그룹 캘린더에서 자세한 내용을 확인하세요!
      
      그룹 보기: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups/${group.id}
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  }

  /**
   * 그룹 이벤트 수정 알림
   */
  async sendGroupEventUpdateNotification(user, event, group) {
    const subject = `📝 그룹 이벤트 변경: ${event.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #667eea; }
          .badge { display: inline-block; padding: 5px 10px; background: #f59e0b; color: white; border-radius: 5px; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 이벤트 변경 알림</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${user.first_name}님!</p>
            <p><strong>${group.name}</strong> 그룹의 이벤트가 수정되었습니다.</p>
            
            <div class="event-details">
              <div style="margin-bottom: 15px;">
                <span class="badge">수정됨</span>
              </div>
              
              <h2>${event.title}</h2>
              ${event.description ? `<p>${event.description}</p>` : ''}
              
              <div class="detail-row">
                <span class="label">시작 시간:</span>
                ${new Date(event.start_time).toLocaleString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              ${event.end_time ? `
                <div class="detail-row">
                  <span class="label">종료 시간:</span>
                  ${new Date(event.end_time).toLocaleString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              ` : ''}
              
              ${event.location ? `
                <div class="detail-row">
                  <span class="label">장소:</span>
                  ${event.location}
                </div>
              ` : ''}
            </div>
            
            <p>변경된 내용을 확인하세요!</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups/${group.id}" class="button">
              그룹 보기
            </a>
          </div>
          
          <div class="footer">
            <p>이 이메일은 자동으로 발송되었습니다.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      안녕하세요, ${user.first_name}님!
      
      ${group.name} 그룹의 이벤트가 수정되었습니다.
      
      제목: ${event.title}
      ${event.description ? `설명: ${event.description}` : ''}
      시작 시간: ${new Date(event.start_time).toLocaleString('ko-KR')}
      ${event.end_time ? `종료 시간: ${new Date(event.end_time).toLocaleString('ko-KR')}` : ''}
      ${event.location ? `장소: ${event.location}` : ''}
      
      변경된 내용을 확인하세요!
      
      그룹 보기: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups/${group.id}
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  }

  /**
   * 환영 이메일 (회원가입 시)
   */
  async sendWelcomeEmail(user) {
    const subject = '🎉 일정 관리 시스템에 오신 것을 환영합니다!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 환영합니다!</h1>
          </div>
          <div class="content">
            <p>안녕하세요, ${user.first_name}님!</p>
            <p>일정 관리 시스템에 가입해 주셔서 감사합니다.</p>
            
            <h3>주요 기능:</h3>
            
            <div class="feature-box">
              <h4>📅 개인 일정 관리</h4>
              <p>개인 이벤트를 생성하고 관리하세요.</p>
            </div>
            
            <div class="feature-box">
              <h4>👥 그룹 협업</h4>
              <p>팀원들과 함께 일정을 공유하고 관리하세요.</p>
            </div>
            
            <div class="feature-box">
              <h4>🔔 스마트 알림</h4>
              <p>이벤트 시작 전 이메일 알림을 받으세요.</p>
            </div>
            
            <p>지금 바로 시작해보세요!</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
                대시보드로 이동
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>문의사항이 있으시면 언제든지 연락주세요.</p>
            <p>&copy; 2024 일정 관리 시스템. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      안녕하세요, ${user.first_name}님!
      
      일정 관리 시스템에 가입해 주셔서 감사합니다.
      
      주요 기능:
      - 개인 일정 관리
      - 그룹 협업
      - 스마트 알림
      
      지금 바로 시작해보세요!
      
      대시보드로 이동: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });
  }
}

// 싱글톤 인스턴스
const emailService = new EmailService();

module.exports = emailService;
