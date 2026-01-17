const LoadingSpinner = ({ stage = 'generating' }) => {
  // Stage can be: 'fetching' or 'generating'

  const config = {
    fetching: {
      title: 'Fetching Projects',
      message: 'Analyzing your portfolio and ranking projects by relevance...',

      color: 'blue'
    },
    generating: {
      title: 'Generating Your Resume',
      message: 'AI is customizing your resume based on the job description...',

      color: 'blue'
    }
  };

  const current = config[stage] || config.generating;

  return (
    <div className="w-full h-full flex flex-col" style={{ minHeight: '600px' }}>
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 h-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-12 px-6 max-w-md">
          {/* Animated Icon */}
          <div className="text-6xl mb-6 animate-bounce">
            {current.icon}
          </div>

          {/* Spinner */}
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>

          {/* Title */}
          <p className="text-xl font-bold text-gray-800 mb-3 text-center">
            {current.title}
          </p>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center leading-relaxed mb-6">
            {current.message}
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-progress"></div>
          </div>

          {/* Tip */}
          <p className="text-xs text-gray-500 mt-6 text-center italic">
            {stage === 'fetching'
              ? 'This usually takes 5-10 seconds...'
              : 'This may take up to 30 seconds...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;