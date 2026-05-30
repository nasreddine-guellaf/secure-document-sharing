import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { downloadDocumentFile, getErrorMessage } from "../api/api";
import DocumentCard from "../components/DocumentCard";

function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [shareEmails, setShareEmails] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDocuments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/documents/my");
      setDocuments(response.data.data || []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Could not load documents."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleShareEmailChange = (documentId, value) => {
    setShareEmails((current) => ({ ...current, [documentId]: value }));
  };

  const handleShare = async (documentId) => {
    setError("");
    setMessage("");
    const receiverEmail = shareEmails[documentId];

    try {
      await api.post("/shares", { documentId, receiverEmail });
      setMessage("Document shared successfully.");
      setShareEmails((current) => ({ ...current, [documentId]: "" }));
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Share failed."));
    }
  };

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
          <p className="eyebrow">Owned documents</p>
          <h1>My documents</h1>
        </div>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {loading && <div className="empty-state">Loading documents...</div>}
      {!loading && documents.length === 0 && <div className="empty-state">No documents uploaded yet.</div>}

      <div className="document-grid">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            shareEmail={shareEmails[document.id] || ""}
            onShareEmailChange={handleShareEmailChange}
            onShare={handleShare}
            onDownload={handleDownload}
            onVerify={(code) => navigate(`/verify?code=${encodeURIComponent(code)}`)}
          />
        ))}
      </div>
    </section>
  );
}

export default MyDocuments;
