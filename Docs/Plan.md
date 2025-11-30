# 📘 Cobuild AI – Complete Master Specification v5.0 (Final - English)

---

## 1. Executive Overview

**Cobuild AI** is an intelligent platform for teaching programming through console-based applications.

**Core Philosophy:**
1. **Socratic Mentorship:** AI guides through questions, not direct answers
2. **Safe Execution:** Code runs via Piston API (Frontend → Piston direct)
3. **Learning by Building:** Complete projects from single files
4. **Practice Through Challenges:** Function-based coding problems (no interactive input)

---

## 2. Technology Stack

### Frontend (Client-Side)
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** 
  - Tailwind CSS (Zinc-950 Dark Theme)
  - ShadCN UI Components
  - Lucide React Icons
- **State Management:** Zustand + LocalStorage Persistence
- **Code Editor:** @monaco-editor/react
  - Languages: Python, JavaScript, C++ syntax
  - NO auto-complete features
- **Visualization:** 
  - Mermaid.js (Flowcharts)
  - React-Markdown (Chat messages)
- **HTTP Client:** Axios

### Backend (Server-Side)
- **Framework:** FastAPI (Python 3.10+)
- **AI Engine:** Google Gemini 2.5 Pro
  - SDK: `google-generativeai`
- **Data Validation:** Pydantic v2 (Strict JSON enforcement)
- **CORS:** Enabled for localhost development

### External Services
- **Code Execution:** Piston API
  - Endpoint: `https://emkc.org/api/v2/piston/execute`
  - Called directly from Frontend
  - No authentication required

---

## 3. LocalStorage Schema (Detailed)

### Storage Keys:
- `cobuild_profile` → User profile data
- `cobuild_projects` → Array of projects
- `cobuild_challenges` → Generated challenges data

### Data Structures:

#### 3.1 Profile Object
```typescript
interface Profile {
  name: string;                    // "Ahmed"
  level: "beginner" | "intermediate" | "advanced";
  language: "python" | "javascript" | "cpp";
  createdAt: number;               // Unix timestamp
}

// Storage key: "cobuild_profile"
```

**Example:**
```json
{
  "name": "Ahmed",
  "level": "beginner",
  "language": "python",
  "createdAt": 1716825600000
}
```

---

#### 3.2 Projects Array
```typescript
interface Task {
  id: string;                      // "task-1"
  text: string;                    // "Import random module"
  completed: boolean;              // false
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;                 // Message text (supports Markdown)
  timestamp: number;               // Unix timestamp
}

interface Project {
  id: string;                      // UUID v4
  title: string;                   // "Number Guessing Game"
  language: "python" | "javascript" | "cpp";
  filename: string;                // "game.py"
  code: string;                    // Current user code (auto-saved)
  mermaidChart: string;            // Mermaid syntax (no backticks)
  tasks: Task[];                   // 6-8 tasks
  hiddenSolution: string;          // Complete working code (hidden)
  chatHistory: ChatMessage[];      // Last 50 messages max
  lastModified: number;            // Unix timestamp
  createdAt: number;               // Unix timestamp
}

// Storage key: "cobuild_projects"
```

**Example:**
```json
[
  {
    "id": "proj-123e4567-e89b",
    "title": "Number Guessing Game",
    "language": "python",
    "filename": "game.py",
    "code": "import random\n\ndef main():\n    pass",
    "mermaidChart": "graph TD\n    A[Start] --> B[Generate Number]",
    "tasks": [
      {
        "id": "task-1",
        "text": "Import random module",
        "completed": true
      },
      {
        "id": "task-2",
        "text": "Create main() function",
        "completed": false
      }
    ],
    "hiddenSolution": "import random\n\ndef main():\n    # Full solution...",
    "chatHistory": [
      {
        "role": "assistant",
        "content": "Welcome! Let's start building.",
        "timestamp": 1716825700000
      }
    ],
    "lastModified": 1716827400000,
    "createdAt": 1716825600000
  }
]
```

---

#### 3.3 Challenges Object
```typescript
interface TestCase {
  input: string;                   // "is_palindrome('racecar')"
  expected: string;                // "True"
  hidden: boolean;                 // true = not shown to user
}

interface Challenge {
  id: string;                      // "chal-uuid"
  title: string;                   // "Check Palindrome"
  difficulty: "easy" | "medium" | "hard";
  language: "python" | "javascript" | "cpp";
  description: string;             // Full problem statement (Markdown)
  functionSignature: string;       // "def is_palindrome(s):"
  testCases: TestCase[];           // 5-8 test cases
  solved: boolean;                 // User completion status
  userCode: string;                // Last attempted solution
  createdAt: number;
}

interface ChallengesData {
  challenges: Challenge[];         // All generated challenges
  completedIds: string[];          // ["chal-1", "chal-3"]
}

// Storage key: "cobuild_challenges"
```

**Example:**
```json
{
  "challenges": [
    {
      "id": "chal-a1b2c3",
      "title": "Sum Two Numbers",
      "difficulty": "easy",
      "language": "python",
      "description": "Write a function that takes two integers and returns their sum.\n\n**Examples:**\n- `sum_two(2, 3)` → `5`\n- `sum_two(-1, 1)` → `0`",
      "functionSignature": "def sum_two(a, b):",
      "testCases": [
        {
          "input": "sum_two(2, 3)",
          "expected": "5",
          "hidden": false
        },
        {
          "input": "sum_two(-10, 10)",
          "expected": "0",
          "hidden": true
        }
      ],
      "solved": false,
      "userCode": "",
      "createdAt": 1716825600000
    }
  ],
  "completedIds": []
}
```

---

## 4. User Interface Specification (Exhaustive)

---

### 4.1 Page: Onboarding (`/`)

**Purpose:** Collect user profile and initialize localStorage

**Route:** `/`

