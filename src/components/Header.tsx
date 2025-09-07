import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import ProfileMenu from "./ProfileMenu"; // bevat Profiel/Dashboard/Uitloggen
import ThemeToggle from "./ui/ThemeToggle";

const Header: React.FC = () => {
  const { user } = useAuth() as any;

  return (
    <header className="w-full bg-black/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500" />
          <span className="text-white font-semibold">FITProve</span>
        </Link>

        <div className="flex items-center gap-2">
          {!user ? (
            <nav className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-orange-500 text-black font-semibold hover:bg-orange-400 transition"
              >
                Log in
              </Link>
            </nav>
          ) : (
            <nav className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition"
              >
                Dashboard
              </Link>
              <ProfileMenu />
            </nav>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
