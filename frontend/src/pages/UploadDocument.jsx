import { useState } from "react";
import { Upload } from "lucide-react";
import api, { getErrorMessage } from "../api/api";

function UploadDocument() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    setError("");

    if (!file) {
      setError("Choose a PDF, DOCX, or TXT file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(response.data.data);
      setFile(null);
      event.target.reset();
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Upload failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Off-chain storage</p>
          <h1>Upload document</h1>
        </div>
      </div>

      <form className="form-panel full" onSubmit={handleSubmit}>
        {error && <div className="alert error">{error}</div>}
        <label>
          Document file
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        <button className="primary-button" disabled={loading}>
          <Upload size={18} />
          {loading ? "Securing document..." : "Upload and secure"}
        </button>
      </form>

      {result && (
        <section className="result-panel">
          <h2>Upload result</h2>
          <div className="details-grid">
            <span>Document code</span>
            <strong>{result.documentCode}</strong>
            <span>Hash</span>
            <code>{result.sha256Hash}</code>
            <span>AI category</span>
            <strong>{result.category}</strong>
            <span>Confidence</span>
            <strong>{Math.round((result.confidence || 0) * 100)}%</strong>
            <span>Blockchain status</span>
            <strong>{result.blockchainStatus}</strong>
            <span>Transaction hash</span>
            <code>{result.blockchainTxHash || "N/A"}</code>
          </div>
        </section>
      )}
    </section>
  );
}

export default UploadDocument;
