import { motion, AnimatePresence } from "framer-motion";
import TextType from './TextType';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useState, useRef, useEffect } from "react";
import prof_img from '../assets/prof_img.jpg';
import Enter from "../pages/enter.jsx";
import { Sun, Moon } from 'lucide-react';
const Navbar = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  console.log(user);
  const[runanimation,setRunanimation]=useState(true);
  useEffect(() => {
    const timer=setTimeout(()=>{
      setRunanimation(false);
    },1500)
    return ()=>clearTimeout(timer)
  }, [])
  
  const profileImage = user?.profileImage || "";
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const [showenter, setShowenter] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const logout = useAuth().logout;
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex justify-between items-center px-4 md:px-10 py-4 bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-md sticky top-0 z-50"
    >
      {showenter && <Enter toop={1} setShowenter={setShowenter} />}
      <button onClick={() => navigate("/")} className=" hover:cursor-pointer text-2xl font-bold font-cursive text-indigo-600 dark:text-indigo-400">VibeSpace</button>
      <div className="space-x-6 flex items-center">
        {/* <span className="hover:text-indigo-600  text-gray-500 hover:underline cursor-pointer">Problem</span>
        <span className="hover:text-indigo-600  text-gray-500 hover:underline cursor-pointer">Features</span> */}
        {user&&<span onClick={() => navigate("/projects")} className="hover:text-gray-800 dark:hover:text-gray-100 text-gray-500 dark:text-gray-300 hover:underline cursor-pointer font-dancing">My Arena</span>}
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
        {!user && <button onClick={() => { setShowenter(!showenter) }} className="px-2 py-1 bg-indigo-600 dark:bg-gray-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 cursor-pointer transition flex  items-end gap-1 font-dancing">
          <lord-icon
            src="https://cdn.lordicon.com/kdduutaw.json"
            trigger="loop"
            stroke="bold"
            state="hover-looking-around"
            colors="primary:#FFFFFF,secondary:#FFFFFF"
            style={{ backgroundColor: "none", width: "25px", height: "25px" }}
            className='font-extrabold'>
          </lord-icon>
          Sign In
        </button>}
        {user && (
          <div 
            ref={menuRef} 
            className="relative"
            onMouseEnter={() => window.innerWidth >= 768 && setOpen(true)}   // Desktop: Show on hover
            onMouseLeave={() => window.innerWidth >= 768 && setOpen(false)}  // Desktop: Hide on leave
          >
            {/* BUTTON */}
            <button
              onClick={() => setOpen(!open)}  // Mobile & Desktop: Toggle on click
              className={` flex items-center gap-2 cursor-pointer bg-indigo-100 dark:bg-gray-500 rounded-l-full rounded-r-full text-white pr-2`}
            >
              {console.log(profileImage)}
              {profileImage ? <img
                src={`${user.profileImage}?sz=200`}
                className={` ${runanimation ? "animate-slide-half" : ""} w-8 h-8 rounded-full object-cover`}
                
              /> : <img
                src={`${prof_img}?sz=200`}
                className={` ${runanimation ? "animate-slide-half" : ""} w-8 h-8 rounded-full object-cover`}
                
              />}

              {window.innerWidth>800?(<span className="text-gray-500 dark:text-gray-200" title={user.name}>
                {user.name.length > 5 ? user.name.slice(0, 8) + ".." : user.name}
              </span>):(<span className="text-gray-500 dark:text-gray-200" title={user.name}>
                {user.name.length > 5 ? user.name.slice(0,1) + ".." : user.name}
              </span>)}
            </button>

            {/* DROPDOWN */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 "
                >
                  <button
                    onClick={() => navigate("/profile")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => navigate("/settings")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => { logout(), navigate("/") }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-400"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
