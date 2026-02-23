'use client';

import { useState } from 'react';

export default function ApiTester({ endpoint, payload }) {
  const [result, setResult] = useState('');

  async function run() {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    setResult(JSON.stringify(json, null, 2));
  }

  return (
    <div className="card">
      <button onClick={run} className="button">Run {endpoint}</button>
      {result && <pre className="small" style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>}
    </div>
  );
}
