// Heavy libs are loaded on demand to keep initial client bundles small

export interface PDFGenerationOptions {
  filename?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  margin?: number;
  scale?: number;
}

/**
 * Generate a PDF from HTML content and trigger download
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  options: PDFGenerationOptions = {},
): Promise<void> {
  // Dynamically import heavy dependencies to avoid bloating common client chunks
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const {
    filename = "HELOC-Report.pdf",
    format = "a4",
    orientation = "portrait",
    margin = 10,
    scale = 2,
  } = options;

  try {
    // Create a temporary container for the HTML content
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.style.width = "210mm"; // A4 width
    tempContainer.style.backgroundColor = "white";
    tempContainer.style.padding = "20px";
    tempContainer.style.fontFamily = "Arial, sans-serif";
    tempContainer.style.fontSize = "12px";
    tempContainer.style.lineHeight = "1.4";

    // Add some basic styling for better PDF appearance
    const style = document.createElement("style");
    style.textContent = `
      .printable-report * {
        box-sizing: border-box;
      }
      .printable-report h1 {
        font-size: 24px;
        margin-bottom: 10px;
        color: #1f2937;
      }
      .printable-report h2 {
        font-size: 18px;
        margin-bottom: 8px;
        color: #374151;
      }
      .printable-report h3 {
        font-size: 16px;
        margin-bottom: 6px;
        color: #4b5563;
      }
      .printable-report h4 {
        font-size: 14px;
        margin-bottom: 4px;
        color: #6b7280;
      }
      .printable-report p {
        margin-bottom: 8px;
      }
      .printable-report .grid {
        display: grid;
        gap: 16px;
      }
      .printable-report .grid-cols-2 {
        grid-template-columns: 1fr 1fr;
      }
      .printable-report .grid-cols-3 {
        grid-template-columns: 1fr 1fr 1fr;
      }
      .printable-report .flex {
        display: flex;
      }
      .printable-report .justify-between {
        justify-content: space-between;
      }
      .printable-report .items-center {
        align-items: center;
      }
      .printable-report .text-center {
        text-align: center;
      }
      .printable-report .text-right {
        text-align: right;
      }
      .printable-report .font-bold {
        font-weight: bold;
      }
      .printable-report .font-semibold {
        font-weight: 600;
      }
      .printable-report .font-medium {
        font-weight: 500;
      }
      .printable-report .text-green-600,
      .printable-report .text-green-700,
      .printable-report .text-green-900 {
        color: #059669;
      }
      .printable-report .text-blue-900 {
        color: #1e3a8a;
      }
      .printable-report .text-gray-600 {
        color: #6b7280;
      }
      .printable-report .text-gray-700 {
        color: #374151;
      }
      .printable-report .text-gray-900 {
        color: #1f2937;
      }
      .printable-report .bg-blue-50 {
        background-color: #eff6ff;
      }
      .printable-report .bg-green-50 {
        background-color: #f0fdf4;
      }
      .printable-report .bg-gray-50 {
        background-color: #f9fafb;
      }
      .printable-report .border {
        border: 1px solid #d1d5db;
      }
      .printable-report .border-blue-300 {
        border-color: #93c5fd;
      }
      .printable-report .border-green-300 {
        border-color: #86efac;
      }
      .printable-report .border-gray-300 {
        border-color: #d1d5db;
      }
      .printable-report .rounded-lg {
        border-radius: 8px;
      }
      .printable-report .p-4 {
        padding: 16px;
      }
      .printable-report .p-2 {
        padding: 8px;
      }
      .printable-report .mb-1 {
        margin-bottom: 4px;
      }
      .printable-report .mb-2 {
        margin-bottom: 8px;
      }
      .printable-report .mb-3 {
        margin-bottom: 12px;
      }
      .printable-report .mb-6 {
        margin-bottom: 24px;
      }
      .printable-report .mt-6 {
        margin-top: 24px;
      }
      .printable-report .space-y-1 > * + * {
        margin-top: 4px;
      }
      .printable-report .space-y-2 > * + * {
        margin-top: 8px;
      }
      .printable-report .text-xs {
        font-size: 10px;
      }
      .printable-report .text-sm {
        font-size: 12px;
      }
      .printable-report .text-lg {
        font-size: 16px;
      }
      .printable-report .text-xl {
        font-size: 18px;
      }
      .printable-report .text-2xl {
        font-size: 20px;
      }
    `;
    tempContainer.appendChild(style);

    document.body.appendChild(tempContainer);

    // Convert HTML to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: format,
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // Add first page
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - margin * 2;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - margin * 2;
    }

    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

/**
 * Generate PDF from a React component rendered to string
 */
export async function generatePDFFromComponent(
  componentHTML: string,
  filename?: string,
): Promise<void> {
  const options: PDFGenerationOptions = {
    filename: filename || "HELOC-Report.pdf",
    format: "a4",
    orientation: "portrait",
    margin: 10,
    scale: 1.5,
  };

  await generatePDFFromHTML(componentHTML, options);
}
