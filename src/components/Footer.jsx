function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16">
      <div className="h-px bg-linear-to-r from-transparent via-tech-blue to-transparent opacity-40" />
      <div className="bg-dark-panel border-t border-dark-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="text-lg font-bold mb-2 text-text-primary">
              Smart Energy Dashboard
            </div>
            <p className="text-sm text-text-secondary">
              &copy; {currentYear} Smart Energy Dashboard
              <span className="mx-2">•</span>
              Built with React & Tailwind CSS
            </p>
            <p className="text-xs text-text-muted mt-2">
              Intelligent energy management — make every kWh count.
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-text-muted">
              <a href="#" className="hover:text-tech-blue text-sm transition-colors">Privacy</a>
              <span className="text-dark-border">|</span>
              <a href="#" className="hover:text-tech-blue text-sm transition-colors">Terms</a>
              <span className="text-dark-border">|</span>
              <a href="#" className="hover:text-tech-blue text-sm transition-colors">Help</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
