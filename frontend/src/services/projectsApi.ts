/**
 * API service for project-related operations
 */
import apiClient from './api';
import {
    ProjectInitRequest,
    ProjectInitResponse,
    CodeReviewRequest,
    CodeReviewResponse,
    ChatRequest,
    ChatResponse,
} from '@/types';

export const projectsApi = {
    /**
     * Initialize a new project with AI-generated plan
     * POST /api/project/init
     */
    async initializeProject(request: ProjectInitRequest): Promise<ProjectInitResponse> {
        console.log('[projectsApi] initializeProject called with:', request);
        try {
            const response = await apiClient.post<ProjectInitResponse>('/api/project/init', request);
            console.log('[projectsApi] initializeProject success:', response.data);
            return response.data;
        } catch (error) {
            console.error('[projectsApi] initializeProject error:', error);
            throw error;
        }
    },

    /**
     * Get Socratic code review from AI mentor
     * POST /api/project/review
     */
    async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
        const response = await apiClient.post<CodeReviewResponse>('/api/project/review', request);
        return response.data;
    },

    /**
     * Chat with AI mentor about the project
     * POST /api/project/chat
     */
    async chatWithMentor(request: ChatRequest): Promise<ChatResponse> {
        const response = await apiClient.post<ChatResponse>('/api/project/chat', request);
        return response.data;
    },
};
