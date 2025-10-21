function Features() {
  const features = [
    { icon: '📊', title: 'Price Forecast', description: 'Real-time AI-powered electricity price forecasting to capture the best trading windows.' },
    { icon: '💰', title: 'Smart Trading', description: 'Automated trading to sell surplus energy at peak prices.' },
    { icon: '⚡', title: 'Real-time Monitoring', description: 'Track generation, storage, and consumption in real time.' },
    { icon: '📈', title: 'Data Visualization', description: 'Professional charts for trends, energy flow, and revenue analysis.' },
    { icon: '🤖', title: 'AI Recommendation', description: 'Get smart suggestions for when to sell or store energy.' },
    { icon: '🔋', title: 'Storage Management', description: 'Optimize home battery usage to maximize efficiency.' },
    { icon: '🌞', title: 'Solar Optimization', description: 'Leverage weather and history to optimize solar generation.' },
    { icon: '📱', title: 'Mobile Friendly', description: 'Responsive design for phones and tablets.' },
  ];

  return (
    <section id="features" className="py-24 bg-dark-panel">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary uppercase mb-4 relative inline-block">
            Features
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[-15px] h-1 w-16 bg-tech-blue"></span>
          </h2>
          <p className="text-lg text-text-secondary mt-8 max-w-2xl mx-auto">
            Professional capabilities to help you manage energy and maximize revenue.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-dark-card border border-dark-border p-6 rounded-lg hover:border-tech-blue/50 transition-all duration-300 group shadow-card"
            >
              {/* Icon */}
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              {/* Feature Content */}
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
