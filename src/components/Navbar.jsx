import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, label }) => (
    <Link
      to={to}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? 'text-tech-blue'
          : 'text-text-secondary hover:text-text-primary'
      }`}
      onClick={() => setOpen(false)}
    >
      <span className="relative">
        {label}
        {isActive(to) && (
          <span className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-tech-blue" />
        )}
      </span>
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-md bg-dark-panel/95 border-b border-dark-border shadow-lg">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center group">
              <span className="text-xl mr-2">⚡</span>
              <span className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
                Smart Energy
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <NavItem to="/dashboard" label="Price Forecast" />
              <NavItem to="/trading" label="Trading" />
              <a
                href="#features"
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                About
              </a>

              {/* CTA */}
              <Link
                to="/trading"
                className="ml-3 inline-flex items-center gap-2 bg-tech-blue text-white px-5 py-2 text-sm font-semibold hover:bg-tech-blue/90 transition-all shadow-glow-blue"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded-md text-text-secondary hover:text-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue"
                aria-label="Open menu"
                aria-expanded={open}
              >
                {open ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Panel */}
      {open && (
        <div className="md:hidden bg-dark-panel/98 backdrop-blur border-b border-dark-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-1">
            <NavItem to="/dashboard" label="Price Forecast" />
            <NavItem to="/trading" label="Trading" />
            <a href="#features" className="block px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary">Features</a>
            <a href="#about" className="block px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary">About</a>
            <Link
              to="/trading"
              onClick={() => setOpen(false)}
              className="block text-center bg-tech-blue text-white px-4 py-2 text-sm font-semibold mt-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* 顶部科技蓝分隔线 */}
      <div className="h-px bg-linear-to-r from-transparent via-tech-blue to-transparent opacity-60" />
    </header>
  );
}

export default Navbar;
