import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'; // Ensure this is in your import_map.json

// Supported languages for translation
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

// IMPORTANT: Store your API key securely as an environment variable in Supabase
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

serve(async (req: Request) => {
  // Handle CORS if calling from a different origin than your Supabase URL
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Or your specific frontend domain
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Respond to OPTIONS requests for CORS preflight
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
    const { title, content, targetLang } = await req.json();

    if (!title || !content || !targetLang) {
      return new Response(JSON.stringify({ error: 'Missing title, content, or targetLang' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or "gemini-1.5-flash", etc.

    // Find language name for the prompt
    const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;

    const titlePrompt = `Translate the following story title accurately to ${targetLangName}. Output only the translated title:\n"${title}"`;
    const contentPrompt = `Translate the following story content accurately to ${targetLangName}. Output only the translated content:\n"${content}"`;

    console.log(`Translating to ${targetLangName} (${targetLang})...`);

    // Make parallel calls to Gemini
    const [titleResult, contentResult] = await Promise.all([
      model.generateContent(titlePrompt),
      model.generateContent(contentPrompt),
    ]);

    // Extract text safely
    const translatedTitle = titleResult?.response?.text()?.trim() || title; // Fallback to original
    const translatedContent = contentResult?.response?.text()?.trim() || content; // Fallback to original

    console.log("Translation successful.");

    return new Response(JSON.stringify({ translatedTitle, translatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error during translation request:', error);
    return new Response(JSON.stringify({ error: 'Failed to translate content' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});