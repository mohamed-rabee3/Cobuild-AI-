import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storageService } from "@/services/storage";
import { projectsApi } from "@/services/projectsApi";
import { Project, ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Plus, Trash2, Lightbulb, Send, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import MermaidChart from "@/components/ide/MermaidChart";
import { pistonService } from "@/services/piston";
import { containsArabic } from "@/lib/utils";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const ProjectIDENew = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [inputs, setInputs] = useState("");
  const [showInputModal, setShowInputModal] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/dashboard");
      return;
    }

    const loadedProject = storageService.getProject(id);
    if (!loadedProject) {
      toast.error("المشروع غير موجود");
      navigate("/dashboard");
      return;
    }

    setProject(loadedProject);
    setCode(loadedProject.code);
    // Filter out any messages without content when loading
    const validChatHistory = (loadedProject.chatHistory || []).filter(
      (msg) => msg.content && msg.content.trim().length > 0
    );
    setChatHistory(validChatHistory);
  }, [id, navigate]);

  // Auto-save code every 2 seconds
  useEffect(() => {
    if (!project || !code) return;

    const timer = setTimeout(() => {
      const updatedProject = { ...project, code, lastModified: Date.now() };
      storageService.saveProject(updatedProject);
    }, 2000);

    return () => clearTimeout(timer);
  }, [code, project]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("الكود فارغ!");
      return;
    }

    setIsRunning(true);
    setOutput("$ جاري تشغيل الكود...\n\n");

    try {
      const inputLines = inputs.split("\n").filter(line => line.trim());
      const result = await pistonService.execute(code, project?.language || "python", inputLines);

      if (result.run.code === 0) {
        setOutput(`$ جاري تشغيل ${project?.filename}...\n\n${result.run.output}\n\n✅ انتهى بالرمز 0`);
        toast.success("تم تشغيل الكود بنجاح");
      } else {
        setOutput(`$ جاري تشغيل ${project?.filename}...\n\n${result.run.stderr || result.run.output}\n\n❌ انتهى بالرمز ${result.run.code}`);
        toast.error("حدث خطأ أثناء التنفيذ");
      }
    } catch (error: any) {
      setOutput(`❌ خطأ: ${error.message}`);
      toast.error("فشل تشغيل الكود");
    } finally {
      setIsRunning(false);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    if (!project) return;

    const updatedTasks = project.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const updatedProject = { ...project, tasks: updatedTasks };
    setProject(updatedProject);
    storageService.saveProject(updatedProject);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !project || isChatLoading) return;

    // Save message before clearing
    const messageText = chatMessage.trim();

    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    // Add user message immediately
    const tempHistory = [...chatHistory, userMessage];
    setChatHistory(tempHistory);
    setChatMessage(""); // Clear input after saving message
    setIsChatLoading(true);

    try {
      // Call AI mentor API
      // Filter out messages without content and ensure all required fields are present
      const validHistory = chatHistory
        .filter((msg) => msg.content && msg.content.trim().length > 0)
        .map((msg) => ({
          role: msg.role,
          content: msg.content.trim(),
        }))
        .slice(-10); // Only send last 10 messages to avoid token limits

      const response = await projectsApi.chatWithMentor({
        message: messageText, // Use saved message, not chatMessage (which is now empty)
        language: project.language,
        project_title: project.title,
        history: validHistory,
        current_code: code,
      });

      // Add AI response
      if (!response.response || !response.response.trim()) {
        throw new Error("Empty AI response");
      }

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: response.response.trim(),
        timestamp: Date.now(),
      };

      const updatedHistory = [...tempHistory, aiMessage];
      setChatHistory(updatedHistory);

      // Save to localStorage
      const updatedProject = { ...project, chatHistory: updatedHistory };
      storageService.saveProject(updatedProject);
    } catch (error: any) {
      console.error("Chat error:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        code: error.code,
        originalError: error.originalError,
      });
      
      // Show more specific error message
      if (error.status === 422) {
        toast.error("البيانات المرسلة غير صحيحة. تحقق من الرسالة.");
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("فشل الاتصال بالمساعد الذكي. حاول مرة أخرى.");
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleReviewCode = async () => {
    if (!code.trim() || !project || isReviewLoading) {
      toast.error("اكتب بعض الكود أولاً!");
      return;
    }

    setIsReviewLoading(true);

    try {
      // Calculate current task index
      const currentTaskIndex = project.tasks.findIndex((t) => !t.completed);

      // Call code review API
      const response = await projectsApi.reviewCode({
        code: code.trim(),
        language: project.language,
        project_context: {
          title: project.title,
          tasks: project.tasks.map((t) => t.text),
          current_task_index: currentTaskIndex >= 0 ? currentTaskIndex : 0,
        },
      });

      // Add review message to chat
      if (!response.review_comment || !response.review_comment.trim()) {
        throw new Error("Empty review response");
      }

      const reviewMessage: ChatMessage = {
        role: "assistant",
        content: response.review_comment.trim(),
        timestamp: Date.now(),
      };
      
      console.log("Review response:", response);

      const updatedHistory = [...chatHistory, reviewMessage];
      setChatHistory(updatedHistory);

      // Save to localStorage
      const updatedProject = { ...project, chatHistory: updatedHistory };
      storageService.saveProject(updatedProject);

      toast.success("تمت مراجعة الكود! 🔬");
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error("فشل تحليل الكود. حاول مرة أخرى.");
    } finally {
      setIsReviewLoading(false);
    }
  };

  if (!project) return null;

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const inputCount = inputs.split("\n").filter(line => line.trim()).length;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold">{project.title}</h1>
          </div>

          <div className="text-sm text-muted-foreground">
            {completedTasks} / {project.tasks.length} مهام
          </div>
        </div>
      </header>

      {/* Main Layout - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Plan (20%) */}
        <div className="w-1/5 border-r border-border bg-card overflow-hidden flex flex-col">
          <Tabs defaultValue="tasks" className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b border-border shrink-0">
              <TabsTrigger value="blueprint" className="flex-1">المخطط</TabsTrigger>
              <TabsTrigger value="tasks" className="flex-1">المهام</TabsTrigger>
            </TabsList>

            <TabsContent value="blueprint" className="flex-1 overflow-hidden m-0 p-0">
              <MermaidChart chart={project.mermaidChart} />
            </TabsContent>

            <TabsContent value="tasks" className="flex-1 overflow-y-auto m-0 p-4 space-y-3">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors ${containsArabic(task.text) ? "flex-row-reverse" : ""}`}
                  dir={containsArabic(task.text) ? "rtl" : "ltr"}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                    className="mt-1"
                  />
                  <span
                    className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                  >
                    {task.text}
                  </span>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground text-center">
                  {completedTasks} / {project.tasks.length} مكتمل
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Column 2: Workspace (55%) */}
        <div className="w-[55%] flex flex-col">
          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between shrink-0">
                <span className="text-sm font-medium">📄 {project.filename}</span>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={project.language}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    suggestOnTriggerCharacters: false,
                    quickSuggestions: false,
                    parameterHints: { enabled: false },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="h-64 border-t border-border bg-terminal-bg flex flex-col shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <Button size="sm" variant="outline" onClick={() => setShowInputModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                إضافة مدخلات {inputCount > 0 && `(${inputCount})`}
              </Button>

              <Button size="sm" onClick={handleRunCode} disabled={isRunning}>
                <Play className="h-4 w-4 mr-1" />
                {isRunning ? "جاري التشغيل..." : "تشغيل الكود"}
              </Button>

              <Button size="sm" variant="ghost" onClick={() => setOutput("")}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">
                {output || "اضغط 'تشغيل الكود' لتنفيذ الكود"}
              </pre>
            </div>
          </div>
        </div>

        {/* Column 3: Mentor (25%) */}
        <div className="w-1/4 border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border shrink-0">
            <Button className="w-full" variant="outline" onClick={() => setShowSolutionModal(true)}>
              <Lightbulb className="h-4 w-4 mr-2" />
              عرض الحل
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, i) => {
              const isArabic = containsArabic(msg.content);
              return (
                <div
                  key={i}
                  className={`rounded-lg p-3 ${msg.role === "assistant"
                    ? "bg-primary/10 text-foreground"
                    : "bg-secondary/50 ml-4"
                    }`}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  <p className={`text-xs font-medium mb-2 ${isArabic ? "text-right" : "text-left"}`}>
                    {msg.role === "assistant" ? "🤖 المعلم الذكي" : "👤 أنت"}
                  </p>
                  <div className="text-sm">
                    <MarkdownRenderer content={msg.content} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border space-y-2 shrink-0">
            {/* Chat Input with Send Button */}
            <div className="relative">
              <Textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="اسأل الـ AI..."
                className="resize-none h-20 pl-12"
                dir="rtl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatMessage.trim()}
                className="absolute top-1/2 left-2 -translate-y-1/2 h-9 w-9 rounded-full p-0 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                size="icon"
                aria-label="إرسال"
              >
                {isChatLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button variant="outline" className="w-full" size="sm" onClick={handleReviewCode} disabled={isReviewLoading || !code.trim()}>
              {isReviewLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري المراجعة...
                </>
              ) : (
                <>
                  🔬 مراجعة الكود
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Input Modal */}
      <Dialog open={showInputModal} onOpenChange={setShowInputModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚙️ إعداد المدخلات</DialogTitle>
            <DialogDescription>
              إذا كان كودك يستخدم input()، أدخل القيم هنا (سطر واحد لكل مدخل)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inputs">المدخلات (كل سطر = مدخل واحد)</Label>
              <Textarea
                id="inputs"
                value={inputs}
                onChange={(e) => setInputs(e.target.value)}
                rows={5}
                placeholder="50&#10;25&#10;37"
                className="font-mono"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              💡 كل سطر يمثل استدعاء واحد لـ input()
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setInputs("")} className="flex-1">
              مسح الكل
            </Button>
            <Button onClick={() => setShowInputModal(false)} className="flex-1">
              حفظ وإغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Solution Modal */}
      <Dialog open={showSolutionModal} onOpenChange={setShowSolutionModal}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>💡 الحل النموذجي</DialogTitle>
            <DialogDescription>
              هذا تطبيق كامل للمشروع. ادرسه بعناية، لكن حاول أن تكتب كودك أولاً! 🚀
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden rounded-lg border border-border">
            <Editor
              height="100%"
              language={project.language}
              value={project.hiddenSolution}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(project.hiddenSolution);
                toast.success("تم نسخ الكود!");
              }}
              className="flex-1"
            >
              نسخ الكود
            </Button>
            <Button onClick={() => setShowSolutionModal(false)} className="flex-1">
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectIDENew;
