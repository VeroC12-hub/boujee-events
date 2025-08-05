// src/pages/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/lib/auth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login");
          return;
        }

        if (session?.user) {
          // Get user role and redirect accordingly
          const role = await getUserRole(session.user.id);
          
          if (role === "admin") {
            navigate("/admin-dashboard");
          } else if (role === "organiser") {
            navigate("/organiser-dashboard");
          } else {
            navigate("/member-dashboard");
          }
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Completing login...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
