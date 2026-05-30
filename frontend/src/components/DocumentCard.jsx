import { Download, Send, ShieldCheck } from "lucide-react";

function DocumentCard({
  document,
  shareEmail,
  onShareEmailChange,
  onShare,
  onDownload,
  onVerify
}) {
  const confidence = Math.round((document.confidence || 0) * 100);

  return (
    <article className="document-card">
      <div className="document-main">
        <div>
          <h3>{document.originalName}</h3>
          <p className="muted">{document.documentCode}</p>
        </div>
        <span className={`status-pill ${document.blockchainStatus?.toLowerCase()}`}>
          {document.blockchainStatus}
        </span>
      </div>

      <dl className="document-meta">
        <div>
          <dt>Category</dt>
          <dd>{document.category}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{confidence}%</dd>
        </div>
        <div>
          <dt>Uploaded</dt>
          <dd>{new Date(document.createdAt).toLocaleString()}</dd>
        </div>
      </dl>

      {onShare && (
        <div className="share-row">
          <input
            value={shareEmail || ""}
            onChange={(event) => onShareEmailChange(document.id, event.target.value)}
            placeholder="receiver@example.com"
            type="email"
          />
          <button className="secondary-button" onClick={() => onShare(document.id)}>
            <Send size={17} />
            Share
          </button>
        </div>
      )}

      <div className="actions-row">
        <button className="secondary-button" onClick={() => onDownload(document)}>
          <Download size={17} />
          Download
        </button>
        <button className="primary-button" onClick={() => onVerify(document.documentCode)}>
          <ShieldCheck size={17} />
          Verify
        </button>
      </div>
    </article>
  );
}

export default DocumentCard;
