# Collegewala - AI College Inquiry Chatbot

An intelligent AI-powered chatbot system built with **Next.js, React, and Google Genkit** designed to automatically answer student inquiries about Collegewala Institute of Engineering & Technology using Natural Language Processing (NLP) and semantic similarity matching.

## 📋 Project Overview

The Collegewala chatbot is a modern web application that:
- **Understands** student queries using advanced text similarity algorithms (cosine similarity)
- **Matches** user questions to the most relevant college information
- **Generates** contextual AI responses using Google Generative AI (Gemini)
- **Learns** from new questions and stores responses for continuous improvement
- **Provides** a responsive, user-friendly chat interface with conversation history
- **Manages** multiple chat sessions for better user experience

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js Server Actions, Node.js
- **AI**: Google Genkit 1.26.0, Generative AI API
- **Database**: JSON-based storage (learning and feedback logs)
- **UI Components**: Shadcn UI, Lucide Icons, Embla Carousel

## 🚀 Features

✨ **Smart Intent Recognition** - Identifies query types (contact, location, fees, etc.)
🤖 **AI-Powered Responses** - Uses Google Gemini to generate contextual answers
📝 **18+ Detailed Intents** - Comprehensive knowledge base covering all college aspects
❓ **20+ FAQs** - Frequently asked questions with clear, simple answers
💾 **Conversation History** - Save and load multiple chat sessions
📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
🔄 **Continuous Learning** - Logs unanswered questions and learns from interactions
🎯 **Keyword Elaboration** - Simple, easy-to-understand explanations with examples
⚡ **Fast Performance** - Optimized rendering and minimal latency

## 📦 Installation

### Requirements
- **Node.js**: 18.0+ (LTS recommended)
- **npm** or **yarn**: Latest version
- **Google API Key**: For Generative AI access
- **~600MB disk space** for dependencies

### Step 1: Clone/Navigate to Project
```bash
cd c:\laragon\www\Chaton
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- **Next.js & React**: Frontend framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Component library
- **Genkit & Google GenAI**: AI capabilities
- **Zod**: Validation
- All supporting libraries

### Step 3: Configure Environment
Create `.env.local` file in project root:
```bash
GOOGLE_GENAI_API_KEY=your_google_api_key_here
```

**Get API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy and paste in `.env.local`

### Step 4: Build Project (Optional but Recommended)
```bash
npm run build
```

This creates optimized production build in `.next` directory.

## 🔧 Running the Application

### Development Mode (Hot Reload)
```bash
npm run dev
```
Application will be available at: `http://localhost:3000`

**Features in Dev Mode:**
- Hot module reloading (auto-refresh on code changes)
- Detailed error messages
- Debug mode enabled
- Slower performance (expected)

### Production Mode (Optimized)
```bash
npm run build
npm start
```
Application will be available at: `http://localhost:3000`

**Better Performance:**
- Optimized bundle size
- Faster page loads
- Production-ready performance

### Build Only (No Run)
```bash
npm run build
```
Generates `.next` directory with compiled assets.

## 🐛 Fixing Common Issues

### Issue 1: MODULE_TYPELESS_PACKAGE_JSON Warning
**Error Message:**
```
[MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///path/to/next.config.js 
is not specified and it doesn't parse as CommonJS.
```

**Root Cause:** Next.js can't determine module type for config files.

**Solution (Choose One):**

**Option A: Add "type": "module" to package.json (May cause PostCSS issues)**
```json
{
  "type": "module",
  "name": "collegewala"
}
```

**Option B: Use .mjs extension (Recommended)**
Rename `next.config.js` to `next.config.mjs`

**Option C: Ignore Warning (Current Approach)**
The warning is non-critical and doesn't affect functionality. Build completes successfully. You can safely ignore it.

**⚠️ Why we don't add "type": "module":**
- Causes PostCSS compatibility issues
- Breaks tailwind.config.ts processing
- Build fails during CSS compilation
- Better to keep as-is or use `.mjs` approach

