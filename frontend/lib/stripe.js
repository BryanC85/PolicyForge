import Stripe from 'stripe';
import { getMasterApiConfig } from './masterApiConfig';

const cfg = getMasterApiConfig();
export const stripe = new Stripe(cfg.stripe.secretKey, {
  apiVersion: '2024-12-18.acacia'
});
