import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Import slick-carousel CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slogans = [
  "Breaking the silence, one story at a time.",
  "Your voice matters. Your story matters.",
  "Together we stand, united we heal.",
  "Empowering voices, creating change.",
  "You are not alone in this journey.",
  "Strength in sharing, power in unity."
];

// Define a type for the story object for better type safety
interface Story {
  id: string;
  title: string;
  content: string;
  media_urls?: string[];
  author_id?: string;
  profiles?: { username?: string };
  reactions?: { count: number }[];
  reactionsCount?: number; // Added for client-side sorting
}

// Define a type for Testimonials
interface Testimonial {
  id: string; // Assuming testimonials also have an ID
  content: string;
  author_id?: string;
}



const testimonialSliderSettings = {
  dots: false,
  arrows: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,

  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        arrows: true,
        dots: false,

      }
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        arrows: true,
        dots: false,

      }
    }
  ]
};

export default function Home() {
  const [currentSlogan, setCurrentSlogan] = useState(slogans[0]);
  const [topStories, setTopStories] = useState<Story[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialContent, setTestimonialContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

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
        media_urls,
        author_id,
        profiles:author_id(username),
        reactions:reactions(count)
      `)
      .order('created_at', { ascending: false })
      .limit(9); // Fetch more stories for the slider (e.g., 9 for 3 slides of 3)

    if (error) {
      console.error('Error fetching stories for top stories:', error);
      return;
    }

    if (data) {
      const storiesWithReactions: Story[] = data.map((story) => ({
        ...story,
        profiles: Array.isArray(story.profiles) ? story.profiles[0] : story.profiles, // Fix: get first profile object
        reactionsCount: story.reactions?.[0]?.count || 0,
      }));
      storiesWithReactions.sort((a, b) => (b.reactionsCount ?? 0) - (a.reactionsCount ?? 0));
      setTopStories(storiesWithReactions); // Set all fetched & sorted stories for the slider
    }
  }

  async function fetchTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        id,
        content,
        author_id
      `)
      .order('created_at', { ascending: false })
      .limit(9); // Fetch more testimonials for the slider

    if (error) {
      console.error('Error fetching testimonials:', error);
      return;
    }
    if (data) {
      setTestimonials(data as Testimonial[]);
    }
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
    setTestimonialContent('');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Top Stories</h2>
        {topStories.length > 0 ? (
          <Slider
            dots={false}
            arrows={true}
            infinite={topStories.length > 3}
            speed={500}
            slidesToShow={3}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={5000}

            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                  infinite: topStories.length > 2,
                  arrows: true,
                  dots: false,

              }},
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  infinite: topStories.length > 1,
                  arrows: true,
                  dots: false,

                }
              }
            ]}
          >
            {topStories
              .sort((a, b) => (b.reactionsCount ?? 0) - (a.reactionsCount ?? 0))
              .slice(0, 9)
              .map((story) => {
                const isExpanded = expandedStoryId === story.id;
                const shouldTruncate = story.content.length > 600 && !isExpanded;
                return (
                  <div key={story.id} className="px-4">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col w-[420px] max-w-full mx-auto transform hover:scale-105 transition-transform duration-300">
                      <div className="p-8 flex-grow">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">{story.title}</h3>
                        <p className="text-gray-600 text-base mb-4">
                          {shouldTruncate
                            ? `${story.content.substring(0, 600)}...`
                            : story.content}
                          {shouldTruncate && (
                            <button
                              onClick={() => setExpandedStoryId(story.id)}
                              className="ml-2 text-pink-600 hover:text-pink-700 font-semibold transition-colors duration-200"
                            >
                              Read More
                            </button>
                          )}
                          {isExpanded && story.content.length > 600 && (
                            <button
                              onClick={() => setExpandedStoryId(null)}
                              className="ml-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200"
                            >
                              Show Less
                            </button>
                          )}
                        </p>
                      </div>
                      <div className="p-6 border-t border-gray-100">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>By Anonymous_{story.author_id?.slice(0, 6) || 'User'}</span>
                          <span>{story.reactionsCount ?? 0} reactions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </Slider>
        ) : (
          <p className="col-span-full text-center text-gray-500">No top stories available at the moment.</p>
        )}
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Voices of Strength
          </h2>

          {/* Testimonial Submission Form */}
          <form onSubmit={handleAddTestimonial} className="mb-12 max-w-xl mx-auto">
            <textarea
              value={testimonialContent}
              onChange={(e) => setTestimonialContent(e.target.value)}
              placeholder="Share your experience with SafeVoice..."
              className="w-full p-4 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              rows={4}
              required
            ></textarea>
            <button
              type="submit"
              className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Give Your Review'}
            </button>
          </form>

          {testimonials.length > 0 ? (
            testimonials.length > 3 ? ( // Only use Slider if more than 3 testimonials
              <Slider {...testimonialSliderSettings}>
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="px-2 sm:px-3"> {/* Add padding for spacing */}
                    <div
                      className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-between transform transition-transform duration-300 hover:scale-105"
                    >
                      <p className="text-gray-600 mb-4 font-normal text-sm italic">
                        "{testimonial.content}"
                      </p>
                      <p className="text-gray-800 font-semibold text-xs text-right">
                        By Anonymous_{testimonial.author_id?.slice(0, 8) || 'User'}
                      </p>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              // Fallback for 1-3 testimonials
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="px-2 sm:px-3">
                     <div
                      className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-between transform transition-transform duration-300 hover:scale-105"
                    >
                      <p className="text-gray-600 mb-4 font-normal text-sm italic">
                        "{testimonial.content}"
                      </p>
                      <p className="text-gray-800 font-semibold text-xs text-right">
                        By Anonymous_{testimonial.author_id?.slice(0, 8) || 'User'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-center text-gray-500">No testimonials yet. Be the first to share your experience!</p>
          )}
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