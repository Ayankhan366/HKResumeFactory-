import React, { useEffect, useState } from "react";
import { CheckSquare, Square, AlertCircle, Briefcase } from "lucide-react";

const ProjectSelectModal = ({ projects = [], formData, onConfirm, onClose }) => {
    const [selected, setSelected] = useState([]);
    const [warning, setWarning] = useState("");
    const [showFullJD, setShowFullJD] = useState(false);

    // Auto-select TOP 3 by default
    useEffect(() => {
        if (projects.length) {
            const topThree = projects.slice(0, 3);
            setSelected(topThree);
        }
    }, [projects]);

    // Toggle project selection
    const toggleProject = (project) => {
        let updated;
        const exists = selected.some(p => p.name === project.name);

        if (exists) {
            updated = selected.filter(p => p.name !== project.name);
        } else {
            updated = [...selected, project];
        }

        setSelected(updated);

        if (updated.length > 3) {
            setWarning("⚠️ Selecting more than 3 projects may reduce resume focus.");
        } else {
            setWarning("");
        }
    };

    // Get job description from formData
    const jobDescription = formData?.jobDescription || "";
    const truncatedJD = jobDescription.length > 200
        ? jobDescription.substring(0, 200) + "..."
        : jobDescription;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* ================= HEADER ================= */}
                <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Select Relevant Projects
                    </h2>
                    <p className="text-sm text-gray-600">
                        Top 3 projects are pre-selected based on job description match.
                    </p>
                </div>

                {/* ================= JOB DESCRIPTION SECTION ================= */}
                {jobDescription && (
                    <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                        <div className="flex items-start gap-3">
                            <Briefcase className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                                    Job Description
                                </h3>
                                <div className="relative">
                                    <p className={`text-sm text-gray-700 leading-relaxed ${!showFullJD && 'line-clamp-3'}`}>
                                        {showFullJD ? jobDescription : truncatedJD}
                                    </p>
                                    {jobDescription.length > 200 && (
                                        <button
                                            onClick={() => setShowFullJD(!showFullJD)}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 underline"
                                        >
                                            {showFullJD ? "Show less" : "Show more"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= PROJECT LIST ================= */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {projects.map((item, index) => {
                            const isSelected = selected.some(p => p.name === item.name);

                            return (
                                <div
                                    key={index}
                                    onClick={() => toggleProject(item)}
                                    className={`
                    relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                    ${isSelected
                                            ? "border-blue-500 bg-blue-50 shadow-md"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                        }
                  `}
                                >
                                    {/* Rank Badge */}
                                    <div className="absolute top-3 right-3 flex items-center gap-2">
                                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full">
                                            Rank #{index + 1}
                                        </span>
                                    </div>

                                    {/* Checkbox & Project Name */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {isSelected ? (
                                                <CheckSquare className="w-6 h-6 text-blue-600" />
                                            ) : (
                                                <Square className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 pr-24">
                                                {item.name}
                                            </h3>

                                            {/* Score Badge */}
                                            {typeof item.score === "number" && (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-3">
                                                    <span className="text-xs">Match Score:</span>
                                                    <span className="text-base">{item.score}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description Box */}
                                    {item.description && (
                                        <div className="mb-3 bg-white rounded-lg p-3 border border-gray-200">
                                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                Description
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Keywords Box */}
                                    {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                                        <div className="mb-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <div className="text-xs font-semibold text-blue-700 uppercase mb-2">
                                                Keywords
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {item.keywords.map((keyword, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded border border-blue-300"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Technologies Box */}
                                    {Array.isArray(item.technologies) && item.technologies.length > 0 && (
                                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                            <div className="text-xs font-semibold text-purple-700 uppercase mb-2">
                                                Technologies
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {item.technologies.map((tech, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-white text-purple-700 text-xs font-medium rounded border border-purple-300"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ================= WARNING ================= */}
                {warning && (
                    <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200">
                        <div className="flex items-center gap-2 text-yellow-800">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{warning}</span>
                        </div>
                    </div>
                )}

                {/* ================= FOOTER ================= */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">{selected.length}</span>{" "}
                        project(s) selected
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={selected.length === 0}
                            onClick={() => onConfirm(selected)}
                            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectSelectModal;