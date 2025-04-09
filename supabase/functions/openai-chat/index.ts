
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { message, userId } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate OpenAI key is set
    if (!openAiKey) {
      console.error("OpenAI API key is not configured");
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine user intent (workout, nutrition, meditation, etc.)
    let intent = "general";
    const lowercaseMsg = message.toLowerCase();
    
    if (lowercaseMsg.includes('workout') || lowercaseMsg.includes('exercise') || lowercaseMsg.includes('training')) {
      intent = "workout";
    } else if (lowercaseMsg.includes('food') || lowercaseMsg.includes('meal') || lowercaseMsg.includes('diet') || lowercaseMsg.includes('nutrition')) {
      intent = "nutrition";
    } else if (lowercaseMsg.includes('sleep') || lowercaseMsg.includes('meditat') || lowercaseMsg.includes('stress') || lowercaseMsg.includes('mind')) {
      intent = "wellness";
    } else if (lowercaseMsg.includes('goal') || lowercaseMsg.includes('progress') || lowercaseMsg.includes('weight')) {
      intent = "progress";
    }

    // Get user profile data to personalize responses if available
    let userProfile = null;
    if (userId) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      userProfile = profileData;
    }

    try {
      // Call OpenAI for AI response with improved error handling
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system", 
              content: `You are FitVibe, an AI wellness coach specializing in fitness, nutrition, mental wellness, and health tracking.
              ${userProfile ? `The user's name is ${userProfile.full_name || 'there'}.` : ''}
              ${userProfile ? `Their fitness stats: Height: ${userProfile.height || 'unknown'} cm, Weight: ${userProfile.weight || 'unknown'} kg.` : ''}
              ${userProfile && userProfile.goals ? `Their goals are: ${userProfile.goals.join(', ')}.` : ''}
              Provide personalized, practical advice. Be encouraging, friendly, and motivational.
              Keep responses concise (under 150 words) and actionable.
              Focus on realistic, science-based recommendations.`
            },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const openAiData = await response.json();
      const aiResponse = openAiData.choices[0].message.content;

      // Store chat history in the database
      if (userId) {
        await supabase
          .from('chatbot_history')
          .insert({
            user_id: userId,
            message: message,
            response: aiResponse,
            intent: intent
          });
      }

      return new Response(
        JSON.stringify({ response: aiResponse, intent }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (openAIError) {
      console.error('Error calling OpenAI:', openAIError.message);
      return new Response(
        JSON.stringify({ error: `Error calling OpenAI: ${openAIError.message}` }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
  } catch (error) {
    console.error('Error in openai-chat function:', error.message);
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
