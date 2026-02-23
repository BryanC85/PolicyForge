import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'PolicyForge FireFly',
  description: 'Automated HR compliance officer that works 24/7.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <nav className="nav">
            <Link href="/">Overview</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/employee">Employee</Link>
            <Link href="/reports">Reports</Link>
            <Link href="/billing">Billing</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
