import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { downloadDocumentFile, getErrorMessage } from "../api/api";
import DocumentCard from "../components/DocumentCard";

function SharedDocuments() {
  const [shares, setShares] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadShares() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/shares/received");
        setShares(response.data.data || []);
      } catch (apiError) {
        setError(getErrorMessage(apiError, "Could not load shared documents."));
      } finally {
        setLoading(false);
      }
    }

    loadShares();
  }, []);

  const handleDownload = async (document) => {
    try {
      await downloadDocumentFile(document);
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Download failed."));
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Received access</p>
          <h1>Shared documents</h1>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading && <div className="empty-state">Loading shared documents...</div>}
      {!loading && shares.length === 0 && <div className="empty-state">No documents shared with you yet.</div>}

      <div className="document-grid">
        {shares.map((share) => (
          <div className="shared-item" key={share.id}>
            <p className="muted">Shared by {share.owner?.name || share.owner?.email}</p>
            <DocumentCard
              document={share.document}
              onDownload={handleDownload}
              onVerify={(code) => navigate(`/verify?code=${encodeURIComponent(code)}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default SharedDocuments;
