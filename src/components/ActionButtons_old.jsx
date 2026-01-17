import { Download, ExternalLink, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

const ActionButtons = ({ resume, googleDocUrl, resetForm, generateResume, formData, loading }) => {
  // Remove markdown formatting and extract plain text
  const removeMarkdown = (text) => {
    if (!text) return '';
    // Remove bold markers
    let cleaned = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    // Remove duplicate URLs (markdown link format when URL is already shown)
    cleaned = cleaned.replace(/\(https?:\/\/[^)]+\)\s*\[Link\]\(https?:\/\/[^)]+\)/gi, (match) => {
      const urlMatch = match.match(/\((https?:\/\/[^)]+)\)/);
      return urlMatch ? urlMatch[1] : match;
    });
    return cleaned;
  };

  // Check if text needs a new page
  const checkNewPage = (pdf, yPosition, lineHeight, pageHeight, margin) => {
    if (yPosition + lineHeight > pageHeight - margin) {
      pdf.addPage();
      return margin;
    }
    return yPosition;
  };

  const handleDownloadPDF = async () => {
    if (!resume) return;

    try {
      // Use text-based PDF generation for reliable output
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Default font settings
      const normalFontSize = 11;
      const headerFontSize = 18;
      const sectionFontSize = 14;
      const lineHeight = 6;
      const paragraphSpacing = 4;
      const sectionSpacing = 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(normalFontSize);

      // Split resume into sections (double newlines)
      const sections = resume.split(/\n\n+/);
      let prevSectionWasHeader = false;

      sections.forEach((section, sectionIndex) => {
        const trimmed = section.trim();
        if (!trimmed) return;

        // Split section into lines
        const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) return;

        const firstLine = lines[0];
        const cleanFirstLine = removeMarkdown(firstLine);

        // Check if it's a main header (starts with ** and is short)
        const isMainHeader = firstLine.startsWith('**') &&
          firstLine.endsWith('**') &&
          cleanFirstLine.length < 60 &&
          lines.length === 1;

        // Check if it's a section header (ends with colon, or is bold and short)
        const isSectionHeader = (cleanFirstLine.endsWith(':') && !cleanFirstLine.startsWith('-') && lines.length === 1) ||
          (firstLine.startsWith('**') && firstLine.endsWith('**') && cleanFirstLine.length < 50 && cleanFirstLine.includes(':') && lines.length === 1);

        // Check if it's a bullet list
        const bulletCount = lines.filter(line =>
          /^[-•*]\s/.test(line) ||
          /^[-•*][A-Za-z]/.test(line) ||
          /^\d+\.\s/.test(line)
        ).length;
        const isBulletList = bulletCount > 0 && (bulletCount === lines.length || bulletCount >= lines.length * 0.7);

        // Check if it's a label-value pair (like "**Name:** Lokesh")
        const labelMatch = firstLine.match(/^\*\*([^*]+):\*\*\s*(.+)$/);

        yPosition = checkNewPage(pdf, yPosition, lineHeight * 2, pageHeight, margin);

        if (prevSectionWasHeader && isBulletList) {
          // Bullets following a header (like "Experience:" followed by bullets)
          yPosition += paragraphSpacing;
          const bulletLines = lines.filter(line =>
            /^[-•*]\s/.test(line) ||
            /^[-•*][A-Za-z]/.test(line) ||
            /^\d+\.\s/.test(line)
          );

          bulletLines.forEach((line) => {
            const cleanLine = removeMarkdown(line);
            let bulletText = cleanLine;
            let isNumbered = false;
            let number = null;

            // Check if it's a numbered item (like "1. Project Name")
            if (/^\d+\.\s+/.test(cleanLine)) {
              const numberMatch = cleanLine.match(/^(\d+)\.\s+(.+)$/);
              if (numberMatch) {
                number = numberMatch[1];
                bulletText = numberMatch[2];
                isNumbered = true;
              }
            } else if (/^[-•*]\s+/.test(cleanLine)) {
              bulletText = cleanLine.replace(/^[-•*]\s+/, '');
            } else if (/^[-•*][A-Za-z]/.test(cleanLine)) {
              bulletText = cleanLine.substring(1);
            } else {
              bulletText = cleanLine.replace(/^[-•*]\s*/, '');
            }

            if (!bulletText || bulletText.trim().length === 0) return;

            yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
            const splitText = pdf.splitTextToSize(bulletText.trim(), maxWidth - 5);
            splitText.forEach((text, idx) => {
              yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
              if (isNumbered && idx === 0) {
                pdf.text(number + '. ' + text, margin + 5, yPosition);
              } else if (isNumbered) {
                pdf.text(text, margin + 15, yPosition);
              } else {
                pdf.text('• ' + text, margin + 5, yPosition);
              }
              yPosition += lineHeight;
            });
          });
          yPosition += paragraphSpacing;
          prevSectionWasHeader = false;
        } else if (isMainHeader) {
          // Main header (like "Developer Profile")
          pdf.setFontSize(headerFontSize);
          pdf.setFont('helvetica', 'bold');
          const headerText = cleanFirstLine;
          const splitHeader = pdf.splitTextToSize(headerText, maxWidth);
          splitHeader.forEach((text, idx) => {
            yPosition = checkNewPage(pdf, yPosition, lineHeight * 2, pageHeight, margin);
            pdf.text(text, margin, yPosition);
            yPosition += lineHeight * 1.2;
          });
          // Add underline effect with a line
          yPosition += 2;
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += sectionSpacing;
          pdf.setFontSize(normalFontSize);
          pdf.setFont('helvetica', 'normal');
          prevSectionWasHeader = false;
        } else if (isSectionHeader) {
          // Section header (like "Core Skills:" or "Experience:")
          yPosition += sectionSpacing;
          pdf.setFontSize(sectionFontSize);
          pdf.setFont('helvetica', 'bold');
          const headerText = cleanFirstLine.replace(/:$/, '');
          const splitHeader = pdf.splitTextToSize(headerText, maxWidth);
          splitHeader.forEach((text, idx) => {
            yPosition = checkNewPage(pdf, yPosition, lineHeight * 1.5, pageHeight, margin);
            pdf.text(text, margin, yPosition);
            yPosition += lineHeight * 1.2;
          });
          yPosition += paragraphSpacing;
          pdf.setFontSize(normalFontSize);
          pdf.setFont('helvetica', 'normal');
          prevSectionWasHeader = true;
        } else if (isBulletList) {
          // Bullet list
          yPosition += paragraphSpacing;
          const bulletLines = lines.filter(line =>
            /^[-•*]\s/.test(line) ||
            /^[-•*][A-Za-z]/.test(line) ||
            /^\d+\.\s/.test(line)
          );

          bulletLines.forEach((line) => {
            const cleanLine = removeMarkdown(line);
            let bulletText = cleanLine;
            let isNumbered = false;
            let number = null;

            // Check if it's a numbered item (like "1. Project Name")
            if (/^\d+\.\s+/.test(cleanLine)) {
              const numberMatch = cleanLine.match(/^(\d+)\.\s+(.+)$/);
              if (numberMatch) {
                number = numberMatch[1];
                bulletText = numberMatch[2];
                isNumbered = true;
              }
            } else if (/^[-•*]\s+/.test(cleanLine)) {
              bulletText = cleanLine.replace(/^[-•*]\s+/, '');
            } else if (/^[-•*][A-Za-z]/.test(cleanLine)) {
              bulletText = cleanLine.substring(1);
            } else {
              bulletText = cleanLine.replace(/^[-•*]\s*/, '');
            }

            if (!bulletText || bulletText.trim().length === 0) return;

            yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);

            // Check if line contains bold text (label: value format)
            const boldMatch = bulletText.trim().match(/^([^:]+):\s*(.+)$/);
            if (boldMatch) {
              // Format as label: value
              pdf.setFont('helvetica', 'bold');
              if (isNumbered) {
                pdf.text(number + '. ' + boldMatch[1] + ':', margin + 5, yPosition);
              } else {
                pdf.text(boldMatch[1] + ':', margin + 5, yPosition);
              }
              const labelWidth = pdf.getTextWidth((isNumbered ? number + '. ' : '') + boldMatch[1] + ': ');
              pdf.setFont('helvetica', 'normal');
              const valueText = pdf.splitTextToSize(boldMatch[2], maxWidth - labelWidth - 5);
              if (valueText.length > 1) {
                pdf.text(valueText[0], margin + 5 + labelWidth, yPosition);
                yPosition += lineHeight;
                for (let i = 1; i < valueText.length; i++) {
                  yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                  pdf.text(valueText[i], margin + 5 + labelWidth, yPosition);
                  yPosition += lineHeight;
                }
              } else {
                pdf.text(valueText[0], margin + 5 + labelWidth, yPosition);
                yPosition += lineHeight;
              }
            } else {
              // Regular bullet point
              const splitText = pdf.splitTextToSize(bulletText.trim(), maxWidth - 5);
              splitText.forEach((text, idx) => {
                yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                if (isNumbered && idx === 0) {
                  pdf.text(number + '. ' + text, margin + 5, yPosition);
                } else if (isNumbered) {
                  pdf.text(text, margin + 15, yPosition);
                } else {
                  pdf.text('• ' + text, margin + 5, yPosition);
                }
                yPosition += lineHeight;
              });
            }
          });
          yPosition += paragraphSpacing;
          prevSectionWasHeader = false;
        } else if (labelMatch && lines.length === 1) {
          // Label-value pair (like "**Name:** Lokesh")
          yPosition += paragraphSpacing;
          pdf.setFont('helvetica', 'bold');
          pdf.text(labelMatch[1] + ':', margin, yPosition);
          const labelWidth = pdf.getTextWidth(labelMatch[1] + ': ');
          pdf.setFont('helvetica', 'normal');
          const valueText = removeMarkdown(labelMatch[2]);
          const splitValue = pdf.splitTextToSize(valueText, maxWidth - labelWidth);
          if (splitValue.length > 1) {
            pdf.text(splitValue[0], margin + labelWidth, yPosition);
            yPosition += lineHeight;
            for (let i = 1; i < splitValue.length; i++) {
              yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
              pdf.text(splitValue[i], margin + labelWidth, yPosition);
              yPosition += lineHeight;
            }
          } else {
            pdf.text(splitValue[0], margin + labelWidth, yPosition);
            yPosition += lineHeight;
          }
          prevSectionWasHeader = false;
        } else {
          // Regular paragraph
          yPosition += paragraphSpacing;
          lines.forEach((line) => {
            const cleanLine = removeMarkdown(line);
            if (!cleanLine) {
              yPosition += lineHeight * 0.5;
              return;
            }

            // Check if line contains bold text (label: value format)
            const boldMatch = cleanLine.match(/^([^:]+):\s*(.+)$/);
            if (boldMatch) {
              // Format as label: value
              pdf.setFont('helvetica', 'bold');
              pdf.text(boldMatch[1] + ':', margin, yPosition);
              const labelWidth = pdf.getTextWidth(boldMatch[1] + ': ');
              pdf.setFont('helvetica', 'normal');
              const valueText = pdf.splitTextToSize(boldMatch[2], maxWidth - labelWidth);
              if (valueText.length > 1) {
                pdf.text(valueText[0], margin + labelWidth, yPosition);
                yPosition += lineHeight;
                for (let i = 1; i < valueText.length; i++) {
                  yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                  pdf.text(valueText[i], margin + labelWidth, yPosition);
                  yPosition += lineHeight;
                }
              } else {
                pdf.text(valueText[0], margin + labelWidth, yPosition);
                yPosition += lineHeight;
              }
            } else {
              // Regular text
              const splitText = pdf.splitTextToSize(cleanLine, maxWidth);
              splitText.forEach((text, idx) => {
                yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                pdf.text(text, margin, yPosition);
                yPosition += lineHeight;
              });
            }
          });
          yPosition += paragraphSpacing;
          prevSectionWasHeader = false;
        }
      });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `Resume_${timestamp}.pdf`;

      // Save PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleOpenInDrive = () => {
    if (googleDocUrl) {
      window.open(googleDocUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleGenerateAnother = () => {
    if (generateResume && formData && !loading) {
      // Regenerate resume with the same form data
      generateResume(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={!resume}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>📥 Download PDF</span>
        </button>

        {/* Open in Google Drive Button */}
        {googleDocUrl && (
          <button
            onClick={handleOpenInDrive}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition shadow-md hover:shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            <span>🔗 Open in Drive</span>
          </button>
        )}

        {/* Generate Another Button */}
        <button
          onClick={handleGenerateAnother}
          disabled={loading || !formData}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition shadow-md hover:shadow-lg disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{loading ? 'Generating...' : '🔄 Generate Another'}</span>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;

