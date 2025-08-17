import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { tourAPI } from "../services/api";

const BlogPost = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch blog by slug (or title, depending on backend API)
        const response = await tourAPI.getBlogBySlug(slug);
        if (response.success && response.data) {
          setBlog(response.data);
        } else {
          setError("Blog post not found.");
        }
      } catch (err) {
        setError("Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!blog) return null;

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Link to="/heritage" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Heritage</Link>
      <h1 className="text-4xl font-bold mb-4 text-blue-900">{blog.title}</h1>
      <img src={blog.image} alt={blog.title} className="w-full h-72 object-cover rounded-xl mb-6" />
      <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }} />
      <div className="text-gray-500 text-sm">Category: {blog.category} | Published: {new Date(blog.createdAt).toLocaleDateString()}</div>
    </div>
  );
};

export default BlogPost;