**Layout:**
```
┌────────────────────────────────────────────────────┐
│                                                    │
│              🎯 Welcome to Cobuild AI              │
│         Learn Programming by Building Projects     │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ What's your name?                            │ │
│  │ ┌──────────────────────────────────────────┐ │ │
│  │ │ [Enter your name...]                     │ │ │
│  │ └──────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Select your experience level:                │ │
│  │                                              │ │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐     │ │
│  │ │ Beginner │ │Intermediate│ Advanced │     │ │
│  │ │    🌱    │ │     🌿     │    🌳    │     │ │
│  │ │          │ │            │          │     │ │
│  │ │ Start    │ │ Some       │ Expert   │     │ │
│  │ │ coding   │ │ experience │ level    │     │ │
│  │ └──────────┘ └──────────┘ └──────────┘     │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Choose your primary language:                │ │
│  │                                              │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │ │
│  │  │ Python  │  │JavaScript│  │   C++   │     │ │
│  │  │   🐍    │  │    ⚡    │  │   ⚙️    │     │ │
│  │  └─────────┘  └─────────┘  └─────────┘     │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│            ┌──────────────────────┐               │
│            │  Start Learning  →   │               │
│            └──────────────────────┘               │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### Components Breakdown:

**1. Header Section:**
- Logo icon: 🎯 (centered)
- Title: "Welcome to Cobuild AI" (text-3xl, font-bold)
- Subtitle: "Learn Programming by Building Projects" (text-muted-foreground)

**2. Name Input Field:**
- Component: ShadCN `<Input>`
- Placeholder: "Enter your name..."
- Validation:
  - Required: Yes
  - Min length: 2 characters
  - Max length: 30 characters
  - Pattern: Letters and spaces only
- Error message: "Please enter a valid name (2-30 characters)"
- Display: Shown below input in red text

**3. Level Selection Cards:**
- Layout: 3 cards in horizontal flexbox (responsive: stack on mobile)
- Card dimensions: 160px × 180px
- States:
  - **Inactive:** `border-gray-700`, `bg-gray-900`
  - **Active:** `border-accent`, `bg-accent/10`, scale-105 animation
- Default: "Beginner" pre-selected

**Card Structure:**
```typescript
{
  id: "beginner" | "intermediate" | "advanced",
  icon: "🌱" | "🌿" | "🌳",
  title: string,
  description: string
}
```

**4. Language Chips:**
- Layout: 3 chips in horizontal flexbox
- Chip dimensions: 120px × 100px
- States:
  - **Inactive:** `border-gray-700`, `bg-gray-900`
  - **Active:** `bg-accent`, `text-white`
- Default: "Python" pre-selected
- Icons: 🐍 (Python), ⚡ (JavaScript), ⚙️ (C++)

**5. Start Button:**
- Component: ShadCN `<Button>` (size="lg")
- Text: "Start Learning →"
- Width: 300px (centered)
- States:
  - **Disabled:** All fields not filled
  - **Loading:** Spinner + "Setting up..."
  - **Enabled:** Gradient background animation

**Behavior Flow:**
1. User fills name → Validate immediately (debounced 500ms)
2. User selects level → Card gets active state
3. User selects language → Chip gets active state
4. Button becomes enabled when all valid
5. On click:
   - Show loading state
   - Create profile object
   - Save to `localStorage.setItem('cobuild_profile', JSON.stringify(profile))`
   - Initialize empty arrays: `cobuild_projects: []`, `cobuild_challenges: {challenges: [], completedIds: []}`
   - Navigate to `/dashboard`

**Error Handling:**
- If localStorage fails (QuotaExceededError):
  - Show toast: "⚠️ Storage not available. Please enable cookies."
  - Disable button

---

### 4.2 Page: Dashboard (`/dashboard`)

**Purpose:** Main navigation hub for all activities

**Route:** `/dashboard`

**Guards:**
- Check `cobuild_profile` exists in localStorage
- If not → Redirect to `/`

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ 🎯 Cobuild AI           [Ahmed M.] [@]           [☰ Menu] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───────────────────────┐  ┌───────────────────────┐    │
│  │                       │  │                       │    │
│  │   ⚔️                  │  │   🚀                  │    │
│  │                       │  │                       │    │
│  │  Daily Challenges     │  │  Start New Project    │    │
│  │                       │  │                       │    │
│  │  Solve coding         │  │  Build something      │    │
│  │  problems to          │  │  amazing from         │    │
│  │  sharpen your skills  │  │  scratch              │    │
│  │                       │  │                       │    │
│  │  ┌─────────────────┐ │  │  ┌─────────────────┐ │    │
│  │  │  Start Practice │ │  │  │  Create Project │ │    │
│  │  └─────────────────┘ │  │  └─────────────────┘ │    │
│  └───────────────────────┘  └───────────────────────┘    │
│                                                            │
│  📂 Recent Projects                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🐍 Number Guessing Game                            │  │
│  │    Python • 2 hours ago                     [→]    │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ⚡ Todo List Manager                               │  │
│  │    JavaScript • Yesterday                   [→]    │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ⚙️ Calculator                                      │  │
│  │    C++ • 3 days ago                         [→]    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  [View All Projects →]                                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### Components Breakdown:

**1. Header Navigation:**
- **Left:** Logo "🎯 Cobuild AI" (clickable → reload dashboard)
- **Right:**
  - User name display: "[Ahmed M.]" (first name + last initial)
  - Avatar: Circular with first letter of name
  - Menu icon: "☰" → Opens sidebar (future: settings, logout)

**2. Hero Cards Section:**

**Card A: Daily Challenges**
- Dimensions: 400px × 280px
- Icon: ⚔️ (size: 48px)
- Title: "Daily Challenges" (text-2xl, font-bold)
- Description: "Solve coding problems to sharpen your skills"
- Button: "Start Practice →" 
  - Action: Navigate to `/challenges`
  - Style: Primary button

**Card B: New Project**
- Dimensions: 400px × 280px
- Icon: 🚀 (size: 48px)
- Title: "Start New Project" (text-2xl, font-bold)
- Description: "Build something amazing from scratch"
- Button: "Create Project →"
  - Action: Open **New Project Modal**
  - Style: Accent button with gradient

**Responsive Behavior:**
- Desktop (≥1024px): 2 cards side-by-side
- Tablet (768-1023px): 2 cards side-by-side (smaller)
- Mobile (<768px): Cards stack vertically

**3. Recent Projects List:**
- **Header:** "📂 Recent Projects" (text-xl, font-semibold)
- **Display:** Last 5 projects from `cobuild_projects` (sorted by `lastModified` DESC)
- **Empty State:** 
  ```
  ┌────────────────────────────────────┐
  │  📭 No projects yet                │
  │  Click "Create Project" to start!  │
  └────────────────────────────────────┘
  ```

**Project List Item Structure:**
```
┌────────────────────────────────────────────────────┐
│ [Icon] Project Title                               │
│        Language • Relative Time              [→]   │
└────────────────────────────────────────────────────┘
```

**Fields:**
- **Icon:** Based on language (🐍 Python, ⚡ JS, ⚙️ C++)
- **Title:** `project.title` (truncate at 40 chars)
- **Language:** `project.language` (capitalize)
- **Relative Time:** Use library (e.g., `date-fns`)
  - "2 minutes ago"
  - "3 hours ago"
  - "Yesterday"
  - "3 days ago"
- **Arrow Button:** "→" (navigate to `/project/:id`)

**Hover Effect:** Scale 1.02 + shadow increase

**4. View All Button:**
- Text: "View All Projects →"
- Action: Navigate to `/projects` (full project list page)
- Style: Ghost button
- Display: Only if more than 5 projects exist

---

### 4.3 Modal: New Project

**Trigger:** "Create Project →" button on Dashboard

**Type:** Dialog overlay (centered, 600px width)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ✨ Start a New Project                   [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  What do you want to build?                    │
│  ┌───────────────────────────────────────────┐ │
│  │ Describe your project idea...            │ │
│  │                                           │ │
│  │ Examples:                                 │ │
│  │ • Number guessing game                    │ │
│  │ • Simple calculator                       │ │
│  │ • Todo list manager                       │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Programming Language                          │
│  ┌───────────────────────────────────────────┐ │
│  │ Python                              ▼    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────┐  ┌──────────────────┐  │
│  │     Cancel        │  │  Generate Plan → │  │
│  └───────────────────┘  └──────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Form Fields:

**1. Project Idea Input:**
- Component: ShadCN `<Textarea>` (3 rows)
- Placeholder: "Describe your project idea..."
- Helper text: Shows 3 example ideas
- Validation:
  - Required: Yes
  - Min length: 10 characters
  - Max length: 200 characters
- Character counter: "45/200" (shown bottom-right)
- Error: "Please describe your idea (10-200 characters)"

**2. Language Dropdown:**
- Component: ShadCN `<Select>`
- Options:
  - Python 🐍
  - JavaScript ⚡
  - C++ ⚙️
- Default: User's preferred language (from profile)
- No validation needed (always has value)

**3. Action Buttons:**

**Cancel Button:**
- Style: Ghost/Outline
- Action: Close modal without saving

**Generate Plan Button:**
- Style: Primary with gradient
- Text: "Generate Plan →"
- States:
  - **Disabled:** Invalid idea input
  - **Loading:** Spinner + "Generating..."
  - **Enabled:** Ready to submit

**Behavior Flow:**
1. User types idea → Validate in real-time
2. User selects language (optional, defaults to profile)
3. On "Generate Plan" click:
   - Show loading overlay on entire modal
   - Call `POST /api/project/init` with payload:
     ```json
     {
       "idea": "Number guessing game",
       "language": "python",
       "level": "beginner"
     }
     ```
   - On success:
     - Create new project object
     - Generate UUID for project
     - Save to `cobuild_projects` array in localStorage
     - Close modal
     - Navigate to `/project/:newProjectId`
   - On error (see Error Handling section):
     - Show error toast
     - Keep modal open
     - Allow retry

---

### 4.4 Page: Challenges (`/challenges`)

**Purpose:** Browse and solve function-based coding problems

**Route:** `/challenges`

**IMPORTANT:** All challenges are UNLOCKED. There is NO locked state.

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ ⚔️ Daily Challenges                         [← Dashboard]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  [+ Generate New Challenges]                       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Filters: [All] [Easy] [Medium] [Hard]                  │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ 🟢 Easy    │ │ 🟡 Medium  │ │ 🟢 Easy    │          │
│  │            │ │            │ │            │          │
│  │ Sum Two    │ │ Palindrome │ │ Find Max   │          │
│  │ Numbers    │ │ Checker    │ │ in Array   │          │
│  │            │ │            │ │            │          │
│  │ Python     │ │ JavaScript │ │ Python     │          │
│  │            │ │            │ │            │          │
│  │ ✅ Solved  │ │ [Solve →]  │ │ [Solve →]  │          │
│  └────────────┘ └────────────┘ └────────────┘          │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ 🔴 Hard    │ │ 🟡 Medium  │ │ 🔴 Hard    │          │
│  │            │ │            │ │            │          │
│  │ Fibonacci  │ │ Binary     │ │ Prime      │          │
│  │ Sequence   │ │ Search     │ │ Numbers    │          │
│  │            │ │            │ │            │          │
│  │ C++        │ │ Python     │ │ JavaScript │          │
│  │            │ │            │ │            │          │
│  │ [Solve →]  │ │ ✅ Solved  │ │ [Solve →]  │          │
│  └────────────┘ └────────────┘ └────────────┘          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### Components Breakdown:

**1. Header:**
- Title: "⚔️ Daily Challenges" (text-2xl)
- Back Button: "[← Dashboard]" (top-right, navigate to `/dashboard`)

**2. Generate Challenges Button:**
- Position: Top of page (full-width banner)
- Style: Accent button with "+" icon
- Text: "[+ Generate New Challenges]"
- Action: Open **Generate Challenges Modal**

**3. Filter Tabs:**
- Layout: Horizontal tabs (ShadCN `<Tabs>`)
- Options: "All", "Easy", "Medium", "Hard"
- Default: "All" selected
- Behavior: Filter displayed challenges by difficulty

**4. Challenges Grid:**
- Layout: 3 columns (responsive: 2 cols tablet, 1 col mobile)
- Gap: 24px between cards
- Source: `cobuild_challenges.challenges` from localStorage
- Sorting: Most recent first (by `createdAt`)

**Challenge Card Structure:**
```
┌──────────────────┐
│ 🟢 Difficulty    │  ← Badge (top-right)
│                  │
│ Challenge Title  │  ← Bold text
│                  │
│ Language Icon    │  ← 🐍/⚡/⚙️
│                  │
│ [Action Button]  │  ← "Solve →" OR "✅ Solved"
└──────────────────┘
```

**Card Fields:**
- **Difficulty Badge:**
  - Easy: 🟢 Green
  - Medium: 🟡 Yellow
  - Hard: 🔴 Red
- **Title:** `challenge.title` (text-lg, font-semibold)
- **Language:** Icon only (🐍/⚡/⚙️)
- **Action Button:**
  - If `challenge.solved === false`: "Solve →" (Primary button)
  - If `challenge.solved === true`: "✅ Solved" (Success button, disabled)

**Card Interactions:**
- Hover: Shadow increase + scale 1.03
- Click "Solve →": Open **Challenge Runner Modal** with challenge data

**Empty State:**
```
┌─────────────────────────────────────┐
│  📭 No challenges yet               │
│                                     │
│  Click "Generate New Challenges"    │
│  to create your first problems!     │
│                                     │
│  [+ Generate Challenges]            │
└─────────────────────────────────────┘
```

---

### 4.5 Modal: Generate Challenges

**Trigger:** "[+ Generate New Challenges]" button on `/challenges`

**Type:** Dialog overlay (centered, 500px width)

**Layout:**
```
┌───────────────────────────────────────────────────┐
│  ✨ Generate New Challenges                 [X]  │
├───────────────────────────────────────────────────┤
│                                                   │
│  How many challenges?                            │
│  ┌─────────────────────────────────────────────┐ │
│  │  1  ○────●────○────○────○  5                │ │
│  │               3                              │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Difficulty Level                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Easy   │ │ Medium  │ │  Hard   │           │
│  │   🟢    │ │   🟡    │ │   🔴    │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│  (Selected: Medium)                              │
│                                                   │
│  Programming Language                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Python  │ │JavaScript│ │   C++    │        │
│  │    🐍    │ │    ⚡     │ │   ⚙️     │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│  (Selected: Python)                              │
│                                                   │
│  ┌──────────────────┐  ┌───────────────────┐   │
│  │     Cancel       │  │  Generate (3) →   │   │
│  └──────────────────┘  └───────────────────┘   │
│                                                   │
└───────────────────────────────────────────────────┘
```

#### Form Fields:

**1. Challenge Count Slider:**
- Component: ShadCN `<Slider>`
- Range: 1 to 5
- Default: 3
- Display: Show current value below slider
- Marks: Show dots at 1, 2, 3, 4, 5

**2. Difficulty Selection:**
- Layout: 3 toggle buttons (single-select)
- Options:
  - Easy 🟢
  - Medium 🟡
  - Hard 🔴
- Default: Medium selected
- States:
  - **Inactive:** `border-gray-700`, `bg-gray-900`
  - **Active:** `border-accent`, `bg-accent/10`

**3. Language Selection:**
- Layout: 3 toggle buttons (single-select)
- Options:
  - Python 🐍
  - JavaScript ⚡
  - C++ ⚙️
- Default: User's preferred language (from profile)
- States: Same as difficulty buttons

**4. Action Buttons:**

**Cancel Button:**
- Style: Outline
- Action: Close modal

**Generate Button:**
- Style: Primary with gradient
- Text: "Generate (N) →" (where N = slider value)
- Dynamic text updates with slider
- States:
  - **Loading:** Spinner + "Generating..."
  - **Enabled:** Always (no validation needed)

**Behavior Flow:**
1. User adjusts slider → Button text updates: "Generate (4) →"
2. User selects difficulty → Button state updates
3. User selects language → Button state updates
4. On "Generate" click:
   - Show loading overlay
   - Collect existing challenge titles:
     ```typescript
     const existingTitles = cobuild_challenges.challenges.map(c => c.title);
     ```
   - Call `POST /api/challenges/generate` with payload:
     ```json
     {
       "count": 3,
       "difficulty": "medium",
       "language": "python",
       "existing_titles": ["Sum Two Numbers", "Palindrome Checker"]
     }
     ```
   - On success:
     - Append new challenges to `cobuild_challenges.challenges`
     - Save to localStorage
     - Close modal
     - Show success toast: "✅ Generated 3 new challenges!"
     - Scroll to top of challenges list
   - On error:
     - Show error toast (see Error Handling)
     - Keep modal open for retry

---

### 4.6 Modal: Challenge Runner (Fullscreen)

**Trigger:** Click "Solve →" on any challenge card

**Type:** Fullscreen overlay (covers entire viewport)

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  Palindrome Checker                    [Hint] [Give Up] [X]   │
├──────────────────┬─────────────────────────────────────────────┤
│                  │                                             │
│  📝 Description  │  💻 Your Solution                           │
│                  │  ┌────────────────────────────────────────┐│
│  Write a function│  │ def is_palindrome(s):                  ││
│  that checks if a│  │     # Write your code here             ││
│  string is a     │  │                                         ││
│  palindrome.     │  │                                         ││
│                  │  └────────────────────────────────────────┘│
│  A palindrome is │                                             │
│  a word that     │  ┌────────────────────────────────────────┐│
│  reads the same  │  │ [▶ Test Solution]                      ││
│  backwards.      │  └────────────────────────────────────────┘│
│                  │                                             │
│  **Examples:**   │  📊 Test Results                            │
│  • "racecar" → ✅│  ┌────────────────────────────────────────┐│
│  • "hello" → ❌  │  │ Running tests...                       ││
│                  │  │                                         ││
│  **Function:**   │  │ ✅ Test 1: is_palindrome("racecar")    ││
│  `is_palindrome  │  │    Expected: True, Got: True           ││
│  (s: str) -> bool│  │                                         ││
│                  │  │ ❌ Test 2: is_palindrome("python")     ││
│                  │  │    Expected: False, Got: None          ││
│                  │  │                                         ││
│  (Scrollable)    │  │ Score: 1/5 tests passed (20%)          ││
│                  │  └────────────────────────────────────────┘│
│                  │                                             │
└──────────────────┴─────────────────────────────────────────────┘
```

#### Layout Structure:

**Split View: 40% | 60%**

**Left Panel (40%): Problem Description**
- **Header:** Challenge title (text-2xl, font-bold)
- **Content:** Markdown-rendered description
  - Problem statement
  - Examples with emoji indicators (✅/❌)
  - Function signature (code block)
  - Constraints (if any)
- **Scrollable:** Yes

**Right Panel (60%): Solution Editor**

**Top Section: Code Editor**
- Component: Monaco Editor
- Language: Challenge's language (python/javascript/cpp)
- Initial code:
  - Python: `def function_name(params):\n    # Write your code here\n    pass`
  - JavaScript: `function functionName(params) {\n    // Write your code here\n}`
  - C++: Function signature with empty body
