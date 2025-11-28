# who-are-you-x

who-are-you-x

**Overview**
- Chrome Extension that shows “who” an X user is next to the post time, using data from maoxiaoke/who-are-you-x.
- Built with React + Tailwind + Vite. Content script observes X feed and injects a small inline badge.

**Project Structure**
- `public/manifest.json` — Chrome MV3 manifest
- `src/content-script/main.tsx` — content script entry (React)
- `src/content-script/WhoBadge.tsx` — small React badge component
- `src/content-script/style.css` — Tailwind styles for the badge
- `vite.config.ts` — builds `content-script.js` and `content-style.css`

**Build**
- `npm install`
- `npm run build`
- Load unpacked: open `chrome://extensions`, toggle Developer Mode, Load Unpacked → select `dist/`.

**How It Works**
- Fetches `https://raw.githubusercontent.com/maoxiaoke/who-are-you-x/main/data.json` and maps `{ account: "@handle", who: "..." }`.
- Finds X post time elements (`a[href*="/status/"] time`), locates the surrounding user header, extracts the handle, and if it matches the data, renders a badge after the time.

**Notes**
- Tailwind preflight is disabled to avoid resetting site styles.
- Supports `x.com` and `twitter.com` URLs.
