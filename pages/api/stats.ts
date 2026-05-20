import { NextApiRequest, NextApiResponse } from 'next';
import { getUpdateCounter } from '../../common/counter';

export default async function statsEndpoint(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Expected GET.' });
    return;
  }

  try {
    const stats = await getUpdateCounter();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error reading stats:', error);
    res.status(500).json({ error: 'Failed to read stats.' });
  }
}