- Auto-save: Every 2 seconds to `challenge.userCode` in localStorage

**Middle Section: Test Button**
- Button: "[▶ Test Solution]"
- Style: Full-width, primary
- Action: Run tests against challenge.testCases

**Bottom Section: Test Results Panel**
- Display area (300px height, scrollable)
- States:
  - **Idle:** "Click 'Test Solution' to check your code"
  - **Running:** Spinner + "Running tests..."
  - **Complete:** Show results (see below)

**Test Results Format:**
```
┌────────────────────────────────────────┐
│ ✅ Test 1: is_palindrome("racecar")   │
│    Expected: True                      │
│    Your output: True                   │
│                                        │
│ ❌ Test 2: is_palindrome("hello")     │
│    Expected: False                     │
│    Your output: None                   │
│    Error: Function returned None       │
│                                        │
│ ✅ Test 3: is_palindrome("A man...")  │
│    Expected: True                      │
│    Your output: True                   │
│                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Score: 2/3 visible tests passed (67%)  │
│ Hidden tests: 2/2 passed ✅            │
│                                        │
│ 🎉 All tests passed! Challenge solved!│
└────────────────────────────────────────┘
```

**Top Bar Buttons:**

**1. [Hint] Button:**
- Action: Show AI-generated hint
- API call: `POST /api/challenges/hint` with challenge.id
- Display: Modal with hint text

**2. [Give Up] Button:**
- Action: Show solution (marks challenge as unsolved)
- Confirm dialog: "Are you sure? This won't mark as solved."
- Display: Modal with complete solution code

**3. [X] Close Button:**
- Action: Close modal, return to `/challenges`
- Auto-save user code before closing

**Testing Logic:**
1. User clicks "Test Solution"
2. Extract user's function code
3. For each test case:
   - Create wrapper code:
     ```python
     # User's function
     def is_palindrome(s):
         return s == s[::-1]
     
     # Test execution
     result = is_palindrome("racecar")
     print(result)
     ```
   - Call Piston with wrapper code
   - Compare `stdout` with `test_case.expected`
4. Calculate score: `passed / total`
5. If `passed === total`:
   - Mark `challenge.solved = true`
   - Update localStorage
   - Show confetti animation 🎉
   - Enable "Continue" button

---

### 4.7 Page: Project IDE (`/project/:id`)

**Purpose:** Main development environment for building projects

**Route:** `/project/:id`

**Guards:**
- Check project exists in `cobuild_projects`
- If not → Redirect to `/dashboard`

**Layout Overview:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎯 Cobuild AI • Number Guessing Game                  [Save] [← Dashboard] │
├────────────┬───────────────────────────────────┬──────────────────────────────┤
│            │                                   │                              │
│  THE PLAN  │          WORKSPACE                │        THE MENTOR            │
│   (20%)    │           (55%)                   │          (25%)               │
│            │                                   │                              │
│ ┌────────┐ │  📄 game.py                 [⚙️] │  ┌──────────────────────┐   │
│ │Blueprint│ │  ┌──────────────────────────┐   │  │ 💡 Show Solution     │   │
│ │ Tasks  │ │  │ 1  import random         │   │  └──────────────────────┘   │
│ └────────┘ │  │ 2                        │   │                              │
│            │  │ 3  def main():           │   │  ┌──────────────────────┐   │
│ ┌────────┐ │  │ 4      number = random   │   │  │ 🤖 AI Mentor:        │   │
│ │  Start │ │  │ 5      ...randint(1,100) │   │  │ Great start! Now...  │   │
│ │   ↓    │ │  │ 6                        │   │  └──────────────────────┘   │
│ │Generate│ │  │ 7      while True:       │   │                              │
│ │   ↓    │ │  │ 8          guess = ...   │   │  ┌──────────────────────┐   │
│ │  Loop  │ │  │ 9          ...input()    │   │  │ 👤 You:              │   │
│ │   ↓    │ │  │10                        │   │  │ How do I check if... │   │
│ │ Check  │ │  │▌                         │   │  └──────────────────────┘   │
│ │   ↓    │ │  └──────────────────────────┘   │                              │
│ │  End   │ │                                  │  (Chat History)              │
│ └────────┘ │  ▼ Terminal                      │  (Scrollable)                │
│            │  ┌──────────────────────────┐   │                              │
│ ☑️ Import  │  │ [+] Add Inputs [▶ Run] ▾│   │  ┌──────────────────────┐   │
│ ☑️ Generate│  ├──────────────────────────┤   │  │ [Ask question...   ] │   │
│ ☐ Loop     │  │ $ Running game.py...     │   │  │                  📤 │   │
│ ☐ Input    │  │                          │   │  └──────────────────────┘   │
│ ☐ Check    │  │ Guess (1-100): 50        │   │  ┌──────────────────────┐   │
│ ☐ Display  │  │ 📉 Too high!             │   │  │ 🔬 Review My Code    │   │
│            │  │ Guess (1-100): 25        │   │  └──────────────────────┘   │
│ 2/6 done   │  │ 🎉 Correct!              │   │                              │
│            │  │                          │   │                              │
│            │  │ ✅ Exited: 0 (0.45s)     │   │                              │
│            │  └──────────────────────────┘   │                              │
└────────────┴───────────────────────────────────┴──────────────────────────────┘
```

**Column Widths (Resizable):**
- Default: 20% | 55% | 25%
- Min: 15% | 40% | 20%
- Max: 30% | 65% | 35%
- Drag handles between columns

---

#### Column 1: The Plan (Left - 20%)

**Tab Navigation:**
- Two tabs: [Blueprint] [Tasks]
- Active tab: Underline + accent color

**Tab 1: Blueprint (Mermaid Flowchart)**

**Layout:**
```
┌──────────────────┐
│ [Blueprint] Tasks│
├──────────────────┤
│                  │
│    ┌───────┐    │
│    │ Start │    │
│    └───┬───┘    │
│        │        │
│    ┌───▼───┐   │
│    │Generate│   │
│    │ Number │   │
│    └───┬───┘   │
│        │        │
│    ┌───▼───┐   │
│    │ Loop  │   │
│    └───┬───┘   │
│        │        │
│       ...       │
│                  │
│  [Reset View]   │
└──────────────────┘
```

**Features:**
- **Rendering:** Mermaid.js library
- **Source:** `project.mermaidChart` from localStorage
- **Interaction:**
  - Zoom: Mouse wheel (50% to 200%)
  - Pan: Click and drag
  - Reset button: "Reset View" (bottom)
- **Auto-fit:** On first load, fit chart to container
- **Syntax:** `project.mermaidChart` contains raw Mermaid syntax (no backticks)

**Example Mermaid Code:**
```
graph TD
    A[Start] --> B[Generate Random Number]
    B --> C[Get User Input]
    C --> D{Guess == Number?}
    D -->|Yes| E[Display Win]
    D -->|No| F{Guess < Number?}
    F -->|Yes| G[Too Low]
    F -->|No| H[Too High]
    G --> C
    H --> C
    E --> I[End]
