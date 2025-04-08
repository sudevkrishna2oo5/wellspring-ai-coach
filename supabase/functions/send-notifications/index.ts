
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, emailType } = await req.json();
    
    // In a real implementation, you would use a service like Resend or SendGrid
    // to send actual emails. For this demo, we'll just log what would be sent.
    console.log(`Sending email of type ${emailType} to user ${userId}`);
    
    let emailSubject = 'FitVibe Update';
    let emailContent = 'Your FitVibe update is here!';
    
    switch (emailType) {
      case 'daily_motivation':
        emailSubject = 'Your Daily FitVibe Motivation';
        emailContent = getRandomMotivationalMessage();
        break;
      case 'progress_update':
        emailSubject = 'FitVibe Progress Update';
        emailContent = 'Here\'s your weekly progress summary. Keep up the great work!';
        break;
      case 'goal_reminder':
        emailSubject = 'FitVibe Goal Reminder';
        emailContent = 'Don\'t forget about your fitness goals! You\'re making great progress.';
        break;
    }
    
    console.log(`Subject: ${emailSubject}`);
    console.log(`Content: ${emailContent}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification scheduled' 
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
