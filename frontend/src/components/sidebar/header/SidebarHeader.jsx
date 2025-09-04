import React from 'react';
import { useSelector } from "react-redux";
import { ChatIcon, CommunityIcon, DotsIcon, StoryIcon } from "../../../svg";
import { useState } from "react";
import Menu from "./Menu";
import { CreateGroup } from "./createGroup";
import ProfileEdit from "../../profile/ProfileEdit";
import NewCommunity from "../../community/NewCommunity";
import Stories from "../../stories/Stories";
import NewChat from "../../Chat/NewChat";
import AIChat from "../../chat/AIChat";
export default function SidebarHeader() {
  const { user } = useSelector((state) => state.user);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showNewCommunity, setShowNewCommunity] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  return (
    <>
      {/*Sidebar header*/}
      <div className="h-[50px] dark:bg-dark_bg_2 flex items-center p16">
        {/* container */}
        <div className="w-full flex items-center justify-between">
          {/*user image*/}
          <button className="btn" onClick={() => setShowProfileEdit(true)}>
            <img
              src={user.picture}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          {/*user icons*/}
          <ul className="flex items-center gap-x-2 5">
            <li>
              <button className="btn" onClick={() => setShowNewCommunity(true)}>
                <CommunityIcon className="dark:fill-dark_svg_1" />
              </button>
            </li>
            <li>
              <button className="btn" onClick={() => setShowStories(true)}>
                <StoryIcon className="dark:fill-dark_svg_1" />
              </button>
            </li>
            <li>
              <button className="btn" onClick={() => setShowNewChat(true)}>
                <ChatIcon className="dark:fill-dark_svg_1" />
              </button>
            </li>
            <li>
              <button 
                className="btn" 
                onClick={() => setShowAIChat(true)}
                title="Chat with AI"
              >
                🤖
              </button>
            </li>
            <li
              className="relative"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <button className={`btn ${showMenu ? "bg-dark_hover_1" : ""}`}>
                <DotsIcon className="dark:fill-dark_svg_1" />
              </button>
              {showMenu ? (
                <Menu setShowCreateGroup={setShowCreateGroup} />
              ) : null}
            </li>
          </ul>
        </div>
      </div>
      {/*Create Group*/}
      {showCreateGroup && (
        <CreateGroup setShowCreateGroup={setShowCreateGroup} />
      )}
      {/*Profile Edit*/}
      {showProfileEdit && (
        <ProfileEdit setShowProfileEdit={setShowProfileEdit} />
      )}
      {/*New Community*/}
      {showNewCommunity && (
        <NewCommunity setShowNewCommunity={setShowNewCommunity} />
      )}
      {/*Stories*/}
      {showStories && (
        <Stories setShowStories={setShowStories} />
      )}
      {/*New Chat*/}
      {showNewChat && (
        <NewChat setShowNewChat={setShowNewChat} />
      )}
      {/*AI Chat*/}
      {showAIChat && (
        <AIChat onClose={() => setShowAIChat(false)} />
      )}
    </>
  );
}