```

---

**Tab 2: Tasks (Checklist)**

**Layout:**
```
┌──────────────────┐
│ Blueprint [Tasks]│
├──────────────────┤
│                  │
│ ☑️ Import random │
│ ☑️ Create main() │
│ ☐ Generate number│
│ ☐ Create loop    │
│ ☐ Get user input │
│ ☐ Check guess    │
│ ☐ Display result │
│ ☐ Handle win     │
│                  │
│ ━━━━━━━━━━━━━━━ │
│ ████░░░░░░ 2/8   │
│                  │
└──────────────────┘
```

**Task Item Structure:**
```typescript
interface Task {
  id: string;           // "task-1"
  text: string;         // "Import random module"
  completed: boolean;   // false
}
```

**Components:**
- **Checkbox:** ShadCN `<Checkbox>`
- **Text:** Task description (text-sm)
- **State:**
  - Unchecked: White checkbox, normal text
  - Checked: Accent checkbox, strikethrough text, gray color

**Interactions:**
- Click checkbox → Toggle `task.completed`
- Update localStorage immediately
- Recalculate progress bar

**Progress Bar (Bottom):**
- Visual: Horizontal progress bar
- Text: "X/Y completed" (e.g., "2/8")
- Percentage: `(completed / total) * 100`
- Color: Gradient based on progress
  - 0-33%: Red
  - 34-66%: Yellow
  - 67-100%: Green

---

#### Column 2: Workspace (Center - 55%)

**Top Section: Monaco Editor (70% height)**

**Header Bar:**
```
┌──────────────────────────────────────────┐
│ 📄 game.py                          [⚙️] │
└──────────────────────────────────────────┘
```

**Elements:**
- **File Icon:** 📄 (or language-specific: 🐍/⚡/⚙️)
- **Filename:** `project.filename` (e.g., "game.py")
- **Settings Icon:** [⚙️] (dropdown menu)
  - Font size: 12px / 14px / 16px / 18px
  - Theme: Dark (vs-dark) / Light (vs-light)
  - Word wrap: On / Off

**Monaco Editor Configuration:**
```typescript
{
  theme: "vs-dark",
  language: project.language, // "python" | "javascript" | "cpp"
  value: project.code,
  options: {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'Fira Code', 'Courier New', monospace",
    lineNumbers: "on",
    scrollBeyondLastLine: false,
    wordWrap: "on",
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: true,
    // DISABLED FEATURES:
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    parameterHints: { enabled: false },
    suggest: { enabled: false }
  }
}
```

**Auto-save Logic:**
```typescript
const debouncedSave = debounce((code: string) => {
  updateProject(projectId, { code });
  saveToLocalStorage();
}, 2000); // Save every 2 seconds after typing stops

editor.onDidChangeModelContent(() => {
  debouncedSave(editor.getValue());
});
```

**Keyboard Shortcuts:**
- `Ctrl+S` / `Cmd+S`: Manual save (show toast: "✅ Saved")
- `Ctrl+R` / `Cmd+R`: Run code (same as clicking Run button)

---

**Bottom Section: Terminal (30% height, Resizable)**

**Toolbar:**
```
┌─────────────────────────────────────────────────┐
│ [+] Add Inputs (2)    [▶ Run Code]    [🗑️ Clear]│
└─────────────────────────────────────────────────┘
```

**Button 1: [+] Add Inputs**
- Text: "Add Inputs" + badge showing count (e.g., "(2)")
- Badge: Only shown if inputs exist
- Action: Open **Input Config Modal** (see below)
- Style: Secondary button

**Button 2: [▶ Run Code]**
- Text: "Run Code"
- Icon: ▶ (play symbol)
- States:
  - **Disabled:** If code is empty
  - **Loading:** Spinner + "Running..."
  - **Enabled:** Primary button
- Action: Execute code via Piston API

**Button 3: [🗑️ Clear]**
- Icon: Trash icon
- Action: Clear terminal output
- Style: Ghost button

**Output Area:**
```
┌─────────────────────────────────────────┐
│ $ Running game.py...                    │
│                                         │
│ 🎯 Welcome to Number Guessing Game!     │
│ Guess a number (1-100): 50              │
│ 📉 Too high! Try lower.                 │
│ Guess a number (1-100): 25              │
│ 📈 Too low! Try higher.                 │
│ Guess a number (1-100): 37              │
│ 🎉 Correct! You won in 3 attempts!      │
│                                         │

│ ✅ Exited with code 0 (0.34s)           │
└─────────────────────────────────────────┘
```

**Display States:**

**Idle (Before First Run):**
```
┌─────────────────────────────────────────┐
│  Press ▶ Run to execute your code       │
│                                         │
│  💡 Tip: If your code uses input(),     │
│  click [+ Add Inputs] first             │
└─────────────────────────────────────────┘
```

**Running:**
```
┌─────────────────────────────────────────┐
│ ⏳ Executing code...                    │
│                                         │
│ (Spinner animation)                     │
└─────────────────────────────────────────┘
```

**Success (Exit Code 0):**
```
┌─────────────────────────────────────────┐
│ $ Running game.py...                    │
│                                         │
│ [stdout content here]                   │
│                                         │
│ ✅ Exited with code 0 (0.23s)           │
└─────────────────────────────────────────┘
```

**Error (Exit Code ≠ 0 or stderr):**
```
┌─────────────────────────────────────────┐
│ $ Running game.py...                    │
│                                         │
│ ❌ Execution Failed                     │
│                                         │
│ Traceback (most recent call last):     │
│   File "game.py", line 5, in <module>  │
│     print(x)                            │
│ NameError: name 'x' is not defined      │
│                                         │
│ ✖️ Exited with code 1 (0.12s)           │
│                                         │
│ 💡 Tip: Check line 5 for undefined vars│
└─────────────────────────────────────────┘
```

**Styling:**
- Font: Monospace (Fira Code or Consolas)
- Background: `bg-black` (pure black)
- Text colors:
  - Default: `text-gray-300`
  - Success messages (✅): `text-green-400`
  - Error messages (❌): `text-red-400`
  - Info (💡): `text-blue-400`

**Execution Logic Flow:**
1. User clicks "Run Code"
2. Check if code is empty → Show toast: "⚠️ Write some code first"
3. Get stored inputs (if any) from component state
4. Call Piston API:
   ```typescript
   const response = await executePiston({
     language: project.language,
     code: project.code,
     stdin: inputs.join("\n")
   });
   ```
5. Display output in terminal
6. If error → Parse and highlight (see Error Handling section)

---

### 4.8 Modal: Input Config (Add Inputs)

**Trigger:** Click "[+ Add Inputs]" button in Terminal toolbar

**Type:** Dialog overlay (centered, 500px width)

**Layout:**
```
┌────────────────────────────────────────────────┐
│  ⚙️ Configure Test Inputs                [X]  │
├────────────────────────────────────────────────┤
│                                                │
│  If your code uses input(), provide test      │
│  values here (one per line):                  │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 50                                       │ │
│  │ 25                                       │ │
│  │ 37                                       │ │
│  │                                          │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  💡 Each line represents one input() call     │
│  Example: First line = first input()          │
│                                                │
│  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Clear All   │  │  Save & Close       │   │
│  └──────────────┘  └─────────────────────┘   │
│                                                │
└────────────────────────────────────────────────┘
```

#### Form Fields:

**Inputs Textarea:**
- Component: ShadCN `<Textarea>` (5 rows, auto-expand)
- Placeholder: "Enter test inputs (one per line)"
- Value: Loaded from component state (persists during session)
- No character limit
- Behavior:
  - Each line = one stdin value
  - Empty lines are preserved (some programs expect empty input)
  - Leading/trailing whitespace preserved per line

**Helper Text:**
- Icon: 💡
- Text: "Each line represents one input() call"
- Example: "First line = first input()"

**Action Buttons:**

**Clear All Button:**
- Style: Outline, destructive color
- Action: 
  - Clear textarea
  - Confirm dialog: "Are you sure?"

**Save & Close Button:**
- Style: Primary
- Action:
  - Save inputs to component state (NOT localStorage)
  - Update badge on "[+ Add Inputs]" button
  - Close modal
  - Show toast: "✅ Inputs saved (N lines)"

**Behavior Notes:**
- Inputs are NOT saved to localStorage
- Inputs persist only during the current session
- If user leaves IDE page, inputs are cleared
- Rationale: Inputs are test data, not project data

---

#### Column 3: The Mentor (Right - 25%)

**Top Section: Solution Button**

**Layout:**
```
┌──────────────────────────┐
│ 💡 Show Solution         │
└──────────────────────────┘
```

**Button:**
- Style: Full-width, outline, accent color
- Icon: 💡 (lightbulb)
- Text: "Show Solution"
- Always enabled (no restrictions)
- Action: Open **Solution Modal** (see below)

---

**Middle Section: Chat History**

**Layout:**
```
┌────────────────────────────┐
│ (Scrollable area)          │
│                            │
│ ┌────────────────────────┐ │
│ │ 🤖 AI Mentor           │ │
│ │ Great start! You've    │ │
│ │ imported random. What  │ │
│ │ do you think comes next│ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ 👤 You                 │ │
│ │ Create the main        │ │
│ │ function?              │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ 🤖 AI Mentor           │ │
│ │ Exactly! And what will │ │
│ │ it do first?           │ │
│ └────────────────────────┘ │
│                            │
│           ⋮                │
└────────────────────────────┘
```

**Message Bubble Structure:**

**AI Message:**
```
┌────────────────────────┐
│ 🤖 AI Mentor           │
│ [Message content here] │
│ (Markdown supported)   │
└────────────────────────┘
• Timestamp (hover)
```
- Alignment: Left
- Background: `bg-accent/10`
- Border: `border-l-4 border-accent`
- Icon: 🤖 (top-left)
- Text: Rendered as Markdown (support **bold**, `code`, links)

**User Message:**
```
┌────────────────────────┐
│                     You│
│  [Message content here]│
└────────────────────────┘
                 • Timestamp
