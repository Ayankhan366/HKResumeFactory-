import { Briefcase } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          {/* App Title */}
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            ResumeSync
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            AI-Powered Resume Customization
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 max-w-2xl mx-auto">
            Customize your resume based on job descriptions and requirements
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;

