import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const slogans = [
  "Breaking the silence, one story at a time.",
  "Your voice matters. Your story matters.",
  "Together we stand, united we heal.",
  "Empowering voices, creating change.",
  "You are not alone in this journey.",
  "Strength in sharing, power in unity."
];

export default function Home() {
  const [currentSlogan, setCurrentSlogan] = useState(slogans[0]);
  const [topStories, setTopStories] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialContent, setTestimonialContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan(slogans[Math.floor(Math.random() * slogans.length)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTopStories();
    fetchTestimonials();
  }, []);

  async function fetchTopStories() {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        author_id,
        profiles:author_id(username),
        reactions:reactions(count)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching top stories:', error);
      return;
    }

    if (data) {
      setTopStories(
        data.map((story) => ({
          ...story,
          reactionsCount: story.reactions?.[0]?.count || 0,
        }))
      );
    }
  }

  async function fetchTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        content,
        author_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
      return;
    }

    setTestimonials(data);
  }

  async function handleAddTestimonial(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
  
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Please sign in to add a testimonial.');
      setLoading(false);
      return;
    }
  
    const { error } = await supabase
      .from('testimonials')
      .insert({
        content: testimonialContent,
        author_id: user.id,
      });
  
    if (error) {
      toast.error('Failed to add testimonial. Please try again.');
      console.error('Error inserting testimonial:', error);
      setLoading(false);
      return;
    }
  
    toast.success('Testimonial added successfully!');
    setTestimonialContent(''); // Clear the form
    setLoading(false);
    fetchTestimonials(); // Refresh the testimonials list
  }

  return (
    <div className="min-h-screen">
    {/* Hero Section */}
<div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl">
    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-down">
      Welcome to SafeVoice
    </h1>
    <p className="text-xl md:text-2xl mb-8 animate-fade-in">
      {currentSlogan}
    </p>
    <p className="text-lg mb-8 animate-fade-in-up">
      A safe space to share your story and connect with others who understand
    </p>
  </div>
</div>

      {/* Top Stories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topStories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-200"
            >
              <h3 className="text-xl font-semibold mb-4">{story.title}</h3>
              <p className="text-gray-600 mb-4">
                {story.content.substring(0, 150)}...
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>By Anonymous_{story.author_id?.slice(0, 8) || 'Unknown'}</span>
                <span>{story.reactionsCount} reactions</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
<div className="bg-gray-100 py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
      Voices of Strength
    </h2>

    {/* Testimonial Submission Form */}
    <form onSubmit={handleAddTestimonial} className="mb-8">
      <textarea
        value={testimonialContent}
        onChange={(e) => setTestimonialContent(e.target.value)}
        placeholder="Share your experience..."
        className="w-full p-4 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
        rows={4}
        required
      ></textarea>
      <button
        type="submit"
        className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Give Your Review'}
      </button>
    </form>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 transform transition-transform duration-300 hover:scale-105"
        >
          <p className="text-gray-600 mb-4 font-normal hover:font-bold transition-all duration-300">
            "{testimonial.content}"
          </p>
          <p className="text-gray-800 font-semibold hover:font-normal transition-all duration-300">
            By Anonymous_{testimonial.author_id?.slice(0, 8) || 'Unknown'}
          </p>
        </div>
      ))}
    </div>
  </div>
</div>

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            About SafeVoice
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We provide a safe, anonymous platform for women to share their stories,
            find support, and access resources. Together, we're building a
            community of strength and healing.
          </p>
        </div>
      </div>
    </div>
  );
}