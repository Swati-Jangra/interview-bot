import type { TestCase, ComplexityAnalysis, EdgeCase, AlternativeSolution, BestPracticeIssue, DebugInfo } from "@/app/coding/page";

// Simulated code execution with sandbox
export async function executeCode(
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<TestCase[]> {
  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return testCases.map(testCase => {
    try {
      // In production, this would call a backend service with actual code execution
      // For demo, we'll simulate execution results
      const passed = Math.random() > 0.3; // 70% pass rate for demo
      
      return {
        ...testCase,
        status: passed ? "passed" : "failed",
        actualOutput: passed ? testCase.expectedOutput : "undefined",
        error: passed ? undefined : "Test failed: Output does not match expected result"
      };
    } catch (error) {
      return {
        ...testCase,
        status: "failed",
        error: error instanceof Error ? error.message : "Execution error"
      };
    }
  });
}

// AI-powered complexity analysis
export async function analyzeComplexity(
  code: string,
  language: string
): Promise<ComplexityAnalysis> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Analyze code patterns to determine complexity
  const hasNestedLoops = code.includes("for") && code.match(/for.*for/s);
  const hasRecursion = code.includes("function") && code.match(/\w+\s*\([^)]*\)\s*\{[^}]*\w+\s*\(/s);
  const hasHashMap = code.includes("Map") || code.includes("Object") || code.includes("{}");
  const hasSort = code.includes("sort") || code.includes("Sort");

  let timeComplexity = "O(n)";
  let spaceComplexity = "O(1)";
  let explanation = "Linear time complexity with constant space.";

  if (hasNestedLoops) {
    timeComplexity = "O(n²)";
    spaceComplexity = "O(1)";
    explanation = "Nested loops indicate quadratic time complexity. Consider optimizing with hash maps or two-pointer technique.";
  } else if (hasRecursion) {
    timeComplexity = "O(2^n)";
    spaceComplexity = "O(n)";
    explanation = "Recursive solution without memoization leads to exponential time. Consider adding memoization or converting to iterative approach.";
  } else if (hasHashMap) {
    timeComplexity = "O(n)";
    spaceComplexity = "O(n)";
    explanation = "Using hash maps provides linear time complexity but requires additional space for storage.";
  } else if (hasSort) {
    timeComplexity = "O(n log n)";
    spaceComplexity = "O(n)";
    explanation = "Sorting operation dominates the time complexity. Consider if sorting is necessary or if there's an O(n) alternative.";
  }

  return { timeComplexity, spaceComplexity, explanation };
}

// AI-powered edge case detection
export async function detectEdgeCases(
  code: string,
  language: string,
  problem: any
): Promise<EdgeCase[]> {
  await new Promise(resolve => setTimeout(resolve, 1200));

  const edgeCases: EdgeCase[] = [];

  // Check for common edge case issues
  if (!code.includes("if") && !code.includes("length") && !code.includes("size")) {
    edgeCases.push({
      description: "No input validation for empty arrays or null values",
      severity: "high",
      suggestion: "Add checks for empty inputs, null values, and edge cases like single-element arrays."
    });
  }

  if (code.includes("parseInt") || code.includes("parseFloat")) {
    edgeCases.push({
      description: "Potential integer overflow with large numbers",
      severity: "medium",
      suggestion: "Use BigInt for handling large integers or add bounds checking."
    });
  }

  if (code.includes("for") && !code.includes("length")) {
    edgeCases.push({
      description: "Loop may not handle array boundaries correctly",
      severity: "medium",
      suggestion: "Ensure loop conditions properly handle array bounds and empty arrays."
    });
  }

  if (code.includes("===") && !code.includes("null") && !code.includes("undefined")) {
    edgeCases.push({
      description: "Missing null/undefined checks",
      severity: "low",
      suggestion: "Add explicit checks for null and undefined values before comparisons."
    });
  }

  // Problem-specific edge cases
  if (problem.title.includes("Two Sum")) {
    edgeCases.push({
      description: "Negative numbers and zero handling",
      severity: "medium",
      suggestion: "Ensure solution correctly handles negative numbers and zero values in the array."
    });
    edgeCases.push({
      description: "Duplicate elements in array",
      severity: "medium",
      suggestion: "Consider how to handle cases where the same element might be used twice."
    });
  }

  return edgeCases;
}

