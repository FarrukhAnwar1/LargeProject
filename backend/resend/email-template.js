//From REACT email, can be changed
// Helper function to get button text and message based on type
export const getEmailContent = (type, data = {}) => {
    switch (type) {
        case 'admin_verification':
            return {
                title: 'New Member Verification Required',
                message: `${data.newMemberName} (${data.newMemberEmail}) wants to join your company. Please verify them to grant access.`,
                buttonText: 'Verify Member'
            };
        case 'member_pending':
            return {
                title: 'Registration Pending Admin Approval',
                message: `Your registration for ${data.companyName} is pending admin approval. We'll notify you once approved.`,
                buttonText: 'Check Status'
            };
        case 'admin_approved':
            return {
                title: 'Company Access Granted',
                message: `Your account has been approved by the admin of ${data.companyName}. You can now log in.`,
                buttonText: 'Login Now'
            };
        default:
            // For company members, include admin approval message
            const isCompanyMember = data.userType === 'company_member';
            return {
                title: 'Verify Your Email',
                message: `Click the button below to finish setting up your account${isCompanyMember ? 
                    '. Note: After email verification, you will need admin approval from your company administrator. ' +
                    'Please contact them if you do not receive an approval notification within 24 hours.' : ''}`,
                buttonText: 'Verify'
            };
    }
};

export const verificationTokenEmailTemplate = (type = 'email', data = {}) => `<!DOCTYPE html>
<html dir="ltr" lang="en">
  <head>
    <link 
      rel="preload"
      as="image"
      href="https://react-email-demo-c7nq3pwx3-resend.vercel.app/static/plaid-logo.png" 
    />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style="background-color:#ffffff">
    <table 
    border="0" 
    width="100%" 
    cellpadding="0" 
    cellspacing="0" 
    role="presentation" 
    align="center">
      <tbody>
        <tr>
          <td style="background-color:#22577A;font-family:HelveticaNeue,Helvetica,Arial,sans-serif">
            <table align="center"
            width="100%"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation" 
            style="max-width:360px;background-color:#C7F9CC;border:5px solid #eee;border-radius:5px;box-shadow:0 10px 5px rgba(20,50,70,.2);margin-top:20px;margin:0 auto;padding:68px 0 130px">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <img alt="Plaid"
                    height="88"
                    src="https://react-email-demo-c7nq3pwx3-resend.vercel.app/static/plaid-logo.png"
                    style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" 
                    width="212" />
                    <p 
                    style="font-size:20px;line-height:1.4;color:#000;font-weight:700;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;margin:16px 16px 24px 16px;text-transform:uppercase;text-align:center">${getEmailContent(type, data).title}</p>
                    <h1 
                    style="color:#000;display:block;font-family:HelveticaNeue-Medium,Helvetica,Arial,sans-serif;font-size:18px;font-weight:500;line-height:1.6;margin:0 24px 24px;text-align:center">${getEmailContent(type, data).message}</h1>
                    
                    <!--The table-->
                    <table 
                    align="center"
                    width="100%" 
                    border="0" 
                    cellpadding="0" 
                    cellspacing="0" 
                    role="presentation" 
                    style="margin:20px auto 30px;text-align:center;">
                      <tbody>
                        <tr>
                          <td align="center">
                          <a
                          href="{verificationLink}"
                          target="_blank"
                          style="background-color:#22577A;
                          color:#fff;
                          padding:12px 30px;
                          border-radius:6px;
                          font-family:HelveticaNeue,Helvetica,Arial,sans-serif;
                          font-weight:700;
                          text-decoration:none;
                          text-transform:uppercase;
                          letter-spacing:0.5px;
                          display:inline-block;">
                          ${getEmailContent(type, data).buttonText}
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!--verification text-->
                  <p
                  style="font-size:14px;line-height:20px;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;text-align:center;padding: 0 20px;">
                  If the button doesn't work, click or manually enter this link:
                  <br/>
                  <a href="{verificationLink}" style="color:#22577A;">
                  {verificationLink}
                  </a>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
              <p
            style="font-size:12px;line-height:23px;color:#fff;font-weight:800;letter-spacing:0;margin:20px 0;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;text-align:center;text-transform:uppercase;">
            Sent to you by CarStax.
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`

