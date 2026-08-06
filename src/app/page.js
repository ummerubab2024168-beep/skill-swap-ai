import React from 'react';
import Link from 'next/link';
import { RefreshCw, Users, MessageSquare, ShieldCheck, LogIn } from 'lucide-react';

export default function WelcomeLandingPage() {
  const features = [
    {
      icon: <RefreshCw className="w-6 h-6 text-purple-300" />,
      title: "Exchange Skills",
      description: "Trade what you know for what you want to learn in a seamless peer-to-peer ecosystem."
    },
    {
      icon: <Users className="w-6 h-6 text-purple-300" />,
      title: "Connect with Experts",
      description: "Find talented mentors and peers globally to build meaningful collaborations."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-purple-300" />,
      title: "Real-Time Chat",
      description: "Coordinate, discuss, and plan your skill swaps instantly with integrated messaging."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-300" />,
      title: "Verified Reviews",
      description: "Build trust and credibility within a safe, reliable learning community."
    }
  ];

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#1e1b4b] via-[#311042] to-[#0f0728] text-white flex flex-col items-center justify-between overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-12">
      
      {/* Soft Glowing Abstract Background Shape */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[700px] h-[300px] sm:h-[500px] lg:h-[700px] bg-purple-900/30 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>

      {/* Top Brand Logo / Header */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center z-10 mb-6 sm:mb-10">
        <div className="flex items-center gap-2 font-extrabold text-lg sm:text-2xl tracking-wide">
          <span className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">⚡</span>
          <span>SkillSwap</span>
        </div>
        <Link
          href="/login"
          className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 backdrop-blur-md"
        >
          Sign In
        </Link>
      </header>

      {/* Main Glassmorphism Content Card */}
      <main className="w-full max-w-6xl mx-auto bg-black/30 backdrop-blur-2xl border border-white/10 rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 md:p-14 shadow-2xl z-10 flex flex-col items-center text-center my-auto">
        
        {/* Hero Section */}
        <div className="max-w-3xl space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Welcome to <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">Skill Swap</span>
          </h1>
          
          <p className="text-lg sm:text-2xl font-bold tracking-wide text-purple-200">
            Learn. Share. Grow Together.
          </p>

          <p className="text-xs sm:text-base text-purple-200/80 leading-relaxed max-w-2xl mx-auto">
            Connect with talented people, exchange skills, build meaningful collaborations, and grow your career through a trusted learning community.
          </p>

          {/* Action Button: Single Login Button */}
          <div className="flex items-center justify-center pt-4 sm:pt-6 w-full max-w-xs mx-auto">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 text-sm sm:text-base border border-purple-400/30"
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
          </div>
        </div>

        {/* Features Grid Section */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16 pt-10 sm:pt-14 border-t border-white/10">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 sm:p-6 text-left transition-all duration-300 backdrop-blur-md hover:-translate-y-1 shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-purple-200/70 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto text-center z-10 mt-8 text-xs sm:text-sm text-purple-300/60">
        <p>© {new Date().getFullYear()} SkillSwap. Empowering community learning worldwide.</p>
      </footer>

    </div>
  );
}