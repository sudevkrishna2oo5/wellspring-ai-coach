
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    console.log("Processing request to openai-chat function");
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

    // Log the key format (not the actual key) for debugging
    console.log("API Key format check:", openAiKey ? `Key length: ${openAiKey.length}, starts with: ${openAiKey.substring(0, 3)}...` : "Key not set");

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
    } else if (lowercaseMsg.includes('timer') || lowercaseMsg.includes('alarm') || lowercaseMsg.includes('interval')) {
      intent = "timer";
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
      console.log("Calling OpenAI API...");
      
      // Call OpenAI for AI response with improved error handling
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey.trim()}` // Trim whitespace from API key
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
              Focus on realistic, science-based recommendations.
              
              If the user asks about setting timers or alarms for workouts, tell them about the timer feature in the app that they can access by going to the Timer page.
              
              If the user asks questions about their progress or stats, reference their profile data if available.`
            },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      console.log("OpenAI response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        
        // Try to provide more specific error messaging
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else if (response.status === 401) {
          throw new Error("OpenAI authentication error. Please check your API key.");
        } else {
          throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
        }
      }

      const openAiData = await response.json();
      console.log("OpenAI response received successfully");
      
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
