'use client';

import { useState } from 'react';

export default function BillingPage() {
  const [url, setUrl] = useState('');

  async function createCheckout() {
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_id: 'price_demo', organization_id: 'demo-org' })
    });
    const data = await res.json();
    setUrl(data.checkout_url || data.error || 'No response');
  }

  return (
    <section className="grid">
      <div className="card">
        <h2>Billing Dashboard</h2>
        <p className="small">Stripe subscription + usage lock logic (chat can be disabled if subscription is unpaid).</p>
        <button className="button" onClick={createCheckout}>Create Stripe Checkout Session</button>
        {url && <p className="small">Response: {url}</p>}
      </div>
      <div className="card">
        <h3>Metering Inputs</h3>
        <ul className="small">
          <li>Active employee users</li>
          <li>Document storage</li>
          <li>AI usage tokens</li>
          <li>Compliance reviews run</li>
        </ul>
      </div>
    </section>
  );
}
