# Push notifications

The app registers native FCM tokens through `register-push-token`. Admin content handlers invoke `send-push` after a successful Supabase write. Both Edge Functions use the Supabase service role only on the server, and `send-push` uses Firebase HTTP v1 with a Firebase service account.

From the repository root, link the Supabase project and apply the token table migration:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Create a Firebase service account with the Firebase Cloud Messaging API enabled, download its JSON file outside the repository, and set it as a Supabase secret. In PowerShell:

```powershell
supabase secrets set FIREBASE_SERVICE_ACCOUNT_JSON=(Get-Content .\firebase-service-account.json -Raw)
```

Deploy both functions:

```powershell
supabase functions deploy register-push-token
supabase functions deploy send-push
```

Do not commit the service-account JSON file. The app only contains the Firebase client configuration needed by Android; the service account remains in Supabase secrets.