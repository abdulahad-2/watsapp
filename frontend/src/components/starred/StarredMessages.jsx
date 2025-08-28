import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ReturnIcon } from "../../svg";

export default function StarredMessages({ setShowStarredMessages }) {
  const { user } = useSelector((state) => state.user);
  const [starredMessages, setStarredMessages] = useState([]);

  useEffect(() => {
    const fetchStarredMessages = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT || "http://localhost:5000"}/api/v1/message/starred`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          const starred = await response.json();
          setStarredMessages(starred);
        }
      } catch (error) {
        console.error("Failed to fetch starred messages:", error);
        // Fallback to example data
        setStarredMessages([
          {
            _id: 1,
            message: "This is a starred message example",
            sender: { name: "John Doe" },
            createdAt: "2024-01-15",
            conversation: { name: "General Chat" }
          }
        ]);
      }
    };

    fetchStarredMessages();
  }, [user.token]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-dark_bg_2 rounded-lg p-6 w-96 max-w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowStarredMessages(false)}
            className="btn mr-4"
          >
            <ReturnIcon className="dark:fill-dark_svg_1" />
          </button>
          <h2 className="text-lg font-semibold dark:text-dark_text_1">Starred Messages</h2>
        </div>

        {/* Starred Messages List */}
        <div className="overflow-y-auto max-h-96">
          {starredMessages.length > 0 ? (
            starredMessages.map((msg) => (
              <div key={msg._id} className="mb-4 p-3 bg-dark_bg_3 rounded">
                <p className="dark:text-dark_text_1 mb-2">{msg.message}</p>
                <div className="text-xs dark:text-dark_text_2">
                  <span>{msg.sender?.name || msg.sender}</span> • <span>{msg.conversation?.name || msg.conversation}</span> • <span>{new Date(msg.createdAt || msg.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="dark:text-dark_text_2">No starred messages yet</p>
              <p className="text-xs dark:text-dark_text_2 mt-2">
                Star messages to find them easily later
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
