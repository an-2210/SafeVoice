import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'; // Make sure to add to import_map.json

// IMPORTANT: Store your API key securely as an environment variable in Supabase
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Define SUPPORTED_LANGUAGES constant here so it's accessible within the handler
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  // Add more languages as needed
];

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or your specific frontend domain for better security
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Explicitly allow POST and OPTIONS
};


serve(async (req: Request) => { // Changed variable name from req to req for consistency
  // --- START: Handle CORS Preflight Request ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  // --- END: Handle CORS Preflight Request ---

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable not set.");
    return new Response(JSON.stringify({ error: 'API key not configured on server' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { title, content, targetLang } = await req.json();

    // Added more specific checks
    if (!content || typeof content !== 'string' || !targetLang || typeof targetLang !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid content or targetLang' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    // Title is optional for translation, handle if missing
    const effectiveTitle = title && typeof title === 'string' ? title : '';


    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use the updated model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Find language name for the prompt
    const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;

    // Create prompts
    const contentPrompt = `Translate the following story content accurately to ${targetLangName}. Output only the translated content:\n"${content}"`;
    const titlePrompt = effectiveTitle ? `Translate the following story title accurately to ${targetLangName}. Output only the translated title:\n"${effectiveTitle}"` : null;

    console.log(`Translating to ${targetLangName} (${targetLang})...`);

    // Prepare promises
    const promises = [model.generateContent(contentPrompt)];
    if (titlePrompt) {
      promises.unshift(model.generateContent(titlePrompt)); // Add title promise only if title exists
    }

    // Make calls to Gemini
    const results = await Promise.all(promises);

    // Extract text safely
    let translatedTitle = effectiveTitle; // Default to original or empty
    let translatedContent = content; // Default to original
    let titleIndex = -1;
    let contentIndex = -1;

    if (titlePrompt) {
        titleIndex = 0;
        contentIndex = 1;
        translatedTitle = results[titleIndex]?.response?.text()?.trim() || effectiveTitle;
    } else {
        contentIndex = 0; // Only content was requested
    }
    translatedContent = results[contentIndex]?.response?.text()?.trim() || content;


     console.log("Translation successful.");

    return new Response(JSON.stringify({ translatedTitle, translatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) { // Added ': any' for better error handling
    console.error('Error during translation request:', error);
    // Add specific error message check
    let errorMessage = 'Failed to translate content';
     if (error?.message?.includes('SAFETY')) {
         errorMessage = 'Content blocked due to safety settings.';
     }
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})

console.log("Translate function started..."); // Log when the function initializes