### Issue 2: ENOENT Error - prerender-manifest.json Not Found
**Error Message:**
```
Error: ENOENT: no such file or directory, open '.next/prerender-manifest.json'
```

**Root Cause:** Running `npm start` without building first. The `.next` directory doesn't exist.

**Solution:**
Always build before starting production mode:
```bash
# Step 1: Build the project
npm run build

# Step 2: Start production server
npm start
```

**Why This Happens:**
- `npm start` expects pre-built files in `.next` directory
- `npm run dev` creates temporary build on-the-fly
- `.next` directory is gitignored and not version controlled

### Issue 3: Dependencies Installation Fails
**Error:** `npm ERR! ERESOLVE unable to resolve dependency tree`

**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm package-lock.json
npm install

# Or use npm legacy peer deps flag
npm install --legacy-peer-deps
```

### Issue 4: Port 3000 Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

### Issue 5: API Key Not Working
**Error:** `Error: API key not valid`

**Solution:**
1. Verify `.env.local` exists in project root (not subdirectory)
2. Check API key format (should start with `AIza...`)
3. Ensure no extra spaces: `GOOGLE_GENAI_API_KEY=key_here` (no spaces around `=`)
4. Restart dev server after changing `.env.local`

### Issue 6: Build Errors
**Error:** `Failed to compile` or type errors

**Solutions:**
```bash
# Clear Next.js cache
rm -r .next
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Rebuild everything
npm install
npm run build
```

## 📊 Project Structure

```
collegewala/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page/layout
│   │   ├── actions.ts            # Server actions (query handling)
│   │   ├── globals.css           # Global styles
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ChatInterface.tsx      # Main chat component
│   │   ├── ChatHistory.tsx        # Conversation history sidebar
│   │   └── ui/                    # Radix UI components
│   ├── data/
│   │   └── json/
│   │       ├── intents.json       # 18 college intents with Q&A
│   │       ├── faq.json           # 20 frequently asked questions
│   │       ├── clg.json           # College comprehensive data
│   │       ├── learned_answers.json    # ML-learned responses
│   │       ├── unanswered_questions.json # Queries to improve
│   │       └── feedback.json      # User feedback logs
│   ├── ai/
│   │   ├── genkit.ts              # Genkit configuration
│   │   └── flows/                 # AI flow definitions
│   ├── lib/
│   │   ├── similarity.ts          # Text similarity matching
│   │   └── utils.ts               # Utility functions
│   └── hooks/                     # Custom React hooks
├── public/                        # Static assets
├── .env.local                     # Environment variables (not committed)
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── next.config.js                 # Next.js configuration
└── README.md                      # This file
```

## 💾 Data Files Explained

### `intents.json`
Contains 18 college-related intents with simplified, elaborated answers:
- **admission_documents** - Required documents for admission
- **admission_process** - Step-by-step application process
- **campus_security** - Safety and security measures
- **hostel_facility** - Accommodation details
- **fee_structure** - Course fees and payment options
- **placements** - Placement statistics and top companies
- **contact_details** - All contact information
- **courses_offered** - Available programs
- ...and 10 more intents

Each intent has:
- Keywords for matching
- Simple, step-by-step answer
- Multiple question variations

### `faq.json`
20 frequently asked questions with comprehensive answers:
- Structured with category tags
- Real examples and numbers
- Easy-to-understand language
- Covers all major topics

### `clg.json`
Complete college information database:
- College details (name, website, accreditation)
- Campus infrastructure (buildings, labs, facilities)
- Course offerings (B.Tech, MBA, MCA, B.Sc)
- Faculty information (departments, qualifications)
- Administration contacts
- Key statistics (placement rate, alumni count)

### `learned_answers.json`
Dynamically stores new Q&A pairs learned from interactions:
- Saves questions users ask
- Stores AI-generated responses
- Timestamp for tracking

### `unanswered_questions.json`
Tracks queries the chatbot couldn't answer well:
- Identifies knowledge gaps
- Used for continuous improvement
- Helps expand knowledge base

### `feedback.json`
User feedback and interaction logs:
- Chat history
- User satisfaction (good/bad)
- Conversation context
- Used for analytics

## 🎯 How the Chatbot Works

```
User Query
    ↓
