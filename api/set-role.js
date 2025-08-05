import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, role } = req.body;

    // Validate input
    if (!userId || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId and role' 
      });
    }

    // Validate role values
    const validRoles = ['admin', 'user', 'moderator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Update user role using admin client
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to update user role' 
      });
    }

    return res.status(200).json({ 
      message: 'Role updated successfully',
      user: data.user
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
