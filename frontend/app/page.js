import Link from 'next/link';

const cards = [
  ['Risk Radar', 'Continuous compliance detection before lawsuits happen.', '/reports'],
  ['AI Employee Assistant', 'Policy Q&A with citations and escalation.', '/employee'],
  ['Audit Trail Vault', 'Timestamped evidence for good-faith compliance.', '/admin'],
  ['Revenue Control', 'Stripe-powered billing, seat metering, and access lockouts.', '/billing']
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>PolicyForge FireFly</h1>
        <p className="small">Apple + Google-grade UX for 24/7 HR compliance automation.</p>
        <div className="grid">
          {cards.map(([title, desc, href]) => (
            <article className="card" key={title}>
              <h3>{title}</h3>
              <p className="small">{desc}</p>
              <Link href={href} className="button">Open</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
