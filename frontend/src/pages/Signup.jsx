import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import googleicon from "../assets/google.png";
import githubicon from "../assets/github.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const [showwarning, setShowwarning] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [Loading, setLoading] = useState(false);
  const [Loadinggoog, setLoadinggoog] = useState(false);
  const [Loadinggit, setLoadinggit] = useState(false)
  const handleedit=(e)=>{
    setDisabled( !form.email || form.password.length < 6);
    if(e.target.type==="password"){
      if(e.target.value.length<6){
        setShowwarning(true);
      } else {
        setShowwarning(false);
      }
    }

  }
  

  const createUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: to receive cookie
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        await checkAuth(); // Load user data
        navigate('/'); // Auto-login and redirect to home
        alert("Signup successful!");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed");
    }
    setLoading(false);
  };

  return (
    <>
    {Loading||Loadinggoog||Loadinggit ? <div className="w-full bg-blue-500 h-1 flex overflow-hidden"><div className="w-1/2 bg-white animate-slide-full"></div></div> :<div className="h-1 block"></div>} 
    
    <div className="p-8 pb-0 max-w-md mx-auto">
      <h1 className="text-xl font-bold flex items-center justify-center font-dancing dark:text-white"><span>Register</span></h1>
      <form onSubmit={(e) => { e.preventDefault();createUser()}}>
      {/* <input
        className=" p-2 w-full mt-2 border border-indigo-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600  outline-none active:border-none focus:border-none active:outline-none"
        
        placeholder="Full Name"
        onChange={(e) => {setForm({ ...form, name: e.target.value }),handleedit(e)}}
      /> */}

      <input
        className=" p-2 w-full mt-2 border border-indigo-400 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600  outline-none active:border-none focus:border-none active:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        type="email"
        required
        placeholder="Email"
        onChange={(e) => {setForm({ ...form, email: e.target.value }),handleedit(e)}}
      />

      <input
        type="password"
        className=" p-2 w-full mt-2 border border-indigo-400 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600  outline-none active:border-none focus:border-none active:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        
        placeholder="Password"
        onChange={(e) => {setForm({ ...form, password: e.target.value }),handleedit(e)}}
      />
      <div>{showwarning && <p className="text-red-500 text-small">Password must be at least 6 characters long.</p>}</div>

      <button type="submit"
        className={`${disabled ? "bg-gray-400 dark:bg-gray-600" : "bg-green-600 dark:bg-green-500"} rounded-xl font-dancing text-white px-4 py-2 mt-4 w-full hover:opacity-90 transition-opacity`}
        disabled={disabled}
      >
        Sign Up
      </button>
      </form>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={() => {
            setLoadinggoog(true);
            const currentPath = window.location.pathname;
            window.location.href = `${SERVER_URL}/api/auth/google?redirect=${encodeURIComponent(currentPath)}`;
          }}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-xl text-center cursor-pointer flex items-center gap-5 justify-center transition-colors"
        >
          <img className="bg-none size-6" src={googleicon} alt="" />
          <span className="text-gray-700 dark:text-gray-200">{Loadinggoog?"Signing up...":"Continue with Google"}</span>
        </button>

        <button
          onClick={() => {
            setLoadinggit(true);
            const currentPath = window.location.pathname;
            window.location.href = `${SERVER_URL}/api/auth/github?redirect=${encodeURIComponent(currentPath)}`;
          }}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-xl text-center cursor-pointer flex items-center gap-5 justify-center transition-colors"
        >
          <img className="bg-none size-6" src={githubicon} alt="" />
          <span className="text-gray-700 dark:text-gray-200">{Loadinggit?"Signing up...":"Continue with GitHub"}</span>
        </button>
      </div>
    </div>
    </>
    
  );
}
