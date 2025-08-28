import { useDispatch, useSelector } from "react-redux";
import { deleteMessage, starMessage } from "../../../features/chatSlice";
import SocketContext from "../../../context/SocketContext";

function MessageMenu({ message, me, onClose, socket }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { token } = user;

  const handleDelete = async () => {
    try {
      const result = await dispatch(deleteMessage({ 
        token, 
        messageId: message._id,
        convo_id: message.conversation._id 
      }));
      
      if (result.payload) {
        socket.emit("message deleted", {
          messageId: message._id,
          conversationId: message.conversation._id
        });
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
    onClose();
  };

  const handleStar = async () => {
    try {
      await dispatch(starMessage({ 
        token, 
        messageId: message._id 
      }));
    } catch (error) {
      console.error("Failed to star message:", error);
    }
    onClose();
  };

  const handleReply = () => {
    // TODO: Implement reply functionality
    console.log("Reply to message:", message._id);
    onClose();
  };

  const handleForward = () => {
    // TODO: Implement forward functionality
    console.log("Forward message:", message._id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute z-50 bg-dark_bg_2 rounded-lg shadow-lg border border-dark_border_1 py-2 min-w-[150px] top-0 right-0">
        <button
          onClick={handleReply}
          className="w-full text-left px-4 py-2 hover:bg-dark_bg_3 dark:text-dark_text_1 text-sm"
        >
          Reply
        </button>
        
        <button
          onClick={handleForward}
          className="w-full text-left px-4 py-2 hover:bg-dark_bg_3 dark:text-dark_text_1 text-sm"
        >
          Forward
        </button>
        
        <button
          onClick={handleStar}
          className="w-full text-left px-4 py-2 hover:bg-dark_bg_3 dark:text-dark_text_1 text-sm"
        >
          {message.starred ? "Unstar" : "Star"}
        </button>
        
        {me && (
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 hover:bg-dark_bg_3 text-red-500 text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </>
  );
}

const MessageMenuWithSocket = (props) => (
  <SocketContext.Consumer>
    {(socket) => <MessageMenu {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default MessageMenuWithSocket;
