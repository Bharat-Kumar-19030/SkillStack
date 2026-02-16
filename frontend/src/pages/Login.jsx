import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Enter from "./enter.jsx";
import googleicon from "../assets/google.png";
import githubicon from "../assets/github.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
console.log("Server URL:", SERVER_URL);

export default function Login() {
  // const [showenter, setShowenter] = useState(false)
  const [disable,setDisable]=useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const [Loading, setLoading] = useState(false)
  const [Loadinggoog, setLoadinggoog] = useState(false)
  const [Loadinggit, setLoadinggit] = useState(false)
  const loginUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await checkAuth(); // Refresh user data
        // navigate('/'); // Redirect to home
      } else {
        const data = await res.json();
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      alert("Login failed");
    }
    setLoading(false);
  };
  const handleChange=(e)=>{
    if(form.email && form.password){
      setDisable(false);
    } else{
      setDisable(true);
    }
  }
  return (
    <>
    {Loading||Loadinggoog||Loadinggit ? <div className="w-full bg-blue-500 h-1 flex overflow-hidden"><div className="w-1/2 bg-white animate-slide-full"></div></div> :<div className="h-1 block"></div>} 
    <div className="p-8 max-w-md mx-auto pb-0">
      
      <h1 className="text-xl font-bold font-dancing flex items-center justify-center dark:text-white">Welcome Back !</h1>

      <input
        className=" p-2 w-full mt-2 border border-indigo-400 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600  outline-none active:border-none focus:border-none active:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="Email"
        onChange={(e) => {setForm({ ...form, email: e.target.value }),handleChange(e)}}
      />

      <input
        type="password"
        className="p-2 w-full mt-2 border border-indigo-400 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600  outline-none active:border-none focus:border-none active:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="Password"
        onChange={(e) => {setForm({ ...form, password: e.target.value }); handleChange(e)}}
      />

      <button
        onClick={loginUser}
        className={`${disable?"bg-gray-400 dark:bg-gray-600":"bg-green-600 dark:bg-green-500"} text-white px-4 py-2 mt-4 w-full rounded-xl font-dancing hover:opacity-90 transition-opacity`}
        disabled={disable}
      >
        {Loading ? "Logging in..." : "Login"}
      </button>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={() => {
            setLoadinggoog(true);
            const currentPath = window.location.pathname;
            window.location.href = `${SERVER_URL}/api/auth/google?redirect=${encodeURIComponent(currentPath)}`;
          }}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded text-center cursor-pointer flex items-center gap-5 justify-center transition-colors"
        >
          <img className="bg-none size-6" src={googleicon} alt="" /><span className="text-gray-700 dark:text-gray-200">{Loadinggoog?"Logging in...":"Continue with Google"}</span>

        </button>

        <button
          onClick={() => {
            setLoadinggit(true);
            const currentPath = window.location.pathname;
            window.location.href = `${SERVER_URL}/api/auth/github?redirect=${encodeURIComponent(currentPath)}`;
            // setLoading(false);
          }}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded text-center cursor-pointer flex items-center gap-5 justify-center transition-colors"
        >
          <img className="bg-none size-6" src={githubicon} alt="" /><span className="text-gray-700 dark:text-gray-200">{Loadinggit?"Logging in...":"Continue with GitHub"}</span>

        </button>
      </div>
      {/* <p className="mt-4 text-sm">
        Don't have an account?
        <button  className='text-indigo-600 ml-1 cursor-pointer' onClick={<Enter toop={2}/>}> Signup</button>
       
      </p> */}
    </div>
    </>
  );
}
