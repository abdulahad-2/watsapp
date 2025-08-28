import React from 'react';

export default function NewChat({ setShowNewChat }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-dark_bg_1 rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-dark_text_1">New Chat</h2>
          <button
            onClick={() => setShowNewChat(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-dark_text_2 dark:hover:text-dark_text_1"
          >
            ✕
          </button>
        </div>
        <div className="text-center py-8">
          <p className="dark:text-dark_text_2">Use the search bar to find users and start chatting!</p>
        </div>
      </div>
    </div>
  );
}
