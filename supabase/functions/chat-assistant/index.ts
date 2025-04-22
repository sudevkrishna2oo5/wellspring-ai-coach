
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.20.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    
    // Initialize OpenAI
    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    }))

    const systemPrompt = `You are a helpful assistant for FitVibe, a fitness and wellness platform. Your role is to help users book consultations with fitness experts and navigate the platform.
    You should:
    - Help users understand how to book expert consultations
    - Explain the payment process
    - Guide users through selecting time slots
    - Answer questions about the experts' qualifications
    - Be friendly and professional`

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    return new Response(
      JSON.stringify({ response: response.data.choices[0].message?.content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
