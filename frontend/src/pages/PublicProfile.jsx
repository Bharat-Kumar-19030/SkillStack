import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PublicProjects from '../components/publicProjects.jsx';
// import GitHubHeatmap from '../components/GitHubHeatmap.jsx';
import GitHubTimeline from '../components/GitHubTimeline.jsx';
import prof_img from '../assets/prof_img.jpg';
import CountUp from '../designs/Countup.jsx';
import{ useNavigate } from 'react-router-dom';
import PracticePlat from './PracticePlat.jsx';
import SkeletalPublic from '../components/SkeletalPublic.jsx'
export default function PublicProfile() {
  const navigate=useNavigate();
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [t_userdetails, setT_userdetails] = useState(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [lastcommit, setLastcommit] = useState("")
  const [githubUsername, setGithubUsername] = useState("");
  const [user, setUser] = useState({});
  const [contributions, setContributions] = useState([]);

  // Log when data is received from child component
  useEffect(() => {
    if (t_userdetails) {
      console.log("Received aggregated data in parent:", t_userdetails);
      console.log("Total Repos:", t_userdetails.totalRepos);
      console.log("Total Commits:", t_userdetails.totalCommits);
      console.log("Languages (sorted):", t_userdetails.languages);
      console.log("User Object:", t_userdetails.userObject);
    }
  }, [t_userdetails]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    console.log("fetching public profile for", username);
    fetchPublicProfile();

    const timer = setTimeout(() => {
      document.body.style.overflow = 'auto';
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 200);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, [username]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const response = await fetch(`${SERVER_URL}/api/users/profile/${username}`);

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setGithubUsername(data.user.githubProfileLink?.split('/').pop());
        setUser(data.user);
        console.log("public profile", data)

        // Check if current user is following this profile
        if (currentUser && data.user.followers) {
          const isCurrentlyFollowing = data.user.followers.some(
            follower => follower._id === currentUser._id
          );
          setIsFollowing(isCurrentlyFollowing);
        }
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }

  };


  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }

    if (!profileData?.user?._id) {
      toast.error('Profile data not loaded');
      return;
    }

    try {
      const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const endpoint = isFollowing ? 'unfollow' : 'follow';

      const response = await fetch(`${SERVER_URL}/api/users/${endpoint}/${profileData.user._id}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? 'Unfollowed successfully' : 'Following successfully');
        // Refresh profile to update counts
        fetchPublicProfile();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Error updating follow status');
    }
  };

  const fetchFollowersList = async () => {
    if (!profileData?.user?.followers) return;
    setFollowersList(profileData.user.followers);
    setShowFollowersModal(true);
  };

  const fetchFollowingList = async () => {
    if (!profileData?.user?.following) return;
    setFollowingList(profileData.user.following);
    setShowFollowingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-800 flex items-center justify-center">
        <SkeletalPublic/>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile not found</h1>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  return (

    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
      {/* Profile Header */}
        <div className=" flex items-center md:items-start flex-col md:flex-row gap-3 md:gap-1  justify-around md:mx-20 mb-8">
          <div className='flex flex-col gap-2 items-center justify-center'>
          <div className=" bg-white dark:bg-gray-600 rounded-xl p-4 flex flex-col md:flex-row items-center  gap-8">
            {/* Profile Image */}
            <div className="flex flex-col ">
              <div className='flex  gap-2 '>
                <img
                  src={user.profileImage || prof_img}
                  alt={user.name}
                  className="w-28 h-28 rounded-xl object-cover border-2 border-indigo-100 dark:border-indigo-300"
                />
                <div className='pt-2'>
                  <p title={user.name} className="font-semibold text-gray-800 dark:text-gray-100">{user.name.charAt(0).toUpperCase() + (user.name.length < 15 ? user.name.slice(1) : user.name.substring(1, 14) + "..")}</p>
                  <p title={user.username} className="text-sm  text-gray-800 dark:text-gray-100">{'@' + (user.username.length < 15 ? user.username : user.username.substring(0, 14) + "..")}</p>

                  {user.Bio && (

                    <p className="text-xs text-gray-700 mt-1 bg-gray-100 dark:bg-gray-500 rounded-md p-0.5 dark:text-gray-300 md:max-w-[150px] block break-words">{user.Bio.length > 48 ? user.Bio.substring(0, 48) + "..." : user.Bio}</p>
                  )}
                </div>

              </div>
              {/* Followers/Following counts */}
              <div className="flex gap-4 mt-4  items-center w-full ">
                <button
                  onClick={fetchFollowersList}
                  className="underline text-gray-700 dark:text-gray-300  cursor-pointer  rounded-lg  transition-colors"
                >
                  {/* <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{user.followersCount}</p> */}
                  <p className=" text-xs text-gray-600 dark:text-gray-300 "> {user.followersCount} Followers</p>
                </button>
                <span className='text-gray-600 dark:text-gray-300 text-xs'>|</span>
                <button
                  onClick={fetchFollowingList}
                  className="underline text-gray-700 dark:text-gray-300 cursor-pointer rounded-lg  transition-colors"
                >
                  {/* <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{user.followingCount}</p> */}
                  <p className="text-xs text-gray-600 dark:text-gray-300"> {user.followingCount} Following</p>
                </button>
              </div>

              {/* Follow Button */}
              {currentUser && currentUser._id !== user._id && (
                <button
                  onClick={handleFollow}
                  className={`p-1 my-1 cursor-pointer rounded-lg font-medium transition-colors ${isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    : 'bg-indigo-600  text-white hover:bg-indigo-700 dark:bg-gray-500 dark:hover:bg-gray-700'
                    }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
              {currentUser && currentUser._id === user._id && (
                <button
                  onClick={() => navigate("/profile")}
                  className={`p-1 flex items-center justify-around  my-1 cursor-pointer rounded-lg font-medium transition-colors ${isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    : 'bg-green-400  text-white hover:bg-green-500 dark:bg-green-400 dark:hover:bg-green-500'
                    }`}
                >
                  Edit Profile
                  <lord-icon
                    src="https://cdn.lordicon.com/exymduqj.json"
                    trigger="hover"
                    state="hover-line"
                    colors="primary:#ffffff,secondary:#ffffff"
                    style={{ width: "20px", height: "20px" }}
                  ></lord-icon>
                </button>
              )}
              
              
              {/* College & Branch */}
              {(user.collegeName || user.Branch) && (
                <div className="md:max-w-[500px]">
                  <div className="mt-1 flex gap-1 items-center text-sm text-gray-600 dark:text-gray-300 break-words">
                    <svg height="15px" width="15px" viewBox="0 0 64 64" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" className="text-gray-600 dark:text-gray-300" fill="currentColor"><path d="M13.1 30.2V37c0 14 37.7 14 37.7 0v-6.8H13.1z" /><path d="M62 25.4L32 38.9L2 25.4l30-13.5z" /><g><path d="M31.9 24.8c-4.6 2.1-14.6 6.6-15 6.8c-.2.1-.4.3-.4.6V39c0 .8 1 .8 1 0v-6.3c4.5-2 14.2-6.4 14.6-6.6c.6-.3.4-1.5-.2-1.3" /><ellipse cx="17" cy="38.9" rx="1.9" ry="2.4" /><path d="M17 51.9c1 0 1.9-.5 1.9-1.2V38.9h-3.8v11.8c0 .7.9 1.2 1.9 1.2" /></g><g><path d="M18.3 39.2c-.1 0-.1.1-.2.1v12.4c.1 0 .1-.1.2-.1V39.2" /><path d="M17.5 39.5h-.2v12.4h.2V39.5" /><path d="M16.7 39.5h-.2v12.4h.2V39.5" /><path d="M15.9 39.3c-.1 0-.1-.1-.2-.1v12.5c.1 0 .1.1.2.1V39.3" /></g></svg>
                    {user.collegeName && <span className="block break-words">{user.collegeName}</span>}
                  </div>
                  <div className="mt-1 text-xs text-center w-full text-gray-600 dark:text-gray-300 break-words">
                    {user.Branch && <span className="block break-words">({user.Branch})</span>}
                  </div>
                </div>
              )}
              <div className="mt-1 flex gap-1 flex-col">
                {user.githubProfileLink && <div className="flex items-center gap-1 text-sm break-words">
                  <svg fill="#000000" width="12px" height="12px" className=' dark:fill-gray-200' viewBox="0 -0.5 25 25" xmlns="http://www.w3.org/2000/svg"><path d="m12.301 0h.093c2.242 0 4.34.613 6.137 1.68l-.055-.031c1.871 1.094 3.386 2.609 4.449 4.422l.031.058c1.04 1.769 1.654 3.896 1.654 6.166 0 5.406-3.483 10-8.327 11.658l-.087.026c-.063.02-.135.031-.209.031-.162 0-.312-.054-.433-.144l.002.001c-.128-.115-.208-.281-.208-.466 0-.005 0-.01 0-.014v.001q0-.048.008-1.226t.008-2.154c.007-.075.011-.161.011-.249 0-.792-.323-1.508-.844-2.025.618-.061 1.176-.163 1.718-.305l-.076.017c.573-.16 1.073-.373 1.537-.642l-.031.017c.508-.28.938-.636 1.292-1.058l.006-.007c.372-.476.663-1.036.84-1.645l.009-.035c.209-.683.329-1.468.329-2.281 0-.045 0-.091-.001-.136v.007c0-.022.001-.047.001-.072 0-1.248-.482-2.383-1.269-3.23l.003.003c.168-.44.265-.948.265-1.479 0-.649-.145-1.263-.404-1.814l.011.026c-.115-.022-.246-.035-.381-.035-.334 0-.649.078-.929.216l.012-.005c-.568.21-1.054.448-1.512.726l.038-.022-.609.384c-.922-.264-1.981-.416-3.075-.416s-2.153.152-3.157.436l.081-.02q-.256-.176-.681-.433c-.373-.214-.814-.421-1.272-.595l-.066-.022c-.293-.154-.64-.244-1.009-.244-.124 0-.246.01-.364.03l.013-.002c-.248.524-.393 1.139-.393 1.788 0 .531.097 1.04.275 1.509l-.01-.029c-.785.844-1.266 1.979-1.266 3.227 0 .025 0 .051.001.076v-.004c-.001.039-.001.084-.001.13 0 .809.12 1.591.344 2.327l-.015-.057c.189.643.476 1.202.85 1.693l-.009-.013c.354.435.782.793 1.267 1.062l.022.011c.432.252.933.465 1.46.614l.046.011c.466.125 1.024.227 1.595.284l.046.004c-.431.428-.718 1-.784 1.638l-.001.012c-.207.101-.448.183-.699.236l-.021.004c-.256.051-.549.08-.85.08-.022 0-.044 0-.066 0h.003c-.394-.008-.756-.136-1.055-.348l.006.004c-.371-.259-.671-.595-.881-.986l-.007-.015c-.198-.336-.459-.614-.768-.827l-.009-.006c-.225-.169-.49-.301-.776-.38l-.016-.004-.32-.048c-.023-.002-.05-.003-.077-.003-.14 0-.273.028-.394.077l.007-.003q-.128.072-.08.184c.039.086.087.16.145.225l-.001-.001c.061.072.13.135.205.19l.003.002.112.08c.283.148.516.354.693.603l.004.006c.191.237.359.505.494.792l.01.024.16.368c.135.402.38.738.7.981l.005.004c.3.234.662.402 1.057.478l.016.002c.33.064.714.104 1.106.112h.007c.045.002.097.002.15.002.261 0 .517-.021.767-.062l-.027.004.368-.064q0 .609.008 1.418t.008.873v.014c0 .185-.08.351-.208.466h-.001c-.119.089-.268.143-.431.143-.075 0-.147-.011-.214-.032l.005.001c-4.929-1.689-8.409-6.283-8.409-11.69 0-2.268.612-4.393 1.681-6.219l-.032.058c1.094-1.871 2.609-3.386 4.422-4.449l.058-.031c1.739-1.034 3.835-1.645 6.073-1.645h.098-.005zm-7.64 17.666q.048-.112-.112-.192-.16-.048-.208.032-.048.112.112.192.144.096.208-.032zm.497.545q.112-.08-.032-.256-.16-.144-.256-.048-.112.08.032.256.159.157.256.047zm.48.72q.144-.112 0-.304-.128-.208-.272-.096-.144.08 0 .288t.272.112zm.672.673q.128-.128-.064-.304-.192-.192-.32-.048-.144.128.064.304.192.192.32.044zm.913.4q.048-.176-.208-.256-.24-.064-.304.112t.208.24q.24.097.304-.096zm1.009.08q0-.208-.272-.176-.256 0-.256.176 0 .208.272.176.256.001.256-.175zm.929-.16q-.032-.176-.288-.144-.256.048-.224.24t.288.128.225-.224z" /></svg>
                  <a
                    href={user.githubProfileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex gap-1 items-center underline text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    {user.githubProfileLink.indexOf("github.com/") !== -1 ? user.githubProfileLink.split("github.com/")[1] : user.githubProfileLink}

                    <svg width="10px" height="10px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M64 40 H104 M40 64 V104 M40 152 V192 Q40 216 64 216 H192 Q216 216 216 192 V152" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /><path d="M120 120 L216 40 M160 40 H216 V96" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  </a>
                </div>}
                {user.linkedInProfileLink && <div className="flex items-center gap-1 text-sm break-words">
                  <svg height="12px" width="12px" viewBox="0 0 382 382" className=' fill-blue-500 dark:fill-white'>
                    <path d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472L341.91,330.654z" />
                  </svg>
                  <a
                    href={user.linkedInProfileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex gap-1 items-center underline text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    {user.linkedInProfileLink.indexOf("linkedin.com/") !== -1 ? user.linkedInProfileLink.split("linkedin.com/")[1] : user.linkedInProfileLink}
                    <svg width="10px" height="10px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M64 40 H104 M40 64 V104 M40 152 V192 Q40 216 64 216 H192 Q216 216 216 192 V152" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /><path d="M120 120 L216 40 M160 40 H216 V96" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  </a>
                </div>}
                {user.leetcodeProfileLink && <div className="flex items-center gap-1 text-sm break-words">
                  <svg height="12px" width="12px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-yellow-700 dark:text-black dark:bg-white rounded-xs"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M33.8092 34.8772 26.8725 41.814a5.7258 5.7258 0 0 1-8.1154 0L8.6127 31.67a5.726 5.726 0 0 1 0-8.1155L18.7571 13.41a5.7258 5.7258 0 0 1 8.1154 0L34.5 21.0373" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.7571 13.41 27.7647 4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.5838 27.5918h21.49" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></g></svg>
                  <a
                    href={user.leetcodeProfileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex gap-1 items-center underline text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    {user.leetcodeProfileLink.indexOf("leetcode.com/") !== -1 ? user.leetcodeProfileLink.split("leetcode.com/")[1] : user.leetcodeProfileLink}
                    <svg width="10px" height="10px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M64 40 H104 M40 64 V104 M40 152 V192 Q40 216 64 216 H192 Q216 216 216 192 V152" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /><path d="M120 120 L216 40 M160 40 H216 V96" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  </a>
                </div>}
                {user.gfgProfileLink && <div className="flex items-center gap-1 text-sm break-words">
                  <svg height="12px" width="12px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-green-700 dark:text-black dark:bg-white rounded-xs"><g id="SVGRepo_bgCarrier" strokeWidth="2"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M23.9944 24H43.5a9.7513 9.7513 0 1 1-2.8565-6.8943" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path d="M24.0056 24H4.5a9.7513 9.7513 0 1 0 2.8565-6.8943" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></g></svg>
                  <a
                    href={user.gfgProfileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex gap-1 items-center underline text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    {user.gfgProfileLink.indexOf("geeksforgeeks.org/") !== -1 ? user.gfgProfileLink.split("geeksforgeeks.org/")[1] : user.gfgProfileLink}
                    <svg width="10px" height="10px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M64 40 H104 M40 64 V104 M40 152 V192 Q40 216 64 216 H192 Q216 216 216 192 V152" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /><path d="M120 120 L216 40 M160 40 H216 V96" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  </a>
                </div>}
                {user.hackerrankProfileLink && <div className="flex items-center gap-1 text-sm break-words">
                  <svg height="12px" width="12px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-green-700 dark:text-black dark:bg-white rounded-xs"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M15.998047 3C14.225047 3 5.5352031 7.9839062 4.6582031 9.5039062C3.7802031 11.024906 3.7802031 20.983047 4.6582031 22.498047C5.5392031 24.017047 14.229047 29 15.998047 29C17.762047 29 26.451938 24.019953 27.335938 22.501953C28.222938 20.979953 28.222938 11.014047 27.335938 9.4980469L27.335938 9.4960938C26.444937 7.9790937 17.756047 3 15.998047 3zM15.996094 5.0117188C17.693094 5.3647187 24.417703 9.2167656 25.595703 10.509766C26.135703 12.150766 26.134703 19.844281 25.595703 21.488281C24.425703 22.779281 17.695094 26.636281 15.996094 26.988281C14.298094 26.638281 7.5723906 22.783234 6.4003906 21.490234C5.8653906 19.842234 5.8653906 12.155766 6.4003906 10.509766C7.5693906 9.2167656 14.297094 5.3617187 15.996094 5.0117188zM13 9L11 11H12V21H14V17H18V21H17L19 23L21 21H20V12H18V15H14V11H15L13 9z"/></g></svg>
                  <a
                    href={user.hackerrankProfileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex gap-1 items-center underline text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    {user.hackerrankProfileLink.indexOf("www.") !== -1 ? user.hackerrankProfileLink.split("www.")[1].split("/")[0]+"/"+ user.hackerrankProfileLink.split("www.")[1].split("/")[2] : user.hackerrankProfileLink}
                    <svg width="10px" height="10px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M64 40 H104 M40 64 V104 M40 152 V192 Q40 216 64 216 H192 Q216 216 216 192 V152" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /><path d="M120 120 L216 40 M160 40 H216 V96" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  </a>
                </div>}
                {user.hackerearthProfileLink && <div className="flex items-center gap-1 text-sm break-words">
                  <svg height="12px" width="12px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-green-700 dark:text-gray-700 dark:bg-white rounded-xs"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M18.447 20.936H5.553V19.66h12.894zM20.973 0H9.511v6.51h.104c.986-1.276 2.206-1.4 3.538-1.306 1.967.117 3.89 1.346 4.017 5.169v7.322c0 .089-.05.177-.138.177h-2.29c-.09 0-.253-.082-.253-.177V10.6c0-1.783-.58-3.115-2.341-3.115-1.282 0-2.637.892-2.637 2.77v7.417c0 .089-.008.072-.102.072h-2.29c-.09 0-.29.022-.29-.072V0H3.178c-.843 0-1.581.673-1.581 1.515v20.996c0 .843.738 1.489 1.58 1.489h17.797c.843 0 1.431-.646 1.431-1.489V1.515c0-.842-.588-1.515-1.43-1.515"/></g></svg>
                  <a
                    href={user.hackerearthProfileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex gap-1 items-center underline text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    {user.hackerearthProfileLink.indexOf("www.") !== -1 ? user.hackerearthProfileLink.split("www.")[1] : user.hackerearthProfileLink}
                    <svg width="10px" height="10px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M64 40 H104 M40 64 V104 M40 152 V192 Q40 216 64 216 H192 Q216 216 216 192 V152" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /><path d="M120 120 L216 40 M160 40 H216 V96" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  </a>
                </div>}
                
              </div>
            </div>
          </div>
          {user.websites&& user.websites[0].trim()!==''&&<div className=" bg-white w-full p-2 dark:bg-gray-600 rounded-xl flex flex-col">
            <div className='flex items-center justify-center w-full'>
              <div className="text-gray-600 font-bold dark:text-white mb-2 flex items-center gap-1">
              My Creations
            </div>
            </div>
            {console.log("user details in public profile:::::::::::::::::::::::::::: ", user)}
            {user.websites && user.websites.map((website, idx) => (
              website.trim() !== "" && (
                <a key={idx} href={website} target="_blank" rel="noopener noreferrer">
                  <div className='px-2 underline flex items-center gap-2 mb-1 dark:text-gray-300 text-xs text-gray-700 rounded-lg'>
                    {website.split('://')[1]?.length < 40 ? website.split('://')[1] : website.split('://')[1]?.substring(0, 40) + "..."} {/* Display domain name */}
                    <svg width="10px" height="10px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M64 40 H104 M40 64 V104 M40 152 V192 Q40 216 64 216 H192 Q216 216 216 192 V152" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /><path d="M120 120 L216 40 M160 40 H216 V96" stroke="black" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  </div>
                </a>
              )
            ))}
          </div>}
          </div>

          <div className=' rounded-xl flex flex-col md:flex-row items-center justify-center gap-8'>
            {/* Coding Stats Button */}
              {(user.leetcodeProfileLink || user.codeforcesProfileLink || user.hackerrankProfileLink) && (
                <PracticePlat user={user} />
              )}
          </div>
          <div>

          </div>
        </div>

        {/* GitHub Stats Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 w-full justify-between items-start ">
          <div className='flex flex-col  items-center justify-between w-full md:w-1/2 h-80'>
            <div className="bg-white dark:bg-gray-600 rounded-xl shadow p-6  w-full">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-white">Repositories</p>
                  <p className="text-2xl font-bold text-gray-800 text-center dark:text-white">
                    {/* {t_userdetails?.totalRepos || profileData?.projects?.length || 0} */}

                    <CountUp
                      from={0}
                      to={t_userdetails?.totalRepos || profileData?.projects?.length || 0}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                    />
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white  dark:bg-gray-600 rounded-xl shadow p-6  w-full">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79085 16 7.99999 14.2091 7.99999 12M16 12C16 9.79086 14.2091 8 12 8C9.79085 8 7.99999 9.79086 7.99999 12M16 12H22M7.99999 12H2.00018" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-white">Total Commits</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white text-center">
                    {/* {t_userdetails?.totalCommits || user.totalCommits || 0} */}
                    <CountUp
                      from={0}
                      to={t_userdetails?.totalCommits || user.totalCommits || 0}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                    />
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white  dark:bg-gray-600  rounded-xl shadow p-6  w-full">
              <div className="flex items-center gap-3 ">
                <div className="p-3 bg-green-100  rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-white">Last Commit</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {/* {user.lastCommitDate 
                    ? new Date(user.lastCommitDate).toLocaleDateString()
                    : 'N/A'} */}
                    {lastcommit || 'N/A'}
                    {console.log("last commit in parent", lastcommit)}
                  </p>
                </div>
              </div>
            </div>


          </div>
          {githubUsername && (
            <div className="bg-white dark:bg-gray-600 p-6 pt-4 shadow h-80 rounded-xl overflow-y-auto w-full md:w-1/2 scrollbar-thin-only overflow-x-visible">
              <GitHubTimeline setLastcommit={setLastcommit} githubUsername={githubUsername} />
              {/* {console.log("last commit",lastcommit)} */}
            </div>
          )}
        </div>

        {/* GitHub Contribution Calendar */}
        {/* {githubUsername && (
           <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">GitHub Activity</h2>*/}

        {/* Contribution Heatmap */}
        {/* <div className="mb-8">
              <GitHubHeatmap githubUsername={githubUsername} />
            </div> */}

        {/* Activity Timeline */}
        {/* <div className="mt-8 pt-8 border-t border-gray-200">
              <GitHubTimeline githubUsername={githubUsername} />
            </div> */}

        {/* Link to full GitHub profile */}
        {/* //     <div className="mt-8 pt-6 border-t border-gray-200">
        //       <div className="flex items-center justify-center">
        //         <a
        //           href={user.githubProfileLink}
        //           target="_blank"
        //           rel="noopener noreferrer"
        //           className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        //         >
        //           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        //             <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        //           </svg>
        //           View Full GitHub Profile
        //         </a>
        //       </div>
        //     </div>
        //   </div>
        // )} */}

        {/* Languages Section - Display aggregated languages from child */}
        {t_userdetails && t_userdetails.languages && t_userdetails.languages.length > 0 && (
          <div className="bg-white dark:bg-gray-600  rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Languages Used</h2>
            <div className="space-y-4">
              {(() => {
                const total = t_userdetails.languages.reduce((sum, lang) => sum + lang.bytes, 0);
                const languageColors = {
                  JavaScript: "#f1e05a",
                  TypeScript: "#3178c6",
                  Python: "#3572A5",
                  Java: "#b07219",
                  HTML: "#FF6347",
                  CSS: "#563d7c",
                  C: "#555555",
                  "C++": "#f34b7d",
                  "C#": "#178600",
                  Go: "#00ADD8",
                  Rust: "#dea584",
                  Ruby: "#701516",
                  PHP: "#4F5D95",
                  Swift: "#F05138",
                  Kotlin: "#A97BFF",
                  Dart: "#00B4AB",
                  Shell: "#89e051",
                  Vue: "#41b883",
                  Scala: "#c22d40",
                  R: "#198CE7",
                };

                return (
                  <>
                    {/* Language bar */}
                    <div className="w-full h-4 flex rounded-lg overflow-hidden dark:text-white bg-gray-200">
                      {t_userdetails.languages.slice(0, 10).map((lang) => {
                        const percent = ((lang.bytes / total) * 100).toFixed(1);
                        return (
                          <div
                            key={lang.name}
                            title={`${lang.name}: ${percent}%`}
                            style={{
                              width: `${percent}%`,
                              backgroundColor: languageColors[lang.name] || "#8b949e",
                            }}
                            className="h-full"
                          />
                        );
                      })}
                    </div>

                    {/* Language list */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                      {t_userdetails.languages.map((lang) => {
                        const percent = ((lang.bytes / total) * 100).toFixed(1);
                        return (
                          <div key={lang.name} className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full shrink-0"
                              style={{ backgroundColor: languageColors[lang.name] || "#8b949e" }}
                            ></span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate dark:text-white">{lang.name}</p>
                              <p className="text-xs text-gray-500 dark:text-white">{percent == 0.0 ? '<0.1' : percent}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className=" rounded-2xl">
          <PublicProjects
            username={username}
            t_userd={t_userdetails}
            set_t_userd={setT_userdetails}
            contributions={contributions}
            setContributions={setContributions}
          />
        </div>

        {/* Followers Modal */}
        {showFollowersModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowFollowersModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Followers</h2>
                <button
                  onClick={() => setShowFollowersModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {followersList.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No followers yet</p>
                ) : (
                  <div className="space-y-3">
                    {followersList.map((follower) => (
                      <div key={follower._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <img
                          src={follower.profileImage || prof_img}
                          alt={follower.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{follower.name}</p>
                          {follower.username && (
                            <p className="text-sm text-gray-500">@{follower.username}</p>
                          )}
                        </div>
                        <a
                          href={`/profile/${follower.username}`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Following Modal */}
        {showFollowingModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowFollowingModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Following</h2>
                <button
                  onClick={() => setShowFollowingModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {followingList.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Not following anyone yet</p>
                ) : (
                  <div className="space-y-3">
                    {followingList.map((following) => (
                      <div key={following._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <img
                          src={following.profileImage || prof_img}
                          alt={following.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{following.name}</p>
                          {following.username && (
                            <p className="text-sm text-gray-500">@{following.username}</p>
                          )}
                        </div>
                        <a
                          href={`/profile/${following.username}`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
