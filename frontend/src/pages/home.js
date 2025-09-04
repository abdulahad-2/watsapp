import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Peer from "simple-peer";
import { ChatContainer, WhatsappHome } from "../components/Chat";
import { Sidebar } from "../components/sidebar";
import SocketContext from "../context/SocketContext";
import {
  getConversations,
  updateMessagesAndConversations,
  removeMessage,
} from "../features/chatSlice";
import Call from "../components/Chat/call/Call";
import {
  getConversationId,
  getConversationName,
  getConversationPicture,
} from "../utils/chat";
const callData = {
  socketId: "",
  receiveingCall: false,
  callEnded: false,
  name: "",
  picture: "",
  signal: "",
};
function Home({ socket }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { activeConversation } = useSelector((state) => state.chat);
  const [onlineUsers, setOnlineUsers] = useState([]);
  //call
  const [call, setCall] = useState(callData);
  const [stream, setStream] = useState();
  const [show, setShow] = useState(false);
  const { socketId } = call;
  const [callAccepted, setCallAccepted] = useState(false);
  const [totalSecInCall, setTotalSecInCall] = useState(0);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  //typing
  const [typing, setTyping] = useState(false);
  //join user into the socket io
  useEffect(() => {
    // Support both Mongo (_id) and Supabase (id)
    const userId = user?.id || user?._id;
    if (userId) {
      socket.emit("join", userId);
    }
    //get online users
    socket.on("get-online-users", (users) => {
      setOnlineUsers(users);
    });
  }, [user, socket]);

  //call
  useEffect(() => {
    // Don't setup media automatically - only when needed for calls
    socket.on("setup socket", (id) => {
      setCall(prevCall => ({ ...prevCall, socketId: id }));
    });
    socket.on("call user", (data) => {
      setCall({
        ...call,
        socketId: data.from,
        name: data.name,
        picture: data.picture,
        signal: data.signal,
        receiveingCall: true,
      });
    });
    socket.on("end call", () => {
      setShow(false);
      setCall({ ...call, callEnded: true, receiveingCall: false });
      myVideo.current.srcObject = null;
      if (callAccepted) {
        connectionRef?.current?.destroy();
      }
    });
  }, [call, callAccepted, socket]);
  //--call user funcion
  const callUser = () => {
    setupMedia(); // Request media only when user initiates call
    setCall({
      ...call,
      name: getConversationName(user, activeConversation.users),
      picture: getConversationPicture(user, activeConversation.users),
    });
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("call user", {
        userToCall: getConversationId(user, activeConversation.users),
        signal: data,
        from: socketId,
        name: user.name,
        picture: user.picture,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("call accepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };
  //--answer call  funcion
  const answerCall = () => {
    setupMedia(); // Request media only when user answers call
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answer call", { signal: data, to: call.socketId });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    peer.signal(call.signal);
    connectionRef.current = peer;
  };
  //--end call  funcion
  const endCall = () => {
    setShow(false);
    setCall({ ...call, callEnded: true, receiveingCall: false });
    myVideo.current.srcObject = null;
    socket.emit("end call", call.socketId);
    connectionRef?.current?.destroy();
  };
  //--------------------------
  const setupMedia = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((error) => {
        // Silently handle media access denial - don't log errors
        // Try audio only
        navigator.mediaDevices
          .getUserMedia({ video: false, audio: true })
          .then((audioStream) => {
            setStream(audioStream);
          })
          .catch((audioError) => {
            // Continue without any media - this is normal for many users
          });
      });
  };

  const enableMedia = () => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
    setShow(true);
  };
  //get Conversations
  useEffect(() => {
    if (user?.token) {
      dispatch(getConversations(user.token));
    }
  }, [user, dispatch]);
  useEffect(() => {
    //lsitening to receiving a message
    socket.on("receive message", (message) => {
      dispatch(updateMessagesAndConversations(message));
    });
    //listening when a user is typing
    socket.on("typing", (conversation) => setTyping(conversation));
    socket.on("stop typing", () => setTyping(false));
    //listening for message deletion
    socket.on("message deleted", ({ messageId, conversationId }) => {
      dispatch(removeMessage({ messageId, convo_id: conversationId }));
    });
  }, [dispatch, socket]);
  return (
    React.createElement(React.Fragment, null,
      React.createElement("div", { className: "h-screen dark:bg-dark_bg_1 flex items-center justify-center overflow-hidden" },
        React.createElement("div", { className: "container h-screen flex py-[19px]" },
          React.createElement(Sidebar, { onlineUsers: onlineUsers, typing: typing }),
          (activeConversation?.id || activeConversation?._id)
            ? React.createElement(ChatContainer, { onlineUsers: onlineUsers, callUser: callUser, typing: typing })
            : React.createElement(WhatsappHome)
        )
      ),
      React.createElement("div", { className: (show || call.signal) && !call.callEnded ? "" : "hidden" },
        React.createElement(Call, {
          call: call,
          setCall: setCall,
          callAccepted: callAccepted,
          myVideo: myVideo,
          userVideo: userVideo,
          stream: stream,
          answerCall: answerCall,
          show: show,
          endCall: endCall,
          totalSecInCall: totalSecInCall,
          setTotalSecInCall: setTotalSecInCall
        })
      )
    )
  );
}

const HomeWithSocket = (props) => (
  React.createElement(
    SocketContext.Consumer,
    null,
    (socket) => React.createElement(Home, { ...props, socket })
  )
);
export default HomeWithSocket;
