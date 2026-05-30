import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api, { getErrorMessage } from "../api/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [usersResponse, documentsResponse, verificationsResponse, categoriesResponse] =
        await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/documents"),
          api.get("/admin/verifications"),
          api.get("/admin/categories")
        ]);

      setUsers(usersResponse.data.data || []);
      setDocuments(documentsResponse.data.data || []);
      setVerifications(verificationsResponse.data.data || []);
      setCategories(categoriesResponse.data.data || []);
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Could not load admin dashboard."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/admin/categories", { name: categoryName });
      setCategoryName("");
      setMessage("Category created.");
      await loadAdminData();
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Could not create category."));
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Admin dashboard</h1>
        </div>
      </div>

      {loading && <div className="empty-state">Loading admin dashboard...</div>}
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {!loading && (
        <div className="admin-grid">
          <section className="admin-section">
            <h2>Users</h2>
            <div className="table-wrap compact">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user._count?.documents || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section">
            <h2>Categories</h2>
            <form className="inline-form" onSubmit={handleCreateCategory}>
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="New category"
                required
              />
              <button className="primary-button">
                <Plus size={17} />
                Add
              </button>
            </form>
            <div className="tag-list">
              {categories.map((category) => (
                <span key={category.id}>{category.name}</span>
              ))}
            </div>
          </section>

          <section className="admin-section wide-section">
            <h2>Registered documents</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Owner</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>{document.documentCode}</td>
                      <td>{document.originalName}</td>
                      <td>{document.owner?.email}</td>
                      <td>{document.category}</td>
                      <td>{document.blockchainStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section wide-section">
            <h2>Verification logs</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Code</th>
                    <th>Verifier</th>
                    <th>Result</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((verification) => (
                    <tr key={verification.id}>
                      <td>{new Date(verification.createdAt).toLocaleString()}</td>
                      <td>{verification.documentCode}</td>
                      <td>{verification.verifiedBy?.email || "N/A"}</td>
                      <td>
                        <span className={`result-badge ${verification.result.toLowerCase()}`}>
                          {verification.result}
                        </span>
                      </td>
                      <td>{verification.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;
