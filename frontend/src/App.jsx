import Home from "./pages/Home"; 
import Profile from "./components/Profile";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AddProject from "./pages/AddProject";
import Login from "./pages/Login"
import Signup from "./pages/Signup";
import Enter from "./pages/enter";
import PublicProfile from "./pages/PublicProfile";
import PracticePlat from "./pages/PracticePlat";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ViewProjects from "./pages/ViewProjects";
import Settings from "./components/Settings";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/projects" element={<ViewProjects/>}/>
          <Route path="/profile/:username" element={<PublicProfile/>}/>
          <Route path="/practice-platforms" element={<PracticePlat/>}/>
          {/* <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/> */}
          <Route path="/enter" element={<Enter/>}/>
        </Routes>
        <Footer/>
      </Router>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}

export default App;
