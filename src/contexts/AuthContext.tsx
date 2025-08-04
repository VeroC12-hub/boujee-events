// In your AuthContext, update the login function to accept user data
const login = (role: string, email: string, userData?: any) => {
  // Store user data including role, permissions, etc.
  const user = {
    email,
    role,
    ...userData
  };
  
  // Update your auth state
  setAuthState({
    isAuthenticated: true,
    user,
    loading: false
  });
  
  // Store in localStorage if needed
  localStorage.setItem('user', JSON.stringify(user));
};
