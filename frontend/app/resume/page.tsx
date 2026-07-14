"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertCircle, Download, Trash2, Sparkles, Target, BookOpen, Briefcase, GraduationCap, Award, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AnalysisStatus = "idle" | "uploading" | "analyzing" | "complete" | "error";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOC, DOCX, or TXT file");
      setStatus("error");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      setStatus("error");
      return;
    }

    setFile(selectedFile);
    setError("");
    analyzeResume(selectedFile);
  };

  const analyzeResume = async (resumeFile: File) => {
    setStatus("uploading");
    
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus("analyzing");
      
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      setAnalysis({
        overallScore: 78,
        sections: [
          { name: "Contact Information", score: 100, status: "complete" },
          { name: "Professional Summary", score: 85, status: "good" },
          { name: "Work Experience", score: 75, status: "needs_improvement" },
          { name: "Education", score: 90, status: "good" },
          { name: "Skills", score: 70, status: "needs_improvement" },
          { name: "Projects", score: 60, status: "missing" }
        ],
        strengths: [
          "Clear professional summary with quantifiable achievements",
          "Well-structured education section",
          "Good use of action verbs",
          "Relevant technical skills listed"
        ],
        weaknesses: [
          "Work experience lacks specific metrics and results",
          "Skills section could be more detailed",
          "Missing project portfolio section",
          "Could benefit from certifications section"
        ],
        suggestions: [
          "Add specific metrics to your work experience (e.g., 'Increased sales by 25%')",
          "Include a projects section showcasing key achievements",
          "Add relevant certifications and courses",
          "Consider adding a languages section if applicable",
          "Include links to your portfolio or GitHub"
        ],
        keywords: [
          { word: "JavaScript", found: true },
          { word: "React", found: true },
          { word: "Node.js", found: true },
          { word: "TypeScript", found: false },
          { word: "Python", found: false },
          { word: "AWS", found: true },
          { word: "Docker", found: false },
          { word: "Kubernetes", found: false }
        ],
        atsScore: 82,
        readabilityScore: 75
      });
      
      setStatus("complete");
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setStatus("idle");
    setError("");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  return (
    <AppShell>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Resume Analyzer</h1>
          <p className="mt-2 text-muted-foreground">Upload your resume to get AI-powered feedback and optimization tips</p>
        </div>

        {status === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-dashed">
              <CardContent className="p-12">
                <div
                  className={`flex flex-col items-center justify-center space-y-4 transition-colors ${
                    dragActive ? "bg-muted/50" : ""
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="h-20 w-20 rounded-full gradient-bg flex items-center justify-center">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">Upload your resume</h3>
                    <p className="mt-2 text-muted-foreground">
                      Drag and drop your resume here, or click to browse
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    id="resume-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileInput}
                  />
                  <label htmlFor="resume-upload">
                    <Button variant="primary" className="gap-2 cursor-pointer">
                      <FileText size={18} /> Choose File
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {(status === "uploading" || status === "analyzing") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">
                      {status === "uploading" ? "Uploading your resume..." : "Analyzing your resume..."}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      {status === "uploading" 
                        ? "Please wait while we upload your file" 
                        : "Our AI is reviewing your resume for optimization tips"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-destructive">Upload Failed</h3>
                    <p className="mt-2 text-muted-foreground">{error}</p>
                  </div>
                  <Button onClick={handleReset} variant="outline">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {status === "complete" && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={20} /> Analysis Results
                </CardTitle>
                <CardDescription>Based on AI analysis of your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className={`inline-flex h-24 w-24 items-center justify-center rounded-full ${getScoreBg(analysis.overallScore)}`}>
                      <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}%
                      </span>
                    </div>
                    <p className="mt-2 font-medium">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex h-24 w-24 items-center justify-center rounded-full ${getScoreBg(analysis.atsScore)}`}>
                      <span className={`text-3xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                        {analysis.atsScore}%
                      </span>
                    </div>
                    <p className="mt-2 font-medium">ATS Compatibility</p>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex h-24 w-24 items-center justify-center rounded-full ${getScoreBg(analysis.readabilityScore)}`}>
                      <span className={`text-3xl font-bold ${getScoreColor(analysis.readabilityScore)}`}>
                        {analysis.readabilityScore}%
                      </span>
                    </div>
                    <p className="mt-2 font-medium">Readability</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} /> Section Analysis
                </CardTitle>
                <CardDescription>Detailed breakdown of each resume section</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.sections.map((section: any, index: number) => (
                    <motion.div
                      key={section.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-3">
                          {section.status === "complete" && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {section.status === "good" && (
                            <CheckCircle className="h-5 w-5 text-yellow-600" />
                          )}
                          {section.status === "needs_improvement" && (
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                          )}
                          {section.status === "missing" && (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-medium">{section.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                section.score >= 80
                                  ? "bg-green-600"
                                  : section.score >= 60
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                              }`}
                              style={{ width: `${section.score}%` }}
                            />
                          </div>
                          <span className={`font-semibold ${getScoreColor(section.score)}`}>
                            {section.score}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Weaknesses */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} /> Strengths
                  </CardTitle>
                  <CardDescription>What your resume does well</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle size={20} /> Areas for Improvement
                  </CardTitle>
                  <CardDescription>What could be enhanced</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.weaknesses.map((weakness: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} /> Actionable Suggestions
                </CardTitle>
                <CardDescription>Specific recommendations to improve your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Keyword Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} /> Keyword Analysis
                </CardTitle>
                <CardDescription>Important keywords for your target role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword: any, index: number) => (
                    <span
                      key={index}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                        keyword.found
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {keyword.found ? "✓" : "✗"} {keyword.word}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <Upload size={18} /> Upload Different Resume
              </Button>
              <Button variant="outline" className="gap-2">
                <Download size={18} /> Download Report
              </Button>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 size={18} /> Delete Resume
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
