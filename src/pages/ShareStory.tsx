import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const TAGS = [
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [myStories, setMyStories] = useState<any[]>([]); // To store user's stories
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyStories();
  }, []);

  const fetchMyStories = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Please sign in to view your stories');
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        tags,
        created_at,
        reactions:reactions(count)
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
  };

  const handleDelete = async (storyId: string) => {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete the story.');
      return;
    }

    toast.success('Story deleted successfully.');

    // Fetch the updated stories list from the database
    fetchMyStories();
  };

  const handleEdit = (story: any) => {
    navigate(`/edit-story/${story.id}`, { state: { story } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
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

    const { error } = await supabase
      .from('stories')
      .insert({
        title,
        content,
        tags: selectedTags,
        author_id: user.id,
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
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Share Your Story</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Your Story
          </label>
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            required
          />
        </div>

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

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Sharing...' : 'Share Story'}
          </button>
          <p className="text-sm text-gray-500">
            Your identity will remain anonymous
          </p>
        </div>
      </form>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Your Stories</h2>
      {myStories.length === 0 ? (
        <p className="text-gray-500">You haven't shared any stories yet.</p>
      ) : (
        <ul className="space-y-4">
          {myStories.map(story => (
            <li key={story.id} className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900">{story.title}</h3>
              <p className="text-gray-700 mt-2">{story.content}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Tags: {story.tags?.join(', ') || 'None'}
                </div>
                <div className="text-sm text-gray-500">
                  Reactions: {story.reactionsCount}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(story)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}