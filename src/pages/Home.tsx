import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan(slogans[Math.floor(Math.random() * slogans.length)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTopStories();
  }, []);

  async function fetchTopStories() {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        profiles:author_id(username),
        reactions(count)
      `)
      .limit(3);

    if (!error && data) {
      setTopStories(data);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to SafeVoice
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in">
            {currentSlogan}
          </p>
          <p className="text-lg mb-8">
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
                <span>By Anonymous_{story.author_id.slice(0, 8)}</span>
                <span>{story.reactions.length} reactions</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Add testimonial cards here */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 mb-4">
                "Finding SafeVoice was a turning point in my healing journey. Here, I found understanding and support."
              </p>
              <p className="text-gray-800 font-semibold">Anonymous User</p>
            </div>
            {/* Add more testimonials */}
          </div>
        </div>
      </div>

      {/* About Section Preview */}
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