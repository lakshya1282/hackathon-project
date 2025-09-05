import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with your actual JWT token retrieval logic
        const token = localStorage.getItem('token');
        const res = await fetch('/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        const data = await res.json();
        setStats(data.stats);
        setRecentBlogs(data.recentBlogs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {stats && (
        <div className="stats">
          <p>Total Blogs: {stats.totalBlogs}</p>
          <p>Pending Blogs: {stats.pendingBlogs}</p>
          <p>Approved Blogs: {stats.approvedBlogs}</p>
          <p>Total Users: {stats.totalUsers}</p>
        </div>
      )}
      <h3>Recent Pending Blogs</h3>
      <ul>
            {recentBlogs.map(blog => {
              const authorName = blog.author && blog.author.username ? blog.author.username : 'Unknown';
              const authorEmail = blog.author && blog.author.email ? blog.author.email : 'Unknown';
              return (
                <li key={blog._id}>
                  <strong style={{ cursor: 'pointer', color: '#007bff' }}
                    onClick={() => onBlogClick && onBlogClick(blog._id)}
                  >{blog.title}</strong> by {authorName} ({authorEmail})
                  <button
                    style={{ marginLeft: '10px', color: 'red' }}
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this blog?')) {
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`/admin/blogs/${blog._id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            }
                          });
                          if (!res.ok) throw new Error('Failed to delete blog');
                          setRecentBlogs(recentBlogs.filter(b => b._id !== blog._id));
                          alert('Blog deleted successfully');
                        } catch (err) {
                          alert('Error deleting blog: ' + err.message);
                        }
                      }
                    }}
                  >Delete</button>
                  <button
                    style={{ marginLeft: '10px' }}
                    onClick={() => window.open(`/blog/${blog._id}`, '_blank')}
                  >View</button>
                </li>
              );
            })}
      </ul>
    </div>
  );
};

export default AdminDashboard;
