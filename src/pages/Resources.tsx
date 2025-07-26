import React, { useState, useEffect } from 'react';
import { Phone, Globe, Shield, BookOpen, Heart, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  deleteDoc
} from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore();

// Define admin emails. This should be consistent with your other admin-only pages.
const ADMIN_EMAILS = ['safevoiceforwomen@gmail.com', 'piyushydv011@gmail.com', 'aditiraj0205@gmail.com'];


// Define the structure of an NGO object
interface NGO {
  id: string;
  name: string;
  description: string;
  contact?: string;
  email?: string;
  website?: string;
  registration_number?: string;
  approved?: boolean;
}

export default function Resources() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);

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

  // Check for admin status on auth state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  // Fetch approved NGOs from Firestore when the component mounts
  useEffect(() => {
    const fetchNGOs = async () => {
      setLoadingNGOs(true); // Start loading
      try {
        // Create a query to get approved NGOs
        const ngosRef = collection(db, 'ngos');
        const q = query(
          ngosRef,
          where('approved', '==', true),
          // orderBy('name') // This requires a composite index. We will sort on the client.
        );
        
        const querySnapshot = await getDocs(q);
        const ngosList: NGO[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id, // Use Firestore's document ID
            name: data.name,
            description: data.description,
            contact: data.contact,
            email: data.email,
            website: data.website,
            registration_number: data.registration_number,
            approved: data.approved
          };
        });
        
        // Sort the NGOs on the client-side since we removed orderBy from the query
        ngosList.sort((a, b) => a.name.localeCompare(b.name));
        setNGOs(ngosList);
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

  // Handler for deleting an approved NGO (admins only)
  const handleDeleteNGO = async (ngoId: string, ngoName: string) => {
    if (!window.confirm(`Are you sure you want to delete the NGO "${ngoName}"? This action cannot be undone.`)) {
      return;
    }

    const toastId = toast.loading(`Deleting ${ngoName}...`);
    try {
      const ngoRef = doc(db, 'ngos', ngoId);
      await deleteDoc(ngoRef);
      
      // Update state to remove the NGO from the list in the UI
      setNGOs(prevNgos => prevNgos.filter(ngo => ngo.id !== ngoId));
      
      toast.success(`${ngoName} has been deleted.`, { id: toastId });
    } catch (error) {
      console.error('Error deleting NGO:', error);
      toast.error(`Failed to delete ${ngoName}.`, { id: toastId });
    }
  };

  // Handler to show more NGOs
  const handleShowMore = () => {
    setVisibleNGOs((prev) => prev + 6); // Show 6 more NGOs each time
  };

  // Handler for submitting the NGO request form
  const handleNGORequest = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setLoadingRequest(true); // Start loading

    // Check authentication
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in to submit a request');
      navigate('/auth');
      setLoadingRequest(false);
      return;
    }

    // Basic validation
    if (!ngoName.trim() || !description.trim() || !contact.trim() || !email.trim() || !registrationNumber.trim()) {
        toast.error("Please fill in all required fields.");
        setLoadingRequest(false);
        return;
    }

    try {
      // Add a new document to the ngo_requests collection
      await addDoc(collection(db, 'ngo_requests'), {
        name: ngoName,
        description,
        contact,
        email,
        registration_number: registrationNumber,
        user_id: user.uid,
        created_at: serverTimestamp(),
        approved: false // Default to not approved
      });

      toast.success('Your request has been submitted successfully! It will be reviewed by our team.');
      // Reset form fields after successful submission
      setNGOName('');
      setDescription('');
      setContact('');
      setEmail('');
      setRegistrationNumber('');
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
                <div key={ngo.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow relative group">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteNGO(ngo.id, ngo.name)}
                        className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Delete ${ngo.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{ngo.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{ngo.description}</p>
                  {ngo.contact && (
                    <p className="text-gray-700 text-sm"><strong>Contact:</strong> {ngo.contact}</p>
                  )}
                  {ngo.email && (
                    <p className="text-gray-700 text-sm"><strong>Email:</strong> {ngo.email}</p>
                  )}
                  {ngo.website && (
                    <p className="text-gray-700 text-sm">
                      <strong>Website:</strong> <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">{ngo.website}</a>
                    </p>
                  )}
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
                  type="tel"
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