[Text Preprocessing] - Remove punctuation, lowercase, tokenize
    ↓
[Intent Detection] - Identify query type (contact, location, etc.)
    ↓
[Similarity Matching] - Find best matching answer from knowledge base
    ↓
[AI Enhancement] - Generate contextual response using Google Gemini
    ↓
[Response Return] - Send answer with suggested follow-up questions
    ↓
[Learning] - Save new Q&A for future reference
    ↓
[Analytics] - Log interaction and user feedback
```

## 🚀 Available Commands

```bash
# Development
npm run dev              # Start dev server (hot reload)

# Production
npm run build            # Build optimized production build
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking (not configured yet)

# Maintenance
npm install              # Install all dependencies
npm cache clean --force  # Clear npm cache
```

## 📈 Performance Metrics

- **Build Time**: ~25-35 seconds
- **Initial Load**: ~1-2 seconds
- **Chat Response Time**: ~2-3 seconds (with AI generation)
- **Bundle Size**: ~133 KB (First Load JS)

## 🧠 Understanding the Response System

### Similarity Threshold
- **0.1 (10%)** - Minimum similarity to attempt answer
- **Lower threshold** = More attempts, potential wrong answers
- **Higher threshold** = More "I don't know" responses
- **Current setting**: 0.1 (optimized for college queries)

### Query Type Prioritization
The system recognizes query types and prioritizes relevant answers:
- **Contact queries** → Prioritize contact_details
- **Location queries** → Prioritize campus_location
- **Website queries** → Prioritize admission_process
- **Greeting queries** → Return personalized welcome

### Keyword Elaboration
All responses use:
- **Numbered steps** for clarity
- **Real examples** with numbers
- **Simple language** avoiding jargon
- **Actionable information** users can use immediately

## 🔐 Security Notes

- **API Key**: Never commit `.env.local` to git (added to `.gitignore`)
- **Sensitive Data**: Don't log API keys or personal information
- **Input Validation**: All user inputs are sanitized
- **Error Messages**: Generic error messages to prevent information leakage

## 📝 Development Workflow

### Adding New Knowledge
1. Edit `src/data/json/intents.json` or `faq.json`
2. Add new Q&A with keywords
3. Run `npm run build`
4. Test in dev mode: `npm run dev`

### Fixing Responses
1. Identify poor responses in `feedback.json`
2. Update relevant intent/FAQ
3. Clear browser cache
4. Test again

### Deploying Changes
```bash
# Local verification
npm run build
npm run dev

# When ready for deployment
npm run build    # Creates production build
npm start        # Start production server
```

## 🐛 Debugging Tips

### Enable Detailed Logging
Edit `src/app/actions.ts` to add console logs:
```typescript
console.log('Query:', query);
console.log('Best Match:', bestMatch);
console.log('Confidence:', bestScore);
```

### Check Browser Console
- Press `F12` to open DevTools
- Go to Console tab
- Look for API errors or client-side issues

### Monitor Network Requests
- DevTools → Network tab
- Look for server action calls to `/api/`
- Check response payloads

## 🤝 Contributing

To improve the chatbot:
1. Identify poor responses from logs
2. Edit relevant JSON data files
3. Test thoroughly
4. Verify all intents still work
5. Check mobile responsiveness

## 📄 License

This project is for Collegewala Institute of Engineering & Technology.

## 👨‍💻 Support & Troubleshooting

1. **Check errors in browser console** (F12)
2. **Verify `.env.local` is configured**
3. **Ensure you built before running** (`npm run build` then `npm start`)
4. **Check logs in** `src/data/json/unanswered_questions.json`
5. **Try rebuilding**: `rm -r .next && npm run build`

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**Status**: Production Ready
