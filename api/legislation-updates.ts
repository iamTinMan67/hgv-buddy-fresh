import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scrapeLegislationUpdates } from './lib/scraper';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const updates = await scrapeLegislationUpdates();
    response.status(200).json({ success: true, data: updates });
  } catch (error) {
    console.error('Error scraping legislation updates:', error);
    response.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch legislation updates' 
    });
  }
}

