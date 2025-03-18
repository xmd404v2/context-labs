"use strict";
(() => {
  // background/index.ts
  var HF_API_TOKEN = "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";
  var HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
  chrome.runtime.onInstalled.addListener(() => {
    console.log("Real-Time Context extension installed");
  });
  function detectCompany(text) {
    const detectedCompanies = [];
    const commonCompanies = [
      "Apple",
      "Microsoft",
      "Google",
      "Amazon",
      "Facebook",
      "Meta",
      "Tesla",
      "Twitter",
      "Netflix",
      "Disney",
      "Walmart",
      "Coca-Cola",
      "Nike",
      "Samsung",
      "IBM",
      "Intel",
      "AMD",
      "Nvidia",
      "Oracle",
      "Salesforce",
      "Adobe",
      "Spotify",
      "Uber",
      "Lyft",
      "Airbnb",
      "Zoom",
      "TikTok",
      "Snapchat",
      "Reddit",
      "LinkedIn",
      "Pinterest",
      "PayPal",
      "Square",
      "Stripe",
      "Shopify",
      "Robinhood",
      "Coinbase",
      "SpaceX",
      "OpenAI",
      "Anthropic",
      "Roblox",
      "Activision",
      "EA",
      "Ubisoft",
      "Blizzard",
      "Toyota",
      "Honda",
      "Ford",
      "BMW",
      "Mercedes",
      "Volkswagen",
      "Audi",
      "Porsche"
    ];
    for (const company of commonCompanies) {
      const regex = new RegExp(`\\b${company}\\b`, "i");
      if (regex.test(text)) {
        detectedCompanies.push(company);
      }
    }
    return detectedCompanies;
  }
  function detectPublicFigure(text) {
    const detectedFigures = [];
    const commonFigures = [
      "Elon Musk",
      "Bill Gates",
      "Tim Cook",
      "Mark Zuckerberg",
      "Jeff Bezos",
      "Joe Biden",
      "Donald Trump",
      "Kamala Harris",
      "Barack Obama",
      "Hillary Clinton",
      "Taylor Swift",
      "Beyonce",
      "Jay-Z",
      "Kanye West",
      "Rihanna",
      "Drake",
      "Adele",
      "LeBron James",
      "Michael Jordan",
      "Cristiano Ronaldo",
      "Lionel Messi",
      "Serena Williams",
      "Leonardo DiCaprio",
      "Tom Hanks",
      "Jennifer Lawrence",
      "Meryl Streep",
      "Denzel Washington",
      "Oprah Winfrey",
      "Ellen DeGeneres",
      "Jimmy Fallon",
      "Stephen Colbert",
      "Trevor Noah",
      "Elon Musk",
      "Warren Buffett",
      "Sam Altman",
      "Demis Hassabis",
      "Satya Nadella",
      "Sundar Pichai",
      "Tim Cook",
      "Andy Jassy"
    ];
    for (const person of commonFigures) {
      const regex = new RegExp(`\\b${person.replace(/ /g, "\\s+")}\\b`, "i");
      if (regex.test(text)) {
        detectedFigures.push(person);
      }
    }
    return detectedFigures;
  }
  async function fetchWikipediaData(name, isCompany = false) {
    try {
      console.log(`Fetching Wikipedia data for ${isCompany ? "company" : "person"}: ${name}...`);
      const searchTerm = isCompany ? `${name} company` : name;
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
      console.log("Search results:", searchData);
      if (!searchData.query || !searchData.query.search || !searchData.query.search.length) {
        console.log(`No search results found for ${name}`);
        return {
          summary: `No Wikipedia information found for ${name}.`,
          imageUrl: null
        };
      }
      const pageId = searchData.query.search[0].pageid;
      console.log(`Page ID for ${name}: ${pageId}`);
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
      console.log("Extract data:", extractData);
      if (!extractData.query || !extractData.query.pages || !extractData.query.pages[pageId]) {
        console.error("Invalid extract data structure");
        return {
          summary: `Error retrieving information about ${name}.`,
          imageUrl: null
        };
      }
      const page = extractData.query.pages[pageId];
      const summary = page.extract ? page.extract.split("\n")[0] : `Information about ${name} not available.`;
      const imageUrl = page.thumbnail ? page.thumbnail.source : null;
      console.log(`Retrieved summary (${summary.length} chars) and image: ${imageUrl ? "Yes" : "No"}`);
      return {
        summary: summary.length > 200 ? summary.substring(0, 200) + "..." : summary,
        imageUrl
      };
    } catch (error) {
      console.error("Error fetching Wikipedia data:", error);
      return {
        summary: `Couldn't fetch information about ${name} at this time.`,
        imageUrl: null
      };
    }
  }
  function generateStockData(companyName) {
    let seed = 0;
    for (let i = 0; i < companyName.length; i++) {
      seed += companyName.charCodeAt(i);
    }
    const price = 50 + seed % 450;
    const change = -5 + seed * 7 % 1e3 / 100;
    let marketCap;
    const marketCapValue = 1 + seed % 3e3;
    if (marketCapValue > 1e3) {
      marketCap = `$${(marketCapValue / 1e3).toFixed(2)}T`;
    } else {
      marketCap = `$${marketCapValue}B`;
    }
    return {
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      marketCap
    };
  }
  async function fetchContextFromAI(text) {
    try {
      const companyMatches = detectCompany(text);
      const personMatches = detectPublicFigure(text);
      const wikipediaDataMap = /* @__PURE__ */ new Map();
      if (personMatches.length > 0) {
        const personPromises = personMatches.map(
          (person) => fetchWikipediaData(person).then((data2) => {
            wikipediaDataMap.set(person, data2);
          })
        );
        await Promise.all(personPromises);
      }
      if (companyMatches.length > 0) {
        const companyPromises = companyMatches.map(
          (company) => fetchWikipediaData(company, true).then((data2) => {
            wikipediaDataMap.set(company, data2);
          })
        );
        await Promise.all(companyPromises);
      }
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json"
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
            return_full_text: false
          }
        })
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      if (data && data[0] && data[0].generated_text) {
        let processedText = data[0].generated_text.trim();
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        const companyTagRegex = /\[COMPANY:(.*?)\]/g;
        const personTagRegex = /\[PERSON:(.*?)\]/g;
        const companiesFromAI = [...processedText.matchAll(companyTagRegex)].map((match) => match[1]);
        const personsFromAI = [...processedText.matchAll(personTagRegex)].map((match) => match[1]);
        processedText = processedText.replace(companyTagRegex, "<strong>$1</strong>");
        processedText = processedText.replace(personTagRegex, "<strong>$1</strong>");
        const additionalCompanies = detectCompany(processedText);
        const additionalPersons = detectPublicFigure(processedText);
        let additionalData = "";
        const orderedEntities = [];
        const mentionedEntities = /* @__PURE__ */ new Set();
        const addEntityInOrder = (type, name) => {
          const key = `${type}:${name}`;
          if (!mentionedEntities.has(key)) {
            orderedEntities.push({ type, name });
            mentionedEntities.add(key);
          }
        };
        companyMatches.forEach((company) => addEntityInOrder("company", company));
        personMatches.forEach((person) => addEntityInOrder("person", person));
        companiesFromAI.forEach((company) => addEntityInOrder("company", company));
        personsFromAI.forEach((person) => addEntityInOrder("person", person));
        additionalCompanies.forEach((company) => addEntityInOrder("company", company));
        additionalPersons.forEach((person) => addEntityInOrder("person", person));
        console.log("Ordered entities:", orderedEntities);
        if (orderedEntities.length > 0) {
          let allCards = "";
          orderedEntities.forEach((entity) => {
            if (entity.type === "company") {
              const companyData = wikipediaDataMap.get(entity.name);
              let summarySummary = companyData?.summary || `Loading information about ${entity.name}...`;
              const stockData = generateStockData(entity.name);
              const priceChangeClass = stockData.change >= 0 ? "change-positive" : "change-negative";
              const priceChangeSign = stockData.change >= 0 ? "+" : "";
              allCards += `<div class="info-card company-card">
              <div class="card-header">
                <div class="company-logo" style="background-color: #${getColorFromString(entity.name)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${entity.name.charAt(0)}</div>
                <div class="company-info">
                  <div class="company-name">${entity.name}</div>
                  <div class="company-price ${priceChangeClass}">$${stockData.price} <span class="price-change">${priceChangeSign}${stockData.change}%</span></div>
                </div>
              </div>
              <div class="company-summary">
                <p>${summarySummary}</p>
              </div>
              <div class="card-footer">
                <span class="market-cap">Market Cap: ${stockData.marketCap}</span>
                <span class="data-source">Data from Wikipedia</span>
              </div>
            </div>`;
            } else {
              let summaryText = `Loading information about ${entity.name}...`;
              let imageHtml = "";
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
      return "No context available";
    } catch (error) {
      console.error("Error fetching context from AI:", error);
      return `We couldn't fetch context right now. You were typing about "${text.substring(0, 30)}..."`;
    }
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_CONTEXT") {
      const { text } = message;
      if (!text || text.trim().length < 5) {
        sendResponse({ context: "" });
        return true;
      }
      fetchContextFromAI(text).then((context) => {
        sendResponse({ success: true, context });
      }).catch((error) => {
        console.error("Error in fetchContextFromAI:", error);
        sendResponse({
          success: false,
          context: `We couldn't fetch context right now. You were typing about "${text.substring(0, 30)}..."`
        });
      });
      return true;
    }
    return true;
  });
  function getColorFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 16777215).toString(16).toUpperCase();
    return "00000".substring(0, 6 - c.length) + c;
  }
})();
