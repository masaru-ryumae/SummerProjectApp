import React from 'react'
import { loggerService } from '../services/loggerService'

// Defect #23 Fix: Enhanced error recovery UI with better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false,
      recoveryAttempt: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Defect #23: Log error with context
    loggerService.error('Error caught by ErrorBoundary', 'ErrorBoundary', error)

    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempt: this.state.recoveryAttempt + 1
    })
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }))
  }

  // Defect #23: Better error messages and context
  getErrorMessage = () => {
    const { error } = this.state

    if (!error) return 'An unexpected error occurred'

    const errorString = error.toString()
    if (errorString.includes('Cannot read')) {
      return 'Data could not be loaded. Please try again.'
    } else if (errorString.includes('Network')) {
      return 'Network connection error. Please check your internet.'
    } else if (errorString.includes('Timeout')) {
      return 'Request timed out. Please try again.'
    }

    return 'Something went wrong. We\'re working on it.'
  }

  // Defect #23: Suggest recovery based on error
  getSuggestions = () => {
    const { error, errorCount } = this.state

    if (errorCount > 2) {
      return [
        '🔄 Refresh the page',
        '🏠 Go to home page',
        'Contact support if problem persists'
      ]
    }

    return [
      '↩️ Try again',
      '🔄 Refresh the page',
      '🏠 Go to home page'
    ]
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const suggestions = this.getSuggestions()

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Error Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Oops!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                {this.getErrorMessage()}
              </p>

              {/* Error Details Toggle */}
              {isDevelopment && this.state.error && (
                <div className="mb-6">
                  <button
                    onClick={this.toggleDetails}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full text-center"
                  >
                    {this.state.showDetails ? '▼ Hide Details' : '▶ Show Details'}
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs overflow-auto max-h-48 font-mono text-gray-700 dark:text-gray-300">
                      <div className="mb-2 font-bold">Error:</div>
                      <div className="mb-3 text-red-600 dark:text-red-400">
                        {this.state.error.toString()}
                      </div>
                      {this.state.errorInfo && (
                        <>
                          <div className="mb-2 font-bold">Stack:</div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {this.state.errorInfo.componentStack}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Things you can try:
                </p>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {suggestions.map((suggestion, idx) => (
                    <li key={idx}>• {suggestion}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Try Again
                </button>

                <button
                  onClick={this.handleRefresh}
                  className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Refresh Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Go to Home
                </button>
              </div>

              {/* Error Counter */}
              {this.state.errorCount > 1 && (
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
                  Error count: {this.state.errorCount}
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
