import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import api, { getErrorMessage } from "../api/api";

function VerifyDocument() {
  const [searchParams] = useSearchParams();
  const [documentCode, setDocumentCode] = useState(searchParams.get("code") || "");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    setError("");

    if (!file) {
      setError("Choose the file you want to verify.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentCode", documentCode);
    setLoading(true);

    try {
      const response = await api.post("/verifications/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(response.data);
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Verification failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Integrity check</p>
          <h1>Verify document</h1>
        </div>
      </div>

      <form className="form-panel full" onSubmit={handleSubmit}>
        {error && <div className="alert error">{error}</div>}
        <label>
          Document code
          <input
            value={documentCode}
            onChange={(event) => setDocumentCode(event.target.value)}
            placeholder="DOC-2026-0001"
            required
          />
        </label>
        <label>
          File to verify
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            required
          />
        </label>
        <button className="primary-button" disabled={loading}>
          <ShieldCheck size={18} />
          {loading ? "Verifying..." : "Verify integrity"}
        </button>
      </form>

      {result && (
        <section className={`verification-result ${result.result?.toLowerCase()}`}>
          <h2>{result.result}</h2>
          <p>{result.message}</p>
          {result.data?.calculatedHash && <code>{result.data.calculatedHash}</code>}
        </section>
      )}
    </section>
  );
}

export default VerifyDocument;
