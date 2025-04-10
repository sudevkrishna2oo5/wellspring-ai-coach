
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
    const { userId, notificationType, data } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!notificationType) {
      throw new Error('Notification type is required');
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*, email_settings (*)')
      .eq('id', userId)
      .single();
    
    if (userError) {
      throw new Error(`Failed to get user data: ${userError.message}`);
    }
    
    // Get user email from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError || !authUser?.user?.email) {
      throw new Error(`Failed to get user email: ${authError?.message || 'No email found'}`);
    }
    
    const userEmail = authUser.user.email;
    const userName = userData?.full_name || 'Fitness Enthusiast';
    
    // Process notification based on type
    let notificationTitle = '';
    let notificationBody = '';
    let emailSubject = '';
    let emailContent = '';
    
    switch (notificationType) {
      case 'daily_goal':
        notificationTitle = '🎯 Daily Goal Check-in';
        notificationBody = `You've completed ${data?.progress || 0}% of your daily fitness goals. Keep it up!`;
        emailSubject = 'Your FitVibe Daily Goal Update';
        emailContent = getEmailTemplate('daily_goal', { userName, progress: data?.progress || 0 });
        break;
        
      case 'achievement':
        notificationTitle = '🏆 New Achievement Unlocked!';
        notificationBody = `Congratulations! You've earned the "${data?.achievement || 'FitVibe'}" badge.`;
        emailSubject = 'You Earned a New FitVibe Achievement!';
        emailContent = getEmailTemplate('achievement', { userName, achievement: data?.achievement || 'FitVibe' });
        break;
        
      case 'workout_reminder':
        notificationTitle = '💪 Workout Time!';
        notificationBody = `Don't forget your scheduled ${data?.workout || 'workout'} today.`;
        emailSubject = 'Your FitVibe Workout Reminder';
        emailContent = getEmailTemplate('workout_reminder', { userName, workout: data?.workout || 'workout' });
        break;
        
      case 'meal_reminder':
        notificationTitle = '🍎 Meal Time Reminder';
        notificationBody = `Time for your scheduled ${data?.meal || 'meal'}!`;
        emailSubject = 'Your FitVibe Meal Reminder';
        emailContent = getEmailTemplate('meal_reminder', { userName, meal: data?.meal || 'meal' });
        break;
        
      case 'motivation':
        const motivationalMessage = data?.message || getRandomMotivationalMessage();
        notificationTitle = '✨ FitVibe Motivation';
        notificationBody = motivationalMessage;
        emailSubject = 'Your Daily Dose of FitVibe Motivation';
        emailContent = getEmailTemplate('motivation', { userName, message: motivationalMessage });
        break;
        
      default:
        notificationTitle = 'FitVibe Update';
        notificationBody = 'You have a new update from FitVibe!';
        emailSubject = 'FitVibe Update';
        emailContent = getEmailTemplate('default', { userName });
    }
    
    // Store notification in database for in-app viewing
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notificationType,
        title: notificationTitle,
        body: notificationBody,
        data: data || {},
        read: false
      })
      .select()
      .single();
    
    if (notificationError) {
      console.error('Error storing notification:', notificationError);
    }
    
    // Check if user has email notifications enabled for this type
    const emailSettingsKey = `${notificationType}_email`;
    const shouldSendEmail = userData?.email_settings && 
      userData.email_settings[emailSettingsKey] !== false;
    
    // Send email if enabled
    if (shouldSendEmail) {
      console.log(`Sending email notification to ${userEmail}`);
      console.log(`Subject: ${emailSubject}`);
      // In a production implementation, you would use a service like Resend or SendGrid
      // to send actual emails. For this demo, we'll just log what would be sent.
      console.log(`Email content: ${emailContent.substring(0, 100)}...`);
      
      // Call email function
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            type: notificationType,
            userId,
            subject: emailSubject,
            content: emailContent,
            userName
          })
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }
    
    // Check if user has push notifications enabled for this type
    const pushSettingsKey = `${notificationType}_push`;
    const shouldSendPush = userData?.notification_settings && 
      userData.notification_settings[pushSettingsKey] !== false;
    
    // Send push notification if enabled
    if (shouldSendPush && userData?.push_token) {
      console.log(`Sending push notification to device: ${userData.push_token.substring(0, 10)}...`);
      // In a production implementation, you would use a service like Firebase Cloud Messaging
      // or OneSignal to send actual push notifications.
      console.log(`Title: ${notificationTitle}`);
      console.log(`Body: ${notificationBody}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification sent',
        notification: notification || {
          title: notificationTitle,
          body: notificationBody,
          type: notificationType
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
    console.error('Error sending notification:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
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

// Helper function for getting random motivational messages
function getRandomMotivationalMessage(): string {
  const messages = [
    "Today's efforts are tomorrow's results. Keep pushing!",
    "Your only limit is the one you set for yourself.",
    "Small progress is still progress. Be proud of yourself!",
    "Consistency is key. One day at a time!",
    "Your future self will thank you for the work you put in today.",
    "Every workout brings you closer to your goals.",
    "The hardest part is starting. You've already begun!",
    "Focus on progress, not perfection.",
    "Remember why you started.",
    "You're stronger than you think!"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

// Helper function to get email templates
function getEmailTemplate(type: string, data: Record<string, any>): string {
  const baseTemplate = `
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
      .content {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .footer {
        text-align: center;
        font-size: 0.9em;
        color: #666;
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #ddd;
      }
      .highlight {
        color: #6366f1;
        font-weight: bold;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="color: #6366f1;">FitVibe</h1>
      </div>
      <div class="content">
  `;
  
  let specificContent = '';
  
  switch (type) {
    case 'daily_goal':
      specificContent = `
        <h2>Daily Goal Update</h2>
        <p>Hello ${data.userName},</p>
        <p>You've completed <span class="highlight">${data.progress}%</span> of your daily fitness goals.</p>
        <p>${data.progress >= 80 ? 'Amazing work! You\'re crushing it today!' : 'Keep going! You\'re making great progress.'}</p>
        <p>Check your FitVibe app to see detailed progress and continue your fitness journey.</p>
        <center><a href="#" class="button">View Your Progress</a></center>
      `;
      break;
      
    case 'achievement':
      specificContent = `
        <h2>New Achievement Unlocked! 🏆</h2>
        <p>Hello ${data.userName},</p>
        <p>Congratulations! You've earned the <span class="highlight">"${data.achievement}"</span> badge.</p>
        <p>This achievement is a testament to your dedication and hard work.</p>
        <p>Check your FitVibe app to see your full collection of achievements!</p>
        <center><a href="#" class="button">View Your Achievements</a></center>
      `;
      break;
      
    case 'workout_reminder':
      specificContent = `
        <h2>Workout Reminder 💪</h2>
        <p>Hello ${data.userName},</p>
        <p>Don't forget your scheduled <span class="highlight">${data.workout}</span> today.</p>
        <p>Your consistency is what builds results over time.</p>
        <p>Open your FitVibe app to check your workout details and track your progress.</p>
        <center><a href="#" class="button">Start Your Workout</a></center>
      `;
      break;
      
    case 'meal_reminder':
      specificContent = `
        <h2>Meal Time Reminder 🍎</h2>
        <p>Hello ${data.userName},</p>
        <p>It's time for your scheduled <span class="highlight">${data.meal}</span>!</p>
        <p>Proper nutrition is a key part of your fitness journey.</p>
        <p>Open your FitVibe app to log your meal and stay on track with your nutrition goals.</p>
        <center><a href="#" class="button">Log Your Meal</a></center>
      `;
      break;
      
    case 'motivation':
      specificContent = `
        <h2>Your Daily Dose of Motivation ✨</h2>
        <p>Hello ${data.userName},</p>
        <p style="font-style: italic; text-align: center; font-size: 1.2em; margin: 20px 0;">"${data.message}"</p>
        <p>Remember, every step forward counts, no matter how small.</p>
        <p>Open your FitVibe app to continue your fitness journey today.</p>
        <center><a href="#" class="button">Open FitVibe</a></center>
      `;
      break;
      
    default:
      specificContent = `
        <h2>FitVibe Update</h2>
        <p>Hello ${data.userName},</p>
        <p>You have a new update from FitVibe!</p>
        <p>Check your app to see what's new and continue your fitness journey.</p>
        <center><a href="#" class="button">Open FitVibe</a></center>
      `;
  }
  
  const footerTemplate = `
      </div>
      <div class="footer">
        <p>Stay fit, stay healthy!</p>
        <p>— The FitVibe Team</p>
      </div>
    </div>
  </body>
  </html>
  `;
  
  return baseTemplate + specificContent + footerTemplate;
}
