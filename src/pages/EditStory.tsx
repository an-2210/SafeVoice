import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

export default function EditStory() {
  const location = useLocation();
  const navigate = useNavigate();
  const story = location.state?.story;

  const [title, setTitle] = useState(story?.title || '');
  const [content, setContent] = useState(story?.content || '');
  const [tags, setTags] = useState<string[]>(story?.tags || []);
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null); // New media files
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>(story?.media_urls || []); // Existing media URLs
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      setLoading(false);
      return;
    }

    let updatedMediaUrls = [...existingMediaUrls]; // Start with existing media URLs

    // Upload new media files if any
    if (mediaFiles) {
      for (const file of Array.from(mediaFiles)) {
        // Check file size (50 MB limit)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 50 MB.`);
          continue;
        }

        // Check file type
        const allowedTypes = ['image/', 'video/', 'audio/'];
        if (!allowedTypes.some((type) => file.type.startsWith(type))) {
          toast.error(`File ${file.name} is not a supported type.`);
          continue;
        }

        const { data, error } = await supabase.storage
          .from('story-media')
          .upload(`${story.id}/${Date.now()}-${file.name}`, file);

        if (error) {
          console.error('Error uploading media:', error);
          toast.error('Failed to upload media. Please try again.');
          setLoading(false);
          return;
        }

        const publicUrl = supabase.storage
          .from('story-media')
          .getPublicUrl(data.path).data.publicUrl;

        updatedMediaUrls.push(publicUrl);
      }
    }

    // Update the story in the database
    const { error } = await supabase
      .from('stories')
      .update({
        title,
        content,
        tags,
        media_urls: updatedMediaUrls, // Save updated media URLs
      })
      .eq('id', story.id);

    if (error) {
      toast.error('Failed to update story. Please try again.');
      console.error('Error updating story:', error);
      setLoading(false);
      return;
    }

    toast.success('Story updated successfully!');
    setLoading(false);
    navigate('/share-story'); // Redirect back to the ShareStory page
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRemoveMedia = (url: string) => {
    setExistingMediaUrls((prev) => prev.filter((mediaUrl) => mediaUrl !== url));
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tags.includes(tag)
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="media" className="block text-sm font-medium text-gray-700">
            Upload New Media (Optional)
          </label>
          <input
            type="file"
            id="media"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={(e) => setMediaFiles(e.target.files)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
          />
        </div>

        {existingMediaUrls.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing Media
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingMediaUrls.map((url, index) => (
                <div key={index} className="relative">
                  {url.match(/\.(jpeg|jpg|gif|png)$/i) && (
                    <img src={url} alt={`Media ${index + 1}`} className="w-full rounded-md" />
                  )}
                  {url.match(/\.(mp4|webm|ogg)$/i) && (
                    <video controls className="w-full rounded-md">
                      <source src={url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {url.match(/\.(mp3|wav|ogg)$/i) && (
                    <audio controls className="w-full">
                      <source src={url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(url)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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