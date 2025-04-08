import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function EditStory() {
  const location = useLocation();
  const navigate = useNavigate();
  const { story } = location.state || {}; // Get the story data passed via navigation

  const [title, setTitle] = useState(story?.title || '');
  const [content, setContent] = useState(story?.content || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('stories')
      .update({ title, content })
      .eq('id', story.id);

    if (error) {
      console.error('Error updating story:', error);
      toast.error('Failed to update the story. Please try again.');
      setLoading(false);
      return;
    }

    toast.success('Story updated successfully!');
    setLoading(false);
    navigate('/share-story'); // Redirect back to the ShareStory page
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Your Story</h1>
      <form onSubmit={handleUpdate} className="space-y-6">
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

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Story'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/share-story')}
            className="text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}