```
- Alignment: Right
- Background: `bg-gray-800`
- Border: None
- Text: Plain text (no Markdown)

**Timestamp Display:**
- Format: "HH:MM AM/PM" (e.g., "3:45 PM")
- Position: Small text below bubble
- Color: `text-gray-500`
- Show: Only on hover

**Auto-scroll:**
- When new message arrives → Scroll to bottom
- Smooth animation (300ms)

**Empty State (No Messages Yet):**
```
┌────────────────────────────┐
│                            │
│         💬                 │
│                            │
│  Start a conversation      │
│  with your AI mentor!      │
│                            │
│  Ask questions or request  │
│  a code review.            │
│                            │
└────────────────────────────┘
```

---

**Bottom Section: Input Area**

**Layout:**
```
┌────────────────────────────┐
│ ┌────────────────────────┐ │
│ │ Ask a question...      │ │
│ │                    📤 │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ 🔬 Review My Code      │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

**Message Input Field:**
- Component: ShadCN `<Textarea>` (auto-expand, max 4 rows)
- Placeholder: "Ask a question..."
- Features:
  - Enter to send (if Shift not pressed)
  - Shift+Enter for new line
- Icon: 📤 (send button, right side)

**Send Button Behavior:**
- States:
  - **Disabled:** Empty input
  - **Loading:** Spinner (while AI responds)
  - **Enabled:** Ready to send
- Action:
  1. Add user message to chat history
  2. Clear input
  3. Call `POST /api/project/chat` with:
     ```json
     {
       "message": "How do I create a loop?",
       "language": "python",
       "project_title": "Number Guessing Game",
       "history": [...last 5 messages],
       "current_code": "import random\n..."
     }
     ```
  4. On response:
     - Add AI message to chat history
     - Save to localStorage
     - Auto-scroll to bottom

---

**Review Button:**
- Style: Full-width, secondary with icon
- Icon: 🔬 (microscope)
- Text: "Review My Code"
- States:
  - **Disabled:** Code is empty
  - **Loading:** Spinner + "Analyzing..."
  - **Enabled:** Ready
- Action:
  1. Add system message: "🔬 Requesting code review..."
  2. Call `POST /api/project/review` with:
     ```json
     {
       "code": "import random\n...",
       "language": "python",
       "project_context": {
         "title": "Number Guessing Game",
         "tasks": [...],
         "current_task_index": 2
       },
       "previous_review": "..." // Last review message (if any)
     }
     ```
  3. On response:
     - Add AI review message to chat
     - If `highlight_line` exists:
       - Scroll editor to that line
       - Highlight line with accent background (temporary, 3 seconds)
     - Save to localStorage

---

### 4.9 Modal: Show Solution (Fullscreen)

**Trigger:** Click "💡 Show Solution" button in Mentor panel

