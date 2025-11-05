//From REACT email, can be changed
export const verificationTokenEmailTemplate = `<!DOCTYPE html>
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
                    style="font-size:22px;line-height:16px;color:#000;font-weight:700;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;height:16px;letter-spacing:0;margin:16px 8px 8px 8px;text-transform:uppercase;text-align:center;margin-top:16px;margin-right:8px;margin-bottom:8px;margin-left:8px"> Verify Your Email </p>
                    <h1 
                    style="color:#000;display:inline-block;font-family:HelveticaNeue-Medium,Helvetica,Arial,sans-serif;font-size:22px;font-weight:500;line-height:24px;margin-bottom:0;margin-top:0;text-align:center"> Click the button below to finish setting up your account </h1>
                    
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
                          color:#ffff;
                          padding:12px 30px;
                          border-radius:6px;
                          font-family:HelveticaNeue,Helvetica,Arial,sans-serif;
                          font-weight:700;
                          text-decoration:none;
                          text-transform:uppercase;
                          letter-spacing:0.5px;
                          display:inline-block;">
                          Verify
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

                  <p
                  style="font-size:15px;line-height:23px;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;text-align:center;padding: 0 40px;margin: 16px 0 0 0;">
                  Not expecting this email? Contact
                  <a
                    href="mailto:noreply@farrukhanwar.site"
                    style="color:#444;text-decoration:underline"
                    target="_blank">
                    noreply@farrukhanwar.site
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
</html>`;

export const WELCOME_EMAIL_TEMPLATE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <link
      rel="preload"
      as="image"
      href="https://react-email-demo-c5c0ph259-resend.vercel.app/static/koala-logo.png" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <!--$-->
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
          <td
            style='background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'>
            <div
              style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
              data-skip-in-text="true">
              The sales intelligence platform that helps you uncover qualified
              leads.
              <div>
                 ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿
              </div>
            </div>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width:37.5em;margin:0 auto;padding:20px 0 48px">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <img
                      alt="Koala"
                      height="50"
                      src="https://react-email-demo-c5c0ph259-resend.vercel.app/static/koala-logo.png"
                      style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto"
                      width="170" />
                    <p
                      style="font-size:16px;line-height:26px;margin-top:16px;margin-bottom:16px">
                      Hi
                      <!-- -->{name}<!-- -->,
                    </p>
                    <p
                      style="font-size:16px;line-height:26px;margin-top:16px;margin-bottom:16px">
                      Welcome to Koala, the sales intelligence platform that
                      helps you uncover qualified leads and close deals faster.
                    </p>
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="text-align:center">
                      <tbody>
                        <tr>
                          <td>
                            <a
                              href="https://getkoala.com"
                              style="line-height:100%;text-decoration:none;display:block;max-width:100%;mso-padding-alt:0px;background-color:#5F51E8;border-radius:3px;color:#fff;font-size:16px;text-align:center;padding:12px;padding-top:12px;padding-right:12px;padding-bottom:12px;padding-left:12px"
                              target="_blank"
                              ><span
                                ><!--[if mso]><i style="mso-font-width:300%;mso-text-raise:18" hidden>&#8202;&#8202;</i><![endif]--></span
                              ><span
                                style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px"
                                >Get started</span
                              ><span
                                ><!--[if mso]><i style="mso-font-width:300%" hidden>&#8202;&#8202;&#8203;</i><![endif]--></span
                              ></a
                            >
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p
                      style="font-size:16px;line-height:26px;margin-top:16px;margin-bottom:16px">
                      Best,<br />The Koala team
                    </p>
                    <hr
                      style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#cccccc;margin:20px 0" />
                    <p
                      style="font-size:12px;line-height:24px;color:#8898aa;margin-top:16px;margin-bottom:16px">
                      470 Noor Ave STE B #1148, South San Francisco, CA 94080
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>`