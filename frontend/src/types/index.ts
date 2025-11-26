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

export interface Challenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  language: Language;
  description: string;
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
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}