**Type:** Fullscreen overlay (covers entire viewport)

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  💡 Model Solution                                   [X]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  This is a complete, working implementation of your        │
│  project. Study it carefully, but try to code yours       │
│  first! 🚀                                                 │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ import random                                        │ │
│  │                                                      │ │
│  │ def main():                                          │ │
│  │     """Main game function"""                         │ │
│  │     print("🎯 Welcome to Number Guessing Game!")    │ │
│  │     number = random.randint(1, 100)                 │ │
│  │     attempts = 0                                     │ │
│  │                                                      │ │
│  │     while True:                                      │ │
│  │         try:                                         │ │
│  │             guess = int(input("Guess (1-100): "))   │ │
│  │             attempts += 1                            │ │
│  │                                                      │ │
│  │             if guess == number:                      │ │
│  │                 print(f"🎉 Correct! Won in          │ │
│  │                        {attempts} attempts!")        │ │
│  │                 break                                │ │
│  │             elif guess < number:                     │ │
│  │                 print("📈 Too low! Try higher.")    │ │
│  │             else:                                    │ │
│  │                 print("📉 Too high! Try lower.")    │ │
│  │         except ValueError:                           │ │
│  │             print("⚠️ Please enter a valid number") │ │
│  │                                                      │ │
│  │ if __name__ == "__main__":                           │ │
│  │     main()                                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────┐  ┌──────────────────────┐       │
│  │  Copy to Clipboard  │  │       Close          │       │
│  └─────────────────────┘  └──────────────────────┘       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### Components:

**Header:**
- Icon: 💡
- Title: "Model Solution" (text-2xl, font-bold)
- Close button: [X] (top-right)

**Description:**
- Text: Educational disclaimer
- Style: `text-gray-400`, centered
- Message: Encourages learning, not copying

**Code Display:**
- Component: Monaco Editor (read-only)
- Language: Same as project
- Value: `project.hiddenSolution`
- Configuration:
  ```typescript
  {
    theme: "vs-dark",
    language: project.language,
    value: project.hiddenSolution,
    options: {
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: "on",
      fontSize: 14
    }
  }
  ```
- Height: 70vh (scrollable)

**Action Buttons:**

**Copy to Clipboard:**
- Style: Outline, secondary
- Icon: 📋
- Action:
  1. Copy `project.hiddenSolution` to clipboard
  2. Show toast: "✅ Code copied to clipboard!"
  3. Button text changes to "Copied!" for 2 seconds

**Close:**
- Style: Primary
- Action: Close modal, return to IDE

**Important Notes:**
- Viewing solution does NOT mark project as complete
- User's code is NOT replaced (read-only reference)
- Modal can be reopened anytime (unlimited views)

---

## 5. Backend API Endpoints (Complete Specification)

**Base URL:** `http://localhost:8000/api`

**Global Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**CORS Configuration:**
```python
allow_origins=["http://localhost:5173"], # Vite default
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"]
```

---

### 5.1 Endpoint: Initialize Project

**Purpose:** Generate complete project plan, tasks, flowchart, and solution

**Route:** `POST /api/project/init`

**Request Body:**
```json
{
  "idea": "Number guessing game",
  "language": "python",
  "level": "beginner"
}
```

**Pydantic Model:**
```python
class ProjectInitRequest(BaseModel):
    idea: str = Field(..., min_length=10, max_length=200)
    language: Literal["python", "javascript", "cpp"]
    level: Literal["beginner", "intermediate", "advanced"]
```

**Validation Rules:**
- `idea`: Required, 10-200 characters, string
- `language`: Required, must be one of: "python", "javascript", "cpp"
- `level`: Required, must be one of: "beginner", "intermediate", "advanced"

**System Prompt (Gemini 2.5 Pro):**
```
You are an expert software engineer and programming educator.

The student wants to build: "{idea}"
Their skill level: {level}
Programming language: {language}

Generate a complete project plan with:

1. **Project Title:** A concise, descriptive name (3-5 words)

2. **Mermaid Flowchart:** A flowchart showing the program's logic flow
   - Use Mermaid graph TD syntax
   - Include: Start, main logic steps, decisions, End
   - Keep it simple but complete
   - DO NOT include ```mermaid backticks

3. **Task Checklist:** 6-8 actionable steps a student can follow
   - Each task should be a single, clear action
   - Order them logically (imports → functions → logic)
   - Use simple, encouraging language

4. **Complete Solution Code:** A fully working, well-commented implementation
   - Single-file console application
   - Use ONLY standard library (no external packages)
   - Include proper error handling
   - Add helpful comments
   - Follow best practices for {language}
   - Make it educational but functional

5. **Filename:** A suitable filename (e.g., "game.py", "calculator.js")

Requirements:
- Code must be production-quality but beginner-readable
- Comments should explain WHY, not just WHAT
- Handle edge cases gracefully
- Use meaningful variable names

Respond ONLY with valid JSON (no markdown, no extra text):
{{
  "project_title": string,
  "mermaid_chart": string,
  "tasks": string[],
  "full_solution_code": string,
  "starter_filename": string
}}

Language preference: 
- Title and tasks in Arabic
- Code and comments in English
```

**Gemini Configuration:**
```python
generation_config = {
    "temperature": 0.7,
    "max_output_tokens": 4096,
    "response_mime_type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "project_title": "لعبة تخمين الرقم",
  "mermaid_chart": "graph TD\n    A[Start] --> B[Generate Random Number 1-100]\n    B --> C[Initialize Attempts Counter]\n    C --> D[Get User Input]\n    D --> E{Valid Number?}\n    E -->|No| F[Show Error]\n    F --> D\n    E -->|Yes| G{Guess == Number?}\n    G -->|Yes| H[Display Win Message]\n    G -->|No| I{Guess < Number?}\n    I -->|Yes| J[Display Too Low]\n    I -->|No| K[Display Too High]\n    J --> L[Increment Attempts]\n    K --> L\n    L --> D\n    H --> M[End]",
  "tasks": [
    "استورد مكتبة random",
    "أنشئ دالة main()",
    "ولّد رقماً عشوائياً بين 1 و 100",
    "أضف متغير لعدد المحاولات",
    "اصنع حلقة تكرار لا نهائية",
    "اطلب من المستخدم إدخال تخمين",
    "قارن التخمين بالرقم المولّد",
    "اعرض رسالة مناسبة (صحيح / أعلى / أقل)"
  ],
  "starter_filename": "game.py",
  "full_solution_code": "import random\n\ndef main():\n    \"\"\"\n    Main game function.\n    Generates a random number and asks user to guess it.\n    \"\"\"\n    print(\"🎯 Welcome to the Number Guessing Game!\")\n    print(\"I'm thinking of a number between 1 and 100...\\n\")\n    \n    # Generate random number\n    secret_number = random.randint(1, 100)\n    attempts = 0\n    \n    while True:\n        try:\n            # Get user input\n            guess = int(input(\"Enter your guess (1-100): \"))\n            attempts += 1\n            \n            # Validate range\n            if guess < 1 or guess > 100:\n                print(\"⚠️ Please enter a number between 1 and 100!\\n\")\n                continue\n            \n            # Check guess\n            if guess == secret_number:\n                print(f\"\\n🎉 Congratulations! You guessed it!\")\n                print(f\"The number was {secret_number}\")\n                print(f\"It took you {attempts} attempts!\")\n                break\n            elif guess < secret_number:\n                print(\"📈 Too low! Try a higher number.\\n\")\n            else:\n                print(\"📉 Too high! Try a lower number.\\n\")\n                \n        except ValueError:\n            print(\"⚠️ Invalid input! Please enter a valid number.\\n\")\n\nif __name__ == \"__main__\":\n    main()"
}
```

**Error Responses:**

**422 Validation Error:**
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "idea"],
      "msg": "String should have at least 10 characters",
      "input": "game",
      "ctx": {"min_length": 10}
    }
  ]
}
```

**500 AI Generation Failed:**
```json
{
  "error": "ai_generation_failed",
  "message": "Failed to generate project plan. Please try again or simplify your idea.",
  "retryable": true,
  "details": "Gemini API returned invalid JSON"
}
```

**503 Service Unavailable:**
```json
{
  "error": "service_unavailable",
  "message": "AI service is temporarily unavailable. Please try again in a few moments.",
  "retryable": true
}
```

---

### 5.2 Endpoint: Socratic Code Review

**Purpose:** Analyze user's code and provide Socratic guidance (no direct solutions)

**Route:** `POST /api/project/review`

**Request Body:**
```json
{
  "code": "import random\n\nprint('hello')\nx = input()\nprint(x)",
  "language": "python",
  "project_context": {
    "title": "Number Guessing Game",
    "tasks": [
      "استورد مكتبة random",
      "أنشئ دالة main()",
      "ولّد رقماً عشوائياً"
    ],
    "current_task_index": 2
  },
  "previous_review": "Think about how to structure your code with functions."
}
```

**Pydantic Models:**
```python
class ProjectContext(BaseModel):
    title: str
    tasks: List[str]
    current_task_index: int

class CodeReviewRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=10000)
    language: Literal["python", "javascript", "cpp"]
    project_context: ProjectContext
    previous_review: Optional[str] = None
```

**Validation Rules:**
- `code`: Required, 1-10,000 characters
- `language`: Required, one of: "python", "javascript", "cpp"
- `project_context.title`: Required, string
- `project_context.tasks`: Required, array of strings
- `project_context.current_task_index`: Required, integer (0-based)
- `previous_review`: Optional, string

**System Prompt (Gemini 2.5 Pro):**
```
You are a Socratic Mentor (معلم سقراطي) for programming students.

CRITICAL RULES (NEVER VIOLATE):
1. NEVER write code that directly fixes the student's error
2. NEVER provide the complete solution or missing code
3. ALWAYS guide through thought-provoking questions
4. Be encouraging but technically precise
5. Focus on ONE main issue at a time
6. If code is mostly correct, praise first, then ask about improvements

Student's Project: {title}
Current Progress: Task {current_task_index + 1} of {total_tasks}

Project Tasks:
{formatted_tasks_list}

Student's Current Code:
```{language}
{code}
```

Previous Review (if any):
{previous_review or "None"}

Your mission:
1. Analyze the code for:
   - Logic errors or bugs
   - Missing functionality (based on project tasks)
   - Poor practices (naming, structure, error handling)
   - Edge cases not handled
   - Opportunities for improvement

2. Respond with:
   - Brief acknowledgment of what's working (1 sentence)
   - A Socratic question that guides them to the issue (1-2 sentences)
   - Optional: A subtle hint about where to look (line number or concept)

3. Tone: Supportive, curious, never condescending

Examples of good questions:
- "هل لاحظت كيف تتعامل حلقتك مع الحالة الشرطية هنا؟"
- "ماذا سيحدث إذا أدخل المستخدم قيمة خاطئة؟"
- "كيف يمكنك تحسين قابلية قراءة هذا الجزء من الكود؟"

Respond ONLY with valid JSON:
{{
  "review_comment": string (Arabic, 2-4 sentences),
  "highlight_line": number | null (1-based line number),
  "severity": "info" | "warning" | "error"
}}

Severity levels:
- "info": Improvement suggestion, code works
- "warning": Logic issue or poor practice
- "error": Critical bug that prevents functionality
```

**Gemini Configuration:**
```python
generation_config = {
    "temperature": 0.8,  # Higher for varied questioning
    "max_output_tokens": 500,
    "response_mime_type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "review_comment": "بداية جيدة! 👍 لاحظت أنك استوردت مكتبة random لكنها غير مستخدمة بعد. السؤال الأهم: هل لاحظت أن كودك يعمل خارج أي دالة؟ كيف يمكنك تنظيمه بشكل أفضل حسب المهمة الثانية في قائمتك؟",
  "highlight_line": 3,
  "severity": "warning"
}
```

**Example Responses for Different Scenarios:**

**Good Code (Info):**
```json
{
  "review_comment": "ممتاز! ✨ الكود يعمل بشكل صحيح. هل فكرت في إضافة رسائل أكثر وضوحاً للمستخدم؟ ماذا لو أضفت emoji لجعل التجربة أمتع؟",
  "highlight_line": null,
  "severity": "info"
}
```

**Logic Error (Warning):**
```json
{
  "review_comment": "الكود منظم جيداً! 🎯 لكن لاحظت أن حلقة التكرار قد تستمر إلى ما لا نهاية. ما الشرط الذي يجب أن يوقفها عندما يفوز المستخدم؟",
  "highlight_line": 8,
  "severity": "warning"
}
```

**Critical Bug (Error):**
```json
{
  "review_comment": "هناك مشكلة هنا! ⚠️ الكود يحاول استخدام متغير قبل تعريفه. راجع السطر 5: من أين يأتي 'number'؟ ما الخطوة التي نسيتها من قائمة المهام؟",
  "highlight_line": 5,
  "severity": "error"
}
```

**Error Responses:**

**400 Empty Code:**
```json
{
  "error": "empty_code",
  "message": "لا يمكن مراجعة كود فارغ. اكتب بعض الأكواد أولاً!",
  "retryable": false
}
```

**500 Review Failed:**
```json
{
  "error": "review_failed",
  "message": "فشل تحليل الكود. حاول مرة أخرى.",
  "retryable": true
}
```

---

### 5.3 Endpoint: General Chat (Mentor)

**Purpose:** Answer student's general programming questions (without solving their project)

**Route:** `POST /api/project/chat`

**Request Body:**
```json
{
  "message": "كيف أعمل حلقة while في Python؟",
  "language": "python",
  "project_title": "Number Guessing Game",
  "history": [
    {
      "role": "user",
      "content": "كيف أبدأ؟"
    },
    {
      "role": "assistant",
      "content": "ابدأ باستيراد المكتبات المطلوبة. ما المكتبة التي تحتاجها لتوليد الأرقام العشوائية؟"
    }
  ],
  "current_code": "import random\n\n# Starting..."
}
```

**Pydantic Models:**
```python
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    language: Literal["python", "javascript", "cpp"]
    project_title: str
    history: List[ChatMessage] = Field(default_factory=list, max_length=10)
    current_code: Optional[str] = None
```

**Validation Rules:**
- `message`: Required, 1-500 characters
- `language`: Required
- `project_title`: Required
- `history`: Optional, max 10 messages (to limit context size)
- `current_code`: Optional, for context

**System Prompt (Gemini 2.5 Pro):**
```
You are a friendly programming mentor helping a student build: {project_title}

RULES:
1. Answer questions directly and clearly
2. Use simple, educational examples (NOT from the student's project)
3. Explain concepts, don't solve their homework
4. Encourage experimentation and learning
5. Keep responses concise (2-3 paragraphs maximum)
6. Be supportive and motivating


Student's Question:
{message}

Their Current Code (for context):
```{language}
{current_code or "Not started yet"}
```

Previous Conversation:
{formatted_history}

Respond in Arabic with:
- A direct answer to their question
- A simple code example (if relevant)
- An encouraging follow-up question or suggestion

Keep code examples generic and educational, never specific to their project solution.

Format: Plain text with markdown (for code blocks).
```

**Gemini Configuration:**
```python
generation_config = {
    "temperature": 0.7,
    "max_output_tokens": 800
}
```

**Response (200 OK):**
```json
{
  "response": "حلقات التكرار `while` في Python سهلة! 😊\n\nتعمل حلقة `while` طالما الشرط صحيح:\n\n```python\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n```\n\nهذا الكود يطبع الأرقام من 0 إلى 4. الحلقة تتوقف عندما يصبح `count` يساوي 5.\n\nفي مشروعك، ستحتاج حلقة تستمر حتى يخمن المستخدم الرقم الصحيح. فكر: ما الشرط الذي يجب أن يحققه المستخدم لإيقاف الحلقة؟ 🤔",
  "suggested_reading": null
}
```

**Example Responses:**

**Concept Explanation:**
```json
{
  "response": "المتغيرات في Python تعمل كصناديق لتخزين البيانات! 📦\n\n```python\nname = \"Ahmed\"  # String\nage = 25        # Integer\nheight = 1.75   # Float\nis_student = True  # Boolean\n```\n\nلا تحتاج لتحديد النوع، Python تفهمه تلقائياً. جرب إنشاء متغير لتخزين الرقم العشوائي في مشروعك!",
  "suggested_reading": null
}
```

**Error Explanation:**
```json
{
  "response": "خطأ `NameError` يحدث عندما تحاول استخدام متغير قبل تعريفه:\n\n```python\nprint(x)  # ❌ Error: x is not defined\nx = 10\n```\n\nالحل: تأكد من تعريف المتغير قبل استخدامه:\n\n```python\nx = 10\nprint(x)  # ✅ Works!\n```\n\nراجع كودك: هل عرّفت جميع المتغيرات قبل استخدامها؟",
  "suggested_reading": null
}
```

**Error Responses:**

**400 Empty Message:**
```json
{
  "error": "empty_message",
  "message": "الرجاء كتابة سؤال أو رسالة.",
  "retryable": false
}
```

**500 Chat Failed:**
```json
{
  "error": "chat_failed",
  "message": "فشل الاتصال بالمساعد الذكي. حاول مرة أخرى.",
  "retryable": true
}
```

---

### 5.4 Endpoint: Generate Challenges

**Purpose:** Create function-based coding problems with test cases

**Route:** `POST /api/challenges/generate`

**Request Body:**
```json
{
  "count": 3,
  "difficulty": "medium",
  "language": "python",
  "existing_titles": ["Sum Two Numbers", "Palindrome Checker"]
}
```

**Pydantic Model:**
```python
class ChallengeGenerateRequest(BaseModel):
    count: int = Field(..., ge=1, le=5)
    difficulty: Literal["easy", "medium", "hard"]
    language: Literal["python", "javascript", "cpp"]
    existing_titles: List[str] = Field(default_factory=list)
