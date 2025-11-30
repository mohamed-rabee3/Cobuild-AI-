// Core Types for Cobuild AI

export type Language = "python" | "javascript" | "cpp";
export type Level = "beginner" | "intermediate" | "advanced";
export type MessageRole = "user" | "assistant";

export interface UserProfile {
  name: string;
  level: Level;
  language: Language;
  createdAt: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  language: Language;
  filename: string;
  code: string;
  mermaidChart: string;
  tasks: Task[];
  hiddenSolution: string;
  chatHistory: ChatMessage[];
  lastModified: number;
  createdAt: number;
}

export interface TestCase {
  input: string;
  expected: string;
  hidden: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  language: Language;
  description: string;
  function_signature: string;
  test_cases: TestCase[];
  solved: boolean;
  createdAt: number;
}

export interface PistonRequest {
  language: string;
  version: string;
  files: Array<{
    name: string;
    content: string;
  }>;
  stdin?: string;
  compile_timeout?: number;
  run_timeout?: number;
}

export interface PistonResponse {
  language: string;
  version: string;
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

// ============================================
// Project API Types
// ============================================

export interface ProjectInitRequest {
  idea: string;
  language: Language;
  level: Level;
}

export interface ProjectInitResponse {
  project_title: string;        // Arabic title
  mermaid_chart: string;         // Raw Mermaid syntax (no backticks)
  tasks: string[];               // Task descriptions
  full_solution_code: string;    // Complete solution
  starter_filename: string;      // e.g., "game.py"
}

export interface CodeReviewRequest {
  code: string;
  language: Language;
  project_context: {
    title: string;
    tasks: string[];
    current_task_index: number;
  };
  previous_review?: string;
}

export interface CodeReviewResponse {
  review_comment: string;        // Socratic questions/hints
  highlight_line?: number | null; // Optional line number to highlight
  severity: "info" | "warning" | "error"; // Severity level
}

export interface ChatRequest {
  message: string;
  language: Language;
  project_title: string;
  history: Array<{ role: string; content: string }>;
  current_code: string;
}

export interface ChatResponse {
  response: string;
  suggested_reading: string | null;
}

