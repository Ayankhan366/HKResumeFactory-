import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

const Preview = ({ resume, googleDocUrl, loading, error, success }) => {
  const [copied, setCopied] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  // Set timestamp when resume is successfully generated
  useEffect(() => {
    if (success && resume) {
      setGeneratedAt(new Date());
    }
  }, [success, resume]);

  const handleCopyToClipboard = async () => {
    if (!resume) return;

    try {
      const textToCopy = typeof resume === 'object'
        ? JSON.stringify(resume, null, 2)
        : resume;

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getCharacterCount = () => {
    if (!resume) return 0;

    if (typeof resume === 'string') {
      return resume.length;
    }

    if (typeof resume === 'object') {
      return JSON.stringify(resume).length;
    }

    return 0;
  };

  const characterCount = getCharacterCount();
  const formattedCount = characterCount.toLocaleString();

  // Loading state
  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col" style={{ minHeight: '600px' }}>
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 h-full flex items-center justify-center">
          <div className="flex flex-col items-center justify-center py-12 px-4">
            {/* Spinner */}
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Loading Message */}
            <p className="text-lg font-medium text-gray-700 mb-4">
              Customizing your resume with AI...
            </p>

            {/* Progress Indicator */}
            <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex flex-col" style={{ minHeight: '600px' }}>
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 h-full flex flex-col p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-medium">Error</p>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!resume || (typeof resume === 'object' && Object.keys(resume).length === 0)) {
    return (
      <div className="w-full h-full flex flex-col" style={{ minHeight: '600px' }}>
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 h-full flex flex-col p-8 items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg">No resume generated yet.</p>
            <p className="mt-2">Fill the form and click Generate Resume</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="w-full h-full flex flex-col" style={{ minHeight: '600px', maxHeight: '1120px' }}>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 h-full flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="font-semibold text-gray-700">{formattedCount} characters</span>
              {generatedAt && (
                <span className="text-gray-600">
                  Generated at {generatedAt.toLocaleString()}
                </span>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Preview only. Final resume saved to Google Drive.
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {googleDocUrl && (
              <a
                href={googleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open in Google Docs</span>
              </a>
            )}
          </div>
        </div>

        {/* Resume Content */}
        <div className="px-6 sm:px-8 py-6 flex-1 overflow-y-auto bg-white">
          <div className="resume-content">
            {(() => {
              if (typeof resume === 'object' && resume !== null) {
                const data = resume;

                return (
                  <div className="space-y-8 font-sans text-gray-800">

                    {/* Header */}
                    {data.header && (
                      <div className="border-b-2 border-gray-200 pb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase">
                          {data.header.profile || data.header.position || 'Developer Profile'}
                        </h1>
                        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-600 mt-3">
                          {data.header.experience && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-900">Experience:</span> {data.header.experience}
                            </div>
                          )}
                          {data.header.location && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-900">Location:</span> {data.header.location}
                            </div>
                          )}
                          {data.header.availability && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-900">Availability:</span> {data.header.availability}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Professional Summary */}
                    {data.summary && (
                      <section>
                        <h2 className="text-xl font-bold text-gray-900 uppercase mb-3 border-b border-gray-200 pb-1">
                          Professional Summary
                        </h2>
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                          {data.summary}
                        </div>
                      </section>
                    )}

                    {/* Skills */}
                    {data.skills && (
                      <section>
                        <h2 className="text-xl font-bold text-gray-900 uppercase mb-3 border-b border-gray-200 pb-1">
                          Core Skills
                        </h2>
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                          {data.skills}
                        </div>
                      </section>
                    )}

                    {/* Experience */}
                    {data.detailedExperience && (
                      <section>
                        <h2 className="text-xl font-bold text-gray-900 uppercase mb-3 border-b border-gray-200 pb-1">
                          Detailed Experience
                        </h2>
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                          {data.detailedExperience}
                        </div>
                      </section>
                    )}

                    {/* Projects */}
                    {data.projects && (
                      <section>
                        <h2 className="text-xl font-bold text-gray-900 uppercase mb-3 border-b border-gray-200 pb-1">
                          Project Highlights
                        </h2>
                        <div className="leading-relaxed text-gray-700 space-y-6">
                          {(() => {
                            const projectsText = data.projects;
                            const projectBlocks = projectsText.split(/\n\n+/);

                            return projectBlocks.map((block, blockIdx) => {
                              if (!block.trim()) return null;

                              const lines = block.split('\n');
                              return (
                                <div key={blockIdx} className="mb-6 last:mb-0">
                                  {lines.map((line, lineIdx) => {
                                    const trimmedLine = line.trim();
                                    if (!trimmedLine) return null;

                                    const titleMatch = trimmedLine.match(/^(\d+\.)\s+(.+)$/);
                                    if (titleMatch) {
                                      return (
                                        <h3 key={lineIdx} className="font-bold text-gray-900 mb-2 mt-1">
                                          {trimmedLine}
                                        </h3>
                                      );
                                    }

                                    const labelMatch = trimmedLine.match(/^(Description:|Relevance:|Key Focus Areas:|Technologies:)\s*(.+)$/i);
                                    if (labelMatch) {
                                      return (
                                        <div key={lineIdx} className="mb-2">
                                          <span className="font-bold text-gray-900">{labelMatch[1]}</span>
                                          <span className="ml-1">{labelMatch[2]}</span>
                                        </div>
                                      );
                                    }

                                    const linkMatch = trimmedLine.match(/^([•\-]?)?\s*(Web Link:|Play Store:|App Store:)\s*(.+)$/i);
                                    if (linkMatch) {
                                      const bullet = linkMatch[1] ? '• ' : '';
                                      const label = linkMatch[2];
                                      const url = linkMatch[3];

                                      const urlOnlyMatch = url.match(/(https?:\/\/[^\s]+)/);
                                      const actualUrl = urlOnlyMatch ? urlOnlyMatch[1] : url;

                                      return (
                                        <div key={lineIdx} className="mb-1">
                                          {bullet && <span className="mr-1 font-bold">•</span>}
                                          <span className="font-bold text-gray-900">{label}</span>
                                          <a
                                            href={actualUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-1 text-blue-600 hover:text-blue-800 underline break-all"
                                          >
                                            {actualUrl}
                                          </a>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div key={lineIdx} className="mb-1">
                                        {trimmedLine}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </section>
                    )}

                    {/* Perks */}
                    {data.perks && (
                      <section className="bg-gray-50 p-4 rounded-lg mt-6">
                        <h2 className="text-lg font-bold text-gray-900 uppercase mb-3 text-center">
                          Availability & Perks
                        </h2>
                        <div className="flex flex-wrap justify-center gap-8 text-center">
                          {data.perks.timezone && (
                            <div>
                              <span className="block font-semibold text-gray-500 text-xs uppercase tracking-wider">Timezone</span>
                              <span className="font-medium text-gray-900">{data.perks.timezone}</span>
                            </div>
                          )}
                          {data.perks.price && (
                            <div>
                              <span className="block font-semibold text-gray-500 text-xs uppercase tracking-wider">Rate</span>
                              <span className="font-medium text-gray-900">{data.perks.price}</span>
                            </div>
                          )}
                        </div>
                      </section>
                    )}
                  </div>
                );
              }

              return (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {resume}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;