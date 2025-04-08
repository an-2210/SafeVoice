import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between Sign Up and Sign In
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password validation: at least 8 characters, alphanumeric
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must be at least 8 characters long and alphanumeric.');
      return;
    }

    setLoading(true);

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error signing up:', error);

      // Check if the error is due to the user already existing
      if (error.message === 'User already registered') {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error('Failed to sign up. Please try again.');
      }

      setLoading(false);
      return;
    }

    // Insert a profile for the new user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user?.id, // Use the user's ID as the profile ID
        email: email, // Include the user's email
        username: email.split('@')[0], // Default username based on email
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      toast.error('Failed to create profile. Please contact support.');
      setLoading(false);
      return;
    }

    toast.success('Signup successful! Welcome!');
    setLoading(false);
    navigate('/'); // Redirect to the home page
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in. Please check your credentials.');
      setLoading(false);
      return;
    }

    toast.success('Sign in successful!');
    setLoading(false);
    navigate('/'); // Redirect to the home page
  };

  useEffect(() => {
    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/');
      }
    });
  
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? 'Sign Up for SafeVoice' : 'Sign In to SafeVoice'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-pink-600 hover:text-pink-500"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form
            onSubmit={isSignUp ? handleSignUp : handleSignIn}
            className="space-y-4"
          >
            <div>
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
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              disabled={loading}
            >
              {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                  onClick={() => toast('Forgot Password functionality coming soon!')}
                  className="font-medium text-pink-600 hover:text-pink-500"
                >
                  Forgot Password?
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}