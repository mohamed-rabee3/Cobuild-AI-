import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Lightbulb } from "lucide-react";
import Editor from "@monaco-editor/react";
import { pistonService } from "@/services/piston";
import { toast } from "sonner";
import { storageService } from "@/services/storage";
import { Challenge } from "@/types";

const ChallengeRunner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  // Load challenge from localStorage based on ID
  useEffect(() => {
    if (!id) {
      toast.error("Challenge ID missing");
      navigate("/challenges");
      return;
    }

    const challenges = storageService.getChallenges();
    const foundChallenge = challenges.find((c) => c.id === id);

    if (!foundChallenge) {
      toast.error("Challenge not found");
      navigate("/challenges");
      return;
    }

    setChallenge(foundChallenge);

    // Set initial code to function signature
    setCode(foundChallenge.function_signature + "\n    # Your code here\n    pass");
  }, [id, navigate]);

  // Return loading state while challenge loads
  if (!challenge) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  const handleTest = async () => {
    if (!code.trim()) {
      toast.error("الكود فارغ!");
      return;
    }

    setIsRunning(true);
    setOutput("🔄 جاري الاختبار...\n");

    try {
      let passedCount = 0;
      const totalTests = challenge.test_cases.length;
      let outputText = "Testing...\n\n";

      // Run each test case
      for (let i = 0; i < challenge.test_cases.length; i++) {
        const testCase = challenge.test_cases[i];

        // Create test runner code based on language
        let testCode = "";
        if (challenge.language === "python") {
          testCode = `${code}\n\n# Test execution\nprint(${testCase.input})`;
        } else if (challenge.language === "javascript") {
          testCode = `${code}\n\n// Test execution\nconsole.log(${testCase.input});`;
        } else if (challenge.language === "cpp") {
          // For C++, need to wrap in main function
          testCode = `#include <iostream>\nusing namespace std;\n\n${code}\n\nint main() {\n    cout << ${testCase.input} << endl;\n    return 0;\n}`;
        }

        try {
          // Execute code with Piston
          const result = await pistonService.execute(testCode, challenge.language);

          const actualOutput = result.run?.stdout?.trim() || result.run?.output?.trim() || "";

          // Parse expected output - remove surrounding quotes if it's a string
          let expectedOutput = String(testCase.expected).trim();
          // Remove surrounding quotes if present (e.g., "hello" -> hello)
          if (expectedOutput.startsWith('"') && expectedOutput.endsWith('"')) {
            expectedOutput = expectedOutput.slice(1, -1);
          } else if (expectedOutput.startsWith("'") && expectedOutput.endsWith("'")) {
            expectedOutput = expectedOutput.slice(1, -1);
          }

          const passed = actualOutput === expectedOutput;

          if (passed) passedCount++;

          // Build output display
          const testLabel = testCase.hidden ? `Hidden Test ${i + 1}` : `Test ${i + 1}`;
          const inputDisplay = testCase.hidden ? "[Hidden]" : testCase.input;

          if (passed) {
            outputText += `✅ ${testLabel}: ${inputDisplay} → Passed\n`;
          } else {
            outputText += `❌ ${testLabel}: ${inputDisplay} → Failed\n`;
            // TEMPORARILY show hidden test details for debugging
            outputText += `   Expected: "${expectedOutput}"\n`;
            outputText += `   Got: "${actualOutput}"\n`;
            outputText += `   Input was: ${testCase.input}\n`;
          }

          // Show compile/runtime errors if any
          if (result.compile?.stderr) {
            outputText += `   ⚠️ Compile Error: ${result.compile.stderr}\n`;
          }
          if (result.run?.stderr) {
            outputText += `   ⚠️ Runtime Error: ${result.run.stderr}\n`;
          }
        } catch (testError: any) {
          outputText += `❌ Test ${i + 1}: Error executing test\n`;
          outputText += `   ${testError.message}\n`;
        }

        outputText += "\n";
      }

      // Summary
      outputText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      outputText += `📊 Results: ${passedCount}/${totalTests} test cases passed\n`;

      if (passedCount === totalTests) {
        outputText += `\n🎉 Excellent! All tests passed!\n`;
        // Mark challenge as solved
        storageService.markChallengeSolved(challenge.id);
        toast.success("تهانينا! حليت التحدي بنجاح! 🎉");
      } else {
        outputText += `\n💡 Keep trying! ${totalTests - passedCount} test(s) need fixing.\n`;
      }

      setOutput(outputText);
    } catch (error: any) {
      setOutput(`❌ Error: ${error.message}\n\nPlease check your code and try again.`);
      toast.error("حدث خطأ أثناء التشغيل");
    } finally {
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
          <h2 className="text-lg font-bold mb-4 text-right" dir="rtl">📝 الوصف</h2>

          {/* Render description as markdown-like text (split by paragraphs) - RTL for Arabic */}
          <div className="text-muted-foreground mb-6 space-y-3 text-right" dir="rtl">
            {challenge.description.split('\n').map((paragraph, i) => (
              paragraph.trim() && <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </div>

          <h3 className="font-semibold mb-3 text-right" dir="rtl">أمثلة:</h3>
          <div className="space-y-2 mb-6">
            {challenge.test_cases
              .filter((tc) => !tc.hidden)
              .slice(0, 3)
              .map((tc, i) => (
                <div key={i} className="bg-secondary/30 rounded-lg p-3 font-mono text-sm">
                  <div>Input: {tc.input}</div>
                  <div className="text-primary">Expected: {tc.expected}</div>
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
              defaultLanguage={challenge.language === "cpp" ? "cpp" : challenge.language}
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
