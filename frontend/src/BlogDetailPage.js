import React from 'react';
import { useParams } from 'react-router-dom';
import BlogDetail from './components/BlogDetail';

const BlogDetailPage = () => {
  const { id } = useParams();
  return <BlogDetail blogId={id} />;
};

export default BlogDetailPage;
