import React from 'react';
import { Phone, Globe, Shield, BookOpen, Heart, AlertTriangle } from 'lucide-react';

export default function Resources() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Resources & Support</h1>

      {/* Emergency Contacts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Phone className="h-8 w-8 text-pink-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Women's Emergency Helpline</h3>
            <p className="text-gray-600 mb-2">24/7 Support: 1800-SAFE-NOW</p>
            <p className="text-sm text-gray-500">Immediate assistance and support for women in crisis</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Police Emergency</h3>
            <p className="text-gray-600 mb-2">Emergency: 911</p>
            <p className="text-sm text-gray-500">For immediate police assistance</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <Heart className="h-8 w-8 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Crisis Counseling</h3>
            <p className="text-gray-600 mb-2">1800-HELP-NOW</p>
            <p className="text-sm text-gray-500">24/7 confidential emotional support</p>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Tips</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Shield className="h-8 w-8 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-4">Personal Safety</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Trust your instincts</li>
                <li>• Stay aware of your surroundings</li>
                <li>• Keep emergency contacts readily available</li>
                <li>• Learn basic self-defense techniques</li>
                <li>• Use safety apps when traveling alone</li>
              </ul>
            </div>
            <div>
              <Globe className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-4">Online Safety</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Use strong, unique passwords</li>
                <li>• Enable two-factor authentication</li>
                <li>• Be careful with personal information</li>
                <li>• Report online harassment</li>
                <li>• Block and report abusive accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Resources */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Educational Resources</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <BookOpen className="h-8 w-8 text-yellow-500 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal Rights</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Understanding workplace rights</li>
                <li>• Domestic violence laws</li>
                <li>• Restraining orders</li>
                <li>• Legal aid resources</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support Groups</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Local support meetings</li>
                <li>• Online communities</li>
                <li>• Therapy resources</li>
                <li>• Survivor networks</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Recovery Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Trauma recovery guides</li>
                <li>• Self-care practices</li>
                <li>• Healing workshops</li>
                <li>• Professional counseling</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-4">
            For any questions, concerns, or support needs, please reach out to us:
          </p>
          <p className="text-gray-600">
            Email: <a href="mailto:safevoice@gmail.com" className="text-pink-500 hover:text-pink-600">safevoice@gmail.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}