import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storageService } from "@/services/storage";
import { Project, ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Plus, Trash2, Lightbulb, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import MermaidChart from "@/components/ide/MermaidChart";
import { pistonService } from "@/services/piston";

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
    setChatHistory(loadedProject.chatHistory || []);
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
    setOutput("$ Running code...\n\n");

    try {
      const inputLines = inputs.split("\n").filter(line => line.trim());
      const result = await pistonService.execute(code, project?.language || "python", inputLines);

      if (result.run.code === 0) {
        setOutput(`$ Running ${project?.filename}...\n\n${result.run.output}\n\n✅ Exited with code 0`);
        toast.success("تم تشغيل الكود بنجاح");
      } else {
        setOutput(`$ Running ${project?.filename}...\n\n${result.run.stderr || result.run.output}\n\n❌ Exited with code ${result.run.code}`);
        toast.error("حدث خطأ أثناء التنفيذ");
      }
    } catch (error: any) {
      setOutput(`❌ Error: ${error.message}`);
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

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !project) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatMessage,
      timestamp: Date.now(),
    };

    // Mock AI response
    const aiMessage: ChatMessage = {
      role: "assistant",
      content: "هذه رسالة تجريبية من الذكاء الاصطناعي. سيتم ربط الـ AI في المرحلة القادمة! 🤖",
      timestamp: Date.now() + 1000,
    };

    const updatedHistory = [...chatHistory, userMessage, aiMessage];
    setChatHistory(updatedHistory);

    const updatedProject = { ...project, chatHistory: updatedHistory };
    storageService.saveProject(updatedProject);

    setChatMessage("");
    toast.info("ميزة الـ AI قيد التطوير");
  };

  const handleReviewCode = () => {
    if (!code.trim()) {
      toast.error("اكتب بعض الكود أولاً!");
      return;
    }

    const reviewMessage: ChatMessage = {
      role: "assistant",
      content: "رائع! الكود يبدو جيداً. لكن هل فكرت في معالجة الأخطاء المحتملة؟ 🤔",
      timestamp: Date.now(),
    };

    setChatHistory([...chatHistory, reviewMessage]);
    toast.info("تم مراجعة الكود - نسخة تجريبية");
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
              <TabsTrigger value="blueprint" className="flex-1">Blueprint</TabsTrigger>
              <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="blueprint" className="flex-1 overflow-hidden m-0 p-0">
              <MermaidChart chart={project.mermaidChart} />
            </TabsContent>

            <TabsContent value="tasks" className="flex-1 overflow-y-auto m-0 p-4 space-y-3">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                    className="mt-1"
                  />
                  <span
                    className={`text-sm ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground text-center">
                  {completedTasks} / {project.tasks.length} completed
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
                Add Inputs {inputCount > 0 && `(${inputCount})`}
              </Button>

              <Button size="sm" onClick={handleRunCode} disabled={isRunning}>
                <Play className="h-4 w-4 mr-1" />
                {isRunning ? "Running..." : "Run Code"}
              </Button>

              <Button size="sm" variant="ghost" onClick={() => setOutput("")}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">
                {output || "Press Run to execute your code"}
              </pre>
            </div>
          </div>
        </div>

        {/* Column 3: Mentor (25%) */}
        <div className="w-1/4 border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border shrink-0">
            <Button className="w-full" variant="outline" onClick={() => setShowSolutionModal(true)}>
              <Lightbulb className="h-4 w-4 mr-2" />
              Show Solution
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 ${
                  msg.role === "assistant"
                    ? "bg-primary/10 text-foreground"
                    : "bg-secondary/50 ml-4"
                }`}
              >
                <p className="text-xs font-medium mb-1">
                  {msg.role === "assistant" ? "🤖 AI Mentor" : "👤 أنت"}
                </p>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border space-y-2 shrink-0">
            <Textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="اسأل الـ AI..."
              className="resize-none h-20"
              dir="rtl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <Button onClick={handleSendMessage} className="w-full" size="sm">
              <Send className="h-4 w-4 mr-2" />
              إرسال
            </Button>

            <Button variant="outline" className="w-full" size="sm" onClick={handleReviewCode}>
              🔬 Review My Code
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
