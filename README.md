# 💬 WhatsApp Clone with Video Calls

<div align="center">
  <img src="https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN" alt="WhatsApp Clone Logo" width="120" height="120">
  
  <h3>A modern, feature-rich messaging application with real-time communication</h3>
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
  ![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
</div>

## 📋 Overview

This project is a comprehensive WhatsApp clone featuring real-time messaging, media sharing, and video calling capabilities. Built with modern web technologies including React.js, Node.js, MongoDB, Socket.io, and WebRTC, it delivers a seamless messaging experience similar to the popular WhatsApp application.

## ✨ Features

### 🔐 **Authentication & Security**
- User registration and secure authentication
- End-to-end encryption for secure messaging
- Protected routes and user sessions

### 💬 **Messaging**
- Real-time text messaging
- Individual and group chat support
- Message delivery and read receipts
- Chat filtering and search functionality

### 📎 **Media Sharing**
- Image sharing within chats
- Document sharing and download
- File upload with progress indicators

### 📹 **Video Calling**
- High-quality video calls using WebRTC
- Peer-to-peer connection technology
- Call notifications and management

### 🎨 **User Interface**
- Responsive design for all devices
- Modern and intuitive user interface
- Dark/Light theme support
- Real-time typing indicators

## 🎯 Demo

<div align="center">
  <img src="https://github.com/piyushyadav0191/Full-Stack-Whatsapp-Clone/assets/84402719/0dedda2e-6111-4c40-95a6-55ac67388629" alt="WhatsApp Clone Demo" width="800">
</div>

🚀 **[Live Demo](your-demo-link-here)** - Experience the application in action!
## ⚠️ Case Sensitivity Note

This project is deployed on **Vercel (Linux servers)**.  
Linux file system is **case-sensitive**, unlike Windows/Mac.  

👉 So make sure imports match the exact file/folder name:
- `import Chat from "../components/chat/Chat";` ✅
- `import Chat from "../components/Chat/Chat";` ❌ (will break on Vercel)

If you rename a file/folder only by changing its **case** (`Chat` → `chat`),  
Git might not detect it on Windows/Mac. To fix that:

```bash
# Force rename to update Git
git mv src/components/chat src/components/chat_temp
git commit -m "temp rename to force case change"

git mv src/components/chat_temp src/components/chat
git commit -m "fix: case sensitivity issue"

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern JavaScript library for building user interfaces
- **Redux Toolkit** - Efficient state management
- **Socket.io Client** - Real-time bidirectional event-based communication
- **WebRTC** - Peer-to-peer video calling technology

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Socket.io** - Real-time communication
- **JWT** - JSON Web Tokens for authentication

## 🚀 Getting Started

### Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher) and npm
- **MongoDB** (running instance)
- **WebRTC-compatible browsers** (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abdulahad-2/whatsapp-clone.git
   ```

2. **Navigate to project directory**
   ```bash
   cd whatsapp-clone
   ```

3. **Install and start backend server**
   ```bash
   cd backend
   yarn install
   yarn dev
   ```

4. **Install and start frontend application**
   ```bash
   cd frontend
   yarn install
   yarn start
   ```

5. **Configure environment variables**
   
   Create `.env` files in both frontend and backend directories using the provided `.env.example` templates.

   **Backend `.env` example:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
   JWT_SECRET=your-jwt-secret
   PORT=5000
   ```

   **Frontend `.env` example:**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

### Usage

1. Open your browser and visit `http://localhost:3000`
2. Register a new account or log in with existing credentials
3. Start messaging, sharing media, and making video calls!

## 📁 Project Structure


## 👨‍💻 Author

**Abdul Ahad** - Full-Stack Developer

Passionate about crafting digital experiences and turning ideas into reality. Specialized in building scalable web applications and cutting-edge e-commerce solutions.

### 🔗 Connect with me:

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://ahad-dev.vercel.app/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/abdul-ahad-7908a82b4)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/abdulahad-2)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:abdul.ahadt732@gmail.com)

### 📞 Contact Information:
- **Email:** abdul.ahadt732@gmail.com
- **Phone:** +923259684493
- **Location:** Pakistan

---

<div align="center">
  <p>⭐ Star this repository if you found it helpful!</p>
  <p>🐛 Found a bug? Please create an issue</p>
  <p>💡 Have suggestions? I'd love to hear them!</p>
</div>