// AI-powered alternative solutions generator
export async function generateAlternativeSolutions(
  code: string,
  language: string,
  problem: any
): Promise<AlternativeSolution[]> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const solutions: AlternativeSolution[] = [];

  if (problem.title.includes("Two Sum")) {
    solutions.push({
      approach: "Hash Map Approach",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation: "Use a hash map to store seen values and their indices. For each element, check if target - current exists in the map.",
      code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`
    });

    solutions.push({
      approach: "Two-Pointer Approach (Sorted)",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(1)",
      explanation: "Sort the array and use two pointers from both ends. Adjust pointers based on sum comparison with target.",
      code: `function twoSum(nums, target) {
  const sorted = nums.map((num, i) => ({ num, i }))
                      .sort((a, b) => a.num - b.num);
  let left = 0, right = sorted.length - 1;
  
  while (left < right) {
    const sum = sorted[left].num + sorted[right].num;
    if (sum === target) {
      return [sorted[left].i, sorted[right].i].sort();
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return [];
}`
    });
  }

  if (problem.title.includes("Substring")) {
    solutions.push({
      approach: "Sliding Window with Hash Map",
      timeComplexity: "O(n)",
      spaceComplexity: "O(min(m, n))",
      explanation: "Use a sliding window with a hash map to track character frequencies. Expand window when unique, shrink when duplicate found.",
      code: `function lengthOfLongestSubstring(s) {
  const charMap = new Map();
  let left = 0, maxLength = 0;
  
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (charMap.has(char) && charMap.get(char) >= left) {
      left = charMap.get(char) + 1;
    }
    charMap.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}`
    });
  }

  return solutions;
}

// AI-powered best practices review
export async function reviewBestPractices(
  code: string,
  language: string
): Promise<BestPracticeIssue[]> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const issues: BestPracticeIssue[] = [];

  // Check for naming conventions
  if (code.includes("var ")) {
    issues.push({
      category: "Code Style",
      issue: "Usage of 'var' keyword",
      suggestion: "Use 'const' or 'let' instead of 'var' for better scoping",
      severity: "medium"
    });
  }

  // Check for magic numbers
  const numberPattern = /\b\d{2,}\b/g;
  const numbers = code.match(numberPattern);
  if (numbers && numbers.length > 2) {
    issues.push({
      category: "Code Quality",
      issue: "Magic numbers detected in code",
      suggestion: "Extract magic numbers into named constants for better readability",
      severity: "low"
    });
  }

  // Check for console.log
  if (code.includes("console.log")) {
    issues.push({
      category: "Code Quality",
      issue: "Console.log statements in production code",
      suggestion: "Remove or replace with proper logging mechanism",
      severity: "low"
    });
  }

  // Check for function length
  const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/gs);
  if (functionMatches) {
    functionMatches.forEach(func => {
      if (func.length > 500) {
        issues.push({
          category: "Code Organization",
          issue: "Function is too long",
          suggestion: "Break down large functions into smaller, more focused functions",
          severity: "medium"
        });
      }
    });
  }

  // Check for error handling
  if (!code.includes("try") && !code.includes("catch")) {
    issues.push({
      category: "Error Handling",
      issue: "No error handling present",
      suggestion: "Add try-catch blocks for operations that might fail",
      severity: "high"
    });
  }

  // Check for comments
  const commentRatio = (code.match(/\/\/.*$/gm) || []).length / (code.split("\n").length || 1);
  if (commentRatio < 0.1) {
    issues.push({
      category: "Documentation",
      issue: "Insufficient code comments",
      suggestion: "Add comments to explain complex logic and algorithm choices",
      severity: "low"
    });
  }

  return issues;
}

// AI-powered debugging
export async function debugCode(
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<DebugInfo> {
  await new Promise(resolve => setTimeout(resolve, 1800));

  const issues: DebugInfo["issues"] = [];
  const fixes: string[] = [];

  // Analyze common bugs
  if (code.includes("for (let i = 0; i <") && !code.includes("length")) {
    issues.push({
      line: code.split("\n").findIndex(line => line.includes("for")) + 1,
      type: "error",
      message: "Loop condition may not properly handle array length",
      suggestion: "Use array.length in loop condition"
    });
    fixes.push("Update loop to use array.length for proper iteration");
  }

  if (code.includes("return") && code.match(/return\s*[^;]*$/m)) {
    issues.push({
      line: code.split("\n").findIndex(line => line.includes("return")) + 1,
      type: "warning",
      message: "Return statement might not handle all cases",
      suggestion: "Ensure all code paths return a value"
    });
    fixes.push("Add return statements for all code paths");
  }

  if (code.includes("if") && !code.includes("else")) {
    issues.push({
      line: code.split("\n").findIndex(line => line.includes("if")) + 1,
      type: "info",
      message: "If statement without else clause",
      suggestion: "Consider adding else clause for complete logic coverage"
    });
  }

  // Check for off-by-one errors
  if (code.includes("i <") && code.includes("i++")) {
    issues.push({
      line: code.split("\n").findIndex(line => line.includes("i <")) + 1,
      type: "warning",
      message: "Potential off-by-one error in loop",
      suggestion: "Verify loop boundaries are correct (<= vs <)"
    });
    fixes.push("Review loop boundaries for off-by-one errors");
  }

  // Check for variable initialization
  if (code.includes("let ") && !code.match(/let\s+\w+\s*=\s*[^;]+/)) {
    issues.push({
      line: code.split("\n").findIndex(line => line.includes("let")) + 1,
      type: "error",
      message: "Variable declared but not initialized",
      suggestion: "Initialize variables with default values"
    });
    fixes.push("Initialize all variables before use");
  }

  return { issues, fixes };
}
