/**
 * Utility functions for printing and PDF generation
 */

/**
 * Opens the browser's print dialog for the current page
 * This allows users to save as PDF or print the report
 */
export function printReport() {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

/**
 * Generates a filename for the report based on current date
 */
export function generateReportFilename(scenarioName?: string): string {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
  const baseName = scenarioName 
    ? `HELOC-Report-${scenarioName.replace(/[^a-zA-Z0-9]/g, '-')}`
    : 'HELOC-Report'
  
  return `${baseName}-${dateStr}.pdf`
}

/**
 * Creates a temporary print-only page with the report content
 * This allows printing just the report without other page elements
 */
export function printReportInNewWindow(reportHTML: string, title: string = 'HELOC Report') {
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  
  if (!printWindow) {
    console.error('Failed to open print window')
    return
  }

  const printDocument = printWindow.document
  printDocument.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            color: #111827;
            font-size: 11pt;
          }
          
          @media print {
            body {
              margin: 0;
            }
            @page {
              size: letter;
              margin: 0.5in;
            }
          }

          /* Tailwind-like utility classes for the report */
          .printable-report { padding: 2rem; background-color: white; max-width: 8.5in; margin: 0 auto; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .text-base { font-size: 1rem; line-height: 1.5rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mt-1 { margin-top: 0.25rem; }
          .mt-2 { margin-top: 0.5rem; }
          .mt-6 { margin-top: 1.5rem; }
          .mr-1 { margin-right: 0.25rem; }
          .mr-2 { margin-right: 0.5rem; }
          .mr-3 { margin-right: 0.75rem; }
          .ml-1 { margin-left: 0.25rem; }
          .ml-3 { margin-left: 0.75rem; }
          .p-1 { padding: 0.25rem; }
          .p-2 { padding: 0.5rem; }
          .p-4 { padding: 1rem; }
          .p-8 { padding: 2rem; }
          .pt-4 { padding-top: 1rem; }
          .pb-4 { padding-bottom: 1rem; }
          .pr-2 { padding-right: 0.5rem; }
          .pl-2 { padding-left: 0.5rem; }
          .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .px-2\\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }
          .py-0 { padding-top: 0; padding-bottom: 0; }
          .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
          .space-y-1 > * + * { margin-top: 0.25rem; }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .space-y-3 > * + * { margin-top: 0.75rem; }
          .space-y-6 > * + * { margin-top: 1.5rem; }
          .space-x-2 > * + * { margin-left: 0.5rem; }
          .rounded-lg { border-radius: 0.5rem; }
          .rounded-full { border-radius: 9999px; }
          .border { border-width: 1px; }
          .border-2 { border-width: 2px; }
          .border-t { border-top-width: 1px; }
          .border-b { border-bottom-width: 1px; }
          .border-b-2 { border-bottom-width: 2px; }
          .border-gray-200 { border-color: #e5e7eb; }
          .border-gray-300 { border-color: #d1d5db; }
          .border-gray-800 { border-color: #1f2937; }
          .border-blue-200 { border-color: #bfdbfe; }
          .border-blue-300 { border-color: #93c5fd; }
          .border-green-200 { border-color: #bbf7d0; }
          .border-green-300 { border-color: #86efac; }
          .bg-white { background-color: #ffffff; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .bg-gray-300 { background-color: #d1d5db; }
          .bg-blue-50 { background-color: #eff6ff; }
          .bg-blue-100 { background-color: #dbeafe; }
          .bg-green-50 { background-color: #f0fdf4; }
          .bg-green-100 { background-color: #dcfce7; }
          .bg-green-500 { background-color: #22c55e; }
          .bg-purple-100 { background-color: #e9d5ff; }
          .bg-yellow-50 { background-color: #fefce8; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-700 { color: #374151; }
          .text-gray-900 { color: #111827; }
          .text-blue-600 { color: #2563eb; }
          .text-blue-700 { color: #1d4ed8; }
          .text-blue-800 { color: #1e40af; }
          .text-blue-900 { color: #1e3a8a; }
          .text-green-600 { color: #16a34a; }
          .text-green-700 { color: #15803d; }
          .text-green-800 { color: #166534; }
          .text-green-900 { color: #14532d; }
          .text-purple-800 { color: #6b21a8; }
          .text-purple-900 { color: #581c87; }
          .text-orange-700 { color: #c2410c; }
          .text-orange-800 { color: #9a3412; }
          .text-white { color: #ffffff; }
          .flex { display: flex; }
          .grid { display: grid; }
          .hidden { display: none; }
          .block { display: block; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-4 { gap: 1rem; }
          .gap-6 { gap: 1.5rem; }
          .gap-8 { gap: 2rem; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .top-2 { top: 0.5rem; }
          .bottom-2 { bottom: 0.5rem; }
          .left-2 { left: 0.5rem; }
          .right-0 { right: 0; }
          .right-2 { right: 0.5rem; }
          .top-1\\/2 { top: 50%; }
          .transform { transform: translateY(-50%); }
          .h-4 { height: 1rem; }
          .h-5 { height: 1.25rem; }
          .h-16 { height: 4rem; }
          .w-2 { width: 0.5rem; }
          .h-2 { height: 0.5rem; }
          .w-4 { width: 1rem; }
          .w-5 { width: 1.25rem; }
          .max-w-\\[8\\.5in\\] { max-width: 8.5in; }
          .mx-auto { margin-left: auto; margin-right: auto; }

          /* Gradient backgrounds */
          .bg-gradient-to-r { 
            background: linear-gradient(to right, #eff6ff, #dbeafe); 
          }
          .bg-gradient-to-br { 
            background: linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to)); 
          }
          .from-blue-50 { --tw-gradient-from: #eff6ff; }
          .to-blue-100 { --tw-gradient-to: #dbeafe; }
          .from-green-50 { --tw-gradient-from: #f0fdf4; }
          .to-green-100 { --tw-gradient-to: #dcfce7; }
          .from-yellow-50 { --tw-gradient-from: #fefce8; }
          .to-orange-50 { --tw-gradient-to: #fff7ed; }

          /* Additional utility classes */
          ul { margin: 0; padding: 0; list-style: none; }
          ul li { position: relative; padding-left: 1rem; }
          ul li:before { content: "•"; position: absolute; left: 0; }
          
          /* Overflow and layout */
          .overflow-hidden { overflow: hidden; }
          
          /* Ensure proper printing */
          @media print {
            .printable-report section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${reportHTML}
      </body>
    </html>
  `)
  
  printDocument.close()
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    
    // Close the window after printing (user can cancel if they want)
    printWindow.onafterprint = () => {
      printWindow.close()
    }
  }
}

/**
 * Checks if the browser supports print functionality
 */
export function isPrintSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.print === 'function'
}