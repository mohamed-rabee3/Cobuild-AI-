# Cobuild AI Backend

Backend API server for Cobuild AI - Teaching programming through AI-guided projects using Google Gemini 2.5 Flash.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy environment template
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Edit .env and add your Gemini API key
# Get API key from: https://aistudio.google.com/app/apikey
```

### 3. Run Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## 📚 API Endpoints

### Project Endpoints

1. **POST `/api/project/init`** - Generate project plan
   - Input: idea, language, level
   - Output: title, flowchart, tasks, solution code

2. **POST `/api/project/review`** - Socratic code review
   - Input: code, language, project context
   - Output: review comment, highlight line, severity

3. **POST `/api/project/chat`** - Programming help
   - Input: message, project context, chat history
   - Output: AI mentor response

### Challenges Endpoints

4. **POST `/api/challenges/generate`** - Generate coding challenges
   - Input: count, difficulty, language, existing titles
   - Output: array of challenges with test cases

## 🔧 Configuration

Environment variables (`.env`):

```bash
GOOGLE_API_KEY=your_key_here          # Required: Get from AI Studio
GEMINI_MODEL=gemini-2.5-flash         # Model to use
FRONTEND_URL=http://localhost:5173    # For CORS
MAX_RETRIES=3                         # Rate limit retries
```

## 🧪 Testing

Test an endpoint using curl:

```bash
curl -X POST http://localhost:8000/api/project/init \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Number guessing game",
    "language": "python",
    "level": "beginner"
  }'
```

Or use the interactive docs at http://localhost:8000/docs

## 🔒 Security

- Never commit `.env` file
- API key is loaded from environment variables
- CORS is configured for localhost frontend only

## 📝 Tech Stack

- FastAPI - Web framework
- Pydantic - Data validation
- google-genai - Gemini AI SDK
- Uvicorn - ASGI server

## 🐛 Troubleshooting

**API Key Error:**
- Verify `GOOGLE_API_KEY` is set in `.env`
- Get a new key from https://aistudio.google.com/app/apikey

**Rate Limit (429):**
- Free tier: 15 requests/minute
- Backend automatically retries with exponential backoff

**Import Errors:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

## 📖 More Info

See `Docs/Backend_Implementation_Plan.md` for complete technical details.
