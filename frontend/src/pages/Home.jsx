import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProblemSection from "../components/ProblemSection";
import ProfileShowcase from "../components/ProfileShowcase";
import StatsSection from "../components/StatsSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

function Home() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <HeroSection />
        <StatsSection />
        <ProblemSection />
        <ProfileShowcase />
        <FeaturesSection />
      </div>
    </>
  );
}

export default Home;
