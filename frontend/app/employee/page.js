import ApiTester from '../../components/ApiTester';

export default function EmployeePage() {
  return (
    <section className="grid">
      <div className="card">
        <h2>Employee Assistant</h2>
        <p className="small">Answers come only from approved policy context and include citations.</p>
      </div>
      <ApiTester endpoint="/api/chat" payload={{ organization_id: 'demo-org', user_id: 'employee-9', question: 'How does PTO work?' }} />
    </section>
  );
}
