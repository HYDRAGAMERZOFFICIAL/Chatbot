# Quick Reference for Developers

## Essential Commands

### First Time Setup
```bash
cd c:\laragon\www\Chaton
npm install
```

### Development (Recommended for coding)
```bash
npm run dev
```
- Hot reload on file changes
- Available at http://localhost:3000
- Slower but easier to debug

### Production Build & Run
```bash
npm run build
npm start
```
- Optimized performance
- Available at http://localhost:3000
- Must build before starting

### Code Quality
```bash
npm run lint
```

## Common Issues & Fixes

### If you see MODULE_TYPELESS_PACKAGE_JSON warning
**Status**: ⚠️ Non-critical, safe to ignore
- Build completes successfully
- Doesn't affect functionality
- To fix: Would need to rename `next.config.js` to `next.config.mjs`

### If you get ENOENT prerender-manifest.json error
**Solution**: Always build before starting
```bash
npm run build  # MUST do this first
npm start
```

### If port 3000 is already in use
```bash
npm run dev -- -p 3001  # Use different port
```

### If dependencies fail to install
```bash
npm cache clean --force
rm package-lock.json
npm install
```

## File Locations to Remember

- **API Key**: `.env.local` (KEEP PRIVATE - add to .gitignore)
- **Chat Data**: `src/data/json/`
  - `intents.json` - 18 intents with Q&A
  - `faq.json` - 20 FAQs
  - `clg.json` - College data
  - `learned_answers.json` - AI learns here
  - `unanswered_questions.json` - Questions to improve
  - `feedback.json` - User feedback

- **Main Logic**: `src/app/actions.ts` - Response handling system

- **Chat UI**: `src/components/ChatInterface.tsx` - Main chat component

## After Making Changes

1. **If editing JSON files**: No rebuild needed, just refresh browser
2. **If editing TypeScript/React**: Changes auto-reload in dev mode
3. **For production**: Run `npm run build` then `npm start`

## Before Committing

1. Never commit `.env.local` (API keys!)
2. Run `npm run build` to ensure no errors
3. Test in both dev and prod modes
4. Check mobile responsiveness

## Performance Targets

- Build time: 25-35 seconds
- Dev startup: 5-10 seconds
- Chat response: 2-3 seconds
- Page load: 1-2 seconds

## Architecture Notes

- **Frontend**: Next.js 14 (React 18, TypeScript)
- **AI**: Google Genkit with Gemini API
- **Matching**: Cosine similarity (0.1 threshold)
- **Storage**: JSON files (localStorage for chat sessions)
- **UI**: Radix UI components + Tailwind CSS

## Last Updated
December 17, 2025 - All systems working, production ready
