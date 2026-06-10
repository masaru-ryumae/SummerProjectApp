/**
 * Toast notification system
 * Simple, lightweight toast notifications without external dependencies
 */

const showToast = (message, duration = 3000) => {
  // Remove any existing toasts
  const existing = document.getElementById('toast-container')
  if (existing) {
    existing.remove()
  }

  // Create container
  const container = document.createElement('div')
  container.id = 'toast-container'
  container.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `

  // Create toast element
  const toast = document.createElement('div')
  toast.style.cssText = `
    background: #1f2937;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
    word-wrap: break-word;
  `
  toast.textContent = message

  // Add animation
  const style = document.createElement('style')
  if (!document.getElementById('toast-styles')) {
    style.id = 'toast-styles'
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  container.appendChild(toast)
  document.body.appendChild(container)

  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      container.remove()
    }, 300)
  }, duration)
}

export default showToast
