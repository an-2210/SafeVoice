exports.handler = async (event, context) => {
    // --- START: CORS Configuration ---
    const allowedOrigins = [
      'http://localhost:5173',             // Your local development URL
      'https://safevoiceforwomen.netlify.app' // Your deployed frontend URL
      // Add any other origins if needed
    ];
  
    const requestOrigin = event.headers.origin;
    let headers = {
      'Content-Type': 'application/json' // Default content type
    };
  
    if (allowedOrigins.includes(requestOrigin)) {
      headers['Access-Control-Allow-Origin'] = requestOrigin;
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'; // Add any other headers your frontend sends
      headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'; // Only GET and OPTIONS needed for this endpoint
    }
  
    // Handle OPTIONS preflight request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204, // No Content status for OPTIONS
        headers: headers,
        body: ''
      };
    }
    // --- END: CORS Configuration ---
  
    // --- Actual Function Logic ---
    try {
      // Only allow GET requests for this endpoint
      if (event.httpMethod !== 'GET') {
        return {
          statusCode: 405, // Method Not Allowed
          headers: headers, // Include CORS headers
          body: JSON.stringify({ error: 'Method Not Allowed' })
        };
      }
  
      // --- Placeholder: Replace with your actual logic to fetch NGOs ---
      // Example: Fetch from a database, another API, or a static list
      const approvedNGOs = [
        { id: 'ngo1', name: 'Asha Foundation', description: 'Supporting women survivors of violence with shelter and legal aid.' },
        { id: 'ngo2', name: 'Sakhi Trust', description: 'Empowering women through skill development and counseling.' },
        { id: 'ngo3', name: 'Jagriti NGO', description: 'Focusing on education and health for underprivileged women and girls.' },
        { id: 'ngo4', name: 'Nari Shakti Kendra', description: 'Provides legal assistance and support groups.' },
        { id: 'ngo5', name: 'Mahila Vikas Manch', description: 'Works on economic empowerment and vocational training.' },
        { id: 'ngo6', name: 'Suraksha Women Center', description: 'Offers emergency shelter and crisis intervention.' },
        // Add more approved NGOs here
      ];
      // --- End Placeholder ---
  
      return {
        statusCode: 200,
        headers: headers, // Include CORS headers
        body: JSON.stringify(approvedNGOs)
      };
  
    } catch (error) {
      console.error('Error fetching approved NGOs:', error);
      return {
        statusCode: 500,
        headers: headers, // Include CORS headers even on error
        body: JSON.stringify({ error: 'Failed to fetch approved NGOs' })
      };
    }
  };