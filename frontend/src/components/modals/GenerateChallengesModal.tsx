import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Challenge, Language } from "@/types";
import { storageService } from "@/services/storage";
import { useGenerateChallenges } from "@/hooks/useChallenges";

interface GenerateChallengesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onChallengesGenerated: (challenges: Challenge[]) => void;
}

const GenerateChallengesModal = ({
    open,
    onOpenChange,
    onChallengesGenerated
}: GenerateChallengesModalProps) => {
    const [count, setCount] = useState([3]);
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
    const [language, setLanguage] = useState<Language>(() => {
        // Get user's preferred language from profile
        const profile = storageService.getProfile();
        return profile?.language || "python";
    });

    // Use the custom React Query hook
    const generateMutation = useGenerateChallenges((challenges) => {
        // Notify parent component
        onChallengesGenerated(challenges);

        // Close modal
        onOpenChange(false);

        // Reset form
        setCount([3]);
        setDifficulty("medium");
    });

    const handleGenerate = async () => {
        // Collect existing titles to avoid duplicates
        const existingChallenges = storageService.getChallenges();
        const existingTitles = existingChallenges.map((c) => c.title);

        // Call the API via mutation
        generateMutation.mutate({
            count: count[0],
            difficulty,
            language,
            existing_titles: existingTitles
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">✨ إنشاء تحديات جديدة</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Challenge Count Slider */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">كم عدد التحديات؟</label>
                        <div className="px-2">
                            <Slider
                                value={count}
                                onValueChange={setCount}
                                min={1}
                                max={5}
                                step={1}
                                className="w-full"
                            />
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                            </div>
                            <div className="text-center mt-2 text-2xl font-bold text-primary">
                                {count[0]}
                            </div>
                        </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">مستوى الصعوبة</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setDifficulty("easy")}
                                className={`
                  p-4 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-2
                  ${difficulty === "easy"
                                        ? "border-accent bg-accent/10"
                                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                                    }
                `}
                            >
                                <span className="text-2xl">🟢</span>
                                <span className="text-sm font-medium">سهل</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDifficulty("medium")}
                                className={`
                  p-4 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-2
                  ${difficulty === "medium"
                                        ? "border-accent bg-accent/10"
                                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                                    }
                `}
                            >
                                <span className="text-2xl">🟡</span>
                                <span className="text-sm font-medium">متوسط</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDifficulty("hard")}
                                className={`
                  p-4 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-2
                  ${difficulty === "hard"
                                        ? "border-accent bg-accent/10"
                                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                                    }
                `}
                            >
                                <span className="text-2xl">🔴</span>
                                <span className="text-sm font-medium">صعب</span>
                            </button>
                        </div>
                    </div>

                    {/* Language Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">لغة البرمجة</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setLanguage("python")}
                                className={`
                  p-4 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-2
                  ${language === "python"
                                        ? "border-accent bg-accent/10"
                                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                                    }
                `}
                            >
                                <span className="text-2xl">🐍</span>
                                <span className="text-sm font-medium">Python</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setLanguage("javascript")}
                                className={`
                  p-4 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-2
                  ${language === "javascript"
                                        ? "border-accent bg-accent/10"
                                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                                    }
                `}
                            >
                                <span className="text-2xl">⚡</span>
                                <span className="text-sm font-medium">JavaScript</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setLanguage("cpp")}
                                className={`
                  p-4 rounded-lg border-2 transition-all
                  flex flex-col items-center gap-2
                  ${language === "cpp"
                                        ? "border-accent bg-accent/10"
                                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                                    }
                `}
                            >
                                <span className="text-2xl">⚙️</span>
                                <span className="text-sm font-medium">C++</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                        disabled={generateMutation.isPending}
                    >
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        className="flex-1"
                        disabled={generateMutation.isPending}
                    >
                        {generateMutation.isPending ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                جاري الإنشاء...
                            </>
                        ) : (
                            <>إنشاء ({count[0]}) →</>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GenerateChallengesModal;
