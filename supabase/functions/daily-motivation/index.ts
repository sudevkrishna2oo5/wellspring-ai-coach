
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users who have enabled daily motivation emails
    const { data: eligibleUsers, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email_settings (*)
      `)
      .eq('email_settings.daily_motivation', true);

    if (error) throw error;

    // Motivational quotes
    const motivationalQuotes = [
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

    // Get 5 random motivational quotes
    const selectedQuotes = [];
    const quotesToSend = [...motivationalQuotes];
    for (let i = 0; i < Math.min(5, quotesToSend.length); i++) {
      const randomIndex = Math.floor(Math.random() * quotesToSend.length);
      selectedQuotes.push(quotesToSend[randomIndex]);
      // Remove the selected quote to avoid duplicates
      quotesToSend.splice(randomIndex, 1);
    }

    // For each eligible user, send the daily motivation email
    const results = [];
    for (const user of eligibleUsers || []) {
      // Call our send-emails function to deliver the motivation email
      try {
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            type: 'daily_motivation',
            userId: user.id,
            quotes: selectedQuotes,
            userName: user.full_name || 'Fitness Enthusiast'
          })
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error(`Failed to send email to user ${user.id}:`, errorData);
          results.push({
            userId: user.id,
            success: false,
            error: errorData
          });
        } else {
          results.push({
            userId: user.id,
            success: true
          });
        }
      } catch (emailError) {
        console.error(`Error sending email to user ${user.id}:`, emailError.message);
        results.push({
          userId: user.id,
          success: false,
          error: emailError.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${eligibleUsers?.length || 0} daily motivation notifications`,
        quotes: selectedQuotes,
        results
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in daily-motivation function:', error.message);
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
