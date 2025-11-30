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
import { projectsApi } from "@/services/projectsApi";
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

    try {
      // Call backend API to generate project plan
      const requestPayload = {
        idea: idea.trim(),
        language,
        level: profile?.level || "beginner",
      };

      console.log("🔍 Project Init Request:", requestPayload);
      console.log("🔍 About to call projectsApi.initializeProject...");
      const response = await projectsApi.initializeProject(requestPayload);
      console.log("🔍 Received response:", response);
      console.log("🔍 Response keys:", Object.keys(response));
      console.log("🔍 Response validation:", {
        hasTitle: !!response.project_title,
        hasMermaid: !!response.mermaid_chart,
        hasTasks: Array.isArray(response.tasks) && response.tasks.length > 0,
        hasCode: !!response.full_solution_code,
        hasFilename: !!response.starter_filename,
      });

      // Validate response before creating project
      if (!response.project_title || !response.mermaid_chart || !response.tasks || !response.full_solution_code || !response.starter_filename) {
        throw new Error("الاستجابة من الخادم غير مكتملة. بعض البيانات مفقودة.");
      }

      if (!Array.isArray(response.tasks) || response.tasks.length === 0) {
        throw new Error("قائمة المهام فارغة. حاول مرة أخرى.");
      }

      // Transform API response to Project object
      const newProject: Project = {
        id: `project-${Date.now()}`,
        title: response.project_title,
        language,
        filename: response.starter_filename,
        code: `# ${response.project_title}\n# ${idea.trim()}\n\n`, // Start with empty template
        mermaidChart: response.mermaid_chart,
        tasks: response.tasks.map((taskText, index) => ({
          id: `task-${index + 1}`,
          text: taskText,
          completed: false,
        })),
        hiddenSolution: response.full_solution_code,
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

      console.log("🔍 Created project object:", {
        id: newProject.id,
        title: newProject.title,
        tasksCount: newProject.tasks.length,
        hasMermaid: !!newProject.mermaidChart,
        hasCode: !!newProject.hiddenSolution,
      });

      // Save to localStorage
      storageService.saveProject(newProject);

      // Success feedback
      toast.success("تم إنشاء المشروع بنجاح! 🎉");

      // Close modal and navigate
      onOpenChange(false);
      setIdea("");
      setIsGenerating(false);
      navigate(`/project/${newProject.id}`);
    } catch (error: any) {
      setIsGenerating(false);
      console.error("Project generation error:", error);

      // Handle different error types with specific messages
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        toast.error("❌ لا يمكن الاتصال بالخادم. تأكد من أن الخادم يعمل على المنفذ 8000.");
      } else if (error.message?.includes("timeout") || error.message?.includes("مهلة")) {
        toast.error("⏱️ انتهت مهلة الاتصال. الذكاء الاصطناعي يحتاج وقتاً أطول. حاول مرة أخرى.");
      } else if (error.status === 404) {
        toast.error("❌ المسار غير موجود. تحقق من إعدادات الخادم.");
      } else if (error.message) {
        toast.error(error.message);
      } else if (error.retryable) {
        toast.error("فشل في توليد المشروع. حاول مرة أخرى.");
      } else {
        toast.error("حدث خطأ غير متوقع. تحقق من الاتصال بالإنترنت والخادم.");
      }
    }
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
