# Legislation Updates Scraping Setup

This document explains how the legislation updates scraping feature works and how to set it up.

## Overview

The legislation updates feature scrapes content from government and transport-related websites to display the latest regulatory changes and updates.

## Architecture

1. **Frontend Component**: `src/components/LegislationUpdates.tsx`
   - Displays scraped updates in a user-friendly interface
   - Calls the API endpoint to fetch updates

2. **API Endpoint**: `api/legislation-updates.ts`
   - Vercel serverless function that handles HTTP requests
   - Calls the scraping service

3. **Scraping Service**: `src/services/legislationScraper.ts`
   - Contains the actual scraping logic
   - Parses HTML from target websites
   - Extracts relevant information

## Installation

1. Install required dependencies:
```bash
npm install
```

The following packages are required:
- `cheerio`: HTML parsing
- `axios`: HTTP requests
- `@vercel/node`: Vercel serverless functions support

## Monitored Sources

The scraper monitors the following sources:

1. **Transport Halo - DVSA Updates**
   - URL: https://www.transporthalo.co.uk/blog/dvsa-updates-april-2025
   - Category: DVSA
   - Priority: High

2. **DfT - Licensing Restrictions Consultation**
   - URL: https://www.gov.uk/government/consultations/amendments-to-licensing-restrictions-bus-coach-and-heavy-goods-vehicles
   - Category: DfT
   - Priority: Medium

3. **Department for Transport**
   - URL: https://www.gov.uk/government/organisations/department-for-transport
   - Category: DfT
   - Priority: Low

4. **Traffic Commissioners**
   - URL: https://www.gov.uk/government/organisations/traffic-commissioners
   - Category: Traffic Commissioner
   - Priority: Low

5. **DVSA**
   - URL: https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency
   - Category: DVSA
   - Priority: Low

## How It Works

1. The frontend component calls `/api/legislation-updates` when mounted
2. The Vercel serverless function receives the request
3. The scraping service fetches HTML from all monitored sources in parallel
4. HTML is parsed using Cheerio to extract:
   - Titles
   - Dates
   - Summaries
   - Tags/Categories
5. Extracted data is formatted and returned as JSON
6. Frontend displays the updates in an accordion-style list

## Development

### Local Testing

For local development, you can:

1. **Test the scraper directly**:
```typescript
import { scrapeLegislationUpdates } from './src/services/legislationScraper';

const updates = await scrapeLegislationUpdates();
console.log(updates);
```

2. **Test the API endpoint**:
   - Use Vercel CLI: `vercel dev`
   - Or set up a local Express server for testing

### Adding New Sources

To add a new source:

1. Add the source to the `sources` array in `legislationScraper.ts`
2. Create a scraping function if needed (or use an existing one)
3. Update the main `scrapeLegislationUpdates` function to handle the new source

### Customizing Scraping Logic

Each website may require different parsing logic. The scraper includes:

- `scrapeTransportHalo()`: For Transport Halo blog posts
- `scrapeGovUKConsultation()`: For GOV.UK consultation pages
- `scrapeGovUKOrganisation()`: For GOV.UK organisation pages

You can add more specific scrapers as needed.

## Deployment

When deploying to Vercel:

1. The `api/` directory is automatically recognized as serverless functions
2. Dependencies are installed during build
3. Functions are deployed and accessible at `/api/legislation-updates`

## Error Handling

- Network errors are caught and logged
- Failed scrapes don't block other sources
- Frontend shows error messages if the API call fails
- Empty results are handled gracefully

## Rate Limiting

Be mindful of:
- Website rate limits
- Vercel function execution time limits (10 seconds on free tier)
- Consider caching results to reduce API calls

## Future Improvements

- Add caching (Redis or database) to store scraped results
- Schedule periodic scraping (cron jobs)
- Add email notifications for high-priority updates
- Store historical updates in a database
- Add user preferences for filtering updates

