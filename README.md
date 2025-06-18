# Excel Analytics Platform

A comprehensive MERN stack application for uploading, analyzing, and visualizing Excel data with interactive charts and insights.

## Features

### Core Functionality
- **Excel File Upload**: Support for .xlsx and .xls files up to 10MB
- **Multi-Sheet Support**: Analyze data from multiple Excel sheets
- **Interactive Charts**: Generate bar, line, pie, and scatter plot charts
- **Data Insights**: Automatic statistical analysis (mean, median, min, max, etc.)
- **Chart Export**: Download charts as PNG images
- **User Authentication**: Secure JWT-based authentication system
- **Dashboard**: Overview of uploaded files and analysis history
- **Admin Panel**: Complete admin functionality for user and file management

### Technical Features
- **Real-time Processing**: Live Excel file parsing and data extraction
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **State Management**: Redux Toolkit for efficient state management
- **File Management**: Secure file upload with validation
- **Data Visualization**: Chart.js integration for beautiful charts
- **RESTful API**: Well-structured backend API endpoints
- **Modern Frontend**: Built with Vite for fast development and builds

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **SheetJS (xlsx)** - Excel file parsing
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Chart.js** - Data visualization
- **React-Chartjs-2** - React wrapper for Chart.js
- **Tailwind CSS** - Styling
- **React Dropzone** - File upload UI
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file with the following variables:
   \`\`\`env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/excel-analytics
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   \`\`\`

4. Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup (Vite)
1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the Vite development server:
   \`\`\`bash
   npm run dev
   \`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Build for Production
To build the frontend for production:
\`\`\`bash
cd frontend
npm run build
\`\`\`

To preview the production build:
\`\`\`bash
npm run preview
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### File Management
- `POST /api/files/upload` - Upload Excel file
- `GET /api/files/my-files` - Get user's files
- `GET /api/files/:fileId` - Get specific file details
- `PUT /api/files/:fileId` - Update file metadata
- `DELETE /api/files/:fileId` - Delete file
- `GET /api/files/stats` - Get file statistics

### Analytics
- `POST /api/analytics/chart-data` - Generate chart data
- `GET /api/analytics/history` - Get analysis history
- `POST /api/analytics/insights` - Generate data insights
- `DELETE /api/analytics/:analysisId` - Delete analysis
- `GET /api/analytics/dashboard-stats` - Get dashboard statistics

### Admin (Admin Only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId/role` - Update user role
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/files` - Get all files
- `DELETE /api/admin/files/:fileId` - Delete any file
- `GET /api/admin/analyses` - Get all analyses
- `DELETE /api/admin/analyses/:analysisId` - Delete any analysis
- `GET /api/admin/stats` - Get system statistics

## Usage Guide

### 1. User Registration/Login
- Create an account or login with existing credentials
- JWT token is stored for authenticated requests

### 2. File Upload
- Navigate to the Upload page
- Drag and drop or click to select Excel files
- Files are automatically processed and parsed

### 3. Data Analysis
- Go to Analytics from the dashboard
- Select a file to analyze
- Choose sheet, chart type, and axes
- Generate interactive charts and insights

### 4. Chart Export
- Download generated charts as PNG images
- View statistical insights for numerical data

### 5. Admin Features
- User management (view, edit roles, delete)
- File management (view all files, delete)
- System statistics and monitoring

## Project Structure

\`\`\`
excel-analytics-platform/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── uploads/         # File upload directory
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store and slices
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # Entry point
│   ├── public/          # Static files
│   ├── index.html       # HTML template
│   └── vite.config.js   # Vite configuration
└── README.md
\`\`\`


