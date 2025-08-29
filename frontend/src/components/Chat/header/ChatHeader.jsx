import React from 'react';
import { useSelector } from "react-redux";
import {
  CallIcon,
  DotsIcon,
  SearchLargeIcon,
  VideoCallIcon,
} from "../../../svg";
import { capitalize } from "../../../utils/string";
import SocketContext from "../../../context/SocketContext";
import {
  getConversationName,
  getConversationPicture,
} from "../../../utils/chat";

function ChatHeader({ online, callUser, socket }) {
  // Redux selectors with default fallback
  const { activeConversation } = useSelector((state) => state.chat) || {};
  const { user } = useSelector((state) => state.user) || {};

  // Safe guards
  const isGroup = activeConversation?.isGroup || false;
  const users = activeConversation?.users || [];
  const conversationPicture = isGroup
    ? activeConversation?.picture
    : getConversationPicture(user, users);
  const conversationName = isGroup
    ? activeConversation?.name
    : capitalize(getConversationName(user, users).split(" ")[0] || "");

  return (
    <div className="h-[59px] dark:bg-dark_bg_2 flex items-center p16 select-none">
      <div className="w-full flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-x-4">
          <button className="btn">
            <img
              src={conversationPicture}
              alt="conversation"
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          <div className="flex flex-col">
            <h1 className="dark:text-white text-md font-bold">{conversationName}</h1>
            <span className="text-xs dark:text-dark_svg_2">
              {online ? "online" : ""}
            </span>
          </div>
        </div>

        {/* Right */}
        <ul className="flex items-center gap-x-2.5">
          <li onClick={() => callUser?.()}>
            <button className="btn">
              <VideoCallIcon />
            </button>
          </li>
          <li>
            <button className="btn" onClick={() => alert("Voice call feature coming soon!")}>
              <CallIcon />
            </button>
          </li>
          <li>
            <button className="btn" onClick={() => alert("Search in chat feature coming soon!")}>
              <SearchLargeIcon className="dark:fill-dark_svg_1" />
            </button>
          </li>
          <li>
            <button className="btn" onClick={() => alert("Chat options menu coming soon!")}>
              <DotsIcon className="dark:fill-dark_svg_1" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Wrap with SocketContext
const ChatHeaderWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <ChatHeader {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default ChatHeaderWithSocket;
