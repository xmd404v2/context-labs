# Real-Time Context Chrome Extension

A Chrome extension that listens to what you're typing in any text field and provides real-time context about the content using AI.

## Features

- 🔍 Real-time text monitoring as you type
- 🧠 AI-powered context fetching
- 🎨 Clean, non-intrusive UI with shadcn components
- 🌓 Dark mode support
- ⚡ Fast and responsive

## Tech Stack

- Next.js for the front-end framework and API routes
- shadcn UI for UI components and styling
- TypeScript for type safety
- OpenAI API for context generation

## Development Setup

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn
- Chrome browser

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd real-time-context
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### Development

To start the development server:

```
npm run dev
```

To build the extension for Chrome:

```
npm run build:extension
```

To build both the extension and Next.js app:

```
npm run dev:extension
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select the `dist` directory from this project
4. The extension should now be installed and active

## Usage

1. Click on the extension icon to see the popup
2. Start typing in any text field on the web
3. The extension will analyze your text and provide contextual information in a floating popup

## Architecture

- `content-scripts/index.ts`: Content script that attaches to web pages and monitors input
- `background/index.ts`: Background script for the extension
- `src/app/api/context/route.ts`: Next.js API route to handle AI requests
- `src/lib/aiClient.ts`: Module to interact with the OpenAI API
- `src/components/ContextDisplay.tsx`: UI component to display the AI context

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
