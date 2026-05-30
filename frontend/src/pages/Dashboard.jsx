import { useEffect, useState } from "react";
import { FileCheck, FileText, History, Share2 } from "lucide-react";
import api from "../api/api";

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    documents: 0,
    shared: 0,
    verifications: 0,
    authentic: 0,
    modified: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);

      try {
        const requests = [
          user.role === "VERIFIER" ? Promise.resolve({ data: { data: [] } }) : api.get("/documents/my"),
          api.get("/shares/received"),
          api.get("/verifications/history")
        ];

        const [documentsResponse, sharesResponse, historyResponse] = await Promise.all(requests);
        const history = historyResponse.data.data || [];

        setStats({
          documents: documentsResponse.data.data?.length || 0,
          shared: sharesResponse.data.data?.length || 0,
          verifications: history.length,
          authentic: history.filter((item) => item.result === "AUTHENTIC").length,
          modified: history.filter((item) => item.result === "MODIFIED").length
        });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user.role]);

  const cards = [
    { label: "My documents", value: stats.documents, icon: FileText },
    { label: "Shared with me", value: stats.shared, icon: Share2 },
    { label: "Verifications", value: stats.verifications, icon: History },
    { label: "Authentic / Modified", value: `${stats.authentic} / ${stats.modified}`, icon: FileCheck }
  ];

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{user.role}</p>
          <h1>Dashboard</h1>
        </div>
        <p className="muted">Welcome back, {user.name}.</p>
      </div>

      {loading ? (
        <div className="empty-state">Loading dashboard...</div>
      ) : (
        <div className="summary-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="summary-card" key={card.label}>
                <Icon size={24} />
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Dashboard;
