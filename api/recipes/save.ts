import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { AlloyResult, UserRequirements } from '../../types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    // Verify the token
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = userData.user.id;
    const {
      alloyName,
      codeName,
      description,
      composition,
      properties,
      feasibility,
      manufacturing,
      costAnalysis,
      applications,
      deepApplications,
      similarAlloys,
      originalRequirements,
    }: AlloyResult & { originalRequirements: UserRequirements } = req.body;

    if (!alloyName) {
      return res.status(400).json({ error: 'alloyName is required' });
    }

    const { data, error } = await supabase.from('recipes').insert([
      {
        user_id: userId,
        alloy_name: alloyName,
        code_name: codeName,
        description,
        composition,
        properties,
        feasibility,
        manufacturing,
        cost_analysis: costAnalysis,
        applications,
        deep_applications: deepApplications,
        similar_alloys: similarAlloys,
        original_requirements: originalRequirements,
      },
    ]);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Recipe saved successfully',
      data,
    });
  } catch (error: any) {
    console.error('Save recipe error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
