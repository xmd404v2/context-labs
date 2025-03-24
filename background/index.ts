// Background script for ContextRT extension

// Add Chrome API type definitions
declare const chrome: {
  runtime: {
    onInstalled: {
      addListener: (callback: () => void) => void;
    };
    onMessage: {
      addListener: (
        callback: (
          message: { type: string; text?: string; settings?: {
            enableExtension: boolean;
            showCompanyCards: boolean;
            showPersonCards: boolean;
            autoDisplay: boolean;
          } },
          sender: any,
          sendResponse: (response: { success?: boolean; context?: string }) => void
        ) => boolean
      ) => void;
    };
  };
};

// Hugging Face API token
const HF_API_TOKEN = "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";
const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('ContextRT extension installed');
});

// Simple company detection (would be more sophisticated in a real implementation)
function detectCompany(text: string): string[] {
  const detectedCompanies: string[] = [];
  const commonCompanies = [
    'Apple', 'Microsoft', 'Google', 'Amazon', 'Facebook', 'Meta', 'Tesla', 'Twitter', 
    'Netflix', 'Disney', 'Walmart', 'Coca-Cola', 'Nike', 'Samsung', 'IBM', 'Intel',
    'AMD', 'Nvidia', 'Oracle', 'Salesforce', 'Adobe', 'Spotify', 'Uber', 'Lyft',
    'Airbnb', 'Zoom', 'TikTok', 'Snapchat', 'Reddit', 'LinkedIn', 'Pinterest',
    'PayPal', 'Square', 'Stripe', 'Shopify', 'Robinhood', 'Coinbase', 'SpaceX', 
    'OpenAI', 'Anthropic', 'Roblox', 'Activision', 'EA', 'Ubisoft', 'Blizzard',
    'Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Volkswagen', 'Audi', 'Porsche'
  ];
  
  for (const company of commonCompanies) {
    // Use word boundaries to match whole words
    const regex = new RegExp(`\\b${company}\\b`, 'i');
    if (regex.test(text)) {
      detectedCompanies.push(company);
    }
  }
  
  return detectedCompanies;
}

// Simple public figure detection (would be more sophisticated in a real implementation)
function detectPublicFigure(text: string): string[] {
  const detectedFigures: string[] = [];
  const commonFigures = [
    'Elon Musk', 'Bill Gates', 'Tim Cook', 'Mark Zuckerberg', 'Jeff Bezos',
    'Joe Biden', 'Donald Trump', 'Kamala Harris', 'Barack Obama', 'Hillary Clinton',
    'Taylor Swift', 'Beyonce', 'Jay-Z', 'Kanye West', 'Rihanna', 'Drake', 'Adele',
    'LeBron James', 'Michael Jordan', 'Cristiano Ronaldo', 'Lionel Messi', 'Serena Williams',
    'Leonardo DiCaprio', 'Tom Hanks', 'Jennifer Lawrence', 'Meryl Streep', 'Denzel Washington',
    'Oprah Winfrey', 'Ellen DeGeneres', 'Jimmy Fallon', 'Stephen Colbert', 'Trevor Noah',
    'Elon Musk', 'Warren Buffett', 'Sam Altman', 'Demis Hassabis', 'Satya Nadella', 
    'Sundar Pichai', 'Tim Cook', 'Andy Jassy'
  ];
  
  for (const person of commonFigures) {
    // Use word boundaries to match whole words or names
    const regex = new RegExp(`\\b${person.replace(/ /g, '\\s+')}\\b`, 'i');
    if (regex.test(text)) {
      detectedFigures.push(person);
    }
  }
  
  return detectedFigures;
}

