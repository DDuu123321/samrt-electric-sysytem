function About() {
  const highlights = [
    'Real-time price forecasting and analytics',
    'Decision support for smart trading',
    'AI-driven energy optimization',
    'Professional data visualization',
    'Responsive mobile support',
    'Secure and reliable data transfer'
  ];

  return (
    <section id="about" className="py-24 bg-dark-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl font-bold text-text-primary mb-6 relative inline-block">
              About Platform
              <span className="absolute left-0 bottom-[-15px] h-1 w-16 bg-tech-blue"></span>
            </h2>

            <h3 className="text-2xl font-semibold text-text-primary mt-8 mb-4">Professional Energy Trading System</h3>

            <p className="text-text-secondary leading-relaxed mb-6">
              Smart Energy Dashboard is a professional trading platform designed for users with solar panels and home batteries. With advanced AI forecasting models and real-time analytics, it helps you sell surplus energy at optimal prices.
            </p>

            <p className="text-text-secondary leading-relaxed mb-8">
              The system integrates price forecasts, algorithmic trading, and real-time monitoring, making energy management efficient and profitable. Whether analyzing price trends or executing trades, we provide institutional-grade tools.
            </p>

            {/* Highlights List */}
            <div className="space-y-3">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-tech-blue mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-dark-card border border-dark-border rounded-lg p-8 shadow-card">
              {/* Stats Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-panel border border-dark-border rounded-lg p-6 text-center hover:border-tech-blue/50 transition-all">
                  <div className="text-4xl font-bold text-tech-blue mb-2">24/7</div>
                  <div className="text-sm text-text-secondary">Live Monitoring</div>
                </div>
                <div className="bg-dark-panel border border-dark-border rounded-lg p-6 text-center hover:border-tech-blue/50 transition-all">
                  <div className="text-4xl font-bold text-tech-blue mb-2">AI</div>
                  <div className="text-sm text-text-secondary">Forecasting</div>
                </div>
                <div className="bg-dark-panel border border-dark-border rounded-lg p-6 text-center hover:border-trade-up/50 transition-all">
                  <div className="text-4xl font-bold text-trade-up mb-2">↑30%</div>
                  <div className="text-sm text-text-secondary">Revenue Uplift</div>
                </div>
                <div className="bg-dark-panel border border-dark-border rounded-lg p-6 text-center hover:border-tech-blue/50 transition-all">
                  <div className="text-4xl font-bold text-tech-blue mb-2">100%</div>
                  <div className="text-sm text-text-secondary">Data Security</div>
                </div>
              </div>

              {/* Energy Flow Illustration */}
              <div className="mt-6 p-6 bg-dark-panel border border-dark-border rounded-lg">
                <div className="flex items-center justify-between text-center">
                  <div className="flex-1">
                    <div className="text-3xl mb-2">🌞</div>
                    <div className="text-xs text-text-secondary">Solar</div>
                  </div>
                  <div className="text-tech-blue text-2xl">→</div>
                  <div className="flex-1">
                    <div className="text-3xl mb-2">🔋</div>
                    <div className="text-xs text-text-secondary">Storage</div>
                  </div>
                  <div className="text-tech-blue text-2xl">→</div>
                  <div className="flex-1">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-xs text-text-secondary">Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