```

**Validation Rules:**
- `count`: Required, integer between 1 and 5
- `difficulty`: Required, one of: "easy", "medium", "hard"
- `language`: Required
- `existing_titles`: Optional, array of strings (used to avoid duplicates)

**System Prompt (Gemini 2.5 Pro):**
```
You are a programming challenge designer for {language}.

Generate {count} coding challenges with difficulty: {difficulty}

IMPORTANT: Avoid these existing challenge titles:
{existing_titles}

Requirements for each challenge:
1. **Function-based**: Student implements a single function
2. **No interactive input**: Function takes parameters, returns result (NO input() calls)
3. **Clear specification**: Describe what the function should do
4. **Test cases**: Provide 5-8 test cases (mix of visible and hidden)
5. **Realistic**: Common programming problems suitable for practice

Difficulty guidelines:
- **Easy**: Basic operations (math, strings, simple logic)
  - Examples: sum numbers, reverse string, find max
- **Medium**: Data structures, algorithms, moderate logic
  - Examples: palindrome check, binary search, count occurrences
- **Hard**: Complex algorithms, edge cases, optimization
  - Examples: Fibonacci with memoization, graph problems

For each challenge, provide:
- Unique title (not in existing_titles)
- Clear description (2-3 sentences)
- Function signature for {language}
- 5-8 test cases (3-4 visible, 2-4 hidden)

Test case format:
- `input`: Function call as string (e.g., "sum_two(2, 3)")
- `expected`: Expected return value as string (e.g., "5")
- `hidden`: Boolean (true = not shown to student)

Respond ONLY with valid JSON array:
[
  {{
    "title": string (unique, concise),
    "description": string (Markdown, 2-3 sentences),
    "function_signature": string (language-specific),
    "test_cases": [
      {{
        "input": string,
        "expected": string,
        "hidden": boolean
      }}
    ]
  }}
]

Language syntax:
- Python: "def function_name(params):"
- JavaScript: "function functionName(params) {{"
- C++: "returnType functionName(params) {{"

Description language: Arabic
Code: English
```

**Gemini Configuration:**
```python
generation_config = {
    "temperature": 0.9,  # Higher for creativity
    "max_output_tokens": 3000,
    "response_mime_type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "challenges": [
    {
      "title": "Find Maximum in Array",
      "description": "اكتب دالة تأخذ مصفوفة من الأرقام وترجع أكبر رقم فيها.\n\n**مثال:**\n- `find_max([1, 5, 3, 9, 2])` → `9`",
      "function_signature": "def find_max(numbers):",
      "test_cases": [
        {
          "input": "find_max([1, 5, 3, 9, 2])",
          "expected": "9",
          "hidden": false
        },
        {
          "input": "find_max([10])",
          "expected": "10",
          "hidden": false
        },
        {
          "input": "find_max([-5, -1, -10])",
          "expected": "-1",
          "hidden": true
        },
        {
          "input": "find_max([0, 0, 0])",
          "expected": "0",
          "hidden": true
        },
        {
          "input": "find_max([100, 200, 50, 200])",
          "expected": "200",
          "hidden": true
        }
      ]
    },
    {
      "title": "Count Vowels",
      "description": "اكتب دالة تحسب عدد الحروف المتحركة (a, e, i, o, u) في نص معين.\n\n**ملاحظة:** تجاهل حالة الأحرف (uppercase/lowercase).",
      "function_signature": "def count_vowels(text):",
      "test_cases": [
        {
          "input": "count_vowels('hello')",
          "expected": "2",
          "hidden": false
        },
        {
          "input": "count_vowels('AEIOU')",
          "expected": "5",
          "hidden": false
        },
        {
          "input": "count_vowels('xyz')",
          "expected": "0",
          "hidden": true
        },
        {
          "input": "count_vowels('Programming is fun!')",
          "expected": "5",
          "hidden": true
        },
        {
          "input": "count_vowels('')",
          "expected": "0",
          "hidden": true
        }
      ]
    },
    {
      "title": "Binary Search",
      "description": "اكتب دالة تبحث عن رقم في مصفوفة **مرتبة** باستخدام خوارزمية Binary Search.\n\n**ترجع:** موضع الرقم (index) أو `-1` إذا لم يوجد.",
      "function_signature": "def binary_search(arr, target):",
      "test_cases": [
        {
          "input": "binary_search([1, 3, 5, 7, 9], 5)",
          "expected": "2",
          "hidden": false
        },
        {
          "input": "binary_search([1, 3, 5, 7, 9], 10)",
          "expected": "-1",
          "hidden": false
        },
        {
          "input": "binary_search([10, 20, 30, 40], 10)",
          "expected": "0",
          "hidden": true
        },
        {
          "input": "binary_search([10, 20, 30, 40], 40)",
          "expected": "3",
          "hidden": true
        },
        {
          "input": "binary_search([], 5)",
          "expected": "-1",
          "hidden": true
        }
      ]
    }
  ]
}
```

**Error Responses:**

**400 Invalid Count:**
```json
{
  "error": "invalid_count",
  "message": "يجب أن يكون عدد التحديات بين 1 و 5.",
  "retryable": false
}
```

**500 Generation Failed:**
```json
{
  "error": "generation_failed",
  "message": "فشل توليد التحديات. حاول مرة أخرى.",
  "retryable": true
}
```

---

## 6. Piston API Integration (Frontend Direct)

**Endpoint:** `https://emkc.org/api/v2/piston/execute`

**Method:** POST

**No Authentication Required**

### Language Mapping:
```typescript
const PISTON_LANGUAGES = {
  python: "python",
  javascript: "javascript",
  cpp: "c++"
};
```

### Request Format:
```typescript
interface PistonRequest {
  language: string;           // "python" | "javascript" | "c++"
  version: string;            // "*" for latest
  files: Array<{
    name: string;             // "main.py" | "main.js" | "main.cpp"
    content: string;          // User's code
  }>;
  stdin: string;              // Joined inputs: "50\n25\n37\n"
  compile_timeout: number;    // milliseconds (10000)
  run_timeout: number;        // milliseconds (5000)
}
```

### Implementation Example:
```typescript
const executePistonCode = async (
  language: string,
  code: string,
  inputs: string[]
): Promise<PistonResponse> => {
  const fileExtensions = {
    python: ".py",
    javascript: ".js",
    cpp: ".cpp"
  };

  const payload: PistonRequest = {
    language: PISTON_LANGUAGES[language],
    version: "*",
    files: [
      {
        name: `main${fileExtensions[language]}`,
        content: code
      }
    ],
    stdin: inputs.join("\n"),
    compile_timeout: 10000,  // 10 seconds
    run_timeout: 5000        // 5 seconds
  };

  try {
    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000  // 15 seconds total
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Execution timeout. Your code may have an infinite loop.");
      }
      if (!error.response) {
        throw new Error("Network error. Check your internet connection.");
      }
    }
    throw error;
  }
};
```

### Response Format:
```typescript
interface PistonResponse {
  language: string;           // "python"
  version: string;            // "3.10.0"
  run: {
    stdout: string;           // Program output
    stderr: string;           // Error messages
    code: number;             // Exit code (0 = success)
    signal: string | null;    // Signal if terminated
    output: string;           // Combined stdout + stderr
  };
  compile?: {                 // Only for compiled languages (C++)
    stdout: string;
    stderr: string;
    code: number;
  };
}
```

### Response Processing:
```typescript
const processExecutionResult = (response: PistonResponse) => {
  const { run, compile } = response;

  // Check compilation (for C++)
  if (compile && compile.code !== 0) {
    return {
      success: false,
      type: "compilation_error",
      message: compile.stderr || "Compilation failed",
      exitCode: compile.code
    };
  }

  // Check runtime
  if (run.code !== 0 || run.stderr) {
    // Check for specific errors
    if (run.stderr.includes("EOFError") || run.stderr.includes("EOF when reading")) {
      return {
        success: false,
        type: "input_error",
        message: "⚠️ Your code expects more inputs than provided.",
        stderr: run.stderr,
        exitCode: run.code
      };
    }

    return {
      success: false,
      type: "runtime_error",
      message: run.stderr || `Program exited with code ${run.code}`,
      stderr: run.stderr,
      exitCode: run.code
    };
  }

  // Success
  return {
    success: true,
    type: "success",
    output: run.stdout,
    exitCode: 0
  };
};
```

