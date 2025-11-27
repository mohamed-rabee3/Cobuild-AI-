/**
 * Custom React Query hooks for challenges
 */
import { useMutation } from '@tanstack/react-query';
import { generateChallenges, ChallengeGenerateRequest, ChallengeFromAPI } from '@/services/challengesApi';
import { Challenge } from '@/types';
import { storageService } from '@/services/storage';
import { toast } from 'sonner';

/**
 * Hook for generating challenges via API
 */
export function useGenerateChallenges(onSuccess?: (challenges: Challenge[]) => void) {
    return useMutation({
        mutationFn: async (request: ChallengeGenerateRequest) => {
            const response = await generateChallenges(request);
            // Return both challenges and request context
            return { challenges: response.challenges, request };
        },
        onSuccess: ({ challenges: apiChallenges, request }) => {
            // Transform API challenges to frontend Challenge format
            const challenges: Challenge[] = apiChallenges.map((apiChallenge, index) => ({
                id: `challenge-${Date.now()}-${index}`,
                title: apiChallenge.title,
                description: apiChallenge.description,
                difficulty: request.difficulty,
                language: request.language,
                function_signature: apiChallenge.function_signature,
                test_cases: apiChallenge.test_cases,
                solved: false,
                createdAt: Date.now() - index,
            }));

            // Save to localStorage
            storageService.addChallenges(challenges);

            // Show success toast
            toast.success(`✅ Generated ${challenges.length} new challenge${challenges.length > 1 ? 's' : ''}!`);

            // Call parent callback
            if (onSuccess) {
                onSuccess(challenges);
            }
        },
        onError: (error: any) => {
            const message = error.message || 'Failed to generate challenges. Please try again.';
            const isRetryable = error.retryable ?? true;

            toast.error(message, {
                description: isRetryable ? 'You can try again' : 'Please check your settings',
            });
        },
    });
}
