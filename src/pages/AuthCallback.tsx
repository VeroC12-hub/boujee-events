import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getCurrentProfile } from "../lib/auth";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait a moment for the profile to be loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get user profile to determine role
        const user = getCurrentUser();
        const profile = getCurrentProfile();
        
        if (user && profile) {
          // Redirect based on role
          switch (profile.role) {
            case 'admin':
              navigate("/admin-dashboard");
              break;
            case 'organizer':
              navigate("/organizer-dashboard");
              break;
            default:
              navigate("/member-dashboard");
          }
        } else {
          // Profile not loaded yet, redirect to login to try again
          setError("Loading user profile...");
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4">
        {loading ? (
          <>
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
            <p className="text-gray-400">Please wait while we set up your account</p>
          </>
        ) : error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-white mb-2">Success!</h2>
            <p className="text-gray-400">Redirecting to your dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
