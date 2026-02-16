import { motion } from "framer-motion";
import TextType from './TextType';
import RotatingText from './RotatingText'
import { useNavigate } from "react-router-dom";
const HeroSection = () => {
  const navigate = useNavigate();
  // const gotoprofile=()=>{
    
  // }
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between px-10 md:px-20 py-20 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 dark:bg-gradient-to-r dark:from-gray-800 dark:via-gray-800 dark:to-gray-500 text-white">
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="md:w-1/2"
      >
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 ">
          Showcase Your Profile to the World.
        </h1>
        <p className="text-lg text-gray-100 mb-6">
          Create your developer profile, upload your college projects with demo
          videos, link your GitHub repositories, and unveil your talent.
        </p>
        <button onClick={()=>{navigate("/profile");}} className="cursor-pointer px-6 py-2 bg-white dark:bg-gray-600  font-semibold rounded-lg shadow-md hover:bg-gray-200 transition">
          {/* Get Started
          Build my Profile
          Craft my Space */}
          

          <RotatingText
            texts={['Get Started   ➜', 'Build my Profile', 'Craft my Space']}
            mainClassName=" text-xl text-indigo-600 dark:text-gray-300 font-semibold overflow-hidden  justify-center rounded-lg"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </button>
      </motion.div>

      <motion.img
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        src="https://cdn.dribbble.com/userupload/9207747/file/original-21b682aefddbbf6e1db13b0f5e4bdbd9.png"
        alt="Student Project Showcase"
        className="w-full md:w-1/2 rounded-2xl shadow-lg"
      />
    </section>
  );
};

export default HeroSection;
