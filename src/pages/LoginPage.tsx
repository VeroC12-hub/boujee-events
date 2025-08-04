import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, magicLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await login(email, password);
    if (error) return alert(error.message);
    navigate('/admin'); // Redirect after login
  };

  const handleMagic = async () => {
    const { error } = await magicLogin(email);
    if (error) return alert(error.message);
    alert('Check your email for the login link!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-black text-white py-2 rounded mb-2">
          Login with Password
        </button>
        <button type="button" onClick={handleMagic} className="w-full text-blue-500 underline text-sm">
          Or send me a magic link
        </button>
      </form>
    </div>
  );
}
