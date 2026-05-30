import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/api";

function VerificationHistory() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/verifications/history");
        setHistory(response.data.data || []);
      } catch (apiError) {
        setError(getErrorMessage(apiError, "Could not load verification history."));
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Audit trail</p>
          <h1>Verification history</h1>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading && <div className="empty-state">Loading history...</div>}
      {!loading && history.length === 0 && <div className="empty-state">No verification logs yet.</div>}

      {history.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Document code</th>
                <th>Uploaded file</th>
                <th>Result</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{item.documentCode || item.document?.documentCode || "N/A"}</td>
                  <td>{item.uploadedFileName}</td>
                  <td>
                    <span className={`result-badge ${item.result.toLowerCase()}`}>{item.result}</span>
                  </td>
                  <td>{item.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default VerificationHistory;
