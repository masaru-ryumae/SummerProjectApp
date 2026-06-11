export interface CodeIssue {
  id: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  suggestion?: string;
}

export interface CodeAnalysisResult {
  language: string;
  issues: CodeIssue[];
  complexity: { cyclomatic: number; cognitive: number; nestingLevel: number; linesOfCode: number };
  quality: { score: number; maintainability: number; testability: number; documentation: number };
  docstring?: string;
  performance: { timeComplexity: string; spaceComplexity: string; bottlenecks: string[]; optimizations: string[] };
}

class CodeAnalyzerService {
  detectLanguage(code: string, filename?: string): string {
    if (filename) {
      if (/\.tsx?$/.test(filename)) return code.includes('interface') ? 'typescript' : 'javascript';
      if (/\.jsx?$/.test(filename)) return 'javascript';
      if (/\.py$/.test(filename)) return 'python';
      if (/\.java$/.test(filename)) return 'java';
    }

    if (code.includes('import React') || code.includes('from "react"')) {
      return /: \w+ = /.test(code) ? 'typescript' : 'javascript';
    }
    if (code.includes('def ') || code.includes('import ')) return 'python';
    if (code.includes('public class') || code.includes('public static')) return 'java';
    if (code.includes('#include') || code.includes('std::')) return 'cpp';
    if (code.includes('fn main') || code.includes('pub fn')) return 'rust';

    return 'javascript';
  }

  analyzeCode(code: string, filename?: string): CodeAnalysisResult {
    const language = this.detectLanguage(code, filename);
    const lines = code.split('\n');

    return {
      language,
      issues: this.findIssues(code, language, lines),
      complexity: this.calculateComplexity(code, lines),
      quality: this.analyzeQuality(code, language),
      docstring: this.generateDocstring(code, language),
      performance: this.analyzePerformance(code, language)
    };
  }

  private findIssues(code: string, language: string, lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];
    let issueId = 0;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      if (trimmed.startsWith('console.') && !trimmed.includes('//')) {
        issues.push({
          id: `issue_${++issueId}`,
          line: lineNum,
          column: line.indexOf('console'),
          message: 'Remove console statement before production',
          severity: 'warning',
          rule: 'no-console',
          suggestion: 'Use proper logging library'
        });
      }

      if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
        issues.push({
          id: `issue_${++issueId}`,
          line: lineNum,
          column: line.indexOf(trimmed[0]),
          message: trimmed.includes('TODO') ? 'TODO found' : 'FIXME found',
          severity: 'info',
          rule: 'todo-comment'
        });
      }

      if (/\d{3,}/.test(trimmed) && !trimmed.startsWith('//')) {
        issues.push({
          id: `issue_${++issueId}`,
          line: lineNum,
          column: line.search(/\d{3,}/),
          message: 'Magic number found',
          severity: 'info',
          rule: 'magic-number',
          suggestion: 'Extract to a named constant'
        });
      }
    });

    return issues;
  }

  private calculateComplexity(code: string, lines: string[]): any {
    let cyclomatic = 1;
    let cognitive = 0;
    let maxNestingLevel = 0;
    let currentNestingLevel = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      const controlFlow = (trimmed.match(/if|else|for|while|case|catch|switch|\?\s*:/g) || []).length;
      cyclomatic += controlFlow;

      if (trimmed.includes('if') || trimmed.includes('?')) cognitive += 1;
      if (trimmed.includes('for') || trimmed.includes('while')) cognitive += 1;
      if (trimmed.includes('&&') || trimmed.includes('||')) cognitive += 1;

      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      currentNestingLevel += openBraces - closeBraces;
      maxNestingLevel = Math.max(maxNestingLevel, currentNestingLevel);
    }

    return {
      cyclomatic,
      cognitive,
      nestingLevel: maxNestingLevel,
      linesOfCode: lines.length
    };
  }

  private analyzeQuality(code: string, language: string): any {
    let score = 100;
    const lines = code.split('\n');
    const commentLines = lines.filter(l => l.trim().startsWith('//')).length;
    const docstringCount = (code.match(/\/\*\*|"""|\'\'\'/g) || []).length;

    if (docstringCount === 0 && lines.length > 10) {
      score -= 30;
    }

    if (commentLines / lines.length < 0.05 && lines.length > 20) {
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      maintainability: 85,
      testability: 75,
      documentation: docstringCount > 0 ? 80 : 50
    };
  }

  private generateDocstring(code: string, language: string): string {
    const match = code.match(/(?:function|const|async|def)\s+(\w+)\s*(?:\(|=)/);
    if (!match) return '';

    const functionName = match[1];
    const params = code.match(/\(([^)]*)\)/)?.[1]?.split(',').map(p => p.trim()) || [];

    if (language === 'javascript' || language === 'typescript') {
      let docstring = '/**\n';
      docstring += ` * ${functionName} - Brief description\n * \n`;
      for (const param of params) {
        if (param) docstring += ` * @param {type} ${param}\n`;
      }
      docstring += ` * @returns {type} Description\n */\n`;
      return docstring;
    }

    return '';
  }

  private analyzePerformance(code: string, language: string): any {
    const bottlenecks: string[] = [];
    const optimizations: string[] = [];

    const nestedLoops = (code.match(/for|while/g) || []).length;
    if (nestedLoops >= 2) {
      bottlenecks.push('Nested loops detected');
    }

    if (code.includes('.map') || code.includes('.filter')) {
      optimizations.push('Consider using for loops for large datasets');
    }

    return {
      timeComplexity: nestedLoops >= 2 ? 'O(n²)' : 'O(n)',
      spaceComplexity: 'O(1)',
      bottlenecks,
      optimizations
    };
  }
}

export const codeAnalyzerService = new CodeAnalyzerService();
export default codeAnalyzerService;
