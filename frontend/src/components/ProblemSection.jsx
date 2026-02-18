import { motion } from "framer-motion";
import { AlertCircle, Target, Rocket } from "lucide-react";

const ProblemSection = () => {
  return (
    <section id="problem" className="relative px-6 md:px-20 py-20 pt-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-200 dark:bg-indigo-900/20 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-30"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">The Problem</span>
          </div> */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What Drives Us
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bridging the gap between talented developers and opportunities
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Student Problem */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-l-4 border-green-500">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    For Students
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-green-600 dark:text-green-400">Amazing projects remain unseen</span> — 
                    Students build incredible projects during college, but most of them never reach potential employers or the wider community.
                  </p>
                </div>
              </div>
              <ul className="space-y-3 ml-16">
                <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-green-500 mt-1">•</span>
                  <span>No centralized platform to showcase skills</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Projects scattered across platforms</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Difficult to share work effectively</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Employer Problem */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-l-4 border-orange-500">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    For Employers
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-orange-600 dark:text-orange-400">Finding real talent is hard</span> — 
                    Employers struggle to discover skilled student developers and evaluate their practical abilities beyond resumes.
                  </p>
                </div>
              </div>
              <ul className="space-y-3 ml-16">
                <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Resumes don't show real capabilities</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Time-consuming candidate research</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Difficult to verify project claims</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Solution Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Rocket className="w-7 h-7" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold">Our Solution</h3>
              </div>
              
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                We provide a <span className="font-bold border-b-2 border-white/50">centralized platform</span> where 
                student developers can create stunning portfolios, showcase projects with demo videos, integrate 
                GitHub & LeetCode statistics, and share everything with a single professional link.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[
                  { icon: '<svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="8"/><circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="8"/><circle cx="50" cy="50" r="15" fill="currentColor"/></svg>', text: "One centralized portfolio" },
                  { icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/></svg>', text: "Single shareable link" },
                  { icon: '<svg width="20" height="20" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="45" width="15" height="40" rx="2"/><rect x="42.5" y="30" width="15" height="55" rx="2"/><rect x="70" y="15" width="15" height="70" rx="2"/></svg>', text: "Real verified metrics" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <span className="text-3xl" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
                    <span className="font-semibold">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
