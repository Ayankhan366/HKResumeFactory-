import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Form = ({
  fetchTopProjects,
  resetForm,
  isLoading,
  isFetchingProjects,
  isGeneratingResume
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetFormHook,
    watch
  } = useForm({
    defaultValues: {
      jobDescription: "",
      industry: "",
      masterResumeLink: "",
      mainTech: "",
      portfolio: "",
      experienceNeeded: "",
      relevancePercentage: 85,
      currency: "$"
    }
  });

  // ✅ Submit handler → calls Webhook-1
  const onSubmit = (data) => {
    fetchTopProjects(data);
  };

  const handleReset = () => {
    resetFormHook();
    resetForm();
  };

  // Portfolio URL warning
  const portfolioValue = watch("portfolio");
  const [portfolioWarning, setPortfolioWarning] = useState("");

  useEffect(() => {
    if (!portfolioValue) {
      setPortfolioWarning("");
      return;
    }

    const looksLikeUrl = /^https?:\/\/.+/.test(portfolioValue.trim());
    setPortfolioWarning(
      looksLikeUrl
        ? ""
        : "⚠️ This doesn't look like a valid URL. Make sure it starts with http:// or https://"
    );
  }, [portfolioValue]);

  // ===============================
  // 🆕 DYNAMIC BUTTON TEXT
  // ===============================
  const getButtonText = () => {
    if (isFetchingProjects) {
      return "Fetching Projects...";
    }
    if (isGeneratingResume) {
      return "Generating Resume...";
    }
    return "Generate Resume";
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return (
        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <div
        className="bg-white shadow-md rounded-lg p-6 space-y-6 flex flex-col"
        style={{ minHeight: "600px", height: "100%" }}
      >
        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("jobDescription", {
              required: "Job description is required",
              validate: (v) => v.trim().length > 0 || "Cannot be empty"
            })}
            rows={8}
            disabled={isLoading}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.jobDescription ? "border-red-500" : "border-gray-300"
              } ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
          />
          {errors.jobDescription && (
            <p className="text-sm text-red-600 mt-1">
              {errors.jobDescription.message}
            </p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry <span className="text-red-500">*</span>
          </label>
          <input
            {...register("industry", { required: "Industry is required" })}
            disabled={isLoading}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.industry ? "border-red-500" : "border-gray-300"
              } ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
          />
          {errors.industry && (
            <p className="text-sm text-red-600 mt-1">
              {errors.industry.message}
            </p>
          )}
        </div>

        {/* Master Resume Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Master Resume Link <span className="text-red-500">*</span>
          </label>
          <input
            {...register("masterResumeLink", {
              required: "Master resume link is required"
            })}
            disabled={isLoading}
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.masterResumeLink ? "border-red-500" : "border-gray-300"
              } ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
          />
          {errors.masterResumeLink && (
            <p className="text-sm text-red-600 mt-1">
              {errors.masterResumeLink.message}
            </p>
          )}
        </div>

        {/* Main Tech */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Tech to Focus (optional)
          </label>
          <input
            {...register("mainTech")}
            disabled={isLoading}
            placeholder="e.g., React, Node.js, AWS"
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
          />
        </div>

        {/* Portfolio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio Link <span className="text-red-500">*</span>
          </label>
          <input
            {...register("portfolio")}
            disabled={isLoading}
            placeholder="https://docs.google.com/document/d/..."
            className={`w-full px-4 py-3 border rounded-lg transition-colors ${portfolioWarning ? "border-yellow-400" : "border-gray-300"
              } ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
          />
          {errors.portfolioWarning && (
            <p className="text-sm text-red-600 mt-1">
              {errors.portfolioWarning.message}
            </p>
          )}
        </div>

        {/* Experience Needed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Needed (optional)
          </label>
          <input
            {...register("experienceNeeded")}
            disabled={isLoading}
            placeholder="e.g., 5"
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
          />
        </div>

        {/* Relevance Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relevance Percentage (optional)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            {...register("relevancePercentage", {
              min: 1,
              max: 100
            })}
            disabled={isLoading}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
          />
          <p className="text-sm text-gray-500 mt-1">
            How closely should resume match JD? (Default: 85)
          </p>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency (optional)
          </label>
          <input
            {...register("currency")}
            disabled={isLoading}
            placeholder="$"
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
          />
        </div>

        {/* ===============================
            🆕 DYNAMIC BUTTONS
            =============================== */}
        <div className="flex gap-4 pt-4 mt-auto">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              } text-white shadow-md`}
          >
            {getButtonIcon()}
            <span>{getButtonText()}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${isLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95"
              } shadow-md`}
          >
            Clear Form
          </button>
        </div>

        {/* ===============================
            🆕 LOADING STAGE INDICATOR
            =============================== */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm font-medium text-blue-900">
              {isFetchingProjects && "Analyzing portfolio and ranking projects..."}
              {isGeneratingResume && "Customizing resume with AI..."}
            </span>
          </div>
        )}
      </div>
    </form>
  );
};

export default React.memo(Form);