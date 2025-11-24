import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storageService } from "@/services/storage";
import { Language, Project } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewProjectModal = ({ open, onOpenChange }: NewProjectModalProps) => {
  const navigate = useNavigate();
  const [idea, setIdea] = useState("");
  const [language, setLanguage] = useState<Language>("python");
  const [isGenerating, setIsGenerating] = useState(false);

  const profile = storageService.getProfile();

  const handleGenerate = async () => {
    if (!idea.trim() || idea.length < 10) {
      toast.error("الرجاء وصف فكرة مشروعك بشكل أوضح (10 أحرف على الأقل)");
      return;
    }

    setIsGenerating(true);

    // Mock AI generation - in real app, call backend API
    setTimeout(() => {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        title: idea.trim().slice(0, 50),
        language,
        filename: language === "python" ? "main.py" : language === "javascript" ? "main.js" : "main.cpp",
        code: `# ${idea}\n# Start coding here...\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()`,
        mermaidChart: `graph TD\n    A[Start] --> B[Initialize]\n    B --> C[Process]\n    C --> D[Output]\n    D --> E[End]`,
        tasks: [
          { id: "task-1", text: "إعداد المشروع الأساسي", completed: false },
          { id: "task-2", text: "إضافة المدخلات", completed: false },
          { id: "task-3", text: "معالجة البيانات", completed: false },
          { id: "task-4", text: "عرض النتائج", completed: false },
          { id: "task-5", text: "اختبار البرنامج", completed: false },
        ],
        hiddenSolution: `# Complete solution\ndef main():\n    print("Complete implementation")\n\nif __name__ == "__main__":\n    main()`,
        chatHistory: [
          {
            role: "assistant",
            content: "مرحباً! أنا هنا لمساعدتك في بناء مشروعك. ابدأ بالتفكير في الخطوة الأولى!",
            timestamp: Date.now(),
          },
        ],
        lastModified: Date.now(),
        createdAt: Date.now(),
      };

      storageService.saveProject(newProject);
      toast.success("تم إنشاء المشروع بنجاح! 🎉");
      onOpenChange(false);
      setIdea("");
      navigate(`/project/${newProject.id}`);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✨ إنشاء مشروع جديد
          </DialogTitle>
          <DialogDescription>
            صف فكرة مشروعك وسيقوم الذكاء الاصطناعي بإنشاء خطة كاملة لك
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="idea">ما الذي تريد بناءه؟</Label>
            <Textarea
              id="idea"
              placeholder="مثال: آلة حاسبة، لعبة تخمين الأرقام، برنامج إدارة مهام..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
              className="resize-none"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">لغة البرمجة</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">🐍 Python</SelectItem>
                <SelectItem value="javascript">⚡ JavaScript</SelectItem>
                <SelectItem value="cpp">⚙️ C++</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isGenerating}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleGenerate}
            className="flex-1"
            disabled={isGenerating || !idea.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              "إنشاء المشروع →"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;
