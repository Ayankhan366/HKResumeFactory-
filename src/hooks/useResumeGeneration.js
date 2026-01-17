import { useState, useCallback } from 'react';
import { sendToN8n } from '../services/api';

export const useResumeGeneration = () => {
  // ===============================
  // STATE
  // ===============================
  const [formData, setFormData] = useState({});
  const [resume, setResume] = useState('');
  const [googleDocUrl, setGoogleDocUrl] = useState('');

  // 🆕 ENHANCED LOADING STATES
  const [loadingStage, setLoadingStage] = useState(null); // null | 'fetching-projects' | 'generating-resume'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // PROJECT SELECTION FLOW
  const [topProjects, setTopProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  // ===============================
  // COMPUTED STATES
  // ===============================
  const isLoading = loadingStage !== null;
  const isFetchingProjects = loadingStage === 'fetching-projects';
  const isGeneratingResume = loadingStage === 'generating-resume';

  // ===============================
  // WEBHOOK-1 → FETCH TOP PROJECTS
  // ===============================
  const fetchTopProjects = useCallback(async (formDataToSend) => {
    setLoadingStage('fetching-projects'); // ✅ Stage 1
    setError('');
    setSuccess(false);

    try {
      console.log('📡 [Stage 1] Fetching top projects...');

      const response = await sendToN8n(
        formDataToSend,
        import.meta.env.VITE_WEBHOOK_1
      );

      console.log("✅ Webhook-1 Response:", response);

      // Normalize response
      let data = response;
      if (Array.isArray(response)) data = response[0];
      if (response?.data) data = response.data;

      const projects = data?.projects || [];

      if (projects.length) {
        setTopProjects(projects);
        setPendingFormData(formDataToSend);
        setShowProjectModal(true); // Show popup
        console.log(`✅ Found ${projects.length} projects. Opening modal...`);
      } else {
        setError('No matching projects found in portfolio.');
      }
    } catch (err) {
      console.error('❌ [Stage 1] Fetch projects failed:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoadingStage(null); // ✅ Reset loading state
    }
  }, []);

  // ===============================
  // WEBHOOK-2 → GENERATE RESUME
  // ===============================
  const generateResume = useCallback(async (formDataToSend = null) => {
    const dataToSend = formDataToSend || formData;

    setLoadingStage('generating-resume'); // ✅ Stage 2
    setError('');
    setSuccess(false);
    setResume('');
    setGoogleDocUrl('');

    try {
      console.log('🤖 [Stage 2] Generating resume with AI...');

      const response = await sendToN8n(
        dataToSend,
        import.meta.env.VITE_WEBHOOK_2
      );

      console.log("✅ Webhook-2 Response:", response);

      // Normalize response
      let data = response;
      if (Array.isArray(response)) data = response[0];

      if (data?.success) {
        setResume(data.resumeText || '');
        setGoogleDocUrl(data.googleDocUrl || '');
        setSuccess(true);
        console.log("✅ Resume generated successfully!");
      } else {
        throw new Error(data?.message || 'Failed to generate resume');
      }
    } catch (err) {
      console.error('❌ [Stage 2] Resume generation failed:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingStage(null); // ✅ Reset loading state
    }
  }, [formData]);

  // ===============================
  // RESET
  // ===============================
  const resetForm = useCallback(() => {
    setFormData({});
    setResume('');
    setGoogleDocUrl('');
    setTopProjects([]);
    setPendingFormData(null);
    setShowProjectModal(false);
    setLoadingStage(null);
    setError('');
    setSuccess(false);
  }, []);

  // ===============================
  // RETURN API
  // ===============================
  return {
    // Actions
    generateResume,
    fetchTopProjects,
    resetForm,

    // Modal controls
    topProjects,
    showProjectModal,
    setShowProjectModal,
    pendingFormData,

    // States
    isLoading,
    isFetchingProjects,
    isGeneratingResume,
    loadingStage, // 'fetching-projects' | 'generating-resume' | null
    error,
    success,
    resume,
    googleDocUrl
  };
};