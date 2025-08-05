// src/pages/LoginPage.tsx
import { useEffect } from "react";
import { GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "@/lib/auth";

const LoginPage = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const { email, sub: id, name, picture } = userInfo.data;

        // Store in Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: tokenResponse.access_token,
        });

        if (error) throw error;

        const user = data.user;
        const role = await getUserRole(user?.id);

        if (role === "admin") navigate("/admin-dashboard");
        else if (role === "organiser") navigate("/organiser-dashboard");
        else navigate("/member-dashboard");

      } catch (err) {
        console.error("Login failed:", err);
      }
    },
    onError: () => {
      console.log("Google login failed");
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <button
          onClick={() => login()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