---

## 7. Error Handling Strategy (Complete)

### 7.1 Frontend Error Types

#### Network Errors
**Scenarios:**
- Backend API unavailable
- Piston API timeout
- No internet connection

**Implementation:**
```typescript
try {
  const response = await api.post("/project/init", data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      // Network error
      showToast({
        type: "error",
        title: "Connection Error",
        message: "⚠️ فشل الاتصال بالخادم. تحقق من الإنترنت.",
        action: {
          label: "Retry",
          onClick: () => retryRequest()
        }
      });
    }
  }
}
```

---

#### Code Execution Errors
**Scenarios:**
- Syntax errors
- Runtime errors
- Timeouts (infinite loops)

**Display Format:**
```typescript
// Terminal output for errors
const displayError = (error: ExecutionError) => {
  return `
❌ Execution Failed

${error.stderr}

✖️ Exited with code ${error.exitCode} (${error.duration}s)

💡 Tip: ${getErrorHint(error)}
  `;
};

const getErrorHint = (error: ExecutionError): string => {
  if (error.stderr.includes("NameError")) {
    return "Check for undefined variables";
  }
  if (error.stderr.includes("IndentationError")) {
    return "Fix your code indentation";
  }
  if (error.stderr.includes("SyntaxError")) {
    return "Review your syntax carefully";
  }
  if (error.exitCode === 124) {
    return "Your code took too long. Check for infinite loops.";
  }
  return "Read the error message carefully";
};
```

---

#### Input/Output Mismatch
**Detection:**
```typescript
if (stderr.includes("EOFError") || stderr.includes("EOF")) {
  // Analyze code to estimate input() calls
  const inputCallCount = countInputCalls(code);
  const providedCount = inputs.length;

  showError({
    type: "input_mismatch",
    message: `⚠️ Input mismatch detected!\n\nYour code expects ~${inputCallCount} inputs\nYou provided: ${providedCount}\n\nClick [+ Add Inputs] to add more.`,
    highlight: "add_inputs_button"
  });
}

const countInputCalls = (code: string): number => {
  // Simple heuristic (not perfect)
  const matches = code.match(/input\s*\(/g);
  return matches ? matches.length : 0;
};
```

---

#### AI Generation Failures
**Backend Implementation:**
```python
@app.post("/api/project/init")
async def initialize_project(request: ProjectInitRequest):
    try:
        # Call Gemini
        response = model.generate_content(prompt)
        
        # Parse JSON
        result = json.loads(response.text)
        
        # Validate structure
        if not all(key in result for key in required_keys):
            raise ValueError("Invalid response structure")
        
        return result
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "invalid_ai_response",
                "message": "AI returned invalid format. Please try again.",
                "retryable": True
            }
        )
    except Exception as e:
        logger.error(f"Project init failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ai_generation_failed",
                "message": "فشل توليد المشروع. حاول مرة أخرى أو قلل من تعقيد الفكرة.",
                "retryable": True
            }
        )
```

**Frontend Handling:**
```typescript
try {
  const project = await api.post("/project/init", data);
} catch (error) {
  if (error.response?.status === 500) {
    const { error: errorType, message, retryable } = error.response.data;
    
    showModal({
      title: "⚠️ فشل إنشاء المشروع",
      message,
      actions: retryable ? [
        { label: "Try Again", onClick: () => retry() },
        { label: "Change Idea", onClick: () => reset() }
      ] : [
        { label: "Close", onClick: () => closeModal() }
      ]
    });
  }
}
```

---

#### LocalStorage Quota Exceeded
**Detection & Handling:**
```typescript
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      // Calculate current usage
      const usage = calculateStorageUsage();
      
      showModal({
        title: "⚠️ Storage Full",
        message: `مساحة التخزين ممتلئة (${usage.used}/${usage.total} MB)`,
        content: <StorageManager projects={getAllProjects()} />,
        actions: [
          { label: "Delete Old Projects", onClick: () => openCleanup() },
          { label: "Cancel", onClick: () => closeModal() }
        ]
      });
    }
  }
};

const calculateStorageUsage = () => {
  let used = 0;
  for (let key in localStorage) {
    used += localStorage[key].length + key.length;
  }
  return {
    used: (used / 1024 / 1024).toFixed(2), // MB
    total: "5" // Browser typical limit
  };
};
```

---

### 7.2 Global Error Boundary

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Optional: Send to analytics
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

// components/ErrorFallback.tsx
const ErrorFallback = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4">
        <div className="text-6xl">😞</div>
        <h1 className="text-2xl font-bold">عذراً، حدث خطأ غير متوقع</h1>
        <p className="text-gray-400">
          {error?.message || "حدث خطأ في التطبيق"}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-accent rounded-lg"
          >
            Reload Page
          </button>
          <button
            onClick={resetError}
            className="px-6 py-2 border border-gray-700 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 8. Implementation Phases (4-Day Hackathon Plan)

### Day 1: Foundation (8 hours)
**Morning (4h):**
- [ ] Setup Vite + React + TypeScript project
- [ ] Configure Tailwind CSS + ShadCN UI
- [ ] Create folder structure
- [ ] Setup Zustand stores (profile, projects)
- [ ] Implement LocalStorage helpers
- [ ] Build Onboarding page (fully functional)

**Afternoon (4h):**
- [ ] Build Dashboard page (static)
- [ ] Create New Project Modal
- [ ] Setup FastAPI backend structure
- [ ] Configure Gemini API
- [ ] Implement `/api/project/init` endpoint
- [ ] Test project generation flow

**Deliverable:** User can create profile and generate a project plan

---

### Day 2: Core IDE (8 hours)
**Morning (4h):**
- [ ] Build Project IDE layout (3-column resizable)
- [ ] Integrate Monaco Editor
- [ ] Implement Task List component
- [ ] Add Mermaid Chart rendering
- [ ] Setup auto-save logic

**Afternoon (4h):**
- [ ] Build Terminal component
- [ ] Create Input Config Modal
- [ ] Implement Piston API integration
- [ ] Add Run Code functionality
- [ ] Test execution with inputs

**Deliverable:** User can write, edit, and run code with test inputs

---

### Day 3: AI Features (8 hours)
**Morning (4h):**
- [ ] Build Chat Interface UI
- [ ] Implement `/api/project/chat` endpoint
- [ ] Add message history management
- [ ] Test general chat functionality

**Afternoon (4h):**
- [ ] Implement `/api/project/review` endpoint
- [ ] Add Review My Code button logic
- [ ] Build Solution Modal
- [ ] Test Socratic review flow

**Deliverable:** AI mentor can chat and review code

---

### Day 4: Challenges + Polish (8 hours)
**Morning (4h):**
- [ ] Build Challenges page
- [ ] Create Generate Challenges Modal
- [ ] Implement `/api/challenges/generate` endpoint
- [ ] Build Challenge Runner Modal
- [ ] Add test execution for challenges

**Afternoon (4h):**
- [ ] Add error handling throughout app
- [ ] Implement loading states
- [ ] Add animations and transitions
- [ ] Responsive design testing
- [ ] Bug fixes and polish
- [ ] Prepare demo

**Deliverable:** Complete, polished hackathon demo

---

## 9. Summary of Changes from v3.0

| Feature | v3.0 | v5.0 (Final) |
|---------|------|-------------|
| **Challenges System** | "Future expansion" | **CORE FEATURE** - Fully specified |
| **Challenge Generation** | Not mentioned | Complete endpoint with anti-duplication |
| **Challenge Locking** | Mentioned locked states | **ALL UNLOCKED** - Generate on demand |
| **Generate Button** | Not described | Prominent "+ Generate" with slider modal |
| **UI/UX Details** | Brief descriptions | **Exhaustive pixel-level specs** |
| **Modal Specs** | Missing | Complete layouts for ALL modals |
| **Error Handling** | Basic mention | **Comprehensive strategy** with examples |
| **LocalStorage Schema** | Generic | **Detailed TypeScript interfaces** |
| **API Documentation** | Examples only | **Complete request/response/errors** |
| **Piston Integration** | Mentioned | **Full implementation code** |
| **Implementation Plan** | 4 vague phases | **Detailed hour-by-hour breakdown** |

---

## 10. Final Checklist

### Backend Requirements:
- [ ] FastAPI server with CORS
- [ ] Gemini 2.5 Pro integration
- [ ] 4 endpoints fully implemented:
  - `/api/project/init`
  - `/api/project/review`
  - `/api/project/chat`
  - `/api/challenges/generate`
- [ ] Pydantic models for validation
- [ ] Error handling for all endpoints
- [ ] Environment variables for API key

### Frontend Requirements:
- [ ] React 18 + TypeScript + Vite
- [ ] Tailwind + ShadCN UI components
- [ ] Zustand stores (profile, projects, challenges)
- [ ] LocalStorage persistence
- [ ] 5 pages:
  - Onboarding
  - Dashboard
  - Challenges
  - Challenge Runner
  - Project IDE
- [ ] 5 modals:
  - New Project
  - Generate Challenges
  - Input Config
  - Challenge Runner
  - Show Solution
- [ ] Monaco Editor integration
- [ ] Mermaid chart rendering
- [ ] Piston API direct calls
- [ ] Error boundaries
- [ ] Loading states
- [ ] Responsive design

### Testing Requirements:
- [ ] User can complete onboarding
- [ ] Project generation works
- [ ] Code execution works with inputs
- [ ] Chat responds correctly
- [ ] Code review provides guidance
- [ ] Challenges generate successfully
- [ ] Challenge testing works
- [ ] Solution modal displays code
- [ ] LocalStorage persists data
- [ ] Error handling works for all scenarios

---

**This specification is complete, exhaustive, and ready for immediate implementation. No assumptions, no gaps, no ambiguity.**