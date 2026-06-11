export class DebugHelperService {
  analyzeError(errorMessage: string, stackTrace?: string, language?: string) {
    const type = this.extractErrorType(errorMessage);
    return this.getAnalysis(type);
  }

  private extractErrorType(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes('undefined')) return 'null_reference';
    if (lower.includes('is not a function')) return 'type_error';
    if (lower.includes('unexpected token')) return 'syntax_error';
    if (lower.includes('network')) return 'network_error';
    return 'unknown_error';
  }

  private getAnalysis(type: string) {
    const analyses: any = {
      null_reference: {
        errorType: 'Null/Undefined Reference',
        description: 'Accessing property on null or undefined value.',
        possibleCauses: ['Not initialized', 'Undefined return', 'Async not complete', 'Wrong destructure'],
        suggestedFixes: [
          { title: 'Check null', description: 'Verify value exists', likelihood: 95 },
          { title: 'Optional chaining', description: 'Use obj?.property', likelihood: 90 }
        ],
        debugSteps: [{ step: 1, action: 'Log variable', expected: 'See type', tools: ['console.log'] }],
        relatedErrors: ['TypeError'],
        prevention: ['Use TypeScript', 'Enable strict', 'Use linting', 'Add tests']
      },
      type_error: {
        errorType: 'Type Error',
        description: 'Calling non-function as function.',
        possibleCauses: ['Wrong reference', 'Typo', 'Bad import'],
        suggestedFixes: [{ title: 'Check function', likelihood: 90 }],
        debugSteps: [{ step: 1, action: 'Log object', expected: 'Check type', tools: ['console.log'] }],
        relatedErrors: [],
        prevention: ['TypeScript', 'Autocomplete']
      },
      network_error: {
        errorType: 'Network Error',
        description: 'Failed connection.',
        possibleCauses: ['Server down', 'CORS issue', 'Bad URL'],
        suggestedFixes: [{ title: 'Check status', likelihood: 80 }],
        debugSteps: [{ step: 1, action: 'Check network', expected: 'See details', tools: ['DevTools'] }],
        relatedErrors: [],
        prevention: ['CORS headers', 'Timeouts', 'Retry logic']
      }
    };
    return analyses[type] || {
      errorType: 'Unknown',
      description: 'Unknown error.',
      possibleCauses: [],
      suggestedFixes: [],
      debugSteps: [],
      relatedErrors: [],
      prevention: []
    };
  }

  getDebuggingBestPractices(language?: string) {
    return [
      'Use meaningful names',
      'Log critical points',
      'Use debugger/breakpoints',
      'Test edge cases',
      'Use TypeScript',
      'Add error handling',
      'Write tests'
    ];
  }
}

export const debugHelperService = new DebugHelperService();
export default debugHelperService;
