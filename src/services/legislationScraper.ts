import axios from 'axios';
import { load } from 'cheerio';

export interface UpdateItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  summary: string;
  category: 'dvsa' | 'dft' | 'traffic-commissioner' | 'general';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

interface ScrapeSource {
  url: string;
  category: UpdateItem['category'];
  name: string;
}

const sources: ScrapeSource[] = [
  {
    url: 'https://www.transporthalo.co.uk/blog/dvsa-updates-april-2025',
    category: 'dvsa',
    name: 'Transport Halo - DVSA Updates',
  },
  {
    url: 'https://www.gov.uk/government/consultations/amendments-to-licensing-restrictions-bus-coach-and-heavy-goods-vehicles',
    category: 'dft',
    name: 'DfT - Licensing Restrictions',
  },
  {
    url: 'https://www.gov.uk/government/organisations/department-for-transport',
    category: 'dft',
    name: 'Department for Transport',
  },
  {
    url: 'https://www.gov.uk/government/organisations/traffic-commissioners',
    category: 'traffic-commissioner',
    name: 'Traffic Commissioners',
  },
  {
    url: 'https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency',
    category: 'dvsa',
    name: 'DVSA',
  },
];

/**
 * Scrapes Transport Halo blog post for DVSA updates
 */
async function scrapeTransportHalo(url: string): Promise<UpdateItem[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = load(response.data);
    const updates: UpdateItem[] = [];

    // Extract main title
    const title = $('h1').first().text().trim() || 
                  $('title').text().trim() ||
                  'DVSA Updates April 2025';

    // Extract date from meta tags or content
    let date = new Date().toISOString().split('T')[0];
    const dateMatch = response.data.match(/(\d{1,2}(st|nd|rd|th)?\s+\w+\s+\d{4})/i);
    if (dateMatch) {
      try {
        date = new Date(dateMatch[1]).toISOString().split('T')[0];
      } catch (e) {
        // Keep default date
      }
    }

    // Extract summary from first paragraph or meta description
    let summary = $('meta[name="description"]').attr('content') || '';
    if (!summary) {
      const firstParagraph = $('article p, .content p, main p').first().text().trim();
      summary = firstParagraph.substring(0, 300) || 'Latest DVSA regulatory updates and requirements.';
    }

    // Extract key points from the article
    const keyPoints: string[] = [];
    $('ul li, ol li').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20 && text.length < 200) {
        keyPoints.push(text);
      }
    });

    // Extract tags from headings or content
    const tags: string[] = [];
    $('h2, h3').each((_, el) => {
      const heading = $(el).text().trim();
      if (heading.length < 50) {
        tags.push(heading);
      }
    });

    // Create update item
    updates.push({
      id: `transport-halo-${Date.now()}`,
      title: title,
      source: 'Transport Halo',
      sourceUrl: url,
      date: date,
      summary: summary || 'Latest DVSA updates including driver records requirements, Smart Tachograph 2 retrofits, and AETR rules for international transport.',
      category: 'dvsa',
      priority: 'high',
      tags: tags.slice(0, 5).length > 0 ? tags.slice(0, 5) : ['Driver Records', 'Smart Tachograph', 'International Transport', 'AETR Rules'],
    });

    return updates;
  } catch (error) {
    console.error(`Error scraping Transport Halo (${url}):`, error);
    return [];
  }
}

/**
 * Scrapes GOV.UK consultation pages
 */
async function scrapeGovUKConsultation(url: string, category: UpdateItem['category']): Promise<UpdateItem[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = load(response.data);
    const updates: UpdateItem[] = [];

    // Extract title
    const title = $('h1').first().text().trim() || 
                  $('title').text().trim() ||
                  'Government Consultation';

    // Extract published date
    let date = new Date().toISOString().split('T')[0];
    const publishedMatch = $('.gem-c-metadata').text() || response.data;
    const dateMatch = publishedMatch.match(/(\d{1,2}\s+\w+\s+\d{4})/i);
    if (dateMatch) {
      try {
        date = new Date(dateMatch[1]).toISOString().split('T')[0];
      } catch (e) {
        // Keep default date
      }
    }

    // Extract summary
    let summary = $('meta[name="description"]').attr('content') || '';
    if (!summary) {
      const firstParagraph = $('.gem-c-lead-paragraph, .summary, p').first().text().trim();
      summary = firstParagraph.substring(0, 300) || 'Government consultation on licensing and regulatory changes.';
    }

    updates.push({
      id: `govuk-consultation-${Date.now()}`,
      title: title,
      source: 'Department for Transport',
      sourceUrl: url,
      date: date,
      summary: summary,
      category: category,
      priority: 'medium',
      tags: ['Consultation', 'Licensing', 'Regulations'],
    });

    return updates;
  } catch (error) {
    console.error(`Error scraping GOV.UK consultation (${url}):`, error);
    return [];
  }
}

/**
 * Scrapes GOV.UK organisation pages
 */
async function scrapeGovUKOrganisation(url: string, category: UpdateItem['category'], name: string): Promise<UpdateItem[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = load(response.data);
    const updates: UpdateItem[] = [];

    // Look for latest updates, news, or publications
    $('.gem-c-document-list__item, .news-item, .publication').each((_, el) => {
      const titleElement = $(el).find('a').first();
      const title = titleElement.text().trim();
      const link = titleElement.attr('href');
      const dateText = $(el).find('.gem-c-metadata__date, time').text().trim();
      
      if (title && title.length > 10) {
        let date = new Date().toISOString().split('T')[0];
        if (dateText) {
          try {
            date = new Date(dateText).toISOString().split('T')[0];
          } catch (e) {
            // Keep default date
          }
        }

        const summary = $(el).find('p, .summary').text().trim().substring(0, 200) || 
                        `${title} - Latest update from ${name}`;

        const fullUrl = link?.startsWith('http') ? link : `https://www.gov.uk${link || ''}`;

        updates.push({
          id: `govuk-${category}-${updates.length}-${Date.now()}`,
          title: title,
          source: name,
          sourceUrl: fullUrl,
          date: date,
          summary: summary,
          category: category,
          priority: dateText ? 'medium' : 'low',
          tags: [name, 'Regulations'],
        });
      }
    });

    // If no items found, create a general update
    if (updates.length === 0) {
      updates.push({
        id: `govuk-${category}-general-${Date.now()}`,
        title: `Latest Updates from ${name}`,
        source: name,
        sourceUrl: url,
        date: new Date().toISOString().split('T')[0],
        summary: `Visit ${name} for the latest regulatory updates and guidance.`,
        category: category,
        priority: 'low',
        tags: [name, 'Updates'],
      });
    }

    return updates;
  } catch (error) {
    console.error(`Error scraping GOV.UK organisation (${url}):`, error);
    return [];
  }
}

/**
 * Main function to scrape all legislation updates
 */
export async function scrapeLegislationUpdates(): Promise<UpdateItem[]> {
  const allUpdates: UpdateItem[] = [];

  // Scrape all sources in parallel
  const scrapePromises = sources.map(async (source) => {
    try {
      if (source.url.includes('transporthalo.co.uk')) {
        return await scrapeTransportHalo(source.url);
      } else if (source.url.includes('/consultations/')) {
        return await scrapeGovUKConsultation(source.url, source.category);
      } else {
        return await scrapeGovUKOrganisation(source.url, source.category, source.name);
      }
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(scrapePromises);
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allUpdates.push(...result.value);
    }
  });

  // Sort by date (newest first) and limit to most recent 20
  return allUpdates
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);
}

