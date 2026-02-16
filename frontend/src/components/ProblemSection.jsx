import { motion } from "framer-motion";

const ProblemSection = () => {
  return (
    <section id="problem" className="px-10 md:px-20 py-16 bg-white dark:bg-gray-900">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800 dark:text-gray-100"
      >
        {/* The Gap We Bridge */}
        What Drives Us !
      </motion.h2>

      <div className="max-w-4xl mx-auto text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Students build amazing projects during college — but most of them remain unseen.
          Employers struggle to find real student talent, and students lack a platform
          to <span className="font-bold">showcase their skills, code, and creativity</span>.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          Our platform solves this by offering a <span className="font-bold">central hub for student developers</span> to
          upload projects, link GitHub repositories, and display demo videos — all in one
          professional portfolio that can be shared with just a single link.
        </motion.p>
      </div>
    </section>
  );
};

export default ProblemSection;
