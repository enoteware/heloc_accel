# i18nexus Integration Guide

## Setup Steps

1. **Create Account**: Sign up at https://i18nexus.com
2. **Create Project**: Select `next-intl` as your library
3. **Add Languages**: Add English (en) and Spanish (es)
4. **Get API Key**: Copy from the Exports page

## Environment Setup

Add to `.env.local`:

```
I18NEXUS_API_KEY=your_api_key_here
```

## Install CLI

```bash
npm install i18nexus-cli --save-dev
```

## Update Package Scripts

```json
{
  "scripts": {
    "dev": "i18nexus pull && next dev",
    "build": "i18nexus pull && next build",
    "start": "i18nexus pull && next start",
    "translate": "i18nexus pull"
  }
}
```

## Upload Current Translations

1. Upload `src/messages/en.json` to i18nexus
2. Use AI translation to generate Spanish versions
3. Review and refine translations in dashboard
4. Pull updates with `npm run translate`

## Development Workflow

- Run `i18nexus listen` for live translation updates
- Use `i18nexus pull` to sync latest translations
- Test with language switcher at `/en` and `/es` routes

## Cost: $14/month for basic plan with AI translations
