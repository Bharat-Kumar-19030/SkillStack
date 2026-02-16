import React from 'react'
import Login from './Login'
import Signup from './Signup'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import {useAuth} from '../context/AuthContext.jsx'
const Enter = ({ toop = 1 ,setShowenter}) => {
    const {user}=useAuth();
    if(user){
        return null;
    }
    const [toopen, setToopen] = useState(0);
    useEffect(() => {
        setToopen(toop);
    }, [toop])

    return (
        <>
            {toopen !== 0 && <div className=' absolute right-0 top-15 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl'>
                {/* <button className='absolute top-2 right-4 z-20 cursor-pointer' onClick={() => { setToopen(0) }}>X</button> */}
                <X size={28} className="text-gray-500 dark:text-gray-400 absolute top-2 right-4 z-40 cursor-pointer rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => { setToopen(0); setShowenter(false); }} />
                <div className='flex items-center justify-around  cursor-pointer w-full text-xl font-bold'>
                    <div onClick={() => { setToopen(1) }} className={`${toopen == 1 ? "text-indigo-600 dark:text-indigo-400 w-1/2" : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300 w-1/2"} p-2 text-center rounded-tl-xl rounded-br-2xl transition-colors`}>Login</div>
                    <div onClick={() => { setToopen(2) }} className={`${toopen == 2 ? "text-indigo-600 dark:text-indigo-400 w-1/2" : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300 w-1/2"} p-2 text-center rounded-tr-xl rounded-bl-2xl transition-colors`}>Signup</div>
                </div>
                {toopen == 1 ? <Login /> : <Signup />}
                <p className="p-8 pt-2 text-sm dark:text-gray-300">
                    Don't have an account?
                    <button className='text-indigo-600 dark:text-indigo-400 ml-1 cursor-pointer hover:underline' onClick={() => setToopen(toopen==1?2:1)}> {toopen == 1 ? "Signup":"Login"}</button>

                </p>
            </div>}

        </>
    )
}

export default Enter
