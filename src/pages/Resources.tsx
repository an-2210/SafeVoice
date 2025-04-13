import React, { useState, useEffect } from 'react';
import { Phone, Globe, Shield, BookOpen, Heart, AlertTriangle } from 'lucide-react';

// Define the structure of an NGO object
interface NGO {
  id: string;
  name: string;
  description: string;
}

export default function Resources() {
  const [ngoName, setNGOName] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const [ngos, setNGOs] = useState<NGO[]>([]); // State to store NGOs
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [visibleNGOs, setVisibleNGOs] = useState(3); // State to control visible NGOs

  // Fetch NGOs from the backend
  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/approved-ngos`);
        if (!response.ok) {
          throw new Error('Failed to fetch NGOs');
        }
        const data: NGO[] = await response.json(); // Ensure the response matches the NGO type
        setNGOs(data);
      } catch (error) {
        console.error('Error fetching NGOs:', error);
      }
    };

    fetchNGOs();
  }, []);

  // Filter NGOs based on the search query
  const filteredNGOs = ngos.filter((ngo) =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ngo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShowMore = () => {
    setVisibleNGOs((prev) => prev + 3); // Show 3 more NGOs
  };

  const handleNGORequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const requestData = {
      name: ngoName,
      description,
      contact,
      email,
      registrationNumber,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/send-ngo-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        alert('Your request has been submitted successfully!');
        setNGOName('');
        setDescription('');
        setContact('');
        setEmail('');
        setRegistrationNumber('');
      } else {
        alert('Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting NGO request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Resources & Support</h1>

      {/* Collaborated NGOs Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Collaborated NGOs</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search NGOs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNGOs.slice(0, visibleNGOs).map((ngo) => (
            <div key={ngo.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">{ngo.name}</h3>
              <p className="text-gray-600">{ngo.description}</p>
            </div>
          ))}
        </div>
        {visibleNGOs < filteredNGOs.length && (
          <button
            onClick={handleShowMore}
            className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            Show More
          </button>
        )}
      </section>

      {/* NGO Request Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Request to Add Your NGO</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleNGORequest}>
            <div className="mb-4">
              <label htmlFor="ngoName" className="block text-sm font-medium text-gray-700">
                NGO Name
              </label>
              <input
                type="text"
                id="ngoName"
                value={ngoName}
                onChange={(e) => setNGOName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                rows={4}
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                type="text"
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                NGO Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </section>

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
            <p className="text-gray-600 mb-2">Emergency: 100</p>
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
            Email: <a href="mailto:safevoiceforwomen@gmail.com" className="text-pink-500 hover:text-pink-600">safevoiceforwomen@gmail.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}