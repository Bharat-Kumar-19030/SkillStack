import { motion } from "framer-motion";
import { Users, Code2, Award, Sparkles } from "lucide-react";

const StatsSection = () => {
  const stats = [
    { 
      icon: <Users className="w-8 h-8" />, 
      number: "1000+", 
      label: "Active Developers",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      icon: <Code2 className="w-8 h-8" />, 
      number: "5000+", 
      label: "Projects Showcased",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      icon: <Award className="w-8 h-8" />, 
      number: "10K+", 
      label: "GitHub Repos Linked",
      gradient: "from-orange-500 to-red-500"
    },
    { 
      icon: <Sparkles className="w-8 h-8" />, 
      number: "500+", 
      label: "Students Hired",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="px-6 md:px-20 py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Trusted by Developers Worldwide
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of developers who are already showcasing their skills
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Gradient border effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl`}></div>
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${stat.gradient} text-white mb-4 shadow-lg`}>
                  {stat.icon}
                </div>
                
                {/* Number */}
                <motion.h3
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2"
                >
                  {stat.number}
                </motion.h3>
                
                {/* Label */}
                <p className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
