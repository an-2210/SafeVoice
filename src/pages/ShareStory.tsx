import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Edit, Trash2, CheckSquare, Loader2 } from 'lucide-react'; // Import icons

const TAGS = [
  // ... TAGS array ...
  'Workplace Harassment',
  'Domestic Violence',
  'Street Harassment',
  'Cyberbullying',
  'Sexual Harassment',
  'Discrimination',
  'Recovery',
  'Support',
  'Healing',
];

export default function ShareStory() {
  // ... existing states ...
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false); // Loading for form submission
  const [myStories, setMyStories] = useState<any[]>([]);
  const [correctedStories, setCorrectedStories] = useState<{ [storyId: string]: string }>({});
  const [loadingCorrection, setLoadingCorrection] = useState<{ [storyId: string]: boolean }>({});
  const [loadingFormCorrection, setLoadingFormCorrection] = useState(false); // Loading for form grammar check

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyStories();
  }, []);

  const fetchMyStories = async () => {
    // ... existing fetchMyStories code ...
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Please sign in to view your stories');
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          content,
          tags,
          media_urls,
          created_at,
          reactions (count)
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
        toast.error('Failed to fetch your stories.');
        return;
      }

      // Update the state with the latest data from the database
      setMyStories(data.map(story => ({
        ...story,
        reactionsCount: story.reactions?.[0]?.count || 0,
      })));
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to fetch your stories.');
    }
  };

  const handleDelete = async (storyId: string) => {
    // ... existing handleDelete code ...
    console.log('Deleting story with ID:', storyId); // Debugging log

    // Delete related reactions first
    const { error: reactionsError } = await supabase
      .from('reactions')
      .delete()
      .eq('story_id', storyId);

    if (reactionsError) {
      console.error('Error deleting reactions:', reactionsError);
      toast.error('Failed to delete reactions for the story.');
      return;
    }

    // Delete the story
    const { error: storyError } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (storyError) {
      console.error('Error deleting story:', storyError);
      toast.error('Failed to delete the story.');
      return;
    }

    toast.success('Story deleted successfully.');

    // Update the state to remove the deleted story
    setMyStories(prevStories => prevStories.filter(story => story.id !== storyId));
    // Also remove any corrected version from state
    setCorrectedStories(prev => {
      const newState = { ...prev };
      delete newState[storyId];
      return newState;
    });
  };

  const handleEdit = (story: any) => {
    // ... existing handleEdit code ...
    const contentToEdit = correctedStories[story.id] || story.content;
    navigate(`/edit-story/${story.id}`, { state: { story: { ...story, content: contentToEdit } } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      setLoading(false);
      return;
    }

    // Limit to 10 files
    if (mediaFiles.length > 10) {
      toast.error('You can upload a maximum of 10 files.');
      setLoading(false);
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Please sign in to share your story');
      navigate('/auth');
      setLoading(false);
      return;
    }

    let mediaUrls: string[] = [];
    if (mediaFiles) {
      for (const file of mediaFiles) {
        // Check file size (50 MB limit)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 50 MB.`);
          continue;
        }

        // Check file type
        const allowedTypes = ['image/', 'video/', 'audio/'];
        if (!allowedTypes.some(type => file.type.startsWith(type))) {
          toast.error(`File ${file.name} is not a supported type.`);
          continue;
        }

        const { data, error } = await supabase.storage
          .from('story-media')
          .upload(`${user.id}/${Date.now()}-${file.name}`, file);

        if (error) {
          console.error('Error uploading media:', error);
          toast.error('Failed to upload media. Please try again.');
          setLoading(false);
          return;
        }

        const publicUrl = supabase.storage
          .from('story-media')
          .getPublicUrl(data.path).data.publicUrl;

        mediaUrls.push(publicUrl);
      }
    }

    const { error } = await supabase
      .from('stories')
      .insert({
        title,
        content,
        tags: selectedTags,
        author_id: user.id,
        media_urls: mediaUrls, // Save media URLs in the database
      });

    if (error) {
      toast.error('Failed to share story. Please try again.');
      console.error('Error inserting story:', error);
      setLoading(false);
      return;
    }

    toast.success('Your story has been shared successfully');
    setLoading(false);

    // Fetch the updated stories list from the database
    fetchMyStories();

    // Reset the form
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setMediaFiles([]);
  };

  const toggleTag = (tag: string) => {
    // ... existing toggleTag code ...
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // --- Grammar Correction Handler (for existing stories) ---
  const handleGrammarFix = async (storyId: string, originalContent: string) => {
    // ... existing handleGrammarFix code ...
    setLoadingCorrection(prev => ({ ...prev, [storyId]: true }));
    try {
      // --- Make API call to your backend grammar correction endpoint ---
      // Replace with your actual deployed function URL
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/correct-grammar`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if needed
          // 'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
        },
        body: JSON.stringify({ content: originalContent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Grammar correction service failed with status ${response.status}`);
      }

      const { correctedContent } = await response.json();

      // Update the corrected stories state
      setCorrectedStories(prev => ({
        ...prev,
        [storyId]: correctedContent,
      }));

      toast.success('Grammar checked and updated.');

    } catch (error: any) {
      console.error("Grammar correction error:", error);
      toast.error(`Failed to correct grammar: ${error.message}`);
    } finally {
      setLoadingCorrection(prev => ({ ...prev, [storyId]: false }));
    }
  };
  // --- End Grammar Correction Handler ---

  // --- Grammar Correction Handler for the FORM ---
  const handleFormGrammarFix = async () => {
    if (!content.trim()) {
      toast.error("Please write something in the story content first.");
      return;
    }
    setLoadingFormCorrection(true);
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/correct-grammar`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if needed
        },
        body: JSON.stringify({ content: content }), // Send current form content
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Grammar correction service failed with status ${response.status}`);
      }

      const { correctedContent } = await response.json();

      // Update the form's content state directly
      setContent(correctedContent);

      toast.success('Grammar checked and updated in the editor.');

    } catch (error: any) {
      console.error("Form grammar correction error:", error);
      toast.error(`Failed to correct grammar: ${error.message}`);
    } finally {
      setLoadingFormCorrection(false);
    }
  };
  // --- End Form Grammar Correction Handler ---

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ... Form for sharing a new story ... */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Share Your Story</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow mb-12">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            required
          />
        </div>

        {/* Content Textarea */}
        <div>
          <div className="flex justify-between items-center mb-1"> {/* Container for label and button */}
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Your Story
            </label>
            {/* Form Grammar Fix Button */}
            <button
              type="button" // Important: Prevent form submission
              onClick={handleFormGrammarFix}
              className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loadingFormCorrection || !content.trim()} // Disable if loading or content is empty
              title="Fix Grammar in Editor"
            >
              {loadingFormCorrection ? (
                <Loader2 className="animate-spin h-4 w-4 mr-1" />
              ) : (
                <CheckSquare size={14} className="mr-1" /> // Slightly smaller icon
              )}
              {loadingFormCorrection ? 'Fixing...' : 'Fix Grammar'}
            </button>
          </div>
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            required
          />
        </div>

        {/* Media Upload */}
        <div>
          <label htmlFor="media" className="block text-sm font-medium text-gray-700">
            Upload Media (Optional, Max 50MB)
          </label>
          <input
            type="file"
            id="media"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={(e) => {
              if (!e.target.files) return;
              const newFiles = Array.from(e.target.files);
              setMediaFiles(prev =>
                [...prev, ...newFiles].slice(0, 10) // Keep only up to 10 files
              );
            }}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
          />
        </div>

        {/* Media Files List */}
        {mediaFiles.length > 0 && (
          <ul className="mt-2 text-sm text-gray-600">
            {mediaFiles.map((file, idx) => (
              <li key={idx} className="flex items-center">
                {file.name}
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:underline"
                  onClick={() =>
                    setMediaFiles(files => files.filter((_, i) => i !== idx))
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Tags Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-pink-500 text-white shadow'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center space-x-4 pt-4">
          <button
            type="submit"
            className="inline-flex items-center bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading || loadingFormCorrection} // Also disable if form correction is loading
          >
            {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />}
            {loading ? 'Sharing...' : 'Share Story'}
          </button>
          <p className="text-sm text-gray-500">
            Your identity will remain anonymous
          </p>
        </div>
      </form>


      {/* Display User's Stories */}
      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Your Stories</h2>
      {myStories.length === 0 ? (
        <p className="text-gray-500 text-center">You haven't shared any stories yet.</p>
      ) : (
        <ul className="space-y-6"> {/* Increased spacing */}
          {myStories.map(story => {
            const displayContent = correctedStories[story.id] || story.content; // Show corrected content if available
            const isCorrecting = loadingCorrection[story.id];

            return (
              <li key={story.id} className="bg-white shadow-md rounded-lg p-4 sm:p-6"> {/* Added padding */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{story.title}</h3> {/* Adjusted size/margin */}
                <p className="text-gray-700 whitespace-pre-wrap">{displayContent}</p> {/* Preserve line breaks */}

                {/* Display media if available */}
                {story.media_urls && story.media_urls.length > 0 && (
                  <div className="mt-4 space-y-3 border-t pt-4"> {/* Added border-top */}
                    {story.media_urls.map((url: string, index: number) => {
                      // ... media rendering logic (same as before) ...
                      const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i);
                      const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                      const isAudio = url.match(/\.(mp3|wav|ogg)$/i);

                      return (
                        <div key={index} className="relative rounded-md overflow-hidden border border-gray-200">
                          {isImage && (
                            <img
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="w-full max-h-80 object-contain bg-gray-50" // Adjusted max-height
                            />
                          )}
                          {isVideo && (
                            <video
                              controls
                              className="w-full max-h-80 object-contain bg-black" // Adjusted max-height
                            >
                              <source src={url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {isAudio && (
                            <audio controls className="w-full p-2 bg-gray-50">
                              <source src={url} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Story Footer with Tags, Reactions, and Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm"> {/* Added border-top, flex layout */}
                  {/* Tags and Reactions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-gray-500">
                    <span>Tags: {story.tags?.join(', ') || 'None'}</span>
                    <span>Reactions: {story.reactionsCount}</span>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3"> {/* Adjusted spacing */}
                    {/* Grammar Fix Button (for existing stories) */}
                    <button
                      onClick={() => handleGrammarFix(story.id, story.content)}
                      className="inline-flex items-center text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isCorrecting}
                      title="Fix Grammar"
                    >
                      {isCorrecting ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-1" />
                      ) : (
                        <CheckSquare size={16} className="mr-1" />
                      )}
                      {isCorrecting ? 'Fixing...' : 'Fix Grammar'}
                    </button>
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(story)}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      title="Edit Story"
                    >
                      <Edit size={16} className="mr-1" /> Edit
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="inline-flex items-center text-red-600 hover:text-red-800"
                      title="Delete Story"
                    >
                      <Trash2 size={16} className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}