// Fetch Wikipedia data for a person
async function fetchWikipediaData(name: string, isCompany: boolean = false): Promise<{summary: string, imageUrl: string | null}> {
  try {
    console.log(`Fetching Wikipedia data for ${isCompany ? 'company' : 'person'}: ${name}...`);
    
    // Adjust search terms for companies to improve results
    const searchTerm = isCompany ? `${name} company` : name;
    
    // Step 1: Search for the entity
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
    console.log(`Search URL: ${searchUrl}`);
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      console.error(`Wikipedia search API failed with status: ${searchResponse.status}`);
      return { 
        summary: `Couldn't retrieve data for ${name}.`,
        imageUrl: null
      };
    }
    
    const searchData = await searchResponse.json();
    console.log('Search results:', searchData);
    
    // If no results found
    if (!searchData.query || !searchData.query.search || !searchData.query.search.length) {
      console.log(`No search results found for ${name}`);
      return { 
        summary: `No Wikipedia information found for ${name}.`,
        imageUrl: null
      };
    }
    
    // Get the page ID from the first search result
    const pageId = searchData.query.search[0].pageid;
    console.log(`Page ID for ${name}: ${pageId}`);
    
    // Step 2: Get the page extract (summary) and image
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=true&explaintext=true&pithumbsize=200&pageids=${pageId}&format=json&origin=*`;
    console.log(`Extract URL: ${extractUrl}`);
    
    const extractResponse = await fetch(extractUrl);
    if (!extractResponse.ok) {
      console.error(`Wikipedia extract API failed with status: ${extractResponse.status}`);
      return { 
        summary: `Couldn't retrieve summary for ${name}.`,
        imageUrl: null
      };
    }
    
    const extractData = await extractResponse.json();
    console.log('Extract data:', extractData);
    
    if (!extractData.query || !extractData.query.pages || !extractData.query.pages[pageId]) {
      console.error('Invalid extract data structure');
      return {
        summary: `Error retrieving information about ${name}.`,
        imageUrl: null
      };
    }
    
    const page = extractData.query.pages[pageId];
    const summary = page.extract ? page.extract.split('\n')[0] : `Information about ${name} not available.`;
    const imageUrl = page.thumbnail ? page.thumbnail.source : null;
    
    console.log(`Retrieved summary (${summary.length} chars) and image: ${imageUrl ? 'Yes' : 'No'}`);
    
    return {
      summary: summary.length > 200 ? summary.substring(0, 200) + '...' : summary,
      imageUrl
    };
  } catch (error) {
    console.error('Error fetching Wikipedia data:', error);
    return {
      summary: `Couldn't fetch information about ${name} at this time.`,
      imageUrl: null
    };
  }
}

// Generate random stock data for company (would use real API in production)
function generateStockData(companyName: string): { price: number, change: number, marketCap: string } {
  // Use company name as seed for consistent but random-looking values
  let seed = 0;
  for (let i = 0; i < companyName.length; i++) {
    seed += companyName.charCodeAt(i);
  }
  
  // Generate price between $50 and $500
  const price = 50 + (seed % 450);
  
  // Generate change between -5% and +5%
  const change = -5 + (((seed * 7) % 1000) / 100);
  
  // Generate market cap (B = Billions, T = Trillions)
  let marketCap: string;
  const marketCapValue = 1 + (seed % 3000);
  if (marketCapValue > 1000) {
    marketCap = `$${(marketCapValue / 1000).toFixed(2)}T`;
  } else {
    marketCap = `$${marketCapValue}B`;
  }
  
  return {
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    marketCap
  };
}

