import { Link, useLocation } from 'react-router-dom';
import { Flame, Sun, Moon } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import useFireStore from '../../store/useFireStore';

export function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useFireStore();

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between px-6 py-4 w-full max-w-7xl bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2rem] shadow-2xl transition-colors duration-300">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-medium tracking-wide text-slate-900 dark:text-white">
            Mavericks
          </span>
        </Link>

        {/* Links & Buttons */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={`${location.pathname === '/' ? 'text-blue-600 dark:text-white' : 'text-slate-500 dark:text-gray-400'} hover:text-blue-600 dark:hover:text-white transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/learn"
              className={`${location.pathname === '/learn' ? 'text-blue-600 dark:text-white' : 'text-slate-500 dark:text-gray-400'} hover:text-blue-600 dark:hover:text-white transition-colors`}
            >
              Learn
            </Link>
            <Link
              to="/agent"
              className={`${location.pathname === '/agent' ? 'text-blue-600 dark:text-white' : 'text-slate-500 dark:text-gray-400'} hover:text-blue-600 dark:hover:text-white transition-colors`}
            >
              Fire
            </Link>
            <Link
              to="/advisor"
              className={`${location.pathname === '/advisor' ? 'text-blue-600 dark:text-white' : 'text-slate-500 dark:text-gray-400'} hover:text-blue-600 dark:hover:text-white transition-colors`}
            >
              AI Advisor
            </Link>
            <Link
              to="/history"
              className={`${location.pathname === '/history' ? 'text-blue-600 dark:text-white' : 'text-slate-500 dark:text-white/60'} hover:text-blue-600 dark:hover:text-white transition-colors`}
            >
              History
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-5 py-2 text-sm font-medium text-white dark:text-black bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors rounded-full hidden sm:block">
                  Log in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border border-black/10 dark:border-white/20"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>

      </nav>
    </div>
  );
}
