import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, MapPin, CheckSquare, DollarSign, Users } from 'lucide-react';
import LoginAuth from './LoginAuth';

// Update these to match the actual filenames in public/heroimage/
const HERO_IMAGES = [
    '/heroimage/heroimage1.jpg',
  '/heroimage/heroimage2.jpg',
  '/heroimage/heroimage3.jpg',
  '/heroimage/heroimage4.jpg',
];

const SLIDE_DURATION_MS = 5000;

export default function HomePage({ onGetStarted }) {
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  if (showLogin) {
    return <LoginAuth onLoginSuccess={onGetStarted} onBackToHome={() => setShowLogin(false)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-[#12222B]/8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-lg font-bold text-[#12222B] tracking-tight">TripSync</span>

          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-[#12222B]/60 hover:text-[#12222B] font-medium transition">
              Features
            </button>
            <button onClick={() => setShowLogin(true)} className="text-sm text-[#12222B]/60 hover:text-[#12222B] font-medium transition">
              Log in
            </button>
            <button onClick={() => setShowLogin(true)} className="text-sm px-4 py-2 bg-[#12222B] text-white rounded-lg font-semibold hover:bg-[#0a1319] transition">
              Get started
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[#12222B]">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-5 space-y-3 border-t border-[#12222B]/8 pt-4">
            <button onClick={() => { setMobileMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="block text-sm text-[#12222B]/60 font-medium">
              Features
            </button>
            <button onClick={() => setShowLogin(true)} className="block text-sm text-[#12222B]/60 font-medium">
              Log in
            </button>
            <button onClick={() => setShowLogin(true)} className="w-full text-sm px-4 py-2.5 bg-[#12222B] text-white rounded-lg font-semibold">
              Get started
            </button>
          </div>
        )}
      </nav>

      {/* Hero - full-bleed rounded photo card, headline overlaid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="relative rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden h-[70vh] sm:h-[75vh] md:h-[80vh] min-h-[480px] sm:min-h-[560px] md:min-h-[680px]">
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
                i === heroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12222B]/55 via-[#12222B]/5 to-transparent" />

          {/* Slide indicators */}
          <div className="absolute top-5 right-5 sm:top-8 sm:right-8 flex gap-2 z-10">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                aria-label={`Show slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === heroIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 md:p-16">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[0.95] mb-4 sm:mb-6 max-w-3xl">
              Plan trips
              <br />
              together
            </h1>
            <p className="text-base sm:text-xl text-white/85 max-w-md mb-6 sm:mb-8">
              One shared plan for routes, tasks, and expenses. No more scattered group chats.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-7 sm:py-4 bg-white text-[#12222B] rounded-full font-bold hover:bg-white/90 transition w-fit text-sm sm:text-base"
            >
              Start planning
              <ArrowRight size={18} />
            </button>

            {/* Scroll indicator */}
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:flex items-center gap-3 absolute bottom-10 right-10 text-white/80 hover:text-white transition"
            >
              <span className="text-sm font-medium">Scroll down</span>
              <span className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <ArrowRight size={16} className="rotate-90" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Features - clearly structured section with generous rhythm */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-24 md:pb-32">
        <p className="text-sm font-semibold text-[#FF5A36] tracking-wide mb-3">WHAT'S INCLUDED</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#12222B] tracking-tight mb-10 sm:mb-16 max-w-xl">
          Everything your group needs, nothing it doesn't
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-14">
          {[
            { icon: MapPin, label: 'Route planning', desc: 'Vote on stops together' },
            { icon: CheckSquare, label: 'Shared tasks', desc: 'Assign who does what' },
            { icon: DollarSign, label: 'Split expenses', desc: 'Settle up automatically' },
            { icon: Users, label: 'Group voting', desc: 'Decide as a group' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-start gap-3 sm:gap-4">
              <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FF5A36]/10 flex items-center justify-center">
                <Icon size={18} className="text-[#FF5A36] sm:hidden" strokeWidth={2} />
                <Icon size={20} className="text-[#FF5A36] hidden sm:block" strokeWidth={2} />
              </span>
              <div>
                <p className="text-[#12222B] font-bold mb-1 text-sm sm:text-base">{label}</p>
                <p className="text-xs sm:text-sm text-[#12222B]/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 md:pb-32 text-center">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#12222B] tracking-tight mb-6">
          Ready for your next trip?
        </h2>
        <button
          onClick={() => setShowLogin(true)}
          className="inline-flex items-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 bg-[#12222B] text-white rounded-xl font-bold hover:bg-[#0a1319] transition text-sm sm:text-base"
        >
          Get started free
          <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#12222B]/8 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#12222B]/40 text-center">
          <span>TripSync</span>
          <span>&copy; 2026 All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}