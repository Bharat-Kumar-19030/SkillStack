// import { response } from 'express'
import { createContext,useState,useEffect,useContext } from 'react' 
const AuthContext=createContext()
export const useAuth=()=>{return useContext(AuthContext)}
export const AuthProvider=({children})=>{
    const [user, setuser] = useState(null)
    const [loading, setLoading] = useState(true);
    const SERVER_URL=import.meta.env.VITE_SERVER_URL||"http://localhost:5000"
    useEffect(() => {
      checkAuth()
    }, [])
    const checkAuth=async()=>{
        try{
            const res=await fetch(`${SERVER_URL}/api/auth/me`,{
                credentials:"include",
            })
            if(res.ok){
                const data=await res.json()
                setuser(data.user)
            }
            else{
                setuser(null)
            }
        }catch(error){
            console.error("Auth check failed:",error)
            setuser(null)
        }finally{
            setLoading(false)
        }
    }
    const logout=async()=>{
        try{
        await fetch(`${SERVER_URL}/api/auth/logout`,{
            method:"POST",
            credentials:"include",
        })
        setuser(null)
    }catch(err){
        console.error("Logout failed:",err)
    }

    }
    return (
        <AuthContext.Provider value={{user,setuser,loading,checkAuth,logout}}>
        {children}
        </AuthContext.Provider>
    )
}