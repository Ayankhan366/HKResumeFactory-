import { Download, ExternalLink, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

const ActionButtons = ({ resume, googleDocUrl, resetForm, generateResume, formData, loading }) => {
    // Remove markdown formatting and extract plain text
    const removeMarkdown = (text) => {
        if (!text) return '';
        // Remove bold markers
        let cleaned = text.replace(/\*\*([^*]+)\*\*/g, '$1');
        // Remove markdown links [text](url) - keep just the text
        cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
        // Remove duplicate URLs (markdown link format when URL is already shown)
        cleaned = cleaned.replace(/\(https?:\/\/[^)]+\)\s*\[Link\]\(https?:\/\/[^)]+\)/gi, (match) => {
            const urlMatch = match.match(/\((https?:\/\/[^)]+)\)/);
            return urlMatch ? urlMatch[1] : match;
        });
        return cleaned;
    };

    // Parse markdown links [text](url) and return {text, url} or null
    const parseMarkdownLink = (text) => {
        if (!text) return null;
        const linkMatch = text.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
            return { text: linkMatch[1], url: linkMatch[2] };
        }
        return null;
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
            const paragraphSpacing = 0.5;
            const sectionSpacing = 4;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(normalFontSize);

            // Split resume into sections (double newlines)
            const allSections = resume.split(/\n\n+/);

            // Filter out duplicate link sections
            const sections = allSections.filter((section, index) => {
                const trimmed = section.trim();
                const prevSection = index > 0 ? allSections[index - 1].trim() : '';

                // Skip if this section is just [Link](url) or [text](url) and previous ends with (url)
                if (/^\[.+?\]\(.+?\)$/.test(trimmed) && /\(.+?\)$/.test(prevSection)) {
                    return false;
                }
                return true;
            });

            let prevSectionWasHeader = false;

            sections.forEach((section, sectionIndex) => {
                const trimmed = section.trim();
                if (!trimmed) return;

                // Split section into lines
                const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l);
                if (lines.length === 0) return;

                const firstLine = lines[0];
                const cleanFirstLine = removeMarkdown(firstLine);

                const renderLine = (line) => {
                    // Skip standalone [Link](url) lines as requested by user
                    if (/^\s*\[Link\]\(.+\)\s*$/i.test(line)) return;

                    const cleanLine = removeMarkdown(line);
                    if (!cleanLine) {
                        yPosition += lineHeight * 0.5;
                        return;
                    }

                    // Check if it's a bullet
                    if (/^[-•*]\s/.test(line) || /^\d+\.\s/.test(cleanLine)) {
                        let bulletText = cleanLine;
                        let isNumbered = false;
                        let number = null;

                        const numberMatch = cleanLine.match(/^(\d+)\.\s+(.+)$/);
                        if (numberMatch) {
                            number = numberMatch[1];
                            bulletText = numberMatch[2];
                            isNumbered = true;
                        } else {
                            bulletText = cleanLine.replace(/^[-•*]\s*/, '');
                        }

                        if (!bulletText || bulletText.trim().length === 0) return;

                        yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);

                        const bulletLabelMatch = bulletText.trim().match(/^([^:]+):\s*(.*)$/);
                        if (bulletLabelMatch && bulletLabelMatch[2] && bulletLabelMatch[2].trim()) {
                            pdf.setFont('helvetica', 'bold');
                            const bulletPrefix = isNumbered ? `${number}.` : '• ';
                            const labelText = `${bulletPrefix}${bulletLabelMatch[1]}: `;
                            pdf.text(labelText, margin, yPosition);
                            const labelWidth = pdf.getTextWidth(labelText + ' ');
                            pdf.setFont('helvetica', 'normal');
                            const value = bulletLabelMatch[2].trim();

                            const markdownLink = parseMarkdownLink(value);
                            if (markdownLink) {
                                pdf.setTextColor(0, 0, 255);
                                pdf.textWithLink(markdownLink.text, margin + labelWidth, yPosition, { url: markdownLink.url });
                                pdf.setTextColor(0, 0, 0);
                                yPosition += lineHeight * 2;
                            } else {
                                const urlMatch = value.match(/^(\()?(https?:\/\/[^\s)]+)(\))?/);
                                if (urlMatch) {
                                    const url = urlMatch[2];
                                    pdf.setTextColor(0, 0, 255);
                                    pdf.textWithLink(url, margin + labelWidth, yPosition, { url: url });
                                    pdf.setTextColor(0, 0, 0);
                                    yPosition += lineHeight * 2;
                                } else {
                                    const valueText = pdf.splitTextToSize(value, maxWidth - labelWidth);
                                    if (valueText.length > 0) {
                                        pdf.text(valueText[0], margin + labelWidth, yPosition);
                                        yPosition += lineHeight;
                                        for (let i = 1; i < valueText.length; i++) {
                                            yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                                            pdf.text(valueText[i], margin + labelWidth, yPosition);
                                            yPosition += lineHeight;
                                        }
                                    }
                                }
                            }
                        } else {
                            const bulletPrefix = isNumbered ? `${number}. ` : '• ';
                            if (isNumbered && line.includes('**')) {
                                pdf.setFont('helvetica', 'bold');
                            }
                            pdf.text(bulletPrefix, margin, yPosition);

                            // Dynamic indentation
                            const prefixWidth = pdf.getTextWidth(bulletPrefix);
                            const indent = isNumbered ? prefixWidth + 2 : 10;

                            const valueText = pdf.splitTextToSize(bulletText, maxWidth - indent);
                            if (valueText.length > 0) {
                                pdf.text(valueText[0], margin + indent, yPosition);
                                yPosition += lineHeight;
                                pdf.setFont('helvetica', 'normal');
                                for (let i = 1; i < valueText.length; i++) {
                                    yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                                    pdf.text(valueText[i], margin + indent, yPosition);
                                    yPosition += lineHeight;
                                }
                            }
                            pdf.setFont('helvetica', 'normal');
                        }
                    } else {
                        if (cleanLine.endsWith(':') && cleanLine.length < 50) {
                            yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(cleanLine, margin, yPosition);
                            pdf.setFont('helvetica', 'normal');
                            yPosition += lineHeight;
                            return;
                        }

                        const calendlyMatch = line.match(/^(.+?)\s*\[Calendly\]\((.+?)\)/i);
                        if (calendlyMatch) {
                            yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                            const prefixText = removeMarkdown(calendlyMatch[1]);
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(prefixText, margin, yPosition);
                            const prefixWidth = pdf.getTextWidth(prefixText + ' ');
                            pdf.setFont('helvetica', 'normal');
                            pdf.setTextColor(0, 0, 255);
                            pdf.textWithLink('Calendly', margin + prefixWidth, yPosition, { url: calendlyMatch[2] });
                            pdf.setTextColor(0, 0, 0);
                            yPosition += lineHeight * 2;
                            return;
                        }

                        const standaloneLink = parseMarkdownLink(line);
                        if (standaloneLink) {
                            yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                            pdf.setTextColor(0, 0, 255);
                            pdf.textWithLink(standaloneLink.text, margin, yPosition, { url: standaloneLink.url });
                            pdf.setTextColor(0, 0, 0);
                            yPosition += lineHeight * 2;
                            return;
                        }

                        const lineLabelMatch = cleanLine.match(/^([^:]+):\s*(.*)$/);
                        if (lineLabelMatch && lineLabelMatch[2] && lineLabelMatch[2].trim()) {
                            yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(lineLabelMatch[1] + ':', margin, yPosition);
                            const labelWidth = pdf.getTextWidth(lineLabelMatch[1] + ': ');
                            pdf.setFont('helvetica', 'normal');
                            const value = lineLabelMatch[2].trim();
                            const markdownLink = parseMarkdownLink(value);
                            if (markdownLink) {
                                pdf.setTextColor(0, 0, 255);
                                pdf.textWithLink(markdownLink.text, margin + labelWidth, yPosition, { url: markdownLink.url });
                                pdf.setTextColor(0, 0, 0);
                                yPosition += lineHeight * 2;
                            } else {
                                const urlMatch = value.match(/^(\()?(https?:\/\/[^\s)]+)(\))?/);
                                if (urlMatch) {
                                    const url = urlMatch[2];
                                    pdf.setTextColor(0, 0, 255);
                                    pdf.textWithLink(url, margin + labelWidth, yPosition, { url: url });
                                    pdf.setTextColor(0, 0, 0);
                                    yPosition += lineHeight * 2;
                                } else {
                                    const valueText = pdf.splitTextToSize(value, maxWidth - labelWidth);
                                    if (valueText.length > 0) {
                                        pdf.text(valueText[0], margin + labelWidth, yPosition);
                                        yPosition += lineHeight;
                                        for (let i = 1; i < valueText.length; i++) {
                                            yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                                            pdf.text(valueText[i], margin + labelWidth, yPosition);
                                            yPosition += lineHeight;
                                        }
                                    }
                                }
                            }
                        } else {
                            const splitText = pdf.splitTextToSize(cleanLine, maxWidth);
                            splitText.forEach((text) => {
                                yPosition = checkNewPage(pdf, yPosition, lineHeight, pageHeight, margin);
                                pdf.text(text, margin, yPosition);
                                yPosition += lineHeight;
                            });
                        }
                    }
                };

                // Check if it's a main header (starts with ** and is short)
                const isMainHeader = firstLine.startsWith('**') &&
                    firstLine.endsWith('**') &&
                    cleanFirstLine.length < 60 &&
                    lines.length === 1;

                // Check if it's a section header (ends with colon, or is bold and short)
                const isSectionHeader = (cleanFirstLine.endsWith(':') && !cleanFirstLine.startsWith('-')) ||
                    (firstLine.startsWith('**') && firstLine.endsWith('**') && cleanFirstLine.length < 50 && cleanFirstLine.includes(':'));

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

                if (isMainHeader) {
                    // Main header
                    pdf.setFontSize(headerFontSize);
                    pdf.setFont('helvetica', 'bold');
                    const headerText = cleanFirstLine;
                    const splitHeader = pdf.splitTextToSize(headerText, maxWidth);
                    splitHeader.forEach((text) => {
                        yPosition = checkNewPage(pdf, yPosition, lineHeight * 2, pageHeight, margin);
                        pdf.text(text, margin, yPosition);
                        yPosition += lineHeight * 1.2;
                    });
                    // Add underline
                    yPosition += 2;
                    pdf.setDrawColor(200, 200, 200);
                    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += sectionSpacing;
                    pdf.setFontSize(normalFontSize);
                    pdf.setFont('helvetica', 'normal');
                    prevSectionWasHeader = false;
                } else if (isSectionHeader) {
                    // Section header
                    yPosition += sectionSpacing;
                    pdf.setFontSize(sectionFontSize);
                    pdf.setFont('helvetica', 'bold');
                    const headerText = cleanFirstLine.replace(/:$/, '');
                    const splitHeader = pdf.splitTextToSize(headerText, maxWidth);
                    splitHeader.forEach((text) => {
                        yPosition = checkNewPage(pdf, yPosition, lineHeight * 1.5, pageHeight, margin);
                        pdf.text(text, margin, yPosition);
                        yPosition += lineHeight * 1.2;
                    });
                    yPosition += paragraphSpacing;
                    pdf.setFontSize(normalFontSize);
                    pdf.setFont('helvetica', 'normal');
                    prevSectionWasHeader = true;

                    // Render remaining lines if any
                    if (lines.length > 1) {
                        lines.slice(1).forEach(renderLine);
                    }
                } else if (isBulletList) {
                    // Standalone bullet list
                    lines.forEach(renderLine);
                    yPosition += paragraphSpacing;
                    prevSectionWasHeader = false;
                } else if (labelMatch && lines.length === 1) {
                    // Label-value pair
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
                    lines.forEach(renderLine);
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
                {/*<button
                    onClick={handleDownloadPDF}
                    disabled={!resume}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
                >
                    <Download className="w-5 h-5" />
                    <span>📥 Download PDF</span>
                </button>
                */}

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
