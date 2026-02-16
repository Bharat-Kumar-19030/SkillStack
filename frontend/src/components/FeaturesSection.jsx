import { motion } from "framer-motion";
import { FaGithub, FaVideo, FaFileAlt, FaUserGraduate } from "react-icons/fa";

const features = [
  {
    icon: <FaUserGraduate className="text-indigo-600 text-3xl" />,
    title: "Create Your Profile",
    desc: "Add your education, skills, and resume to form your developer identity.",
  },
  
  {
    icon: <FaGithub className="text-indigo-600 text-3xl" />,
    title: "Connect GitHub",
    desc: "Sync repositories from GitHub to show your open-source contributions.",
  },
  {
    icon: <FaFileAlt className="text-indigo-600 text-3xl" />,
    title: "Shareable Portfolio",
    desc: "Get a unique profile URL to include in your resume or LinkedIn.",
  },
  {
    icon: <FaFileAlt className="text-indigo-600 text-3xl" />,
    title: "AI Resume Builder",
    desc: "Build a professional resume based on your projects and skills with our AI-powered resume generator.",


  },
  {
    icon: <FaVideo className="text-indigo-600 text-3xl" />,
    title: "Add Project Videos",
    desc: "Upload videos of your projects to visually showcase your work.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="px-10 md:px-20 py-16 bg-gray-50 dark:text-gray-100 dark:bg-gray-900">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
        
        <motion.span
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800 dark:text-gray-100"
      >
        {/* The Gap We Bridge */}
        Create, Share & Grow — All in One Place
      </motion.span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-5xl mx-auto justify-items-center">
  {features.map((feature, index) => (
    <motion.div
      key={index}
      whileHover={{ scale: 1.05 }}
      className={`bg-white dark:bg-gray-700 shadow-md rounded-xl hover:border-2 hover:border-indigo-600 dark:hover:border-gray-600 shadow-[0_0_20px_0_rgba(0,0,0,0.3)] transition hover:shadow-indigo-500 dark:hover:shadow-gray-600 p-6 text-center border border-indigo-600 dark:border-gray-600 hover:shadow-lg
        ${
          index === features.length - 1 && features.length % 2 !== 0
            ? "sm:col-span-2 sm:justify-self-center"
            : ""
        }`}
    >
      <div className="flex justify-center mb-4">{feature.icon}</div>
      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-gray-600 dark:text-gray-200">{feature.desc}</p>
    </motion.div>
  ))}
</div>

    </section>
  );
};

export default FeaturesSection;
