import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storageService } from "@/services/storage";
import { Language, Level } from "@/types";
import { Target, Sprout, TreeDeciduous, Code2 } from "lucide-react";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [language, setLanguage] = useState<Language>("python");
  const [isLoading, setIsLoading] = useState(false);

  const levels: Array<{ value: Level; label: string; icon: typeof Sprout; description: string }> = [
    { value: "beginner", label: "مبتدئ", icon: Sprout, description: "أبدأ من الصفر" },
    { value: "intermediate", label: "متوسط", icon: TreeDeciduous, description: "أعرف الأساسيات" },
    { value: "advanced", label: "متقدم", icon: Code2, description: "لدي خبرة جيدة" },
  ];

  const languages: Array<{ value: Language; label: string; emoji: string }> = [
    { value: "python", label: "Python", emoji: "🐍" },
    { value: "javascript", label: "JavaScript", emoji: "⚡" },
    { value: "cpp", label: "C++", emoji: "⚙️" },
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("الرجاء إدخال اسمك");
      return;
    }

    if (name.length < 2 || name.length > 30) {
      toast.error("الاسم يجب أن يكون بين 2 و 30 حرفاً");
      return;
    }

    setIsLoading(true);

    try {
      const profile = {
        name: name.trim(),
        level,
        language,
        createdAt: Date.now(),
      };

      storageService.setProfile(profile);
      toast.success(`مرحباً ${name}! 🎉`);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      toast.error("حدث خطأ. حاول مرة أخرى");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Target className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Cobuild AI
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            تعلم البرمجة من خلال بناء مشاريع حقيقية
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-8 shadow-lg">
          {/* Name Input */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-lg">ما اسمك؟</Label>
            <Input
              id="name"
              type="text"
              placeholder="أدخل اسمك..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg"
              maxLength={30}
              dir="rtl"
            />
          </div>

          {/* Level Selection */}
          <div className="space-y-4">
            <Label className="text-lg">حدد مستواك:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {levels.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  onClick={() => setLevel(value)}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all duration-200
                    hover:scale-105 hover:shadow-md
                    ${
                      level === value
                        ? "border-primary bg-primary/5 shadow-accent"
                        : "border-border bg-secondary/30"
                    }
                  `}
                >
                  <Icon className={`h-8 w-8 mb-3 mx-auto ${level === value ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-center">
                    <p className="font-semibold mb-1">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-4">
            <Label className="text-lg">اختر لغتك المفضلة:</Label>
            <div className="flex gap-3">
              {languages.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => setLanguage(value)}
                  className={`
                    flex-1 p-4 rounded-xl border-2 transition-all duration-200
                    hover:scale-105
                    ${
                      language === value
                        ? "border-primary bg-primary/10 shadow-accent"
                        : "border-border bg-secondary/30"
                    }
                  `}
                >
                  <div className="text-3xl mb-2">{emoji}</div>
                  <p className="font-medium">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isLoading ? "جاري الإعداد..." : "ابدأ التعلم →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
