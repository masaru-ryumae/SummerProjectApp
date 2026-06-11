export interface ErrorAnalysis {
  errorType: string;
  description: string;
  possibleCauses: string[];
  suggestedFixes: any[];
  debugSteps: any[];
  relatedErrors: string[];
  prevention: string[];
}

class DebugHelperService {
  analyzeError(errorMessage: string, stackTrace?: string, language?: string): ErrorAnalysis {
    const errorType = this.extractErrorType(errorMessage);
    return this.getErrorAnalysis(errorType, errorMessage, language);
  }

  private extractErrorType(errorMessage: string): string {
    const message = errorMessage.toLowerCase();

    if (message.includes('cannot read') || message.includes('undefined')) return 'null_reference';
    if (message.includes('is not a function')) return 'type_error';
    if (message.includes('unexpected token')) return 'syntax_error';
    if (message.includes('module not found')) return 'import_error';
    if (message.includes('timeout')) return 'timeout_error';
    if (message.includes('network') || message.includes('failed to fetch')) return 'network_error';

    return 'unknown_error';
  }

  private getErrorAnalysis(errorType: string, errorMessage: string, language?: string): ErrorAnalysis {
    const analyses: { [key: string]: ErrorAnalysis } = {
      null_reference: {
        errorType: 'Null/Undefined Reference Error',
        description: 'Trying to access a property on null or undefined value.',
        possibleCauses: [
          'Variable not initialized',
          'Function returning undefined',
          'Asynchronous operation not completed',
          'Incorrect destructuring'
        ],
        suggestedFixes: [
          {
            title: 'Add null/undefined check',
            description: 'Check if value exists before access',
            code: 'if (obj && obj.property) { ... }',
            likelihood: 95
          },
          {
            title: 'Use optional chaining',
            description: 'Modern syntax for safe property access',
            code: 'const value = obj?.property?.nested;',
            likelihood: 90
          }
        ],
        debugSteps: [
          { step: 1, action: 'Log the variable', expected: 'Check if null/undefined', tools: ['console.log'] }
        ],
        relatedErrors: ['TypeError', 'ReferenceError'],
        prevention: ['Use TypeScript', 'Enable strict mode', 'Use linting tools', 'Add tests']
      },

      type_error: {
        errorType: 'Type Error',
        description: 'Calling something as function that is not a function.',
        possibleCauses: [
          'Wrong function reference',
          'Property name typo',
          'Incorrect import'
        ],
        suggestedFixes: [
          {
            title: 'Verify function exists',
            description: 'Check property is actually a function',
            code: 'if (typeof obj.method === "function") { obj.method(); }',
            likelihood: 90
          }
        ],
        debugSteps: [
          { step: 1, action: 'Log the object', expected: 'See actual type', tools: ['console.log'] }
        ],
        relatedErrors: ['ReferenceError'],
        prevention: ['Use TypeScript', 'Use IDE autocomplete']
      },

      syntax_error: {
        errorType: 'Syntax Error',
        description: 'Code has invalid syntax.',
        possibleCauses: [
          'Missing closing bracket',
          'Invalid token',
          'Incorrect statement structure'
        ],
        suggestedFixes: [
          {
            title: 'Check brackets',
            description: 'Ensure all brackets are matched',
            code: 'Look for unmatched { } [ ] ( )',
            likelihood: 95
          }
        ],
        debugSteps: [
          { step: 1, action: 'Check error line', expected: 'Locate error', tools: ['Browser DevTools'] }
        ],
        relatedErrors: ['ParseError'],
        prevention: ['Use code formatter (Prettier)', 'Enable ESLint']
      },

      network_error: {
        errorType: 'Network Error',
        description: 'Failed to connect to server or fetch data.',
        possibleCauses: [
          'Server is down',
          'CORS policy violation',
          'Incorrect URL'
        ],
        suggestedFixes: [
          {
            title: 'Check server status',
            description: 'Verify server is running',
            code: 'curl https://api.example.com/status',
            likelihood: 80
          },
          {
            title: 'Add CORS headers',
            description: 'Configure server to allow requests',
            code: 'res.setHeader("Access-Control-Allow-Origin", "*");',
            likelihood: 75
          }
        ],
        debugSteps: [
          { step: 1, action: 'Check network tab', expected: 'See request details', tools: ['Browser DevTools'] }
        ],
        relatedErrors: ['TypeError: Failed to fetch'],
        prevention: ['Configure CORS', 'Use API variables', 'Add timeouts', 'Implement retry logic']
      }
    };

    return analyses[errorType] || {
      errorType: 'Unknown Error',
      description: 'An unexpected error has occurred.',
      possibleCauses: ['Unknown cause'],
      suggestedFixes: [{ title: 'Search error', likelihood: 50 }],
      debugSteps: [{ step: 1, action: 'Check console', expected: 'See full message', tools: ['Browser DevTools'] }],
      relatedErrors: [],
      prevention: ['Use error tracking service']
    };
  }

  getDebuggingBestPractices(language?: string): string[] {
    const practices = [
      'Use meaningful variable names',
      'Add logging at critical points',
      'Use debugger statement or breakpoints',
      'Test edge cases',
      'Use TypeScript for type safety',
      'Implement proper error handling',
      'Write unit tests',
      'Use linting tools'
    ];

    if (language === 'javascript' || language === 'typescript') {
      practices.push('Use optional chaining and nullish coalescing');
      practices.push('Use strict mode');
    }

    return practices;
  }
}

export const debugHelperService = new DebugHelperService();
export default debugHelperService;
