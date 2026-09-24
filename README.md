# Collaborative Project Management Tool

This is a full-stack, real-time project management application built as a clone of tools like Trello and Asana. It allows users to create group projects, manage tasks with a Kanban-style drag-and-drop board, assign tasks, and communicate in real-time.

## Features
- **User Authentication**: Secure login and registration using JWT and bcrypt.
- **Project Hub**: Create group projects and invite team members via email.
- **Interactive Kanban Boards**: Create lists and seamlessly drag-and-drop task cards.
- **Real-time Collaboration**: Built with WebSockets (Socket.io). When a team member moves a card, adds a comment, or updates an assignee, the changes are instantly reflected on all clients.
- **Task Management**: Assign tasks to specific members and participate in live comment threads.
- **Notifications**: Toast notifications alert you when other members comment on tasks.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Zustand (State Management), React-Hot-Toast, @hello-pangea/dnd (Drag and drop).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Real-time**: Socket.io.

## Prerequisites
- Node.js installed on your machine.
- MongoDB running locally on port 27017.

## Installation & Setup

1. **Extract the Repository**
2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The backend server will run on http://localhost:5000*

3. **Frontend Setup**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend application will run on http://localhost:5173*

## Usage
1. Open `http://localhost:5173` in your browser.
2. Register a new account.
3. Create a project and start adding lists and tasks.
4. To test real-time features, open an incognito window, register a second user, invite them to your project, and drag cards around!
