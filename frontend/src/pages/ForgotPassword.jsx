import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) setSent(true);
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
        <h2 style={{ color: "#2563eb", fontWeight: 700, fontSize: 28, marginBottom: 10 }}>Forgot Password</h2>
        <p style={{ color: "#555", marginBottom: 24 }}>Enter your email and we'll send you a link to reset your password.</p>
        {sent ? (
          <div style={{ color: "#2563eb", fontWeight: 500, fontSize: 16, textAlign: "center" }}>
            If that email exists, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="email" style={{ color: "#2563eb", fontWeight: 500, fontSize: 15, display: "block", marginBottom: 8 }}>Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: 12, border: "2px solid #cbd5e1", borderRadius: 10, fontSize: 16, background: "#f8f9fa" }}
                placeholder="Enter your email"
              />
            </div>
            {error && <div style={{ color: "#dc2626", marginBottom: 10 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 10 }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
