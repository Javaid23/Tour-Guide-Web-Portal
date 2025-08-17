import React, { useState } from "react";
import ReactDOM from "react-dom";


const categories = [
  { id: "adventure", name: "Adventure" },
  { id: "cultural", name: "Cultural" },
  { id: "historical", name: "Historical" },
  { id: "religious", name: "Religious" },
  { id: "nature", name: "Nature" },
  { id: "heritage", name: "Heritage" },
];
const locations = [
  { id: "gilgit-baltistan", name: "Gilgit-Baltistan" },
  { id: "punjab", name: "Punjab" },
  { id: "sindh", name: "Sindh" },
  { id: "khyber pakhtunkhwa", name: "Khyber Pakhtunkhwa" },
  { id: "balochistan", name: "Balochistan" },
  { id: "azad kashmir", name: "Azad Kashmir" },
  { id: "islamabad", name: "Islamabad" },
];

const AddTourForm = ({ onClose, onTourAdded }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "adventure",
    location: "gilgit-baltistan",
    maxGroupSize: "",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm(f => ({ ...f, images: Array.from(files) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Prepare form data for image upload if images are selected
      let imageUrls = [];
      if (form.images && form.images.length > 0) {
        for (let img of form.images) {
          const data = new FormData();
          data.append("image", img);
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              body: data
            });
            if (res.ok) {
              const result = await res.json();
              if (result.url) imageUrls.push(result.url);
            }
          } catch (err) {
            // Silent fail for image upload
          }
        }
      }
      // Send tour data to backend
      const response = await fetch("/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price,
          duration: { days: Number(form.duration) },
          category: form.category,
          location: form.location,
          maxGroupSize: form.maxGroupSize,
          images: imageUrls
        })
      });
      if (!response.ok) throw new Error("Failed to add tour");
      onTourAdded && onTourAdded();
      onClose();
    } catch (err) {
      setError("Failed to add tour. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Modal overlay using React portal
  return ReactDOM.createPortal(
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "32px",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        position: "relative"
      }}>
        <h2 style={{ margin: 0, marginBottom: 24, fontSize: 24, fontWeight: 700, color: "#2563eb" }}>Add New Tour</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            name="name"
            type="text"
            placeholder="Tour Name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16 }}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, minHeight: 80 }}
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16 }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16 }}
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <input
            name="price"
            type="number"
            placeholder="Price (USD)"
            value={form.price}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16 }}
          />
          <input
            name="duration"
            type="number"
            placeholder="Duration (days)"
            value={form.duration}
            onChange={handleChange}
            required
            min={1}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16 }}
          />
          <input
            name="maxGroupSize"
            type="number"
            placeholder="Max Group Size"
            value={form.maxGroupSize}
            onChange={handleChange}
            required
            min={1}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16 }}
          />
          <input
            name="images"
            type="file"
            accept="image/*"
            onChange={handleChange}
            multiple
            style={{ fontSize: 16 }}
          />
          {error && <div style={{ color: "#dc2626", fontWeight: 500 }}>{error}</div>}
          <button
            type="submit"
            style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: 12, fontWeight: 600, fontSize: 16, marginTop: 8, cursor: "pointer" }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Tour"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "#f1f5f9", color: "#2563eb", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, fontWeight: 600, fontSize: 16, cursor: "pointer" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddTourForm;
