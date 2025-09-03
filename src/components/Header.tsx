import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const initials = (email?: string) => (email ? email[0]?.toUpperCase() : 'U');

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="w-full bg-black/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500"></div>
          <span className="text-white font-semibold">FITProve</span>
        </Link>

        {!user ? (
          <nav className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-xl bg-orange-500 text-black font-semibold hover:bg-orange-400 transition">
              Log in
            </Link>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link to="/dashboard" className="px-3 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition">
              Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-white/90">
                {initials(user.email ?? user.id)}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition"
                aria-label="Uitloggen"
              >
                Uitloggen
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
