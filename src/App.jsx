import React from "react";
import Header from "./components/Header";
import Form from "./components/Form";
import Preview from "./components/Preview";
import LoadingSpinner from "./components/LoadingSpinner";
import ProjectSelectModal from "./components/ProjectSelectModal";
import { useResumeGeneration } from "./hooks/useResumeGeneration";

const App = () => {
  const {
    // Actions
    generateResume,
    fetchTopProjects,
    resetForm,

    // Modal
    topProjects,
    showProjectModal,
    setShowProjectModal,
    pendingFormData,

    // States
    isLoading,
    isFetchingProjects,
    isGeneratingResume,
    error,
    success,
    resume,
    googleDocUrl
  } = useResumeGeneration();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= LEFT: FORM ================= */}
        <div className="h-full">
          <Form
            fetchTopProjects={fetchTopProjects}
            resetForm={resetForm}
            isLoading={isLoading}
            isFetchingProjects={isFetchingProjects}
            isGeneratingResume={isGeneratingResume}
          />
        </div>

        {/* ================= RIGHT: PREVIEW ================= */}
        <div className="h-full">
          {/* 🆕 SHOW SPINNER FOR BOTH STAGES */}
          {isLoading && (
            <LoadingSpinner
              stage={isFetchingProjects ? 'fetching' : 'generating'}
            />
          )}

          {/* ERROR STATE */}
          {!isLoading && error && (
            <div className="bg-white shadow-md rounded-lg p-6 h-full flex items-center justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {!isLoading && success && (
            <Preview
              resume={resume}
              googleDocUrl={googleDocUrl}
              loading={false}
              error={null}
              success={true}
            />
          )}

          {/* EMPTY STATE */}
          {!isLoading && !success && !error && (
            <div className="bg-white shadow-md rounded-lg p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg
                  className="w-24 h-24 mx-auto mb-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-xl font-medium text-gray-500 mb-2">
                  No Resume Generated Yet
                </p>
                <p className="text-sm text-gray-400">
                  Fill the form and click Generate Resume to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= PROJECT SELECTION MODAL ================= */}
      {showProjectModal && (
        <ProjectSelectModal
          projects={topProjects}
          formData={pendingFormData}
          onClose={() => setShowProjectModal(false)}
          onConfirm={(selectedProjects) => {
            setShowProjectModal(false);
            generateResume({
              ...pendingFormData,
              selectedProjects
            });
          }}
        />
      )}
    </div>
  );
};

export default App;