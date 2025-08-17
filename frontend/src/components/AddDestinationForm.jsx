import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const AddDestinationForm = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    province: "",
    location: "",
    category: "",
    price: "",
    duration: { days: "" },
    maxGroupSize: "",
    highlights: "",
    image: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  // Handle image file select and upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImageUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      // Try to upload to /api/upload or /uploads (adjust endpoint as needed)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data?.url || data?.path) {
        setForm(f => ({ ...f, image: data.url || data.path }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      // Silently fail, do not alert user
    }
    setImageUploading(false);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith("duration.")) {
      setForm(f => ({ ...f, duration: { ...f.duration, days: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const highlightsArr = form.highlights
        ? form.highlights.split(",").map(h => h.trim()).filter(Boolean)
        : [];
      const res = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          maxGroupSize: Number(form.maxGroupSize),
          duration: { days: Number(form.duration.days) },
          highlights: highlightsArr,
        }),
      });
      if (!res.ok) throw new Error("Failed to add destination");
      setLoading(false);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "Error adding destination");
      setLoading(false);
    }
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 10001 }} onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative" style={{ zIndex: 10002, border: '3px solid #2563eb', background: '#fff' }}>
        <h2 className="text-2xl font-bold mb-4">Add New Destination</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Destination Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
            {imageUploading && <div className="text-blue-600 text-sm">Uploading...</div>}
            {form.image && <img src={form.image} alt="Preview" className="w-32 h-24 object-cover rounded mb-2 border" />}
          </div>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" required />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" required />
          <input name="province" value={form.province} onChange={handleChange} placeholder="Province/Region" className="w-full border p-2 rounded" required />
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location (city/state)" className="w-full border p-2 rounded" />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full border p-2 rounded" />
          <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" className="w-full border p-2 rounded" required />
          <input name="duration.days" type="number" value={form.duration.days} onChange={handleChange} placeholder="Duration (days)" className="w-full border p-2 rounded" />
          <input name="maxGroupSize" type="number" value={form.maxGroupSize} onChange={handleChange} placeholder="Max Group Size" className="w-full border p-2 rounded" />
          <input name="highlights" value={form.highlights} onChange={handleChange} placeholder="Highlights (comma separated)" className="w-full border p-2 rounded" />
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all">
              {loading ? "Adding..." : "Add Destination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Try portal, fallback to direct render if not available
  try {
    return createPortal(modalContent, document.body);
  } catch {
    return modalContent;
  }
};

export default AddDestinationForm;
