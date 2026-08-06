"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { Play, Bug, Zap, Clock, HardDrive, AlertTriangle, Lightbulb, CheckCircle, XCircle, Loader2, RefreshCw, Code2, Terminal } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { executeCode, analyzeComplexity, detectEdgeCases, generateAlternativeSolutions, reviewBestPractices, debugCode } from "@/services/coding-interview-service";

export type TestCase = {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  status?: "pending" | "passed" | "failed";
  actualOutput?: string;
  error?: string;
};

export type ComplexityAnalysis = {
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
};

export type EdgeCase = {
  description: string;
  severity: "low" | "medium" | "high";
  suggestion: string;
};

export type AlternativeSolution = {
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: string;
  explanation: string;
};

export type BestPracticeIssue = {
  category: string;
  issue: string;
  suggestion: string;
  severity: "low" | "medium" | "high";
};

export type DebugInfo = {
  issues: Array<{
    line: number;
    type: "error" | "warning" | "info";
    message: string;
    suggestion?: string;
  }>;
  fixes: string[];
};

const defaultCode = `function solution(input) {
  // Write your solution here
  return input;
}`;

const codingProblems = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"]
  },
  {
    id: "2",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      { input: "s = \"abcabcbb\"", output: "3" },
      { input: "s = \"bbbbb\"", output: "1" }
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces"]
  }
];

