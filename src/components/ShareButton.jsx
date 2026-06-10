import { useState } from 'react'
import { generateShareLink, generateEmailBody, generateJSON, downloadPDF } from '../utils/projectExporter'
import { copyToClipboard } from '../utils/projectExporter'
import showToast from '../utils/toast'

const ShareButton = ({ project }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleCopyLink = async () => {
    const link = generateShareLink(project)
    const success = await copyToClipboard(link)
    if (success) {
      showToast('🔗 Link copied to clipboard!')
    } else {
      showToast('Failed to copy link')
    }
    setIsOpen(false)
  }

  const handleDownloadPDF = () => {
    try {
      downloadPDF(project)
      showToast('📄 Opening PDF... Click print to save or view')
    } catch (error) {
      console.error('PDF error:', error)
      showToast('Failed to generate PDF')
    }
    setIsOpen(false)
  }

  const handleEmailLink = () => {
    const { subject, body } = generateEmailBody(project)
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
    showToast('✉️ Opening email client...')
    setIsOpen(false)
  }

  const handleCopyJSON = async () => {
    const json = generateJSON(project)
    const success = await copyToClipboard(json)
    if (success) {
      showToast('📋 JSON copied to clipboard!')
    } else {
      showToast('Failed to copy JSON')
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white rounded-lg font-semibold text-sm transition-all duration-200"
        aria-label="Share project"
        title="Share this project"
      >
        <span>🔗</span>
        <span>Share</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Menu Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Share "{project.title}"
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-900 dark:text-gray-100"
            >
              <span className="text-lg">🔗</span>
              <div>
                <p className="font-medium text-sm">Copy Link</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Share with a unique URL
                </p>
              </div>
            </button>

            {/* Email Link */}
            <button
              onClick={handleEmailLink}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-900 dark:text-gray-100"
            >
              <span className="text-lg">✉️</span>
              <div>
                <p className="font-medium text-sm">Email Link</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Send via email
                </p>
              </div>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-900 dark:text-gray-100"
            >
              <span className="text-lg">📄</span>
              <div>
                <p className="font-medium text-sm">Download PDF</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Save as PDF file
                </p>
              </div>
            </button>

            {/* Copy JSON */}
            <button
              onClick={handleCopyJSON}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-gray-900 dark:text-gray-100"
            >
              <span className="text-lg">📋</span>
              <div>
                <p className="font-medium text-sm">Copy JSON</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Copy as structured data
                </p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Close on escape */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ShareButton
