import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Flag } from 'lucide-react';
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

export default function Stories() {
  const [stories, setStories] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    fetchStories();
    fetchTags();
  }, [selectedTags]);

  async function fetchStories() {
    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        tags,
        created_at,
        author_id,
        profiles:author_id(username),
        reactions(count)
      `)
      .order('created_at', { ascending: false });
  
    if (selectedTags.length > 0) {
      query = query.contains('tags', selectedTags);
    }
  
    const { data, error } = await query;
  
    if (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to fetch stories. Please try again.');
      return;
    }
  
    console.log('Fetched stories:', data); // Debugging log
  
    if (data) {
      setStories(data);
    }
  }

  async function fetchTags() {
    const { data, error } = await supabase
      .from('stories')
      .select('tags');

    if (!error && data) {
      const tags = Array.from(new Set(data.flatMap(story => story.tags)));
      setAvailableTags(tags);
    }
  }

  const handleReaction = async (storyId: string, type: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Please sign in to react to stories');
      return;
    }
  
    const { error } = await supabase
      .from('reactions')
      .insert({
        story_id: storyId,
        user_id: user.id,
        type
      });
  
    if (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction. Please try again.');
      return;
    }
  
    toast.success('Reaction added');
    fetchStories(); // Refresh stories
  };

  const handleReport = async (storyId: string) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    toast.error('Please sign in to report stories');
    return;
  }

  const { error } = await supabase.rpc('increment_report_count', {
    story_id: storyId
  });

  if (error) {
    console.error('Error reporting story:', error);
    toast.error('Failed to report story. Please try again.');
    return;
  }

  toast.success('Story reported. Thank you for helping keep our community safe.');
};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Stories of Strength</h1>

      {/* Tags filter */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Filter by tags:</h2>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTags(prev =>
                prev.includes(tag)
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              )}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTags.includes(tag)
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Stories grid */}
      <div className="grid grid-cols-1 gap-8">
        {stories.map((story) => (
          <div key={story.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{story.title}</h2>
            <p className="text-gray-600 mb-4">{story.content}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {story.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleReaction(story.id, 'heart')}
                  className="flex items-center space-x-1 text-pink-500 hover:text-pink-600"
                >
                  <Heart size={16} />
                  <span>{story.reactions.length}</span>
                </button>
                <button
                  onClick={() => handleReaction(story.id, 'support')}
                  className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                >
                  <MessageCircle size={16} />
                  <span>{SUPPORT_MESSAGES[Math.floor(Math.random() * SUPPORT_MESSAGES.length)]}</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span>By Anonymous_{story.author_id.slice(0, 8)}</span>
                <button
                  onClick={() => handleReport(story.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Report story"
                >
                  <Flag size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}