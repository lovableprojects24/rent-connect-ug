---
name: Pesapal Payment Integration
description: Pesapal API v3 edge function for payments, with sandbox/live toggle in Settings
type: feature
---
- Edge function: `supabase/functions/pesapal/index.ts`
- Handles: OAuth auth, IPN registration, order submission, IPN callback
- Payment method enum: `pesapal` added to `payment_method`
- Settings: `pesapal_env` (sandbox/live), `pesapal_currency` (UGX/KES/USD)
- Secrets: PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET
- Component: `src/components/payments/PesapalPayButton.tsx`
