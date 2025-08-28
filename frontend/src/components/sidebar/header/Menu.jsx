import { useDispatch } from "react-redux";
import { logout } from "../../../features/userSlice";
import { useState } from "react";
import Settings from "../../settings/Settings";
import StarredMessages from "../../starred/StarredMessages";
import NewCommunity from "../../community/NewCommunity";

export default function Menu({ setShowCreateGroup }) {
  const dispatch = useDispatch();
  const [showSettings, setShowSettings] = useState(false);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [showNewCommunity, setShowNewCommunity] = useState(false);
  
  const handleNewCommunity = (e) => {
    e.stopPropagation();
    setShowNewCommunity(true);
  };
  
  const handleStarredMessages = (e) => {
    e.stopPropagation();
    setShowStarredMessages(true);
  };
  
  const handleSettings = (e) => {
    e.stopPropagation();
    setShowSettings(true);
  };
  
  return (
    <>
      <div className="absolute right-1 z-[9999] dark:bg-dark_bg_2 dark:text-dark_text_1 shadow-md w-52">
        <ul>
          <li
            className="py-3 pl-5 cursor-pointer hover:bg-dark_bg_3"
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateGroup(true);
            }}
          >
            <span>New group</span>
          </li>
          <li 
            className="py-3 pl-5 cursor-pointer hover:bg-dark_bg_3"
            onClick={handleNewCommunity}
          >
            <span>New community</span>
          </li>
          <li 
            className="py-3 pl-5 cursor-pointer hover:bg-dark_bg_3"
            onClick={handleStarredMessages}
          >
            <span>Starred messages</span>
          </li>
          <li 
            className="py-3 pl-5 cursor-pointer hover:bg-dark_bg_3"
            onClick={handleSettings}
          >
            <span>Settings</span>
          </li>
          <li
            className="py-3 pl-5 cursor-pointer hover:bg-dark_bg_3"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(logout());
            }}
          >
            <span>Logout</span>
          </li>
        </ul>
      </div>
      
      {/* Modals */}
      {showSettings && <Settings setShowSettings={setShowSettings} />}
      {showStarredMessages && <StarredMessages setShowStarredMessages={setShowStarredMessages} />}
      {showNewCommunity && <NewCommunity setShowNewCommunity={setShowNewCommunity} />}
    </>
  );
}
