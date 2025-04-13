import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Flag, Loader2 } from 'lucide-react'; // Added Loader2
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const SUPPORT_MESSAGES = [
  "You are not alone",
  "Stay strong",
  "We believe in you",
  "Your voice matters",
  "Thank you for sharing",
  "You are brave"
];

// Define supported languages for translation
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  // Add more languages as needed
];

export default function Stories() {
  const [stories, setStories] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  // State to store translated content: { storyId: { langCode: { title: '...', content: '...' } } }
  const [translatedStories, setTranslatedStories] = useState<{ [storyId: string]: { [langCode: string]: { title: string; content: string } } }>({});
  // State to track the selected language for each story: { storyId: langCode }
  const [targetLanguages, setTargetLanguages] = useState<{ [storyId: string]: string }>({});
  // State to track loading status for translation: { storyId: boolean }
  const [loadingTranslations, setLoadingTranslations] = useState<{ [storyId: string]: boolean }>({});


  useEffect(() => {
    fetchStories();
    fetchTags();
  }, []); // Fetch only once on mount

  // Refetch stories if tags change (optional, depends on desired behavior)
  useEffect(() => {
     // If you want filtering based on selectedTags, modify fetchStories query
     // fetchStories(selectedTags);
  }, [selectedTags]);


  async function fetchStories(/* filterTags: string[] = [] */) { // Optional: Pass tags for filtering
    // ...existing code...
    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        tags,
        media_urls,
        created_at,
        author_id,
        reactions:reactions(count)
      `)
      .order('created_at', { ascending: false });

    // Example filtering (if needed):
    // if (filterTags.length > 0) {
    //   query = query.contains('tags', filterTags);
    // }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to fetch stories.');
      return;
    }

    setStories(
      data.map((story) => ({
        ...story,
        reactionsCount: story.reactions?.[0]?.count || 0,
      }))
    );
  }

  async function fetchTags() {
    // ...existing code...
    const { data, error } = await supabase
      .from('stories')
      .select('tags');

    if (error) {
      console.error('Error fetching tags:', error);
      // toast.error('Failed to fetch tags.'); // Maybe less intrusive
      return;
    }

    if (data) {
      // Get unique tags, filter out null/empty tags if necessary
      const tags = Array.from(new Set(data.flatMap((story) => story.tags || []).filter(Boolean)));
      setAvailableTags(tags);
    }
  }

  const handleReaction = async (storyId: string, type: string) => {
    // ...existing code...
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Please sign in to react to stories');
      return;
    }

    // Check if user already reacted (optional, requires different schema/logic)

    const { error } = await supabase
      .from('reactions')
      .insert({
        story_id: storyId,
        user_id: user.id,
        type
      });

    if (error) {
      // Handle potential unique constraint violation if user already reacted
      if (error.code === '23505') { // Example code for unique violation
         toast.error('You have already reacted to this story.');
      } else {
        console.error('Error adding reaction:', error);
        toast.error('Failed to add reaction.');
      }
      return;
    }

    toast.success('Reaction added');
    // Optimistic update or refetch
     setStories(prevStories => prevStories.map(s =>
       s.id === storyId ? { ...s, reactionsCount: (s.reactionsCount || 0) + 1 } : s
     ));
    // Or fetchStories();
  };

  const handleReport = async (storyId: string) => {
    // ...existing code...
     const { data: { user }, error: userError } = await supabase.auth.getUser();
     if (userError || !user) {
       toast.error('Please sign in to report stories');
       return;
     }

     // Consider adding a 'reports' table instead of just incrementing a count
     // for better tracking and moderation.
     // Example using RPC (make sure 'increment_report_count' exists in Supabase SQL Editor):
     /*
     const { error } = await supabase.rpc('increment_report_count', {
       p_story_id: storyId // Match parameter name in your SQL function
     });

     if (error) {
       console.error('Error reporting story:', error);
       toast.error('Failed to report story.');
       return;
     }
     */

     // Placeholder for reporting logic
     console.log(`Reporting story ${storyId} by user ${user.id}`);
     toast.success('Story reported. Thank you.');
  };

  // --- Translation Handler ---
  const handleLanguageChange = async (storyId: string, targetLang: string) => {
    // ...existing code...
    // Reset to original if 'original' is selected or language is empty
    if (!targetLang || targetLang === 'original') {
      setTargetLanguages(prev => ({ ...prev, [storyId]: 'original' }));
      return;
    }

    // Update the target language state immediately for UI feedback
    setTargetLanguages(prev => ({ ...prev, [storyId]: targetLang }));
    setLoadingTranslations(prev => ({ ...prev, [storyId]: true }));

    try {
      // Check if translation is already cached in state
      if (translatedStories[storyId]?.[targetLang]) {
        setLoadingTranslations(prev => ({ ...prev, [storyId]: false }));
        return; // Use cached translation
      }

      const storyToTranslate = stories.find(s => s.id === storyId);
      if (!storyToTranslate) {
        throw new Error("Story not found");
      }

      // --- Make API call to your backend endpoint ---
      // Replace '/api/translate' with your actual endpoint URL
      // Ensure your deployed function URL is used here, e.g., from Supabase settings
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`; // Example URL structure

      const response = await fetch(functionUrl, { // Use the function URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if your function requires it
          // 'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
         },
        body: JSON.stringify({
          title: storyToTranslate.title,
          content: storyToTranslate.content,
          targetLang: targetLang, // e.g., 'hi', 'es'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to get error details
        throw new Error(errorData.error || `Translation service failed with status ${response.status}`);
      }

      const { translatedTitle, translatedContent } = await response.json();
      // --- End API call ---

      // Update the translated stories cache state
      setTranslatedStories(prev => ({
        ...prev,
        [storyId]: {
          ...(prev[storyId] || {}), // Preserve other language translations for this story
          [targetLang]: { title: translatedTitle, content: translatedContent },
        },
      }));

      const langName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
      toast.success(`Story translated to ${langName}`);

    } catch (error: any) {
      console.error("Translation error:", error);
      toast.error(`Failed to translate story: ${error.message}`);
      // Revert language selection back to original on error
      setTargetLanguages(prev => ({ ...prev, [storyId]: 'original' }));
    } finally {
      // Ensure loading state is turned off
      setLoadingTranslations(prev => ({ ...prev, [storyId]: false }));
    }
  };

  // --- Support Message Handler ---
  const handleSupport = () => {
    const randomMessage = SUPPORT_MESSAGES[Math.floor(Math.random() * SUPPORT_MESSAGES.length)];
    toast(randomMessage, { icon: '💖' }); // Use a relevant icon
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Stories of Strength</h1>

      {/* Tags filter */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-700 mb-4 text-center">Filter by tags:</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {/* ... Tag buttons ... */}
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                )
              }
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-pink-500 text-white hover:bg-pink-600 shadow'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
             <button
               onClick={() => setSelectedTags([])}
               className="px-3 py-1 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-300"
             >
               Clear Filters
             </button>
           )}
        </div>
      </div>

      {/* Stories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"> {/* Adjusted gap */}
        {stories
          // Optional: Client-side filtering if not done in the query
          .filter(story => selectedTags.length === 0 || selectedTags.some(tag => story.tags?.includes(tag)))
          .map((story) => {
            // Determine content to display based on selected language
            const currentTargetLang = targetLanguages[story.id] || 'original';
            const translation = translatedStories[story.id]?.[currentTargetLang];
            const displayTitle = currentTargetLang !== 'original' && translation ? translation.title : story.title;
            const displayContent = currentTargetLang !== 'original' && translation ? translation.content : story.content;
            const isLoading = loadingTranslations[story.id];

            return (
              // Improved Card Structure
              <div key={story.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow hover:shadow-xl"> {/* Added overflow-hidden, adjusted shadow */}

                {/* Card Header with Language Selector */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex-grow mr-2 truncate">{displayTitle}</h2> {/* Truncate long titles */}
                  <div className="flex items-center flex-shrink-0"> {/* Prevent selector from shrinking */}
                    {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4 text-gray-500" />}
                    <select
                      value={currentTargetLang}
                      onChange={(e) => handleLanguageChange(story.id, e.target.value)}
                      disabled={isLoading}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-pink-500"
                      aria-label={`Translate story ${story.id}`}
                    >
                      <option value="original">Original</option> {/* Shortened label */}
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-grow"> {/* Content takes available space */}
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">{displayContent}</p> {/* Adjusted text size and leading */}

                  {/* Media Display */}
                  {story.media_urls && story.media_urls.length > 0 && (
                    <div className="mb-4 space-y-3"> {/* Adjusted spacing */}
                      {story.media_urls.map((url: string, index: number) => {
                        const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i);
                        const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                        const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

                        return (
                          <div key={index} className="relative rounded-md overflow-hidden border border-gray-200"> {/* Added border */}
                            {isImage && (
                              <img
                                src={url}
                                alt={`Media ${index + 1}`}
                                className="w-full max-h-64 object-contain bg-gray-50" // Slightly increased max-height
                              />
                            )}
                            {isVideo && (
                              <video
                                controls
                                className="w-full max-h-64 object-contain bg-black" // Slightly increased max-height
                              >
                                <source src={url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            )}
                            {isAudio && (
                              <audio controls className="w-full p-2 bg-gray-50"> {/* Added padding and background */}
                                <source src={url} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {(story.tags || []).map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs font-medium" // Adjusted style
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500"> {/* Added background */}
                  <div className="flex items-center space-x-4">
                    {/* Like Button */}
                    <button
                      onClick={() => handleReaction(story.id, 'heart')}
                      className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 transition-colors group"
                      title="Like"
                    >
                      <Heart size={18} className="group-hover:fill-current" /> {/* Slightly larger icon, fill on hover */}
                      <span className="font-medium">{story.reactionsCount || 0}</span>
                    </button>
                    {/* Support Button */}
                    <button
                      onClick={handleSupport}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors group"
                      title="Send Support"
                    >
                      <MessageCircle size={18} className="group-hover:fill-current" /> {/* Slightly larger icon, fill on hover */}
                      {/* Optional: Add text like "Support" */}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs italic">By Anon_{story.author_id?.slice(0, 6) || '...'}</span> {/* Added italic */}
                    {/* Report Button */}
                    <button
                      onClick={() => handleReport(story.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Report story"
                    >
                      <Flag size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
       {stories.length === 0 && !loadingTranslations /* Adjust loading check if needed */ && ( // Show message if no stories fetched and not loading
         <p className="text-center text-gray-500 mt-12 text-lg">No stories found matching your criteria.</p>
       )}
       {/* Optional: Add a loading indicator for initial fetch */}
       {/* {isLoadingStories && <Loader2 className="animate-spin mx-auto mt-12 h-8 w-8 text-pink-500" />} */}
    </div>
  );
}