export const forgetPasswordTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Reset Your Password</title>
    <style>
      @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,600,700&display=swap");

      body{
        margin: 0;
        padding: 0;
        background-color : #22577A;
        color: #333;
        font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
      }

      a{
        color: #22577A;
        text-decoration: none;
      }

      table{
        border-collapse: collapse;
      }

      .container {
        width: 100%;
        background-color: #22577A;
        text-align: center;
        padding: 40px 0;
      }
      .content-box{
        background-color: #C7F9CC;
        border: 5px solid #EEE;
        border-radius: 8px;
        box-shadow: 0 10px 8px rgba(20, 50, 70, 0.15);
        max-width: 420px;
        margin: 0 auto;
        padding: 50px 30px 60px;
      }

      .logo {
        display:block;
        margin:0 auto 20px;
        height: 70px;
      }

      h1{
        font-size: 22px;
        font-weight: 700;
        color: #000;
        text-align: center;
        margin-bottom: 16px;
      }


      p{
        font-size: 15px;
        line-height: 1.6;
        color: #333;
        margin: 12px 0;
        text-align: left;
      }

      .highlight-box {
        background-color: #FFF;
        border-radius: 6px;
        padding: 14px 16px;
        margin: 18px 0;
        color: #22577A;
        font-weight: 600;
        text-align: center;
        line-height: 1.5;
      }

      .button{
        display: inline-block; 
        background-color: #22577A;
        color: #ffffff !important;
        padding: 12px 30px;
        border-radius: 50px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 6px rgba(34, 87, 122, 0.25);
        transition: all 0.2s ease-in-out;
        margin-top: 25px;
      }

      .button:hover{
        background-color: #163E55;
      }

      .sub {
        font-size: 13px;
        color: #555;
        text-align: center;
        line-height: 1.5;
        margin-top: 25px;
      }

      .footer {
        font-size: 12px;
        color: #FFF;
        text-align: center;
        margin-top:25px;
        letter-spacing: 0.5px;
        font-weight: 700;
        text-transform:uppercase;
      }

      @media only screen and (max-width: 480px){
        .content-box {
          width: 90%;
          padding: 40px 20px 50px;
        }
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="content-box">
        <img
          src="https://react-email-demo-c7nq3pwx3-resend.vercel.app/static/plaid-logo.png"
          alt="CarStax"
          class="logo" />

          <h1>Reset Your Password</h1>

          <div class="highlight-box">
           Hi {{name}}, we received a request to reset your CarStax account password.
           </div>

           <p>
            If you made this request, click the button below to choose a new password.
            <strong>This link is only valid for the next 24 hours.</strong>
          </p>

          <a href="{{reset_link}}" class="button" target="_blank">Reset Password</a>

          <p>
            Didn't request a password reset? You can safely ignore this email. Your password won't change until you access the link above and create a new one.
          </p>

          <p class="sub">
            If the button doesn't work, click this link to continue:
            <br />
            <a href="{{reset_link}}" style="color: #22577A;">{{reset_link}}</a>
          </p>
        </div>

        <div class="footer">
          Sent to you by CarStax
          <br />
          noreply@farrukhanwar.site
        </div>
      </div>
    </body>
  </html>`


export const successResetTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
      <meta charset="UTF-8"  />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      <title>Password Reset Successful</title>
      <style>
        @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,600,700&display=swap");

      body{
        margin: 0;
        padding: 0;
        background-color: #22577A;
        color: #333;
        font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
      }

      a{
        color: #22577A;
        text-decoration: none;
      }

      table{
        border-collapse: collapse;
      }

      .container {
        width: 100%;
        background-color: #22577A;
        text-align: center;
        padding: 40px 0;
      }
      .content-box{
        background-color: #C7F9CC;
        border: 5px solid #EEE;
        border-radius: 8px;
        box-shadow: 0 10px 8px rgba(20, 50, 70, 0.15);
        max-width: 420px;
        margin: 0 auto;
        padding: 50px 30px 60px;
      }

      .logo {
        display:block;
        margin: 0 auto 20px;
        height: 70px;
      }

      h1{
        font-size: 22px;
        font-weight: 700;
        color: #000;
        text-align: center;
        margin-bottom: 16px;
      }


      p{
        font-size: 15px;
        line-height: 1.6;
        color: #333;
        margin: 12px 0;
        text-align: left;
      }

      .highlight-box {
        background-color: #FFF;
        border-radius: 6px;
        padding: 14px 16px;
        margin: 18px 0;
        color: #22577A;
        font-weight: 600;
        text-align: center;
        line-height: 1.5;
      }


      .sub {
        font-size: 13px;
        color: #555;
        text-align: center;
        line-height: 1.5;
        margin-top: 25px;
      }

      .footer {
        font-size: 12px;
        color: #FFF;
        text-align: center;
        margin-top:25px;
        letter-spacing: 0.5px;
        font-weight: 700;
        text-transform:uppercase;
      }

      @media only screen and (max-width: 480px){
        .content-box {
          width: 90%;
          padding: 40px 20px 50px;
        }
      }
      </style>
  </head>

<body>
    <div class="container">
        <div class="content-box">
            <img
              src="https://react-email-demo-c7nq3pwx3-resend.vercel.app/static/plaid-logo.png"
              alt="CarStax"
              class="logo" />

            <h1>Password Reset Successful</h1>

            <div class="highlight-box">
                Hi {{name}}, your CarStax account password has been updated successfully.
            </div>

            <p>
              If you did not perform this action, please contact our support team immediately.
            </p>

            <p class="sub">
              Thank you for using CarStax.
            </p>
        </div>

        <div class="footer">
          Sent to you by CarStax
          <br />
          noreply@farrukhanwar.site
        </div>
    </div>
  </body>
</html>`