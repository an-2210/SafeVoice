import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="ml-2 text-xl font-bold">SafeVoice</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your story. Your strength. Your Safe Voice.
            </p>
            <p className="text-gray-400">
              A safe space for women to share their stories and find support.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-pink-500">Home</Link>
              </li>
              <li>
                <Link to="/stories" className="text-gray-400 hover:text-pink-500">Stories</Link>
              </li>
              <li>
                <Link to="/share-story" className="text-gray-400 hover:text-pink-500">Share Story</Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-400 hover:text-pink-500">Resources</Link>
              </li>
              <li>
                <Link to="/faqs" className="text-gray-400 hover:text-pink-500">FAQs</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-pink-500">About</Link>
              </li>
              <li>
                <Link to="/PrivacyPolicy" className="text-gray-400 hover:text-pink-500">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/termsandconditions" className="text-gray-400 hover:text-pink-500">Terms and Conditions</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                Email: safevoiceforwomen@gmail.com
              </li>
              <li className="text-gray-400">
                Emergency: 1800-SAFE-NOW
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} SafeVoice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
