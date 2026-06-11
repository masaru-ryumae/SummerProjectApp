import React from 'react'

// Issue #6 fix: Error boundary to prevent full app crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-red-900 p-6">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold text-red-700 dark:text-red-200 mb-4">
              Oops, something went wrong
            </h1>
            <p className="text-red-600 dark:text-red-300 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="bg-red-100 dark:bg-red-800 p-4 rounded text-left text-sm overflow-auto mb-4 text-red-900 dark:text-red-100">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