// Fetch context from Hugging Face
async function fetchContextFromAI(text: string): Promise<string> {
  try {
    // Check for company or public figure mentions first - get all matches, not just the first one
    const companyMatches = detectCompany(text);
    const personMatches = detectPublicFigure(text);
    
    // Store pre-fetched Wikipedia data for all detected entities
    const wikipediaDataMap = new Map<string, { summary: string; imageUrl: string | null }>();
    
    // Prefetch Wikipedia data for all detected persons in parallel
    if (personMatches.length > 0) {
      const personPromises = personMatches.map(person => 
        fetchWikipediaData(person).then(data => {
          wikipediaDataMap.set(person, data);
        })
      );
      
      // Wait for all person Wikipedia data to be fetched
      await Promise.all(personPromises);
    }
    
    // Prefetch Wikipedia data for companies in parallel
    if (companyMatches.length > 0) {
      const companyPromises = companyMatches.map(company => 
        fetchWikipediaData(company, true).then(data => {
          wikipediaDataMap.set(company, data);
        })
      );
      
      // Wait for all company Wikipedia data to be fetched
      await Promise.all(companyPromises);
    }
    
    const response = await fetch(HF_API_URL, {
      method: "POST", 
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<s>[INST] Provide immediate, helpful context about this text with the following priorities:

- Focus on CURRENT information and context, with strong bias for recent events and trends
- Highlight **trending topics** and **viral moments** directly related to the text
- Provide factual context about ongoing discussions, debates, or news related to the topic
- Use **bold** for key terms or topics (2-3 max) that deserve special attention
- Be direct and concise - keep to 80 words or less
- Prioritize recency and relevance above all else
- Skip explanations about what the user typed - focus only on adding valuable context
- When appropriate, note how recently the context you're providing emerged
- If public companies are mentioned, identify them with [COMPANY:Name] tag
- If public figures are mentioned, identify them with [PERSON:Name] tag

Provide helpful, current context for: "${text}" [/INST]</s>`,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.4,
          return_full_text: false,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle response format from Hugging Face
    if (data && data[0] && data[0].generated_text) {
      // Process the response text
      let processedText = data[0].generated_text.trim();
      
      // Convert markdown bold (**term**) to HTML bold (<strong>term</strong>)
      processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Extract all company and person tags from the response
      const companyTagRegex = /\[COMPANY:(.*?)\]/g;
      const personTagRegex = /\[PERSON:(.*?)\]/g;
      
      // Get additional entities mentioned in the AI response
      const companiesFromAI = [...processedText.matchAll(companyTagRegex)].map(match => match[1]);
      const personsFromAI = [...processedText.matchAll(personTagRegex)].map(match => match[1]);
      
      // Remove the tags from the text
      processedText = processedText.replace(companyTagRegex, '<strong>$1</strong>');
      processedText = processedText.replace(personTagRegex, '<strong>$1</strong>');
      
      // Find any additional entity mentions in the AI response that weren't tagged
      const additionalCompanies = detectCompany(processedText);
      const additionalPersons = detectPublicFigure(processedText);
      
      // Create additional card data for companies and people
      let additionalData = '';
      
      // Track ordered entities while avoiding duplicates
      const orderedEntities: Array<{type: 'company' | 'person', name: string}> = [];
      const mentionedEntities = new Set<string>();
      
      // Helper function to add entity to ordered list if not already included
      const addEntityInOrder = (type: 'company' | 'person', name: string) => {
        const key = `${type}:${name}`;
        if (!mentionedEntities.has(key)) {
          orderedEntities.push({type, name});
          mentionedEntities.add(key);
        }
      };
      
      // Add entities in order of appearance, starting with the original text
      
      // 1. First add companies from original text in the order detected
      companyMatches.forEach(company => addEntityInOrder('company', company));
      
      // 2. Then add persons from original text in the order detected
      personMatches.forEach(person => addEntityInOrder('person', person));
      
      // 3. Add companies explicitly tagged in AI response
      companiesFromAI.forEach(company => addEntityInOrder('company', company));
      
      // 4. Add persons explicitly tagged in AI response
      personsFromAI.forEach(person => addEntityInOrder('person', person));
      
      // 5. Add additional companies detected in AI response
      additionalCompanies.forEach(company => addEntityInOrder('company', company));
      
      // 6. Add additional persons detected in AI response
      additionalPersons.forEach(person => addEntityInOrder('person', person));
      
      console.log('Ordered entities:', orderedEntities);
      
      // Only create cards section if we have any entities
      if (orderedEntities.length > 0) {
        // Start building cards in order of mention
        let allCards = '';
        
        // Add cards in order
        orderedEntities.forEach(entity => {
          if (entity.type === 'company') {
            // Get Wikipedia data for the company (if fetched)
            const companyData = wikipediaDataMap.get(entity.name);
            let summarySummary = companyData?.summary || `Loading information about ${entity.name}...`;
            
            // Generate stock data for the company
            const stockData = generateStockData(entity.name);
            const priceChangeClass = stockData.change >= 0 ? 'change-positive' : 'change-negative';
            const priceChangeSign = stockData.change >= 0 ? '+' : '';
            
            // Create company card
            allCards += `<div class="info-card company-card">
              <div class="card-header">
                <div class="company-logo" style="background-color: #${getColorFromString(entity.name)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${entity.name.charAt(0)}</div>
                <div class="company-info">
                  <div class="company-name">${entity.name}</div>
                  <div class="company-price ${priceChangeClass}">$${stockData.price} <span class="price-change">${priceChangeSign}${stockData.change}%</span></div>
                </div>
              </div>
              <div class="company-summary">
                <div class="market-cap">Market Cap: ${stockData.marketCap}</div>
                <p>${summarySummary}</p>
              </div>
              <div class="card-footer">Data from Wikipedia</div>
            </div>`;
          } else {
            // Create person card
            // Check if we've already fetched data for this person
            let summaryText = `Loading information about ${entity.name}...`;
            let imageHtml = '';
            
            const personData = wikipediaDataMap.get(entity.name);
            if (personData) {
              summaryText = personData.summary;
              if (personData.imageUrl) {
                imageHtml = `style="background-image: url('${personData.imageUrl}');"`;
              }
            }
            
            allCards += `<div class="info-card person-card">
              <div class="card-header">
                <div class="person-image" ${imageHtml}></div>
                <div class="person-name">${entity.name}</div>
              </div>
              <div class="person-info">
                <p>${summaryText}</p>
              </div>
              <div class="card-footer">Data from Wikipedia</div>
            </div>`;
          }
        });
        
        // Wrap all cards with the "Mentioned:" header and scrollable container
        additionalData = `
          <div class="mentioned-section">
            <div class="mentioned-header">Mentioned:</div>
            <div class="info-cards-container">
              ${allCards}
            </div>
          </div>
        `;
      }
      
      return additionalData ? processedText + additionalData : processedText;
    }
    
    return 'No context available';
  } catch (error) {
    console.error('Error fetching context from AI:', error);
    return `We couldn't fetch context right now. You were typing about "${text.substring(0, 30)}..."`;
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CONTEXT') {
    const { text } = message;
    
    // Don't process very short text
    if (!text || text.trim().length < 5) {
      sendResponse({ context: '' });
      return true;
    }
    
    // Fetch context asynchronously
    fetchContextFromAI(text)
      .then(context => {
        sendResponse({ success: true, context });
      })
      .catch(error => {
        console.error('Error in fetchContextFromAI:', error);
        sendResponse({ 
          success: false, 
          context: `We couldn't fetch context right now. You were typing about "${text.substring(0, 30)}..."`
        });
      });
    
    return true; // Indicates we'll respond asynchronously
  }
  
  // Handle settings update message from dashboard
  if (message.type === 'UPDATE_SETTINGS') {
    console.log('Received updated settings:', message.settings);
    // Store settings in chrome.storage if needed or handle directly
    // You could implement logic here to modify behavior based on settings
    // For example, if message.settings.enableExtension is false, you could
    // stop responding to GET_CONTEXT messages
    
    sendResponse({ success: true });
    return true;
  }
  
  return true;
});

// Generate a consistent color from a string
function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  
  return "00000".substring(0, 6 - c.length) + c;
} 