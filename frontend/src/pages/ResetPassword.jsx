import { useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get token from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else setError(data.message || "Something went wrong");
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay" style={{ minHeight: "100vh", background: "#e6f0ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="dialog-box" style={{ background: "white", borderRadius: 20, padding: 40, maxWidth: 400, width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.12)", border: "2px solid #3b82f6" }}>
        <h2 style={{ color: "#2563eb", fontWeight: 700, fontSize: 28, marginBottom: 10 }}>Reset Password</h2>
        <p style={{ color: "#555", marginBottom: 24 }}>Enter your new password below.</p>
        {success ? (
          <div style={{ color: "#2563eb", fontWeight: 500, fontSize: 16, textAlign: "center" }}>
            Your password has been reset! You can now sign in.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="password" style={{ color: "#2563eb", fontWeight: 500, fontSize: 15, display: "block", marginBottom: 8 }}>New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: 12, border: "2px solid #cbd5e1", borderRadius: 10, fontSize: 16, background: "#f8f9fa" }}
                placeholder="Enter new password"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="confirm" style={{ color: "#2563eb", fontWeight: 500, fontSize: 15, display: "block", marginBottom: 8 }}>Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                style={{ width: "100%", padding: 12, border: "2px solid #cbd5e1", borderRadius: 10, fontSize: 16, background: "#f8f9fa" }}
                placeholder="Confirm new password"
              />
            </div>
            {error && <div style={{ color: "#dc2626", marginBottom: 10 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 10 }}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
