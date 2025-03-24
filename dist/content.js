"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/debounce/index.js
  var require_debounce = __commonJS({
    "node_modules/debounce/index.js"(exports, module) {
      function debounce2(function_, wait = 100, options = {}) {
        if (typeof function_ !== "function") {
          throw new TypeError(`Expected the first parameter to be a function, got \`${typeof function_}\`.`);
        }
        if (wait < 0) {
          throw new RangeError("`wait` must not be negative.");
        }
        const { immediate } = typeof options === "boolean" ? { immediate: options } : options;
        let storedContext;
        let storedArguments;
        let timeoutId;
        let timestamp;
        let result;
        function run() {
          const callContext = storedContext;
          const callArguments = storedArguments;
          storedContext = void 0;
          storedArguments = void 0;
          result = function_.apply(callContext, callArguments);
          return result;
        }
        function later() {
          const last = Date.now() - timestamp;
          if (last < wait && last >= 0) {
            timeoutId = setTimeout(later, wait - last);
          } else {
            timeoutId = void 0;
            if (!immediate) {
              result = run();
            }
          }
        }
        const debounced = function(...arguments_) {
          if (storedContext && this !== storedContext && Object.getPrototypeOf(this) === Object.getPrototypeOf(storedContext)) {
            throw new Error("Debounced method called with different contexts of the same prototype.");
          }
          storedContext = this;
          storedArguments = arguments_;
          timestamp = Date.now();
          const callNow = immediate && !timeoutId;
          if (!timeoutId) {
            timeoutId = setTimeout(later, wait);
          }
          if (callNow) {
            result = run();
          }
          return result;
        };
        Object.defineProperty(debounced, "isPending", {
          get() {
            return timeoutId !== void 0;
          }
        });
        debounced.clear = () => {
          if (!timeoutId) {
            return;
          }
          clearTimeout(timeoutId);
          timeoutId = void 0;
        };
        debounced.flush = () => {
          if (!timeoutId) {
            return;
          }
          debounced.trigger();
        };
        debounced.trigger = () => {
          result = run();
          debounced.clear();
        };
        return debounced;
      }
      module.exports.debounce = debounce2;
      module.exports = debounce2;
    }
  });

  // content-scripts/index.ts
  var import_debounce = __toESM(require_debounce());
  var activeElement = null;
  var contextElement = null;
  var isRequestPending = false;
  async function getContext(text) {
    if (!text || text.trim().length < 5) return "";
    try {
      isRequestPending = true;
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: "GET_CONTEXT", text },
          (response) => {
            if (contextElement && response) {
              if (response.context) {
                updateContextDisplay(response.context);
                checkAndFetchWikipediaData();
              } else {
                updateContextDisplay("No context available");
              }
            }
            if (response && response.context) {
              resolve(response.context);
            } else {
              resolve("No context available");
            }
            isRequestPending = false;
          }
        );
      });
    } catch (error) {
      console.error("Error fetching context:", error);
      return `We couldn't fetch context right now. You were typing about "${text.substring(0, 30)}..."`;
    } finally {
      isRequestPending = false;
    }
  }
  function updateContextDisplay(context) {
    if (!contextElement) return;
    contextElement.innerHTML = `
    <div style="padding-right: 20px;">
      <div style="font-weight: 600; margin-bottom: 8px; font-size: 15px; color: #60a5fa;">Trending Context</div>
      <div style="color: #d1d5db; line-height: 1.6;">${context}</div>
    </div>
  `;
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
    #real-time-context-extension strong {
      color: #60a5fa;
      font-weight: 600;
      padding: 0 1px;
      background: rgba(96, 165, 250, 0.15);
      border-radius: 3px;
    }
  `;
    contextElement.appendChild(styleTag);
    const closeButton = document.createElement("button");
    closeButton.textContent = "\xD7";
    closeButton.style.position = "absolute";
    closeButton.style.top = "8px";
    closeButton.style.right = "8px";
    closeButton.style.border = "none";
    closeButton.style.background = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "18px";
    closeButton.style.color = "#a1a1aa";
    closeButton.style.padding = "2px 6px";
    closeButton.style.borderRadius = "4px";
    closeButton.style.lineHeight = "1";
    closeButton.onmouseenter = () => {
      closeButton.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    };
    closeButton.onmouseleave = () => {
      closeButton.style.backgroundColor = "transparent";
    };
    closeButton.onclick = () => {
      if (contextElement) {
        contextElement.remove();
        contextElement = null;
      }
    };
    contextElement.appendChild(closeButton);
  }
  function checkAndFetchWikipediaData() {
    if (!contextElement) return;
    const personCards = contextElement.querySelectorAll(".person-card");
    personCards.forEach((card) => {
      const infoElement = card.querySelector(".person-info p");
      if (infoElement && infoElement.textContent?.startsWith("Loading information about")) {
        const nameElement = card.querySelector(".person-name");
        if (nameElement && nameElement.textContent) {
          fetchAdditionalWikipediaData(nameElement.textContent, card);
        }
      }
    });
  }
  function showContext(element, context) {
    if (!contextElement) {
      contextElement = document.createElement("div");
      contextElement.id = "real-time-context-extension";
      contextElement.style.position = "absolute";
      contextElement.style.zIndex = "10000";
      contextElement.style.maxWidth = "437px";
      contextElement.style.width = "max-content";
      contextElement.style.padding = "12px 16px";
      contextElement.style.borderRadius = "12px";
      contextElement.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2), 0 2px 10px rgba(0, 0, 0, 0.1)";
      contextElement.style.backgroundColor = "#1f2937";
      contextElement.style.color = "#e5e7eb";
      contextElement.style.fontSize = "14px";
      contextElement.style.lineHeight = "1.5";
      contextElement.style.transition = "all 0.25s ease-in-out";
      contextElement.style.animation = "fadeIn 0.35s ease-out";
      contextElement.style.border = "1px solid rgba(255, 255, 255, 0.05)";
      const closeButton = document.createElement("button");
      closeButton.textContent = "\xD7";
      closeButton.style.position = "absolute";
      closeButton.style.top = "8px";
      closeButton.style.right = "8px";
      closeButton.style.border = "none";
      closeButton.style.background = "none";
      closeButton.style.cursor = "pointer";
      closeButton.style.fontSize = "18px";
      closeButton.style.color = "#a1a1aa";
      closeButton.style.padding = "2px 6px";
      closeButton.style.borderRadius = "4px";
      closeButton.style.lineHeight = "1";
      closeButton.onmouseenter = () => {
        closeButton.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      };
      closeButton.onmouseleave = () => {
        closeButton.style.backgroundColor = "transparent";
      };
      closeButton.onclick = () => {
        if (contextElement) {
          contextElement.remove();
          contextElement = null;
        }
      };
      contextElement.appendChild(closeButton);
      document.body.appendChild(contextElement);
    }
    const rect = element.getBoundingClientRect();
    contextElement.style.top = `${window.scrollY + rect.bottom + 10}px`;
    contextElement.style.left = `${window.scrollX + rect.left}px`;
    contextElement.style.setProperty("--arrow-top", "-8px");
    contextElement.style.setProperty("--arrow-left", "20px");
    if (isRequestPending) {
      contextElement.innerHTML = `
      <div style="padding-right: 20px;">
        <div style="font-weight: 600; margin-bottom: 8px; font-size: 15px; color: #60a5fa;">Trending Context</div>
        <div style="display: flex; justify-content: center; padding: 15px 0;">
          <div style="width: 24px; height: 24px; border: 2.5px solid #60a5fa; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
        </div>
      </div>
    `;
    } else {
      contextElement.innerHTML = `
      <div style="padding-right: 20px;">
        <div style="font-weight: 600; margin-bottom: 8px; font-size: 15px; color: #60a5fa;">Trending Context</div>
        <div style="color: #d1d5db; line-height: 1.6;">${context}</div>
      </div>
    `;
      const styleTag = document.createElement("style");
      styleTag.innerHTML = `
      #real-time-context-extension strong {
        color: #60a5fa;
        font-weight: 600;
        padding: 0 1px;
        background: rgba(96, 165, 250, 0.15);
        border-radius: 3px;
      }
    `;
      contextElement.appendChild(styleTag);
      setTimeout(() => {
        if (contextElement) {
          const personCards = contextElement.querySelectorAll(".person-card");
          personCards.forEach((card) => {
            const infoElement = card.querySelector(".person-info p");
            if (infoElement && infoElement.textContent?.startsWith("Loading information about")) {
              const nameElement = card.querySelector(".person-name");
              if (nameElement && nameElement.textContent) {
                fetchAdditionalWikipediaData(nameElement.textContent, card);
              }
            }
          });
        }
      }, 100);
    }
    if (!document.getElementById("real-time-context-styles")) {
      const styleTag = document.createElement("style");
      styleTag.id = "real-time-context-styles";
      styleTag.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      #real-time-context-extension .mentioned-section {
        margin-top: 15px;
      }
      
      #real-time-context-extension .mentioned-header {
        font-weight: 600;
        font-size: 13px;
        color: #60a5fa;
        margin-bottom: 8px;
        padding-left: 2px;
      }
      
      #real-time-context-extension .info-cards-container {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding-bottom: 8px;
        scrollbar-width: thin;
        -webkit-overflow-scrolling: touch;
      }
      
      #real-time-context-extension .info-cards-container::-webkit-scrollbar {
        height: 6px;
      }
      
      #real-time-context-extension .info-cards-container::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
      }
      
      #real-time-context-extension .info-cards-container::-webkit-scrollbar-thumb {
        background: rgba(96, 165, 250, 0.5);
        border-radius: 10px;
      }
      
      #real-time-context-extension .info-card {
        border-radius: 8px;
        overflow: hidden;
        background: #2d3748;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        flex: 0 0 auto;
        min-width: 180px;
        max-width: 220px;
      }
      
      #real-time-context-extension .card-header {
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      #real-time-context-extension .company-logo {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      #real-time-context-extension .company-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      
      #real-time-context-extension .company-name,
      #real-time-context-extension .person-name {
        font-weight: 600;
        font-size: 13px;
      }
      
      #real-time-context-extension .company-price {
        font-size: 13px;
        font-weight: 600;
      }
      
      #real-time-context-extension .price-change {
        font-size: 11px;
        opacity: 0.9;
      }
      
      #real-time-context-extension .company-summary {
        padding: 8px 12px;
        font-size: 12px;
        line-height: 1.4;
        max-height: 120px;
        overflow-y: auto;
      }
      
      #real-time-context-extension .company-summary .market-cap {
        font-size: 11px;
        color: #a0aec0;
        margin-bottom: 6px;
      }
      
      #real-time-context-extension .company-summary p {
        margin: 0;
      }
      
      #real-time-context-extension .stock-info {
        padding: 8px 12px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      
      #real-time-context-extension .stock-item {
        display: flex;
        flex-direction: column;
      }
      
      #real-time-context-extension .label {
        font-size: 11px;
        color: #a0aec0;
      }
      
      #real-time-context-extension .value {
        font-size: 13px;
        font-weight: 600;
      }
      
      #real-time-context-extension .change-positive {
        color: #48bb78;
      }
      
      #real-time-context-extension .change-negative {
        color: #f56565;
      }
      
      #real-time-context-extension .market-cap {
        font-size: 11px;
        color: #a0aec0;
      }
      
      #real-time-context-extension .data-source {
        font-size: 11px;
        color: #a0aec0;
        margin-left: auto;
      }
      
      #real-time-context-extension .person-image {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #4a5568;
        background-size: cover;
        background-position: center;
      }
      
      #real-time-context-extension .person-info {
        padding: 8px 12px;
        font-size: 12px;
        line-height: 1.4;
        max-height: 120px;
        overflow-y: auto;
      }
      
      #real-time-context-extension .card-footer {
        padding: 6px 12px;
        font-size: 10px;
        color: #718096;
        background: rgba(0, 0, 0, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        text-align: center;
      }
      
      /* Light mode support */
      @media (prefers-color-scheme: light) {
        #real-time-context-extension {
          background-color: #ffffff;
          color: #333333;
          border-color: rgba(0, 0, 0, 0.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(0, 0, 0, 0.07);
        }
        #real-time-context-extension div[style*="color: #d1d5db"] {
          color: #555 !important;
        }
        #real-time-context-extension div[style*="color: #60a5fa"] {
          color: #3b82f6 !important;
        }
        #real-time-context-extension strong {
          color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.08) !important;
        }
        
        #real-time-context-extension .mentioned-header {
          color: #3b82f6;
        }
        
        #real-time-context-extension .info-cards-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        
        #real-time-context-extension .info-cards-container::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
        }
        
        #real-time-context-extension .info-card {
          background: #f7fafc;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        #real-time-context-extension .card-header {
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          background: #f1f5f9;
        }
        
        #real-time-context-extension .change-positive {
          color: #38a169;
        }
        
        #real-time-context-extension .change-negative {
          color: #e53e3e;
        }
        
        #real-time-context-extension .label {
          color: #64748b;
        }
        
        #real-time-context-extension .company-summary .market-cap {
          color: #64748b;
        }
        
        #real-time-context-extension .card-footer {
          background: #f1f5f9;
          color: #64748b;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        #real-time-context-extension .person-image {
          background-color: #e2e8f0;
        }
      }
    `;
      document.head.appendChild(styleTag);
    }
  }
  async function fetchAdditionalWikipediaData(personName, cardElement) {
    try {
      console.log(`Content script fetching Wikipedia data for ${personName}...`);
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(personName)}&format=json&origin=*`;
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        updateWikipediaCard(cardElement, `Couldn't retrieve data for ${personName}.`, null);
        return;
      }
      const searchData = await searchResponse.json();
      if (!searchData.query || !searchData.query.search || !searchData.query.search.length) {
        updateWikipediaCard(cardElement, `No Wikipedia information found for ${personName}.`, null);
        return;
      }
      const pageId = searchData.query.search[0].pageid;
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=true&explaintext=true&pithumbsize=200&pageids=${pageId}&format=json&origin=*`;
      const extractResponse = await fetch(extractUrl);
      if (!extractResponse.ok) {
        updateWikipediaCard(cardElement, `Couldn't retrieve summary for ${personName}.`, null);
        return;
      }
      const extractData = await extractResponse.json();
      if (!extractData.query || !extractData.query.pages || !extractData.query.pages[pageId]) {
        updateWikipediaCard(cardElement, `Error retrieving information about ${personName}.`, null);
        return;
      }
      const page = extractData.query.pages[pageId];
      const summary = page.extract ? page.extract.split("\n")[0] : `Information about ${personName} not available.`;
      const imageUrl = page.thumbnail ? page.thumbnail.source : null;
      updateWikipediaCard(cardElement, summary.length > 200 ? summary.substring(0, 200) + "..." : summary, imageUrl);
    } catch (error) {
      console.error("Error fetching Wikipedia data:", error);
      updateWikipediaCard(cardElement, `Couldn't fetch information about ${personName} at this time.`, null);
    }
  }
  function updateWikipediaCard(cardElement, summary, imageUrl) {
    const infoElement = cardElement.querySelector(".person-info p");
    if (infoElement) {
      infoElement.textContent = summary;
    }
    if (imageUrl) {
      const imageElement = cardElement.querySelector(".person-image");
      if (imageElement) {
        imageElement.setAttribute("style", `background-image: url('${imageUrl}');`);
      }
    }
  }
  var debouncedFetchContext = (0, import_debounce.default)(async (element) => {
    let text = "";
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      text = element.value;
    } else if (element.getAttribute("contenteditable") === "true") {
      text = element.textContent || "";
    }
    if (text.length > 5) {
      showContext(element, "");
      const context = await getContext(text);
      if (context && contextElement) {
        showContext(element, context);
      }
    }
  }, 1e3);
  function handleInput(event) {
    const target = event.target;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.getAttribute("contenteditable") === "true") {
      activeElement = target;
      let textToProcess = "";
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        textToProcess = target.value;
      } else {
        textToProcess = target.textContent || "";
      }
      if (textToProcess && textToProcess.length > 5) {
        debouncedFetchContext(target);
      }
    }
  }
  function handleFocus(event) {
    const target = event.target;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.getAttribute("contenteditable") === "true") {
      activeElement = target;
      let textToProcess = "";
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        textToProcess = target.value;
      } else {
        textToProcess = target.textContent || "";
      }
      if (textToProcess && textToProcess.length > 5) {
        debouncedFetchContext(target);
      }
    }
  }
  function handleClick(event) {
    const target = event.target;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.getAttribute("contenteditable") === "true") {
      activeElement = target;
    }
  }
  function handleBlur() {
    setTimeout(() => {
      if (contextElement && document.activeElement !== activeElement) {
        contextElement.remove();
        contextElement = null;
      }
    }, 200);
  }
  function init() {
    document.addEventListener("input", handleInput, true);
    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("blur", handleBlur, true);
    document.addEventListener("click", handleClick, true);
    console.log("ContextRT Extension initialized");
    const notificationElement = document.createElement("div");
    notificationElement.style.position = "fixed";
    notificationElement.style.bottom = "20px";
    notificationElement.style.right = "20px";
    notificationElement.style.backgroundColor = "#1f2937";
    notificationElement.style.color = "white";
    notificationElement.style.padding = "12px 16px";
    notificationElement.style.borderRadius = "12px";
    notificationElement.style.zIndex = "10000";
    notificationElement.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)";
    notificationElement.style.animation = "fadeIn 0.5s ease-out forwards, fadeOut 0.5s ease-in forwards 2s";
    notificationElement.style.display = "flex";
    notificationElement.style.alignItems = "center";
    notificationElement.style.gap = "8px";
    notificationElement.style.fontSize = "14px";
    notificationElement.style.fontWeight = "500";
    notificationElement.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    const iconElement = document.createElement("div");
    iconElement.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 16v-4"></path>
      <path d="M12 8h.01"></path>
    </svg>
  `;
    notificationElement.appendChild(iconElement);
    notificationElement.appendChild(document.createTextNode("Trending Context activated"));
    document.body.appendChild(notificationElement);
    if (!document.getElementById("real-time-context-notification-styles")) {
      const styleTag = document.createElement("style");
      styleTag.id = "real-time-context-notification-styles";
      styleTag.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
    `;
      document.head.appendChild(styleTag);
    }
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.parentNode.removeChild(notificationElement);
      }
    }, 2500);
  }
  init();
})();
