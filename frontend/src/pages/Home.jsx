import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProblemSection from "../components/ProblemSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
    </div>
    </>
  )
}

export default Home
