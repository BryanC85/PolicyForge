import ApiTester from '../../components/ApiTester';

export default function AdminPage() {
  return (
    <section className="grid">
      <div className="card">
        <h2>Admin Command Center</h2>
        <p className="small">Upload handbooks, launch compliance review, and export legal audit logs.</p>
        <ol className="small">
          <li>Upload policy to `/api/upload`.</li>
          <li>Run compliance review from `/api/review`.</li>
          <li>Export event history via `/api/audit`.</li>
        </ol>
      </div>
      <ApiTester endpoint="/api/review" payload={{ organization_id: 'demo-org', requested_by: 'owner-1' }} />
    </section>
  );
}
