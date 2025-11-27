import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Challenge } from "@/types";
import { storageService } from "@/services/storage";
import GenerateChallengesModal from "@/components/modals/GenerateChallengesModal";

const Challenges = () => {
  const navigate = useNavigate();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Load challenges from localStorage on mount
  useEffect(() => {
    const loadedChallenges = storageService.getChallenges();
    setChallenges(loadedChallenges);
  }, []);

  // Filter challenges by difficulty
  const filteredChallenges = challenges.filter((challenge) => {
    if (selectedDifficulty === "all") return true;
    return challenge.difficulty === selectedDifficulty;
  });

  const getDifficultyIcon = (difficulty: Challenge["difficulty"]) => {
    switch (difficulty) {
      case "easy": return "🟢";
      case "medium": return "🟡";
      case "hard": return "🔴";
    }
  };

  const getLanguageIcon = (language: Challenge["language"]) => {
    switch (language) {
      case "python": return "🐍";
      case "javascript": return "⚡";
      case "cpp": return "⚙️";
    }
  };

  const handleChallengesGenerated = (newChallenges: Challenge[]) => {
    // Prepend new challenges
    const updated = [...newChallenges, ...challenges];
    setChallenges(updated);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearChallenges = () => {
    // Clear from localStorage
    storageService.clearChallenges();
    // Clear from state
    setChallenges([]);
    // Close dialog
    setShowClearDialog(false);
    // Show toast
    toast.success("All challenges cleared");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">⚔️ Daily Challenges</h1>

          <div className="flex items-center gap-2">
            {challenges.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Generate Challenges Button - Full Width Banner */}
        <Button
          onClick={() => setShowGenerateModal(true)}
          className="w-full mb-6 h-12 text-lg"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          + Generate New Challenges
        </Button>

        {/* Filter Tabs */}
        <Tabs
          defaultValue="all"
          className="mb-6"
          onValueChange={setSelectedDifficulty}
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedDifficulty} className="mt-6">
            {filteredChallenges.length === 0 ? (
              // Empty State
              <div className="text-center py-16 px-4">
                <div className="bg-card border border-border rounded-xl p-8 max-w-md mx-auto">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold mb-2">No challenges yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Click "Generate New Challenges" to create your first problems!
                  </p>
                  <Button onClick={() => setShowGenerateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Challenges
                  </Button>
                </div>
              </div>
            ) : (
              // Challenges Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`
                      bg-card border border-border rounded-xl p-6 
                      transition-all duration-200
                      hover:shadow-lg hover:scale-105 cursor-pointer
                    `}
                    onClick={() => !challenge.solved && navigate(`/challenge/${challenge.id}`)}
                  >
                    {/* Difficulty Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl">
                        {getDifficultyIcon(challenge.difficulty)}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                        {challenge.difficulty}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                      {challenge.title}
                    </h3>

                    {/* Language Icon */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">
                        {getLanguageIcon(challenge.language)}
                      </span>
                      <span className="text-sm text-muted-foreground capitalize">
                        {challenge.language}
                      </span>
                    </div>

                    {/* Action Button */}
                    {challenge.solved ? (
                      <Button
                        variant="outline"
                        className="w-full bg-success/10 border-success/30 text-success hover:bg-success/20"
                        disabled
                      >
                        ✅ Solved
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                      >
                        Solve →
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <GenerateChallengesModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        onChallengesGenerated={handleChallengesGenerated}
      />

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Challenges?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {challenges.length} challenge{challenges.length > 1 ? 's' : ''} from your list.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearChallenges}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Challenges;
