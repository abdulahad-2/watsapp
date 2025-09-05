import { useDispatch, useSelector } from "react-redux";
import SocketContext from "../../../context/SocketContext";
import { open_create_conversation, patchConversationUsers } from "../../../features/chatSlice";
import {
  getConversationId,
  getConversationName,
  getConversationPicture,
} from "../../../utils/chat";
import { dateHandler } from "../../../utils/date";
import { capitalize } from "../../../utils/string";
import React from 'react';
import { toast } from "../../../utils/toast";
import api from "../../../lib/axiosConfig";

function Conversation({ convo, socket, online, typing }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { activeConversation } = useSelector((state) => state.chat);
  const { token } = user;
  // Normalize ids
  const myId = user?._id || user?.id || null;
  const pickId = (u) => (u ? u._id || u.id : null);
  // For existing conversations, try to get receiver_id from the conversation itself
  let receiver_id = null;
  if (convo.isGroup) {
    receiver_id = null;
  } else if (convo.users && convo.users.length >= 2) {
    receiver_id = getConversationId(user, convo.users);
  } else if (convo.users && convo.users.length === 1) {
    const otherUser = convo.users[0];
    const otherId = pickId(otherUser);
    receiver_id = otherId && otherId !== myId ? otherId : null;
  } else {
    receiver_id = null;
  }

  // Enhanced fallback logic for receiver_id
  let finalReceiverId = receiver_id;
  if (!finalReceiverId && convo.users && myId) {
    const other = convo.users.find((u) => pickId(u) && pickId(u) !== myId);
    finalReceiverId = pickId(other);
  }
  // If still missing and it's a 1:1 convo with empty users, use convo._id as receiver hint
  if (!convo.isGroup && !finalReceiverId && (!convo.users || convo.users.length === 0)) {
    finalReceiverId = convo._id;
  }

  const values = {
    receiver_id: finalReceiverId,
    isGroup: convo.isGroup,
    convo_id: convo.isGroup ? convo._id : (finalReceiverId ? null : convo._id),
    token,
  };
  
  // Debug logging (removed to reduce console spam)
  
  // If conversation renders as Unknown but we can infer a receiver id, fetch and patch users
  React.useEffect(() => {
    const run = async () => {
      try {
        if (convo.isGroup) return;
        if (!finalReceiverId) return;
        const name = getConversationName(user, convo.users || []);
        if (name && name !== "Unknown") return;
        const { data } = await api.get(`/users/by-id/${finalReceiverId}`);
        const other = Array.isArray(data) ? data[0] : data;
        if (other && (other._id || other.id)) {
          const meUser = {
            _id: user._id || user.id,
            id: user.id || user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            status: user.status,
          };
          const otherUser = {
            _id: other._id || other.id,
            id: other.id || other._id,
            name: other.name || other.email?.split("@")[0] || "User",
            email: other.email,
            picture: other.picture,
            status: other.status,
          };
          dispatch(patchConversationUsers({ convo_id: convo._id, users: [meUser, otherUser] }));
        }
      } catch (e) {
        console.warn("Failed to enrich conversation users:", e?.message || e);
      }
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convo._id, finalReceiverId]);

  const openConversation = async () => {
    // Skip if conversation has incomplete data
    if (!convo.isGroup && convo.users && convo.users.length === 1) {
      const singleUser = convo.users[0];
      const singleId = pickId(singleUser);
      if (singleId && singleId === myId) {
        console.warn("Cannot open conversation - only current user present");
        return;
      }
    }
    
    try {
      console.log("Opening conversation with values:", values);
      let newConvo = await dispatch(open_create_conversation(values));
      const opened = newConvo?.payload?.conversation || newConvo?.payload;
      if (opened && opened._id) {
        socket.emit("join conversation", opened._id);
      } else {
        console.error("Failed to open conversation - invalid payload:", newConvo);
        toast("Could not open conversation", { type: "error" });
      }
    } catch (error) {
      console.error("Failed to open conversation:", error);
      toast("Failed to open conversation", { type: "error" });
    }
  };
  return (
    <li
      onClick={() => openConversation()}
      className={`list-none h-[72px] w-full dark:bg-dark_bg_1 hover:${
        convo._id !== activeConversation?._id ? "dark:bg-dark_bg_2" : ""
      } cursor-pointer dark:text-dark_text_1 px-[10px] ${
        convo._id === activeConversation?._id ? "dark:bg-dark_hover_1" : ""
      }`}
    >
      {/*Container */}
      <div className="relative w-full flex items-center justify-between py-[10px]">
        {/*Left*/}
        <div className="flex items-center gap-x-3">
          {/*Conversation user picture*/}
          <div
            className={`relative min-w-[50px] max-w-[50px] h-[50px] rounded-full overflow-hidden ${
              online ? "online" : ""
            }`}
          >
            <img
              src={
                convo.isGroup
                  ? convo.picture
                  : getConversationPicture(user, convo.users)
              }
              alt="conversation"
              className="w-full h-full object-cover "
            />
          </div>
          {/*Conversation name and message*/}
          <div className="w-full flex flex-col">
            {/*Conversation name*/}
            <h1 className="font-bold flex items-center gap-x-2">
              {convo.isGroup
                ? convo.name
                : capitalize(getConversationName(user, convo.users))}
            </h1>
            {/* Conversation message */}
            <div>
              <div className="flex items-center gap-x-1 dark:text-dark_text_2">
                <div className="flex-1 items-center gap-x-1 dark:text-dark_text_2">
                  {typing === convo._id ? (
                    <p className="text-green_1">Typing...</p>
                  ) : (
                    <p>
                      {convo.latestMessage?.message.length > 25
                        ? `${convo.latestMessage?.message.substring(0, 25)}...`
                        : convo.latestMessage?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Right*/}
        <div className="flex flex-col gap-y-4 items-end text-xs">
          <span className="dark:text-dark_text_2">
            {convo.latestMessage?.createdAt
              ? dateHandler(convo.latestMessage?.createdAt)
              : ""}
          </span>
        </div>
      </div>
      {/*Border*/}
      <div className="ml-16 border-b dark:border-b-dark_border_1"></div>
    </li>
  );
}

const ConversationWithContext = (props) => (
  <SocketContext.Consumer>
    {(socket) => <Conversation {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default ConversationWithContext;
