import { Flame, Twitter, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#0A0A0A] pt-16 pb-8 relative z-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Flame className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-medium tracking-wide text-slate-900 dark:text-white">
                FIREAgent
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed mb-6">
              AI-powered financial freedom agent. Discover exactly how much you need to invest and when you can safely retire early.
            </p>
            <div className="flex items-center gap-4 text-slate-400 dark:text-gray-400">
              <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-medium mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-gray-400">
              <li><Link to="/agent" className="hover:text-blue-600 dark:hover:text-white transition-colors">AI Planning Agent</Link></li>
              <li><Link to="/history" className="hover:text-blue-600 dark:hover:text-white transition-colors">Saved Roadmaps</Link></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-gray-400">
              <li><Link to="/learn" className="hover:text-blue-600 dark:hover:text-white transition-colors">Learn FIRE</Link></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">RAG Knowledge Base</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Market Reports</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-medium mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-gray-500">
            © {new Date().getFullYear()} FIRE Agent AI. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-400 dark:text-gray-500">
            <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
