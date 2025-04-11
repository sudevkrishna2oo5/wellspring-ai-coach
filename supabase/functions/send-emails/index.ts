
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: 'Supabase configuration is missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { type, userId, quotes, userName, subject, content } = requestBody;

    // Validate inputs
    if (!type) {
      console.error("Email type is required");
      return new Response(
        JSON.stringify({ error: 'Email type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user data if userId is provided
    let userData = null;
    if (userId) {
      try {
        const { data: user, error } = await supabase
          .from('profiles')
          .select('*, email_settings (*)')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching user:', error);
        } else {
          userData = user;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    // Get user email from auth table using userId
    let userEmail = null;
    if (userId) {
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (authError) {
          console.error('Error fetching user email:', authError);
        } else if (authUser?.user) {
          userEmail = authUser.user.email;
        }
      } catch (error) {
        console.error("Error fetching auth user:", error);
      }
    }

    if (!userEmail) {
      console.error("Could not determine user email");
      return new Response(
        JSON.stringify({ error: 'Could not determine user email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate email content based on type
    let emailSubject = subject || '';
    let htmlContent = content || '';

    if (!emailSubject || !htmlContent) {
      switch (type) {
        case 'daily_motivation':
          emailSubject = '🌟 Your Daily Motivation Quotes from FitVibe';
          
          // Begin HTML email
          htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
              }
              .container {
                padding: 20px;
                background: linear-gradient(135deg, #f5f7fa 0%, #e4eaff 100%);
                border-radius: 10px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #ddd;
              }
              .quote {
                background-color: white;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 8px;
                border-left: 4px solid #6366f1;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              }
              .footer {
                text-align: center;
                font-size: 0.9em;
                color: #666;
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #6366f1;">Your Daily Motivation</h1>
                <p>Hello ${userName || 'there'}, here are your motivation quotes for today!</p>
              </div>
          `;

          // Add each quote
          if (quotes && Array.isArray(quotes)) {
            quotes.forEach((quote, index) => {
              htmlContent += `
              <div class="quote">
                <p style="font-style: italic;">"${quote}"</p>
                <p style="text-align: right; font-size: 0.9em; color: #6366f1;">— Quote #${index + 1}</p>
              </div>
              `;
            });
          } else {
            // Fallback quotes if none provided
            const fallbackQuotes = [
              "The only bad workout is the one that didn't happen.",
              "Progress takes time. Be patient with yourself.",
              "Your health is an investment, not an expense.",
              "Small steps every day lead to big results over time.",
              "The difference between try and triumph is just a little umph!"
            ];
            
            fallbackQuotes.forEach((quote, index) => {
              htmlContent += `
              <div class="quote">
                <p style="font-style: italic;">"${quote}"</p>
                <p style="text-align: right; font-size: 0.9em; color: #6366f1;">— Quote #${index + 1}</p>
              </div>
              `;
            });
          }

          // Close HTML email
          htmlContent += `
              <div class="footer">
                <p>Stay motivated and keep pushing towards your goals!</p>
                <p>— The FitVibe Team</p>
              </div>
            </div>
          </body>
          </html>
          `;
          break;

        // Add cases for other email types here
        default:
          console.log(`Processing ${type} email notifications...`);
          emailSubject = subject || 'New notification from FitVibe';
          htmlContent = content || `<p>You have a new notification from FitVibe.</p>`;
      }
    }

    console.log(`Preparing to send ${type} email to user ${userId} with email ${userEmail}`);
    console.log('Email Subject:', emailSubject);
    console.log('Email Content Preview:', htmlContent.substring(0, 200) + '...');

    // In a production environment, you would connect to a real email service here
    // like SendGrid, Mailchimp, or AWS SES with code like:
    /*
    const emailResult = await sendEmailWithService({
      to: userEmail,
      from: 'noreply@fitvibe.com',
      subject: emailSubject,
      html: htmlContent
    });
    */

    // Store the email in the database for tracking
    try {
      const { data: emailLog, error: logError } = await supabase
        .from('email_logs')
        .insert({
          user_id: userId,
          email_type: type,
          email_subject: emailSubject,
          sent_to: userEmail,
          status: 'simulated' // In production would be 'sent' or 'failed'
        })
        .select()
        .single();
      
      if (logError) {
        console.warn("Could not log email:", logError);
      }
    } catch (error) {
      console.warn("Error logging email:", error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${type} email notification for user ${userId}`,
        emailPreview: {
          to: userEmail,
          subject: emailSubject,
          contentPreview: 'Email content generated successfully'
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in send-emails function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
