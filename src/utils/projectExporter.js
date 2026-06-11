/**
 * Project Exporter Utilities
 * Pure utility functions for generating shareable content
 */

/**
 * Generate a shareable link for a project
 * @param {Object} project - Project object
 * @returns {string} - Full URL with project ID parameter
 */
export const generateShareLink = (project) => {
  const baseUrl = window.location.origin
  const projectId = project.id
  return `${baseUrl}/?project=${projectId}`
}

/**
 * Generate email body template
 * @param {Object} project - Project object
 * @returns {string} - Email subject and body formatted
 */
export const generateEmailBody = (project) => {
  const shareLink = generateShareLink(project)

  const subject = `Check out this summer project: ${project.title}`

  const body = `
Hi!

I found an awesome summer project I thought you'd like: ${project.title}

${project.description}

Why it's great: ${project.whyGreat}

Budget: $${project.budget}
Time: ${project.timeWeeks} weeks (${project.timePerWeek})
Skill Level: ${project.difficulty}

Tutorial: ${project.tutorialLink}

Check it out: ${shareLink}

Let me know if you want to build this together!
`.trim()

  return { subject, body }
}

/**
 * Generate JSON representation of project
 * @param {Object} project - Project object
 * @returns {string} - Pretty-printed JSON string
 */
export const generateJSON = (project) => {
  const projectData = {
    id: project.id,
    title: project.title,
    category: project.category,
    description: project.description,
    difficulty: project.difficulty,
    budget: project.budget,
    budgetRange: project.budgetRange,
    timeWeeks: project.timeWeeks,
    timePerWeek: project.timePerWeek,
    requiredSkills: project.requiredSkills,
    interests: project.interests,
    location: project.location,
    teamSize: project.teamSize,
    indoor: project.indoor,
    outdoor: project.outdoor,
    tutorialLink: project.tutorialLink,
    partsNeeded: project.partsNeeded,
    whyGreat: project.whyGreat,
    shareLink: generateShareLink(project)
  }

  return JSON.stringify(projectData, null, 2)
}

/**
 * Generate PDF content as HTML string
 * @param {Object} project - Project object
 * @returns {string} - HTML string ready for printing
 */
export const generatePDFContent = (project) => {
  const shareLink = generateShareLink(project)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0;
      padding: 0;
    }

    .header {
      border-bottom: 3px solid #a855f7;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }

    .title {
      font-size: 2.5em;
      font-weight: bold;
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .description {
      font-size: 1.1em;
      color: #6b7280;
      margin: 0;
    }

    .section {
      margin: 2rem 0;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 1.3em;
      font-weight: bold;
      color: #7c3aed;
      border-left: 4px solid #a855f7;
      padding-left: 1rem;
      margin: 1.5rem 0 1rem 0;
    }

    .metadata {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      margin: 1.5rem 0;
    }

    .metadata-item {
      flex: 0 1 auto;
    }

    .metadata-label {
      font-size: 0.85em;
      font-weight: bold;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
    }

    .metadata-value {
      font-size: 1.2em;
      font-weight: bold;
      color: #1f2937;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .tag {
      display: inline-block;
      background: #f0f0f0;
      color: #333;
      padding: 0.4rem 0.8rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
      font-weight: 500;
    }

    .parts-list {
      background: #f9fafb;
      padding: 1rem;
      border-left: 4px solid #a855f7;
      margin: 1rem 0;
    }

    .part {
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .part:last-child {
      border-bottom: none;
    }

    .skill {
      display: inline-block;
      background: #f3e8ff;
      color: #7c3aed;
      padding: 0.3rem 0.6rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .link {
      color: #7c3aed;
      text-decoration: none;
      word-break: break-all;
    }

    .footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.9em;
      color: #9ca3af;
      text-align: center;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">${project.title}</h1>
    <p class="description">${project.description}</p>
  </div>

  <div class="metadata">
    <div class="metadata-item">
      <div class="metadata-label">Category</div>
      <div class="metadata-value">${project.category}</div>
    </div>
    <div class="metadata-item">
      <div class="metadata-label">Difficulty</div>
      <div class="metadata-value">${project.difficulty}</div>
    </div>
    <div class="metadata-item">
      <div class="metadata-label">Budget</div>
      <div class="metadata-value">$${project.budget}</div>
    </div>
    <div class="metadata-item">
      <div class="metadata-label">Timeline</div>
      <div class="metadata-value">${project.timeWeeks} weeks</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Why It's Great</div>
    <p>${project.whyGreat}</p>
  </div>

  <div class="section">
    <div class="section-title">Time Commitment</div>
    <p><strong>Duration:</strong> ${project.timeWeeks} weeks</p>
    <p><strong>Time Per Week:</strong> ${project.timePerWeek}</p>
  </div>

  <div class="section">
    <div class="section-title">Budget</div>
    <p><strong>Total Cost:</strong> $${project.budget} (${project.budgetRange})</p>
  </div>

  <div class="section">
    <div class="section-title">Required Skills</div>
    <div class="tags">
      ${project.requiredSkills.map(skill => `<span class="skill">${skill}</span>`).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Parts Needed</div>
    <div class="parts-list">
      ${project.partsNeeded.map(part => `<div class="part">• ${part}</div>`).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Additional Info</div>
    <p><strong>Location:</strong> ${Array.isArray(project.location) ? project.location.join(', ') : project.location}</p>
    <p><strong>Team Size:</strong> ${project.teamSize}</p>
    <p><strong>Indoor/Outdoor:</strong> ${project.indoor && project.outdoor ? 'Both' : project.indoor ? 'Indoor' : 'Outdoor'}</p>
  </div>

  <div class="section">
    <div class="section-title">Tutorial & Resources</div>
    <p>
      <strong>Link:</strong> <a href="${project.tutorialLink}" class="link">${project.tutorialLink}</a>
    </p>
  </div>

  <div class="section">
    <div class="section-title">Share This Project</div>
    <p>
      <strong>Share Link:</strong><br>
      <a href="${shareLink}" class="link">${shareLink}</a>
    </p>
  </div>

  <div class="footer">
    <p>Generated from Summer Project Finder</p>
    <p>Find your perfect summer project and build something amazing.</p>
  </div>
</body>
</html>
`.trim()
}

/**
 * Download PDF using browser print dialog
 * @param {Object} project - Project object
 */
export const downloadPDF = (project) => {
  const content = generatePDFContent(project)
  const printWindow = window.open('', '', 'width=800,height=600')

  if (!printWindow) {
    console.error('Failed to open print window. Pop-ups may be blocked.')
    return
  }

  printWindow.document.write(content)
  printWindow.document.close()

  // Use setTimeout to ensure content is rendered before printing
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 100)
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (e) {
      document.body.removeChild(textArea)
      return false
    }
  }
}
