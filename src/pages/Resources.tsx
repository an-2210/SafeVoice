import React, { useState, useEffect } from 'react';
import { Phone, Globe, Shield, BookOpen, Heart, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Assuming you use react-hot-toast for notifications

// Define the structure of an NGO object (adjust based on your actual API response)
interface NGO {
  id: string; // Or number, depending on your backend
  name: string;
  description: string;
  // Add other relevant fields like contact, website, etc. if available from the API
  // contact?: string;
  // website?: string;
}

export default function Resources() {
  // State for the NGO request form
  const [ngoName, setNGOName] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loadingRequest, setLoadingRequest] = useState(false); // Loading state for form submission

  // State for displaying NGOs
  const [ngos, setNGOs] = useState<NGO[]>([]); // State to store fetched NGOs
  const [loadingNGOs, setLoadingNGOs] = useState(true); // Loading state for fetching NGOs
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [visibleNGOs, setVisibleNGOs] = useState(6); // Start with 6 visible NGOs

  // Fetch approved NGOs from the backend when the component mounts
  useEffect(() => {
    const fetchNGOs = async () => {
      setLoadingNGOs(true); // Start loading
      try {
        // Use environment variable for the API base URL
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/approved-ngos`);

        if (!response.ok) {
          // Log more details if the response is not ok
          const errorData = await response.text(); // Try to get error text
          console.error(`Error fetching NGOs: ${response.status} ${response.statusText}`, errorData);
          throw new Error(`Failed to fetch NGOs (Status: ${response.status})`);
        }

        const data: NGO[] = await response.json(); // Ensure the response matches the NGO type
        setNGOs(data);
      } catch (error) {
        console.error('Error fetching NGOs:', error);
        toast.error('Could not load the list of NGOs. Please try refreshing the page.'); // User-friendly error
      } finally {
        setLoadingNGOs(false); // Stop loading regardless of success or failure
      }
    };

    fetchNGOs();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Filter NGOs based on the search query (case-insensitive)
  const filteredNGOs = ngos.filter((ngo) =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ngo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler to show more NGOs
  const handleShowMore = () => {
    setVisibleNGOs((prev) => prev + 6); // Show 6 more NGOs each time
  };

  // Handler for submitting the NGO request form
  const handleNGORequest = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setLoadingRequest(true); // Start loading

    // Basic validation (optional, add more as needed)
    if (!ngoName.trim() || !description.trim() || !contact.trim() || !email.trim() || !registrationNumber.trim()) {
        toast.error("Please fill in all required fields.");
        setLoadingRequest(false);
        return;
    }

    const requestData = {
      name: ngoName,
      description,
      contact,
      email,
      registrationNumber,
    };

    try {
      // Use environment variable for the API base URL
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/send-ngo-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authentication headers if required by your backend
          // 'Authorization': `Bearer ${your_token}`
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast.success('Your request has been submitted successfully! It will be reviewed by our team.');
        // Reset form fields after successful submission
        setNGOName('');
        setDescription('');
        setContact('');
        setEmail('');
        setRegistrationNumber('');
      } else {
        // Handle specific error statuses if needed
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit request. Please try again.' }));
        console.error(`Error submitting NGO request: ${response.status}`, errorData);
        toast.error(errorData.message || 'Failed to submit request. Please check your details and try again.');
      }
    } catch (error) {
      console.error('Error submitting NGO request:', error);
      toast.error('An unexpected error occurred while submitting your request. Please try again later.');
    } finally {
      setLoadingRequest(false); // Stop loading
    }
  };

  // --- JSX Rendering ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Resources & Support</h1>

      {/* Collaborated NGOs Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Collaborating NGOs</h2>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search NGOs by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          />
        </div>

        {loadingNGOs ? (
          <div className="text-center text-gray-500 py-10">Loading NGOs...</div>
        ) : filteredNGOs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNGOs.slice(0, visibleNGOs).map((ngo) => (
                <div key={ngo.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{ngo.name}</h3>
                  <p className="text-gray-600 text-sm">{ngo.description}</p>
                  {/* Add more details like contact/website if available */}
                </div>
              ))}
            </div>
            {visibleNGOs < filteredNGOs.length && (
              <div className="text-center mt-8">
                <button
                  onClick={handleShowMore}
                  className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
                >
                  Show More NGOs
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">
            {searchQuery ? 'No NGOs found matching your search.' : 'No NGOs available at the moment.'}
          </div>
        )}
      </section>

      {/* NGO Request Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Request to Add Your NGO</h2>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-gray-100">
          <p className="text-gray-600 mb-6 text-sm">
            If you represent an NGO dedicated to supporting women and would like to collaborate, please fill out the form below.
            Your request will be reviewed by our team.
          </p>
          <form onSubmit={handleNGORequest} className="space-y-5">
            <div>
              <label htmlFor="ngoName" className="block text-sm font-medium text-gray-700 mb-1">
                NGO Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ngoName"
                value={ngoName}
                onChange={(e) => setNGOName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Brief Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                rows={4}
                required
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel" // Use type="tel" for phone numbers
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                NGO Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="registrationNumber"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                required
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center items-center bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                disabled={loadingRequest}
              >
                {loadingRequest ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Emergency Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 text-center">
            <Phone className="h-10 w-10 text-pink-500 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Women's Helpline</h3>
            <p className="text-gray-600 mb-2 text-lg font-medium">1091 / 181</p>
            <p className="text-sm text-gray-500">Nationwide 24/7 support for women in distress</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Police Emergency</h3>
            <p className="text-gray-600 mb-2 text-lg font-medium">100 / 112</p>
            <p className="text-sm text-gray-500">For immediate police assistance</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 text-center">
            <Heart className="h-10 w-10 text-purple-500 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Child Helpline</h3>
            <p className="text-gray-600 mb-2 text-lg font-medium">1098</p>
            <p className="text-sm text-gray-500">24/7 confidential support for children in need</p>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Safety Tips</h2>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-green-500 mr-3 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-800">Personal Safety</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                <li>Trust your instincts; if something feels wrong, it probably is.</li>
                <li>Stay aware of your surroundings, especially in new or crowded places.</li>
                <li>Keep emergency contacts (family, friends, police) readily available.</li>
                <li>Inform someone about your whereabouts when traveling alone.</li>
                <li>Consider learning basic self-defense techniques.</li>
                <li>Utilize safety features on your phone or dedicated safety apps.</li>
              </ul>
            </div>
            <div>
              <div className="flex items-center mb-4">
                <Globe className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-800">Online Safety</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                <li>Use strong, unique passwords for different accounts.</li>
                <li>Enable two-factor authentication (2FA) whenever possible.</li>
                <li>Be cautious about sharing personal information online.</li>
                <li>Adjust privacy settings on social media platforms.</li>
                <li>Be wary of phishing scams and suspicious links/emails.</li>
                <li>Report and block any online harassment or abuse immediately.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Resources */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Know Your Rights & Find Support</h2>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-gray-100">
          <div className="flex items-center mb-6">
             <BookOpen className="h-8 w-8 text-yellow-600 mr-3 flex-shrink-0" />
             <h3 className="text-xl font-semibold text-gray-800">Information & Assistance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Legal Rights</h4>
              <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                <li>Protection against Domestic Violence Act, 2005</li>
                <li>Sexual Harassment of Women at Workplace Act, 2013</li>
                <li>Dowry Prohibition Act, 1961</li>
                <li>Understanding FIRs and legal procedures</li>
                <li>Resources for free legal aid</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Support Groups</h4>
              <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                <li>Find local survivor support meetings</li>
                <li>Connect with online communities</li>
                <li>Access therapy and counseling resources</li>
                <li>Join survivor advocacy networks</li>
                <li>Peer support programs</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Recovery & Healing</h4>
              <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                <li>Information on trauma recovery</li>
                <li>Self-care and mindfulness practices</li>
                <li>Workshops on healing and empowerment</li>
                <li>Access to professional counseling services</li>
                <li>Mental health resources</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Us</h2>
        <div className="bg-white rounded-lg shadow-md p-6 inline-block border border-gray-100">
          <p className="text-gray-600 mb-4">
            For questions, partnership inquiries, or support needs, please reach out:
          </p>
          <p className="text-gray-700 font-medium">
            Email: <a href="mailto:safevoiceforwomen@gmail.com" className="text-pink-600 hover:text-pink-700 hover:underline">safevoiceforwomen@gmail.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}