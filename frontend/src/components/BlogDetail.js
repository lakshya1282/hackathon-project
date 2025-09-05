import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const BlogDetail = ({ blogId }) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/blogs/${blogId}`);
        if (!res.ok) throw new Error('Failed to fetch blog');
        const data = await res.json();
        setBlog(data.blog || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  if (loading) return <div>Loading blog...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!blog) return <div>Blog not found.</div>;

  return (
    <div className="blog-detail">
      <h2>{blog.title}</h2>
      <p>By {blog.author?.username || 'Unknown'} on {new Date(blog.createdAt).toLocaleDateString()}</p>
      <div>{blog.content}</div>
      {/* Add more blog details as needed */}
    </div>
  );
};

export default BlogDetail;