export default function CodingInterviewPage() {
  const router = useRouter();
  const [selectedProblem, setSelectedProblem] = useState(codingProblems[0]);
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState("javascript");
  const [executing, setExecuting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: "1", input: "[2,7,11,15], 9", expectedOutput: "[0,1]", isHidden: false },
    { id: "2", input: "[3,2,4], 6", expectedOutput: "[1,2]", isHidden: false },
    { id: "3", input: "[3,3], 6", expectedOutput: "[0,1]", isHidden: true },
    { id: "4", input: "[-1,-2,-3,-4,-5], -8", expectedOutput: "[2,4]", isHidden: true },
  ]);
  const [complexity, setComplexity] = useState<ComplexityAnalysis | null>(null);
  const [edgeCases, setEdgeCases] = useState<EdgeCase[]>([]);
  const [alternativeSolutions, setAlternativeSolutions] = useState<AlternativeSolution[]>([]);
  const [bestPractices, setBestPractices] = useState<BestPracticeIssue[]>([]);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [activeTab, setActiveTab] = useState("editor");

  async function handleRunCode() {
    setExecuting(true);
    try {
      const results = await executeCode(code, language, testCases);
      setTestCases(results);
    } catch (error) {
      console.error("Execution failed:", error);
    } finally {
      setExecuting(false);
    }
  }

  async function handleAnalyzeComplexity() {
    setAnalyzing(true);
    try {
      const analysis = await analyzeComplexity(code, language);
      setComplexity(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDetectEdgeCases() {
    setAnalyzing(true);
    try {
      const cases = await detectEdgeCases(code, language, selectedProblem);
      setEdgeCases(cases);
    } catch (error) {
      console.error("Edge case detection failed:", error);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGenerateAlternatives() {
    setAnalyzing(true);
    try {
      const solutions = await generateAlternativeSolutions(code, language, selectedProblem);
      setAlternativeSolutions(solutions);
    } catch (error) {
      console.error("Alternative generation failed:", error);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleReviewBestPractices() {
    setAnalyzing(true);
    try {
      const review = await reviewBestPractices(code, language);
      setBestPractices(review);
    } catch (error) {
      console.error("Best practices review failed:", error);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDebug() {
    setAnalyzing(true);
    try {
      const debug = await debugCode(code, language, testCases);
      setDebugInfo(debug);
    } catch (error) {
      console.error("Debugging failed:", error);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <AppShell>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">AI Coding Interview</h1>
            <p className="text-sm text-muted-foreground">Solve problems with AI-powered assistance</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedProblem.id}
              onChange={(e) => setSelectedProblem(codingProblems.find(p => p.id === e.target.value) || codingProblems[0])}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {codingProblems.map(problem => (
                <option key={problem.id} value={problem.id}>{problem.title}</option>
              ))}
            </select>
            <Badge variant={selectedProblem.difficulty === "Easy" ? "default" : selectedProblem.difficulty === "Medium" ? "secondary" : "destructive"}>
              {selectedProblem.difficulty}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid gap-4 lg:grid-cols-2">
          {/* Left Panel - Problem & Editor */}
          <div className="flex flex-col gap-4">
            {/* Problem Description */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 size={20} />
                  {selectedProblem.title}
                </CardTitle>
                <CardDescription>{selectedProblem.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Examples:</h4>
                  {selectedProblem.examples.map((example, index) => (
                    <div key={index} className="mb-2 rounded-lg bg-muted p-3 font-mono text-sm">
                      <div className="text-muted-foreground">Input: {example.input}</div>
                      <div className="text-primary">Output: {example.output}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Constraints:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedProblem.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Solution</CardTitle>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px]">
                  <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Analysis & Results */}
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="editor" className="gap-2">
                  <Terminal size={16} /> Test Cases
                </TabsTrigger>
                <TabsTrigger value="complexity" className="gap-2">
                  <Clock size={16} /> Complexity
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2">
                  <Zap size={16} /> AI Analysis
                </TabsTrigger>
                <TabsTrigger value="solutions" className="gap-2">
                  <Lightbulb size={16} /> Solutions
                </TabsTrigger>
              </TabsList>

              {/* Test Cases Tab */}
              <TabsContent value="editor" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle size={18} />
                      Test Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {testCases.map((testCase) => (
                      <div key={testCase.id} className={`rounded-lg border p-3 ${
                        testCase.isHidden ? "border-dashed border-yellow-500/50 bg-yellow-500/5" : "border-border"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Test Case {testCase.id}
                            {testCase.isHidden && <Badge variant="outline" className="ml-2 text-xs">Hidden</Badge>}
                          </span>
                          {testCase.status === "passed" && <CheckCircle size={16} className="text-green-600" />}
                          {testCase.status === "failed" && <XCircle size={16} className="text-red-600" />}
                          {testCase.status === "pending" && <Loader2 size={16} className="text-muted-foreground animate-spin" />}
                        </div>
                        <div className="font-mono text-xs space-y-1">
                          <div className="text-muted-foreground">Input: {testCase.input}</div>
                          <div className="text-muted-foreground">Expected: {testCase.expectedOutput}</div>
                          {testCase.actualOutput && (
                            <div className={testCase.status === "passed" ? "text-green-600" : "text-red-600"}>
                              Actual: {testCase.actualOutput}
                            </div>
                          )}
                          {testCase.error && (
                            <div className="text-red-600">Error: {testCase.error}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleRunCode} disabled={executing} className="w-full gap-2" variant="primary">
                      {executing ? <><Loader2 size={18} className="animate-spin" /> Running...</> : <><Play size={18} /> Run Code</>}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Complexity Tab */}
              <TabsContent value="complexity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock size={18} />
                      Time Complexity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {complexity ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Complexity:</span>
                          <Badge variant="secondary">{complexity.timeComplexity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{complexity.explanation}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Run complexity analysis to see results</p>
                    )}
                    <Button onClick={handleAnalyzeComplexity} disabled={analyzing} className="w-full gap-2 mt-4">
                      {analyzing ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Clock size={18} /> Analyze Complexity</>}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HardDrive size={18} />
                      Space Complexity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {complexity ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Complexity:</span>
                          <Badge variant="secondary">{complexity.spaceComplexity}</Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Run complexity analysis to see results</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="ai" className="space-y-4">
                <div className="grid gap-3">
                  <Button onClick={handleDebug} disabled={analyzing} variant="outline" className="gap-2">
                    <Bug size={18} /> AI Debug
                  </Button>
                  <Button onClick={handleDetectEdgeCases} disabled={analyzing} variant="outline" className="gap-2">
                    <AlertTriangle size={18} /> Detect Edge Cases
                  </Button>
                  <Button onClick={handleReviewBestPractices} disabled={analyzing} variant="outline" className="gap-2">
                    <CheckCircle size={18} /> Review Best Practices
                  </Button>
                </div>

                {debugInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Debug Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {debugInfo.issues.map((issue, index) => (
                        <div key={index} className={`rounded-lg p-3 ${
                          issue.type === "error" ? "bg-red-100 dark:bg-red-900/20" :
                          issue.type === "warning" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                          "bg-blue-100 dark:bg-blue-900/20"
                        }`}>
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <span>Line {issue.line}:</span>
                            <span>{issue.type}</span>
                          </div>
                          <p className="text-sm mt-1">{issue.message}</p>
                          {issue.suggestion && (
                            <p className="text-sm text-muted-foreground mt-1">Suggestion: {issue.suggestion}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {edgeCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Edge Cases</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {edgeCases.map((edgeCase, index) => (
                        <div key={index} className={`rounded-lg p-3 ${
                          edgeCase.severity === "high" ? "bg-red-100 dark:bg-red-900/20" :
                          edgeCase.severity === "medium" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                          "bg-blue-100 dark:bg-blue-900/20"
                        }`}>
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <AlertTriangle size={14} />
                            <span className="capitalize">{edgeCase.severity} Severity</span>
                          </div>
                          <p className="text-sm mt-1">{edgeCase.description}</p>
                          <p className="text-sm text-muted-foreground mt-1">Suggestion: {edgeCase.suggestion}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {bestPractices.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Best Practices Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {bestPractices.map((practice, index) => (
                        <div key={index} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{practice.category}</span>
                            <Badge variant={practice.severity === "high" ? "destructive" : practice.severity === "medium" ? "secondary" : "outline"}>
                              {practice.severity}
                            </Badge>
                          </div>
                          <p className="text-sm">{practice.issue}</p>
                          <p className="text-sm text-muted-foreground mt-1">Suggestion: {practice.suggestion}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Alternative Solutions Tab */}
              <TabsContent value="solutions" className="space-y-4">
                <Button onClick={handleGenerateAlternatives} disabled={analyzing} className="w-full gap-2">
                  {analyzing ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Lightbulb size={18} /> Generate Alternatives</>}
                </Button>

                {alternativeSolutions.map((solution, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{solution.approach}</CardTitle>
                      <CardDescription>
                        Time: {solution.timeComplexity} | Space: {solution.spaceComplexity}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{solution.explanation}</p>
                      <div className="rounded-lg bg-muted p-3">
                        <pre className="font-mono text-xs overflow-x-auto">{solution.code}</pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
