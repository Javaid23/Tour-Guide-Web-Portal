import React from "react";

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 12, maxWidth: 600, width: "90%", padding: 32, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, fontSize: 20, background: "none", border: "none", cursor: "pointer" }}>&times;</button>
        <h2 style={{ marginBottom: 16 }}>TourGuide Terms of Use</h2>
        <ol style={{ fontSize: 15, color: "#374151", paddingLeft: 20 }}>
          <li style={{ marginBottom: 10 }}><b>Acceptance:</b> By booking or using TourGuide, you agree to these terms.</li>
          <li style={{ marginBottom: 10 }}><b>Eligibility:</b> You must be 18+ or have parental consent to use our services.</li>
          <li style={{ marginBottom: 10 }}><b>Booking & Payment:</b> All bookings are subject to availability. Full payment is required to confirm your reservation.</li>
          <li style={{ marginBottom: 10 }}><b>Cancellation:</b> Cancellations must be made at least 48 hours before the tour for a full refund. No-shows or late cancellations may not be refunded.</li>
          <li style={{ marginBottom: 10 }}><b>Conduct:</b> Users must respect local laws and behave responsibly during tours.</li>
          <li style={{ marginBottom: 10 }}><b>Liability:</b> TourGuide is not liable for personal injury, loss, or damage during tours, except as required by law.</li>
          <li style={{ marginBottom: 10 }}><b>Changes:</b> TourGuide may update these terms at any time. Continued use means you accept the new terms.</li>
        </ol>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 24 }}>For questions, contact us at support@tourguide.com</p>
      </div>
    </div>
  );
};

export default TermsModal;
