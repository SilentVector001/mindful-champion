const { Resend } = require('resend');

const resend = new Resend('re_MF3dtRpT_ENzbTRqTxGSruvwBPzwzp4Qs');

async function testEmail() {
  try {
    console.log('Testing email with sandbox domain (onboarding@resend.dev)...');
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'Test Email - Mindful Champion (Sandbox)',
      html: '<p>This is a test email from Mindful Champion using sandbox</p>',
    });
    
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.response) {
      console.log('Response:', JSON.stringify(error.response, null, 2));
    }
  }
}

testEmail();
