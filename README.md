# Notification Service

A full-stack notification service dashboard built with React and Supabase. It supports authenticated users, test notifications, delivery tracking, retries, idempotency, and transactional/bulk priority classification.

## Features

- User authentication with Supabase Email/Password Auth
- Personalised greeting after login
- Send test notifications through Email, SMS, or Push
- Transactional and bulk traffic classification
- Idempotency keys to prevent duplicate notification requests
- Controlled retries for temporary provider failures:
  - Attempt 1: immediate
  - Attempt 2: after 2 seconds
  - Attempt 3: after 4 seconds
  - Attempt 4: after 8 seconds
  - Attempt 5: permanently failed
- Delivery-attempt tracking, including provider and error details
- Optional email-provider failover using backup Resend credentials
- User-scoped database access with Supabase Row Level Security
- Operational dashboard for delivery health, queues, reliability, and activity
- Vercel-ready frontend deployment

## Technology Stack

- React
- Supabase Auth
- Supabase PostgreSQL
- Supabase Edge Functions
- Resend for email delivery
- Twilio for SMS delivery
- Firebase Cloud Messaging for push notifications
- Vercel for frontend deployment

## Project Structure

```text
src/
  App.js                         # Dashboard, authentication, and notification composer
  lib/supabase.js                # Supabase client and function calls

supabase/
  schema.sql                     # Schema for a new Supabase project
  migrations/
    20260824_reliability.sql     # Reliability upgrade for an existing project
  functions/
    send-notification/
      index.ts                   # Live notification sender and retry handling
