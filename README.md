This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Push notification server setup

Push notifications are sent by the Next.js API routes at `/api/send-push` and `/api/register-push-token`. No Supabase CLI or Supabase Edge Function deployment is required.

Add these variables to `.env.local` and to the Vercel project Environment Variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
FIREBASE_PROJECT_ID=eub-39b
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@eub-39b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
ADMIN_PIN=YOUR_ADMIN_PIN
NEXT_PUBLIC_ADMIN_PIN=YOUR_ADMIN_PIN
NEXT_PUBLIC_API_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app
```

Keep `SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `ADMIN_PIN` server-only. `NEXT_PUBLIC_API_ORIGIN` is used by the Capacitor Android bundle; it can be omitted for same-origin Vercel web requests.
