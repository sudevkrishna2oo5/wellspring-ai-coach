
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
    const { type } = await req.json();

    // In a production environment, you would connect to a real email service here
    // like SendGrid, Mailchimp, or AWS SES
    console.log(`Processing ${type} email notifications...`);

    // Get users who have enabled the specific notification type
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email_settings (*)
      `)
      .eq(`email_settings.${type}`, true);

    if (error) throw error;

    // Process each user who should receive this notification
    const processed = users?.map(user => {
      console.log(`Would send ${type} email to user ${user.id}`);
      return user.id;
    }) || [];

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processed.length} ${type} notifications`,
        processedUsers: processed
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in send-emails function:', error.message);
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
