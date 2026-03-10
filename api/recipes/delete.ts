import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Recipe ID is required' });
  }

  try {
    // Verify the token
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = userData.user.id;

    // Check if recipe exists and belongs to user
    const { data: recipe, error: getError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (getError || !recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Delete the recipe
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return res.status(500).json({ error: deleteError.message });
    }

    return res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error: any) {
    console.error('Delete recipe error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
