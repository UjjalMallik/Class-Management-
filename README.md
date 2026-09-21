# EUB 39B - Class Management App

<p align="center">
  <strong>A focused digital hub for the EUB 39B Civil batch.</strong><br />
  Routines, class links, notices, assignments, student records, and timely push updates in one elegant experience.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Capacitor-Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" />
  <img src="https://img.shields.io/badge/GitHub_Actions-Automated_Builds-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
</p>

<p align="center">
  <a href="https://github.com/UjjalMallik/Class-Management-">Repository</a>
  &nbsp;&bull;&nbsp;
  <a href="LICENSE">License</a>
</p>

## Overview

EUB 39B - Class Management App is a purpose-built class companion for students
and administrators of the EUB 39B Civil batch. It combines a calm, responsive
interface with practical workflows for sharing academic information, managing
class resources, and keeping the batch connected across web and Android.

The app is designed for quick scanning on a phone, dependable content updates,
and a polished experience that feels at home in both a browser and a native
Capacitor build.

## Key Features

- **Real-time push notifications** - Register Android devices for push delivery
  and notify students when notices, class links, routines, or other content is
  published.
- **Role-aware class workspace** - Switch between Student and PIN-protected
  Admin views without separating the everyday student experience from content
  management tools.
- **Academic content management** - Organize routines, class links, notices,
  assignments, student records, and image-based resources from focused tabs.
- **Anonymous feedback via Web3Forms** - Collect suggestions through a clean
  feedback modal without storing feedback in Supabase or requiring a user
  account.
- **Pinch-to-zoom image viewer** - Open uploaded resources in a responsive
  lightbox with pinch, pan, wheel, and double-tap/double-click zoom support.
- **Fast image loading and caching** - Use lazy loading, asynchronous decoding,
  skeleton placeholders, compressed uploads, and in-memory caching for a
  smoother mobile experience.
- **Dynamic versioning** - Display the current application version directly from
  `package.json` in the About experience.
- **Secure automated release builds** - Build consistently signed Android
  Release APKs through GitHub Actions using a protected release keystore and
  repository secrets.
- **Responsive themed interface** - Switch between light and dark themes with
  mobile-first layouts, responsive dialogs, accessible controls, and focused
  touch interactions.
- **Offline-aware behavior** - Detect connectivity changes and provide an
  offline routine view when the network is unavailable.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Radix UI primitives, Framer Motion |
| Data and storage | Supabase Database and Storage |
| Notifications | Capacitor Push Notifications, Firebase Cloud Messaging |
| Mobile runtime | Capacitor Android |
| Image workflows | `browser-image-compression`, `react-zoom-pan-pinch` |
| Feedback delivery | Web3Forms |
| Deployment and automation | Vercel, GitHub Actions, Gradle |

## Local Development

### Requirements

- Node.js 22 or newer
- npm
- Android Studio and a configured Android SDK for APK builds

### Start the web app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

### Available scripts

```bash
npm run dev       # Start the Next.js development server
npm run build     # Create a production web build
npm run start     # Serve the production build
npm run lint      # Run ESLint
```

## Environment Configuration

Create a `.env.local` file for local development. Keep server-only values out
of client-side code and never commit secrets.

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL=YOUR_FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
ADMIN_PIN=YOUR_ADMIN_PIN
NEXT_PUBLIC_ADMIN_PIN=YOUR_ADMIN_PIN
NEXT_PUBLIC_API_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app
```

`SUPABASE_SERVICE_ROLE_KEY`, Firebase credentials, and `ADMIN_PIN` must remain
server-only. `NEXT_PUBLIC_API_ORIGIN` is used by the Capacitor Android bundle
to reach the deployed API.

## Android Release Builds

Release builds use a stable signing key so updates install over existing
versions instead of being treated as a different application. Generate the
keystore locally and store it securely:

```bash
keytool -genkeypair -v -keystore release.keystore \
  -alias class-management-release -keyalg RSA -keysize 2048 \
  -validity 10000 -storetype JKS
```

The GitHub Actions workflow expects these repository secrets:

- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

The workflow decodes the protected keystore, runs `assembleRelease`, and
publishes the signed APK to the GitHub release associated with the version tag.

## License & Copyright

Copyright © 2026 Ujjal Mallik. All Rights Reserved.

This is proprietary software. The code, design, documentation, assets, and
associated materials may not be copied, modified, distributed, published, or
used for any commercial or non-commercial purpose without explicit written
permission from Ujjal Mallik.

See [LICENSE](LICENSE) for the complete terms.

## Developer

**Developed and Maintained by Ujjal Mallik**

EUB 39B - Class Management App is maintained as a dedicated academic utility
for the EUB 39B Civil batch.

<p align="center">
  <a href="https://github.com/UjjalMallik/Class-Management-">View the project on GitHub</a>
</p>
