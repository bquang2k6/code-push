import { NextApiRequest, NextApiResponse } from 'next';
import { incrementUpdateCounter } from '../../common/counter';

export default async function incrementEndpoint(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Expected POST.' });
    return;
  }

  try {
    const stats = await incrementUpdateCounter();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Error incrementing stats:', error);
    res.status(500).json({ error: 'Failed to increment stats.' });
  }
}
