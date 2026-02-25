import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const BASE_URL = Deno.env.get('BASE_URL') || 'https://metalcutting-hub.com';

interface EmailRequest {
  email: string;
  token: string;
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const { email, token }: EmailRequest = await req.json();

    if (!email || !token) {
      return new Response(
        JSON.stringify({ error: 'Email and token are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Build verification URL
    const verificationUrl = `${BASE_URL}/verify-subscription?token=${token}`;

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Metalcutting Hub <onboarding@resend.dev>',
        to: email,
        subject: 'Потвърждение на абонамент за Metalcutting Hub',
        html: `
          <!DOCTYPE html>
          <html lang="bg">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">
                <span style="font-size: 24px;">&#9881;</span> Metalcutting Hub
              </h1>
            </div>
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #dee2e6; border-top: none;">
              <h2 style="color: #0d6efd; margin-top: 0;">Благодарим за абонамента!</h2>
              <p>Здравейте,</p>
              <p>Получихме заявка за абониране към нашия бюлетин с имейл адрес: <strong>${email}</strong></p>
              <p>За да потвърдите абонамента си, моля кликнете на бутона по-долу:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #0d6efd; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Потвърди абонамента
                </a>
              </div>
              <p style="font-size: 14px; color: #666;">Ако бутонът не работи, копирайте и поставете следния адрес в браузъра си:</p>
              <p style="font-size: 12px; color: #0d6efd; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">
                ${verificationUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
              <p style="font-size: 14px; color: #666; margin-bottom: 0;">
                Ако не сте се абонирали за нашия бюлетин, можете да игнорирате този имейл.
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} Metalcutting Hub. Всички права запазени.</p>
              <p>Пазарът за металообработваща техника и инструменти в България.</p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: result }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in send-confirmation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
