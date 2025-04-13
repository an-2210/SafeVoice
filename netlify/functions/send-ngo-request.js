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
      headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'; // Only POST and OPTIONS needed for this endpoint
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
      // Only allow POST requests for this endpoint
      if (event.httpMethod !== 'POST') {
        return {
          statusCode: 405, // Method Not Allowed
          headers: headers, // Include CORS headers
          body: JSON.stringify({ error: 'Method Not Allowed' })
        };
      }
  
      // --- Placeholder: Replace with your actual logic to process the request ---
      // Example: Parse data, validate, send email notification, save to database
      const requestData = JSON.parse(event.body || '{}');
  
      // Basic validation example (add more robust validation)
      if (!requestData.name || !requestData.description || !requestData.contact || !requestData.email || !requestData.registrationNumber) {
          return {
              statusCode: 400, // Bad Request
              headers: headers,
              body: JSON.stringify({ message: 'Missing required fields in request.' })
          };
      }
  
      console.log('Received NGO Request:', requestData); // Log the received data (visible in Netlify function logs)
  
      // TODO: Implement actual processing logic here:
      // 1. Send an email notification to your admin email (using SendGrid, Nodemailer, etc.)
      // 2. Save the request details to a database (like Supabase, FaunaDB, MongoDB Atlas) for review.
  
      // --- End Placeholder ---
  
      return {
        statusCode: 200,
        headers: headers, // Include CORS headers
        body: JSON.stringify({ message: 'Your request has been submitted successfully! It will be reviewed by our team.' }) // Match frontend success message if needed
      };
  
    } catch (error) {
      console.error('Error processing NGO request:', error);
      // Check if it's a JSON parsing error
      if (error instanceof SyntaxError) {
          return {
              statusCode: 400, // Bad Request
              headers: headers,
              body: JSON.stringify({ message: 'Invalid request body format.' })
          };
      }
      return {
        statusCode: 500,
        headers: headers, // Include CORS headers even on error
        body: JSON.stringify({ message: 'Failed to submit request due to an internal error.' }) // User-friendly error
      };
    }
  };