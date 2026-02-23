export default function ReportsPage() {
  return (
    <section className="card">
      <h2>Compliance Report Viewer</h2>
      <p className="small">Each review contains score, missing policy categories, high-risk exposure, and readiness status for insurance/legal review.</p>
      <ul className="small">
        <li>Compliance Score (0-100)</li>
        <li>Missing Required Policies</li>
        <li>High-Risk Legal Exposure</li>
        <li>Ambiguous Language</li>
        <li>State-Specific Warnings</li>
      </ul>
    </section>
  );
}
