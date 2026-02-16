import { motion } from "framer-motion";
import { Github, Video, FileText, GraduationCap, Share2, Zap, Code2, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "Create Your Profile",
    desc: "Build your developer identity with education, skills, and achievements in minutes.",
    gradient: "from-blue-500 to-cyan-500",
    delay: 0.1
  },
  {
    icon: <Github className="w-8 h-8" />,
    title: "GitHub Integration",
    desc: "Automatically sync repositories, contributions, and statistics from your GitHub account.",
    gradient: "from-purple-500 to-pink-500",
    delay: 0.2
  },
  {
    icon: <Code2 className="w-8 h-8" />,
    title: "LeetCode Stats",
    desc: "Showcase your problem-solving skills with integrated LeetCode rankings and progress.",
    gradient: "from-orange-500 to-red-500",
    delay: 0.3
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: "Project Demos",
    desc: "Upload demo videos and screenshots to bring your projects to life visually.",
    gradient: "from-green-500 to-emerald-500",
    delay: 0.4
  },
  {
    icon: <Share2 className="w-8 h-8" />,
    title: "Shareable Portfolio",
    desc: "Get a unique profile URL to share on LinkedIn, resume, or anywhere you need.",
    gradient: "from-indigo-500 to-purple-500",
    delay: 0.5
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "AI Resume Builder",
    desc: "Generate professional resumes powered by AI based on your projects and skills.",
    gradient: "from-yellow-500 to-orange-500",
    delay: 0.6
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative px-6 md:px-20 py-20 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-indigo-100/50 to-transparent dark:from-indigo-950/30 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">✨ Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Stand Out
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to help you create the perfect developer portfolio
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                {/* Corner decoration */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>Join 1000+ developers already using our platform</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
