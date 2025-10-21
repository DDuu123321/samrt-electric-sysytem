function Hero() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative min-h-screen flex items-center justify-center bg-linear-to-b from-dark-bg via-dark-panel to-dark-bg">
      {/* 科技网格背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#2962ff 1px, transparent 1px), linear-gradient(90deg, #2962ff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* 发光效果 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tech-blue/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tech-cyan/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto pt-32 pb-24">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-text-primary mb-6 tracking-tight">
            Smart Energy
            <span className="block text-tech-blue mt-2">Dashboard</span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary font-light leading-relaxed max-w-2xl mx-auto mb-16">
            Professional energy trading platform — AI-powered price forecasting and real-time analytics to maximize your ROI.
          </p>

          <button
            onClick={() => scrollToSection('features')}
            className="inline-block px-9 py-4 bg-tech-blue text-white text-sm font-semibold uppercase tracking-widest hover:bg-tech-blue/90 transition-all duration-300 shadow-glow-blue"
          >
            Explore Features
          </button>
        </div>
      </div>
    </header>
  );
}

export default Hero;
