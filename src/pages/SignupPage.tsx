import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member'); // default role

  const handleSignup = async (e) => {
    e.preventDefault();

    const { data, error } = await signup(email, password);
    if (error) {
      alert(error.message);
      return;
    }

    // Update user metadata in Supabase (set role)
    const userId = data.user.id;
    const { error: metaError } = await fetch('/api/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });

    if (metaError) {
      alert('User created, but failed to assign role.');
    }

    alert('Signup successful! Now you can log in.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Sign Up</h1>

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
          required
        />

        <label className="block mb-2 font-semibold text-sm">Choose Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="member">Member</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" className="w-full bg-black text-white py-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
}
