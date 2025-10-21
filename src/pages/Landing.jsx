import Hero from '../components/Hero';
import Features from '../components/Features';
import About from '../components/About';

function Landing() {
  return (
    <main className="relative bg-dark-bg">
      <div className="pt-14">
        <Hero />
        <div className="space-y-0">
          <Features />
          <About />
        </div>
      </div>
    </main>
  );
}

export default Landing;
