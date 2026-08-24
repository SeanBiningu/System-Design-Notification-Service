# Getting Started with Create React App

## Supabase setup

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor. For an existing installation, run [`supabase/migrations/20260824_reliability.sql`](supabase/migrations/20260824_reliability.sql) instead.
2. Copy `.env.example` to `.env`.
3. Add your project URL and anon/publishable key from **Project Settings → API**. Never add a `service_role` key to this frontend.
4. Restart `npm start` after changing `.env`.

Without these variables, the dashboard stays in demo mode. The test-notification composer will write to the `notifications` table once Supabase is configured.

### Live delivery setup

The real sender is a Supabase Edge Function. Install the Supabase CLI, authenticate, and deploy it:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=... RESEND_FROM_EMAIL=verified@yourdomain.com
# Optional email failover provider credentials
supabase secrets set RESEND_BACKUP_API_KEY=... RESEND_BACKUP_FROM_EMAIL=verified@yourdomain.com
supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM_NUMBER=+15551234567
supabase secrets set FCM_PROJECT_ID=... FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
supabase functions deploy send-notification
```

Run the schema (or reliability migration) in Supabase **SQL Editor** before deploying the function. For live sends, the user must sign in through Supabase Auth; the Edge Function rejects unauthenticated requests. Enable the **Email** provider under **Authentication → Providers**. Provider secrets remain in Supabase and are never bundled into the browser application. Verify your sender domain in Resend, buy/configure a Twilio sender number, and create a Firebase service-account JSON with Firebase Cloud Messaging access.

The sender records every attempt, retries failures at 0, 2, 4, and 8 seconds, and permanently fails after the fifth attempt. Email can fall back to a second Resend credential set. Transactional and bulk requests are stored with separate priorities; for sustained production volume, use a dedicated queue worker to consume transactional items before bulk items rather than invoking provider calls directly from the Edge Function.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
