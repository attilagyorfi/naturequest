# MMI References Map Handover

## Current Local App

- Presentation route: `/mmi`
- Admin route: `/mmi/admin`
- Dataset: `public/mmi-data/projects.json`
- Category colors: `public/mmi-data/categories.json`
- Local images: `public/mmi-data/images/<project-id>/`
- World map: `public/mmi-data/world-countries.geojson`

## Local Commands

```powershell
corepack pnpm run mmi:ingest
corepack pnpm run mmi:validate
corepack pnpm run test:mmi
corepack pnpm run dev
```

Open:

```text
http://localhost:3000/mmi
http://localhost:3000/mmi/admin
```

## Admin Login

The admin API accepts HTTP Basic credentials.

Defaults are defined server-side in `src/mmi/lib/admin-auth.ts`:

- username: `adobeallapps.mmernoki@gmail.com`
- password: `Szigmax355`

For a public website, set these as environment variables instead:

```text
MMI_ADMIN_EMAIL=...
MMI_ADMIN_PASSWORD=...
```

Do not publish the default password in a public repository.

## Desktop Use

The `/mmi` route includes a web app manifest, so Chromium-based browsers can install it as an app:

1. Start the local server.
2. Open `http://localhost:3000/mmi`.
3. Use the browser menu and choose install app / create shortcut.

For a true packaged `.exe`, wrap this route with Electron or Tauri and point it at the built Next app. The current code is ready for that because normal presentation usage reads only static local JSON and images.

## Website Integration

Recommended integration path:

1. Keep `public/mmi-data/projects.json`, `categories.json`, images, and `world-countries.geojson` as static assets.
2. Mount the React app as a dedicated route on the company website, for example `/references-map`.
3. Move admin writes to the website backend or CMS.
4. Replace the temporary Basic auth with the website's production authentication.

The presentation map does not need runtime scraping. Rebuild the dataset with `mmi:ingest`, then deploy the generated static assets.
