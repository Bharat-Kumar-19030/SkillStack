import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Settings from "../components/Settings";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import defaultprofileimg from "../assets/prof_img.jpg"
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
const Profile = () => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!user) {
            toast.error("You need to be logged in to access the profile page.");
            navigate('/');
        }
    }, [user, navigate]);
    const [isedit, setIsedit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        college: "",
        branch: "",
        bio: "",
        github: "",
        linkedin: "",
        leetcode: "",
        gfg: "",
        codeforces: "",
        hackerrank: "",
        hackerearth: "",
        websites: [" "],
        profileImg: null,
    });
    const handleChangeWebsite = (e, idx) => {
        console.log("website change", idx, e.target.value)
        const { name, value } = e.target;
        formData.websites[idx] = value;
        setFormData({ ...formData })
    }
    const addWebsite = () => {
        console.log("add website clicked")
        if (formData.websites.length == 0 || formData.websites[formData.websites.length - 1].trim() === "") {
            console.log("last website is empty, cannot add new one")
            return;
        }
        setFormData({ ...formData, websites: [...formData.websites, ""] })
    }
    const removeWebsite = (idx) => {
        formData.websites.splice(idx, 1);
        if (formData.websites.length === 0) {
            formData.websites.push("");
        }
        setFormData({ ...formData })
    }
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name == "profileImg" && files && files[0]) {
            setFormData({
                ...formData,
                profileImgFile: files[0],
                profileImg: URL.createObjectURL(files[0])
                // setProfileimgtoshow(URL.createObjectURL(files[0]))
            })
        } else {
            setFormData({ ...formData, [name]: value })

            // Check username availability when username field changes
            if (name === 'username' && value !== user?.username) {
                checkUsernameAvailability(value);
            }
        }
    };

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || "",
                username: user.username || "",
                college: user.collegeName || "",
                branch: user.Branch || "",
                bio: user.Bio || "",
                github: user.githubProfileLink || "",
                linkedin: user.linkedInProfileLink || "",
                leetcode: user.leetcodeProfileLink || "",
                gfg: user.gfgProfileLink || "",
                codeforces: user.codeforcesProfileLink || "",
                hackerrank: user.hackerrankProfileLink || "",
                hackerearth: user.hackerearthProfileLink || "",
                websites: user.websites && user.websites.length > 0 ? user.websites : [" "],
                profileImg: user.profileImage || "",
            }))
        }
    }, [user])
    const checkUsernameAvailability = async (username) => {
        if (!username || username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        setCheckingUsername(true);
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${SERVER_URL}/api/users/check-username/${username}`);
            const data = await response.json();
            setUsernameAvailable(data.available);
        } catch (error) {
            console.error('Error checking username:', error);
        } finally {
            setCheckingUsername(false);
        }
    };
    const Saveprofile = async () => {
        console.log("this is the final data")
        console.log(formData)
        setLoading(true);

        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL
            const formDataToSend = new FormData()
            formDataToSend.append("name", formData.name)
            formDataToSend.append("username", formData.username)
            formDataToSend.append("college", formData.college)
            formDataToSend.append("branch", formData.branch)
            formDataToSend.append("bio", formData.bio)
            formDataToSend.append("github", formData.github)
            formDataToSend.append("linkedin", formData.linkedin)
            formDataToSend.append("leetcode", formData.leetcode)
            formDataToSend.append("gfg", formData.gfg)
            formDataToSend.append("codeforces", formData.codeforces)
            formDataToSend.append("hackerrank", formData.hackerrank)
            formDataToSend.append("hackerearth", formData.hackerearth)
            formDataToSend.append("websites", JSON.stringify(formData.websites))
            if (formData.profileImgFile) {
                formDataToSend.append("profileImg", formData.profileImgFile)
            }
            let res = await fetch(`${SERVER_URL}/api/users`, {
                method: "POST",
                credentials: "include",
                body: formDataToSend,
            })
            console.log(JSON.stringify(formData));
            if (res.ok) {
                const data = await res.json();
                alert("profile updated successfully")
                console.log(data)
                if (checkAuth) {
                    await checkAuth(); // Load user data
                }
            } else {
                const error = await res.json();
                alert("Failed to save the profile. Make sure you are logged In")
            }
        } catch (err) {
            console.log("error saving profile", err)
        }
        setLoading(false);

    }
    return (
        <div className='min-h-screen p-10 md:px-40 bg-white dark:bg-gray-900 transition-colors duration-200'>
            <div className='relative'>
                <div className='absolute -top-6 rounded-lg  text-gray-700 dark:text-white text-4xl font-bold bg-white dark:bg-gray-800 p-2 px-4'>Profile</div>
                <div className="bg-white flex flex-col gap-2 dark:bg-gray-800 shadow rounded-xl p-10 md:px-25 ">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 justify-between w-full">

                        <div className="relative">
                            <img src={formData.profileImg || defaultprofileimg} alt="Profile" className="w-32 h-32 rounded-lg object-cover" />
                            {isedit && (
                                <label htmlFor="profileImgInput" className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </label>
                            )}
                            <input
                                id="profileImgInput"
                                type="file"
                                name="profileImg"
                                accept="image/*"
                                onChange={handleChange}
                                className="hidden"
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Full Name</label>
                            <input
                                disabled={!isedit}
                                type="text"
                                name="name"
                                value={formData.name}
                                placeholder="Enter your full name"
                                onChange={handleChange}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Username</label>
                            <input
                                disabled={!isedit}
                                type="text"
                                name="username"
                                value={formData.username}
                                placeholder="Choose a unique username"
                                onChange={handleChange}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                                pattern="^[a-zA-Z0-9_-]+$"
                                minLength={3}
                                maxLength={30}
                            />
                            {checkingUsername && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Checking availability...</p>
                            )}
                            {usernameAvailable === true && formData.username !== user?.username && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Username is available</p>
                            )}
                            {usernameAvailable === false && formData.username !== user?.username && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">✗ Username is already taken</p>
                            )}
                            {formData.username && formData.username.length < 3 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Username must be at least 3 characters</p>
                            )}
                            {/* {user?.username && (
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                                    Your profile: <span className="font-mono">{window.location.origin}/profile/{user.username}</span>
                                </p>
                            )} */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                        {/* College */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">College Name</label>
                            <input
                                disabled={!isedit}
                                type="text"
                                name="college"
                                value={formData.college}
                                placeholder="Enter your college name"
                                onChange={handleChange}
                                minLength={3}
                                maxLength={30}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>

                        {/* Branch */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Branch</label>
                            <input
                                disabled={!isedit}
                                type="text"
                                name="branch"
                                value={formData.branch}
                                placeholder="CSE, IT, ECE, Mechanical, etc."
                                onChange={handleChange}
                                minLength={3}
                                maxLength={15}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Bio</label>
                        <textarea
                            disabled={!isedit}
                            name="bio"
                            placeholder="Write a short intro about yourself..."
                            value={formData.bio}
                            onChange={handleChange}
                            minLength={3}
                            maxLength={50}
                            className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                        {/* GitHub */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">GitHub Profile Link</label>
                            <input
                                disabled={!isedit}
                                type="url"
                                name="github"
                                value={formData.github}
                                placeholder="https://github.com/yourusername"
                                onChange={handleChange}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>

                        {/* LinkedIn */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">LinkedIn Profile Link</label>
                            <input
                                disabled={!isedit}
                                type="url"
                                name="linkedin"
                                value={formData.linkedin}
                                placeholder="https://linkedin.com/in/yourprofile"
                                onChange={handleChange}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full  border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                        {/* Leetcode */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Leetcode Profile</label>
                            <input
                                disabled={!isedit}
                                type="url"
                                name="leetcode"
                                value={formData.leetcode}
                                placeholder="https://leetcode.com/u/bharatkumar19030/"
                                onChange={handleChange}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>

                        {/* GeeksForGeeks */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">GeeksForGeeks Profile</label>
                            <input
                                disabled={!isedit}
                                type="url"
                                name="gfg"
                                value={formData.gfg}
                                placeholder="https://www.geeksforgeeks.org/profile/JohnDoe"
                                onChange={handleChange}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full  border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                        {/* CodeForces */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">CodeForces Profile</label>
                            <input
                                disabled={!isedit}
                                type="url"
                                name="codeforces"
                                value={formData.codeforces}
                                placeholder="https://codeforces.com/profile/bharatkumar19030"
                                onChange={handleChange}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>

                        {/* HackerRank */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">HackerRank Profile</label>
                            <input
                                disabled={!isedit}
                                type="url"
                                name="hackerrank"
                                value={formData.hackerrank}
                                placeholder="https://www.hackerrank.com/profile/bharatkumar19030"
                                onChange={handleChange}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full  border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                        {/* HackerEarth */}
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">HackerEarth Profile</label>
                            <input
                                disabled={!isedit}
                                type="url"
                                name="hackerearth"
                                value={formData.hackerearth}
                                placeholder="https://www.hackerearth.com/profile/bharatkumar19030"
                                onChange={handleChange}
                                className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                            />
                        </div>

                        {/* Websites */}

                        {formData?.websites?.map((website, idx) => (
                            <div key={idx} className="flex items-end justify-between gap-2">
                                <div className="w-full">
                                    <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">Website</label>

                                    <input
                                        disabled={!isedit}
                                        type="url"
                                        name="websites"
                                        value={website}
                                        placeholder="https://www.myblog.com"
                                        onChange={(e) => handleChangeWebsite(e, idx)}
                                        className={` ${isedit ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'} dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 w-full  border rounded-lg p-2 focus:border-indigo-500 dark:focus:border-indigo-400`}
                                    />
                                </div>
                                <div onClick={() => addWebsite(idx)} className=" cursor-pointer flex items-center justify-center">
                                    <svg width="30px" height="30px" viewBox="-3.5 -3.5 57 57" fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-400"><line x1="25" y1="10.5" x2="25" y2="39.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="25" cy="25" r="23.667" /><line x1="39.5" y1="25" x2="10.5" y2="25" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <div onClick={() => removeWebsite(idx)} className='flex cursor-pointer items-center justify-center rounded-lg '>
                                    <svg width="30px" height="30px" viewBox="-0.48 -0.48 24.96 24.96" fill="none" stroke="currentColor" strokeWidth="0.696" className="text-gray-400"><path d="M17 12C17 11.4477 16.5523 11 16 11H8C7.44772 11 7 11.4477 7 12C7 12.5523 7.44771 13 8 13H16C16.5523 13 17 12.5523 17 12Z" fill="currentColor" /><path fillRule="evenodd" clipRule="evenodd" d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z" fill="currentColor" /></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Save Button */}
                    <div className="flex items-center justify-end w-full">
                        {!isedit ? (<button onClick={() => { setIsedit(true) }} className="cursor-pointer bg-gray-600 dark:bg-gray-700 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition">
                            Edit
                        </button>) :
                            (<button type="button" disabled={!isedit} onClick={() => { Saveprofile(); setIsedit(false); }} className={`cursor-pointer bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition`}>
                                {loading ? "Saving..." : "Save "}

                            </button>)
                        }

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Profile
