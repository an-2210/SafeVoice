// filepath: c:\Users\piyus\OneDrive\Desktop\SafeVoice\supabase\functions\correct-grammar\index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

// IMPORTANT: Set GEMINI_API_KEY in your Supabase Project's Environment Variables
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or your specific frontend domain for better security
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable not set.");
    return new Response(JSON.stringify({ error: 'API key not configured on server' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return new Response(JSON.stringify({ error: 'Missing or invalid content' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Or "gemini-1.5-flash", etc.

    const prompt = `Correct the grammar and spelling mistakes in the following text. Preserve the original meaning and tone. Only output the corrected text, without any introductory phrases like "Here is the corrected text:":\n\n"${content}"`;

    console.log("Requesting grammar correction...");

    const result = await model.generateContent(prompt);
    const response = result?.response;
    const correctedContent = response?.text()?.trim() || content; // Fallback to original if correction fails

    console.log("Grammar correction successful.");

    return new Response(JSON.stringify({ correctedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });



    } catch (error: any) { // <-- Add ': any' here
        console.error('Error during grammar correction request:', error);
        // Avoid sending detailed internal errors to the client
        let errorMessage = 'Failed to correct grammar';
        // Now you can safely access error.message
        if (error && error.message && typeof error.message === 'string' && error.message.includes('SAFETY')) { // Check if it's a safety setting block
            errorMessage = 'Content blocked due to safety settings.';
        }
        return new Response(JSON.stringify({ error: errorMessage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
        });
    }
    });



console.log("Grammar correction function started..."); // Log when the function initializes