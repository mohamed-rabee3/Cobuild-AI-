import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Lightbulb } from "lucide-react";
import Editor from "@monaco-editor/react";
import { pistonService } from "@/services/piston";
import { toast } from "sonner";

const ChallengeRunner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [code, setCode] = useState("def is_palindrome(s):\n    # Your code here\n    pass");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Mock challenge data
  const challenge = {
    title: "Palindrome Checker",
    description: "Write a function that checks if a string is a palindrome.",
    examples: [
      { input: '"racecar"', output: "True" },
      { input: '"hello"', output: "False" },
    ],
    testCases: [
      { input: "madam", expected: true },
      { input: "python", expected: false },
    ],
  };

  const handleTest = async () => {
    if (!code.trim()) {
      toast.error("الكود فارغ!");
      return;
    }

    setIsRunning(true);
    setOutput("جاري الاختبار...\n");

    try {
      // Mock testing - in real app, call Piston with test cases
      setTimeout(() => {
        setOutput(
          `Testing...\n\n` +
          `✅ Test 1: is_palindrome("madam") → Passed\n` +
          `❌ Test 2: is_palindrome("python") → Failed (Expected: False, Got: True)\n\n` +
          `2/5 test cases passed`
        );
        setIsRunning(false);
      }, 1500);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/challenges")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold">{challenge.title}</h1>
          </div>

          <Button variant="outline" size="sm">
            <Lightbulb className="h-4 w-4 mr-2" />
            تلميح
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Description Panel */}
        <div className="w-2/5 border-r border-border bg-card overflow-y-auto p-6">
          <h2 className="text-lg font-bold mb-4">📝 الوصف</h2>
          <p className="text-muted-foreground mb-6">{challenge.description}</p>

          <h3 className="font-semibold mb-3">أمثلة:</h3>
          <div className="space-y-2 mb-6">
            {challenge.examples.map((ex, i) => (
              <div key={i} className="bg-secondary/30 rounded-lg p-3 font-mono text-sm">
                <div>Input: {ex.input}</div>
                <div className="text-primary">Output: {ex.output}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Panel */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-medium">📝 حلك</span>
            <Button onClick={handleTest} disabled={isRunning} size="sm">
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? "جاري الاختبار..." : "اختبر الحل"}
            </Button>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="python"
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

          {/* Results */}
          <div className="h-48 border-t border-border bg-terminal-bg overflow-y-auto p-4">
            <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">
              {output || "اضغط 'اختبر الحل' لتشغيل الكود"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeRunner;
