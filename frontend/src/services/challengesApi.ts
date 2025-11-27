/**
 * API functions for challenges endpoints
 */
import apiClient from './api';
import { Language } from '@/types';

// Backend API types matching Pydantic models
export interface TestCase {
    input: string;
    expected: string;
    hidden: boolean;
}

export interface ChallengeFromAPI {
    title: string;
    description: string;
    function_signature: string;
    test_cases: TestCase[];
}

export interface ChallengeGenerateRequest {
    count: number;
    difficulty: 'easy' | 'medium' | 'hard';
    language: Language;
    existing_titles: string[];
}

export interface ChallengeGenerateResponse {
    challenges: ChallengeFromAPI[];
}

/**
 * Generate coding challenges via API
 */
export async function generateChallenges(
    request: ChallengeGenerateRequest
): Promise<ChallengeGenerateResponse> {
    const response = await apiClient.post<ChallengeGenerateResponse>(
        '/api/challenges/generate',
        request
    );
    return response.data;
}
