import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CheckCircle2, Plus } from "lucide-react";
import { Challenge } from "@/types";
import NewChallengeModal from "@/components/modals/NewChallengeModal";

const Challenges = () => {
  const navigate = useNavigate();
  const [showNewModal, setShowNewModal] = useState(false);

  // Mock challenges data
  const challenges: Challenge[] = [
    {
      id: "challenge-1",
      title: "Sum Two Numbers",
      difficulty: "easy",
      description: "Write a function that adds two numbers",
      completed: true,
      locked: false,
    },
    {
      id: "challenge-2",
      title: "Palindrome Checker",
      difficulty: "medium",
      description: "Check if a string is a palindrome",
      completed: false,
      locked: false,
    },
    {
      id: "challenge-3",
      title: "Fibonacci Sequence",
      difficulty: "hard",
      description: "Generate Fibonacci numbers",
      completed: false,
      locked: true,
    },
  ];

  const getDifficultyColor = (difficulty: Challenge["difficulty"]) => {
    switch (difficulty) {
      case "easy": return "text-success bg-success/10";
      case "medium": return "text-warning bg-warning/10";
      case "hard": return "text-destructive bg-destructive/10";
    }
  };

  const getDifficultyIcon = (difficulty: Challenge["difficulty"]) => {
    switch (difficulty) {
      case "easy": return "🟢";
      case "medium": return "🟡";
      case "hard": return "🔴";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">⚔️ التحديات اليومية</h1>
          </div>

          <Button onClick={() => setShowNewModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            إنشاء تحدي
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-warning/20 to-warning/5 border border-warning/30 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            🚀 قريباً
          </h2>
          <p className="text-muted-foreground">
            نعمل على إضافة تحديات برمجية يومية لمساعدتك على تطوير مهاراتك. ترقب التحديث القادم!
          </p>
        </div>

        {/* Challenges Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`
                bg-card border border-border rounded-xl p-6 
                transition-all duration-200
                ${challenge.locked ? "opacity-60" : "hover:shadow-lg hover:scale-105 cursor-pointer"}
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`text-2xl inline-block px-3 py-1 rounded-lg ${getDifficultyColor(challenge.difficulty)}`}>
                  {getDifficultyIcon(challenge.difficulty)}
                </span>
                
                {challenge.completed && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
                {challenge.locked && (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <h3 className="font-bold mb-2">{challenge.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {challenge.description}
              </p>

              {challenge.completed ? (
                <div className="text-sm text-success font-medium">
                  ✅ مكتمل
                </div>
              ) : challenge.locked ? (
                <div className="text-sm text-muted-foreground">
                  🔒 مقفل
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate(`/challenge/${challenge.id}`)}
                >
                  حل التحدي →
                </Button>
              )}
            </div>
          ))}
        </div>
      </main>

      <NewChallengeModal open={showNewModal} onOpenChange={setShowNewModal} />
    </div>
  );
};

export default Challenges;
