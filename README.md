# <img src="frontend/public/icon.svg" alt="Cobuild AI Logo" width="32" height="32"> Cobuild AI

<div align="center">

**An AI-powered educational platform for learning programming through interactive projects and challenges**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61dafb.svg)](https://reactjs.org/)

</div>

---

## 🎥 Demo

<div align="center">

<video src="Demo/demo.mp4" width="800" controls>
  Your browser does not support the video tag.
</video>

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**Cobuild AI** is an innovative educational platform designed to teach programming through AI-guided interactive projects. Built with Google Gemini 2.5 Flash, it provides a personalized learning experience where students can:

- **Build Real Projects**: Generate complete project plans with flowcharts, tasks, and solutions
- **Learn Through Challenges**: Solve daily coding challenges with automated testing
- **Get AI-Powered Feedback**: Receive Socratic code reviews that guide learning
- **Chat with AI Mentor**: Ask questions and get educational explanations
- **Code in Browser**: Full-featured IDE with syntax highlighting and code execution

The platform supports multiple programming languages (Python, JavaScript, C++) and adapts to different skill levels (beginner, intermediate, advanced).

---

## ✨ Features

### 🎓 Project-Based Learning
- **AI-Generated Projects**: Describe an idea and get a complete project plan
- **Interactive Flowcharts**: Visual project structure using Mermaid diagrams
- **Task Management**: Step-by-step task checklist to track progress
- **Hidden Solutions**: Learn by doing, with solutions available when needed

### 💻 Code Editor & Execution
- **Monaco Editor**: Professional code editor with syntax highlighting
- **Live Code Execution**: Run code directly in the browser using Piston API
- **Multi-Language Support**: Python, JavaScript, and C++

### 🤖 AI-Powered Features
- **Socratic Code Review**: Get guided feedback instead of direct answers
- **AI Mentor Chat**: Ask questions and receive educational explanations
- **Smart Project Generation**: Context-aware project creation based on skill level

### 🎯 Coding Challenges
- **Daily Challenges**: Generate and solve function-based coding problems
- **Automated Testing**: Test your solutions with provided test cases
- **Difficulty Levels**: Easy, medium, and hard challenges
- **Progress Tracking**: Monitor your challenge completion

### 🌐 User Experience
- **Arabic Language Support**: Full RTL support for Arabic interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Built with shadcn/ui and Tailwind CSS
- **Dark Mode**: Beautiful dark theme for comfortable coding

---

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.8+** - Core programming language
- **Google Gemini 2.5 Flash** - AI model for project generation and code review
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI server for running FastAPI

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Monaco Editor** - VS Code editor component
- **shadcn/ui** - High-quality React components
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and caching
- **Mermaid** - Diagram and flowchart generation

### Additional Services
- **Piston API** - Code execution engine
- **LocalStorage** - Client-side data persistence

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Google Gemini API Key** - [Get API Key](https://aistudio.google.com/app/apikey)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Cobuild-AI-.git
cd Cobuild-AI-
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
py -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

1. Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env  # If .env.example exists
# Or create .env manually
```

2. Add the following environment variables to `.env`:

```env
# Required: Google Gemini API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional: Configuration (defaults shown)
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:5173
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
MAX_RETRIES=3
REQUEST_TIMEOUT=30
RATE_LIMIT_PER_MINUTE=15
```

**Get your Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

### Frontend Configuration

The frontend is pre-configured to connect to `http://localhost:8000` by default. If you need to change the API URL, modify the API configuration in `frontend/src/services/api.ts`.

---

## 🎮 Usage

### Starting the Development Servers

#### Backend Server

```bash
# From backend directory with venv activated
cd backend
venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate  # macOS/Linux

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

#### Frontend Server

```bash
# From frontend directory
cd frontend
npm run dev
```

The frontend application will be available at:
- **Application**: http://localhost:5173

### Using the Application

1. **Onboarding**: When you first open the app, you'll be asked to set up your profile (name, skill level, preferred language)

2. **Create a Project**:
   - Click "مشروع جديد" (New Project) on the dashboard
   - Enter your project idea (e.g., "Number guessing game")
   - Select your programming language and skill level
   - The AI will generate a complete project plan with flowchart, tasks, and solution

3. **Work on Projects**:
   - Open a project from the dashboard
   - Follow the task checklist
   - Write code in the Monaco editor
   - Get code reviews by clicking "Review Code"
   - Chat with the AI mentor for help
   - Run your code to test it

4. **Solve Challenges**:
   - Navigate to "التحديات اليومية" (Daily Challenges)
   - Generate new challenges or solve existing ones
   - Write your solution and test it with provided test cases

---

## 📁 Project Structure

```
Cobuild-AI-/
│
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── config.py          # Configuration settings
│   │   ├── models/            # Pydantic models
│   │   │   ├── requests.py    # Request models
│   │   │   └── responses.py   # Response models
│   │   ├── routers/           # API route handlers
│   │   │   ├── project.py     # Project endpoints
│   │   │   └── challenges.py  # Challenge endpoints
│   │   ├── services/          # Business logic
│   │   │   └── gemini_service.py  # Gemini AI integration
│   │   └── prompts/           # AI prompt templates
│   │       ├── project_prompts.py
│   │       └── challenge_prompts.py
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                 # Alternative entry point
│   └── README.md              # Backend-specific docs
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ide/           # IDE components
│   │   │   ├── modals/        # Modal dialogs
│   │   │   └── ui/            # shadcn/ui components
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── ProjectIDENew.tsx
│   │   │   ├── Challenges.tsx
│   │   │   └── ChallengeRunner.tsx
│   │   ├── services/          # API services
│   │   │   ├── api.ts         # Base API client
│   │   │   ├── projectsApi.ts
│   │   │   ├── challengesApi.ts
│   │   │   └── piston.ts      # Code execution
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   ├── package.json           # Node.js dependencies
│   └── README.md             # Frontend-specific docs
│
├── .gitignore                 # Git ignore rules
├── LICENSE                    # Apache 2.0 License
└── README.md                  # This file
```

---

## 📚 API Documentation

### Project Endpoints

#### `POST /api/project/init`
Generate a complete project plan from an idea.

**Request Body:**
```json
{
  "idea": "Number guessing game",
  "language": "python",
  "level": "beginner"
}
```

**Response:**
```json
{
  "project_title": "لعبة تخمين الأرقام",
  "mermaid_chart": "flowchart TD\n    Start --> Input",
  "tasks": ["Task 1", "Task 2"],
  "full_solution_code": "# Complete solution code",
  "starter_filename": "game.py"
}
```

#### `POST /api/project/review`
Get Socratic code review feedback.

**Request Body:**
```json
{
  "code": "print('Hello')",
  "language": "python",
  "project_context": {
    "title": "My Project",
    "tasks": ["Task 1"],
    "current_task_index": 0
  }
}
```

**Response:**
```json
{
  "review_comment": "What happens if the user enters invalid input?",
  "highlight_line": 5,
  "severity": "warning"
}
```

#### `POST /api/project/chat`
Chat with the AI mentor.

**Request Body:**
```json
{
  "message": "How do I use loops in Python?",
  "language": "python",
  "project_title": "My Project",
  "history": [],
  "current_code": "print('Hello')"
}
```

### Challenge Endpoints

#### `POST /api/challenges/generate`
Generate coding challenges.

**Request Body:**
```json
{
  "count": 5,
  "difficulty": "easy",
  "language": "python",
  "existing_titles": []
}
```

**Response:**
```json
{
  "challenges": [
    {
      "title": "Sum Two Numbers",
      "difficulty": "easy",
      "language": "python",
      "description": "Write a function to sum two numbers",
      "function_signature": "def sum_two(a: int, b: int) -> int:",
      "test_cases": [
        {"input": "2, 3", "expected": "5", "hidden": false}
      ]
    }
  ]
}
```

### Interactive API Documentation

Once the backend server is running, visit **http://localhost:8000/docs** for interactive Swagger documentation where you can test all endpoints directly.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Add comments for complex logic
- Test your changes before submitting
- Update documentation as needed

---

## 📝 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** - For providing the AI capabilities
- **FastAPI** - For the excellent web framework
- **React Team** - For the amazing UI library
- **shadcn** - For the beautiful UI components
- **Piston API** - For code execution capabilities

---

## 📧 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/Cobuild-AI-/issues) page
2. Create a new issue with detailed information
3. Include error messages, steps to reproduce, and your environment details

---

## 🗺 Roadmap

Future enhancements planned:

- [ ] User authentication and cloud storage
- [ ] More programming languages support
- [ ] Collaborative coding features
- [ ] Progress analytics and achievements
- [ ] Mobile app version
- [ ] Integration with more AI models
- [ ] Community challenges and leaderboards

---

<div align="center">

**Made with ❤️ for learners and educators**

⭐ Star this repo if you find it helpful!

</div>

