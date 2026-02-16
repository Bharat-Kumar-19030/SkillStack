import { motion } from "framer-motion";
import TextType from './TextType';
import RotatingText from './RotatingText';
import { useNavigate } from "react-router-dom";
import { ArrowRight, Github, Code2, Sparkles } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-400 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Floating code symbols */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 text-white/10 dark:text-white/5"
        >
          <Code2 className="w-24 h-24" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 left-16 text-white/10 dark:text-white/5"
        >
          <Github className="w-32 h-32" />
        </motion.div>
      </div>

      <div className="relative z-10 px-6 md:px-20 py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold text-white">Your Portfolio, Elevated</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-white"
          >
            Showcase Your
            <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Skills to the World
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto lg:mx-0"
          >
            Create stunning developer profiles, showcase your projects with demo videos, 
            integrate GitHub & LeetCode stats, and land your dream job with a single shareable link.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <button 
              onClick={() => navigate("/profile")}
              className="group relative px-8 py-4 bg-white dark:bg-gray-900 text-indigo-600 dark:text-white font-bold rounded-xl shadow-2xl hover:shadow-white/20 transition-all hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <RotatingText
                  texts={['Get Started', 'Build Profile', 'Craft Space']}
                  mainClassName="text-lg font-bold overflow-hidden"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </button>

            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all"
            >
              Explore Features
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-white/80 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                ))}
              </div>
              <span>1000+ developers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-300">★★★★★</span>
              <span>5.0 rating</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content - Interactive Visual */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative">
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-50"></div>
            
            {/* Main image container */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl"
            >
              <img
                src="https://cdn.dribbble.com/userupload/9207747/file/original-21b682aefddbbf6e1db13b0f5e4bdbd9.png"
                alt="Developer Portfolio Showcase"
                className="w-full rounded-2xl shadow-2xl"
              />
              
              {/* Floating badge */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-xl"
              >
                ✓ Live Demo
              </motion.div>
            </motion.div>

            {/* Decorative floating cards */}
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">GitHub Repos</p>
                  <p className="font-bold text-gray-900 dark:text-white">50+ Projects</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm flex flex-col items-center gap-2"
      >
        <span>Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
          />
        </div>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
