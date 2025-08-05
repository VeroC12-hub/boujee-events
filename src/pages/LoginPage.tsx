// src/pages/LoginPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "@/lib/supabase"; // Fixed import
import { getUserRole, getCurrentUser } from "@/lib/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        const role = await getUserRole(user.id);
        redirectUserByRole(role);
      }
    };
    checkUser();
  }, []);

  const redirectUserByRole = (role: string | null) => {
    if (role === "admin") navigate("/admin-dashboard");
    else if (role === "organiser") navigate("/organiser-dashboard");
    else navigate("/member-dashboard");
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      
      if (result.error) {
        console.error("Login failed:", result.error);
        // Handle error (show toast, etc.)
        return;
      }
      
      // The redirect will happen automatically via Supabase OAuth flow
      // After redirect, the callback page will handle the user role routing
      
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login with Google"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
