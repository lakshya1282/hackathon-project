# DevNovate Blog Platform 🚀

![DevNovate Banner](https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=DevNovate+Blog+Platform)

**DevNovate** is a modern, full-stack blog platform designed for developers and tech enthusiasts. Built with the MERN stack, it features a beautiful glass-morphism UI, real-time interactions, and comprehensive content management capabilities.

## 🎯 Project Overview

DevNovate was developed as part of the **VIBE HACK 2025** hackathon by a team of Computer Science students from **Bhilai Institute of Technology, Durg**. Our platform aims to create a vibrant community where developers can share knowledge, insights, and engage in meaningful discussions.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Secure user registration and login** with JWT authentication
- **Role-based access control** (User, Admin)
- **Protected routes** for authenticated users
- **Password encryption** using bcrypt

### 📝 Blog Management
- **Rich blog creation** with markdown support
- **Category-based organization** (Technology, Programming, Web Development, AI/ML, etc.)
- **Tag system** for better content discovery
- **Featured images** for visual appeal
- **Draft, Pending, Approved workflow** with admin moderation
- **Real-time blog search** and filtering

### 🎨 Modern User Interface
- **Glass-morphism design** with beautiful visual effects
- **Responsive layout** for all device sizes
- **Smooth animations** powered by Framer Motion
- **Dark/Light theme support** (coming soon)
- **Accessibility-focused** components

### 👥 Social Features
- **Real-time likes** with instant feedback
- **Comment system** with threaded discussions
- **User profiles** with blog management
- **Trending blogs** based on engagement
- **View tracking** for analytics

### 🛡️ Admin Dashboard
- **Content moderation** tools
- **User management** capabilities
- **Analytics and statistics**
- **Bulk actions** for efficient management

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - Modern React with latest features
- **Framer Motion 12.23** - Smooth animations and transitions
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 4.21.2** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose 7.8.7** - Elegant MongoDB object modeling
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing and security

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Nodemon** - Development auto-reload
- **PostCSS & Autoprefixer** - CSS processing

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-team/devnovate-blog-platform.git
   cd devnovate-blog-platform
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/devnovate-blog
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   PORT=5001
   NODE_ENV=development
   ```

5. **Database Setup**
   ```bash
   # Start MongoDB service
   # Windows: Start MongoDB service from Services
   # macOS: brew services start mongodb/brew/mongodb-community
   # Linux: sudo systemctl start mongod
   
   # Seed database with sample data
   cd backend
   npm run seed
   ```

6. **Start Development Servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

7. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`

## 📁 Project Structure

```
devnovate-blog-platform/
├── 📁 backend/                 # Express.js backend
│   ├── 📁 middleware/          # Authentication & validation middleware
│   ├── 📁 models/              # MongoDB schemas (User, Blog)
│   ├── 📁 routes/              # API route handlers
│   ├── 📁 scripts/             # Database seeding scripts
│   ├── 📄 server.js            # Main server file
│   └── 📄 package.json         # Backend dependencies
├── 📁 frontend/                # React.js frontend
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/                 # React components and logic
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📄 App.js           # Main application component
│   │   └── 📄 index.js         # Application entry point
│   └── 📄 package.json         # Frontend dependencies
├── 📄 README.md                # Project documentation
├── 📄 LICENSE                  # Copyright license
└── 📄 .gitignore              # Git ignore patterns
```

## 🎮 Usage Guide

### For Users
1. **Registration**: Create an account with username, email, and password
2. **Writing Blogs**: Use the intuitive editor with category and tag support
3. **Engagement**: Like, comment, and share interesting content
4. **Discovery**: Search blogs or browse by trending/categories

### For Admins
1. **Content Moderation**: Review and approve/reject submitted blogs
2. **User Management**: Monitor user activity and engagement
3. **Analytics**: View platform statistics and trends
4. **Quality Control**: Ensure high-quality content standards

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Blogs
- `GET /api/blogs` - Get blogs with pagination/search
- `GET /api/blogs/trending` - Get trending blogs
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `POST /api/blogs/:id/like` - Toggle like
- `POST /api/blogs/:id/comment` - Add comment

### Admin
- `GET /api/admin/dashboard` - Admin statistics
- `GET /api/admin/blogs` - Get all blogs for moderation
- `PUT /api/admin/blogs/:id/approve` - Approve blog
- `PUT /api/admin/blogs/:id/reject` - Reject blog

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

### Environment Variables (Production)
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
PORT=5000
```

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Development Roadmap

- [ ] **Mobile App** (React Native)
- [ ] **Real-time notifications** (Socket.io)
- [ ] **Advanced text editor** (Rich text/Markdown)
- [ ] **Image upload** functionality
- [ ] **Social media integration**
- [ ] **Email notifications**
- [ ] **Advanced analytics**
- [ ] **Multi-language support**

## 🐛 Known Issues

- Image upload feature is planned for future releases
- Real-time notifications are in development
- Advanced text formatting needs improvement

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-team/devnovate-blog-platform/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🏆 Team Credits

This project was developed by Computer Science students from **Bhilai Institute of Technology, Durg** for **VIBE HACK 2025**:

- **Student 1** - Full-stack development, UI/UX design
- **Student 2** - Backend architecture, database design
- **Student 3** - Frontend development, animations
- **Student 4** - API integration, testing

## 📜 License

This project is licensed under the MIT License with additional academic use provisions. See the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- **Bhilai Institute of Technology, Durg** for academic support
- **VIBE HACK 2025** for the opportunity to showcase our skills
- **Open Source Community** for the amazing tools and libraries
- **MongoDB University** for database design insights
- **React Community** for frontend development resources

---

<div align="center">
  <p><strong>Made with ❤️ by BIT Durg Students</strong></p>
  <p>
    <a href="#devnovate-blog-platform-">🔝 Back to Top</a>
  </p>
</div>
