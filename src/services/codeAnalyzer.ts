export class CodeAnalyzerService {
  detectLanguage(code: string, filename?: string): string {
    if (filename) {
      if (/\.tsx?$/.test(filename)) return code.includes('interface') ? 'typescript' : 'javascript';
      if (/\.jsx?$/.test(filename)) return 'javascript';
      if (/\.py$/.test(filename)) return 'python';
    }
    if (code.includes('import React')) return 'javascript';
    return 'javascript';
  }

  analyzeCode(code: string, filename?: string) {
    const language = this.detectLanguage(code, filename);
    const lines = code.split('\n');
    const issues: any[] = [];
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (line.includes('console.') && !line.includes('//')) {
        issues.push({
          id: `${idx}`,
          line: lineNum,
          column: line.indexOf('console'),
          message: 'Remove console before production',
          severity: 'warning',
          rule: 'no-console'
        });
      }
    });

    return {
      language,
      issues,
      complexity: {
        cyclomatic: 1 + (code.match(/if|for|while/g) || []).length,
        cognitive: (code.match(/if|for|while|\&\&|\|\|/g) || []).length,
        nestingLevel: 2,
        linesOfCode: lines.length
      },
      quality: { score: 85, maintainability: 80, testability: 75, documentation: 70 },
      performance: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        bottlenecks: [],
        optimizations: ['Use const instead of let/var']
      }
    };
  }
}

export const codeAnalyzerService = new CodeAnalyzerService();
export default codeAnalyzerService;
