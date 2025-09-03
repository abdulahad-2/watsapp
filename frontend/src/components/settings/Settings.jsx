import { useState } from "react";
import { ReturnIcon } from "../../svg";
import React from 'react';

export default function Settings({ setShowSettings }) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-dark_bg_2 rounded-lg p-6 w-96 max-w-full">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowSettings(false)}
            className="btn mr-4"
          >
            <ReturnIcon className="dark:fill-dark_svg_1" />
          </button>
          <h2 className="text-lg font-semibold dark:text-dark_text_1">Settings</h2>
        </div>

        {/* Settings Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="dark:text-dark_text_1">Notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="toggle"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="dark:text-dark_text_1">Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="toggle"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="dark:text-dark_text_1">Read Receipts</span>
            <input
              type="checkbox"
              checked={readReceipts}
              onChange={(e) => setReadReceipts(e.target.checked)}
              className="toggle"
            />
          </div>

          <div className="pt-4 border-t border-dark_border_1">
            <p className="text-sm dark:text-dark_text_2 mb-2">Account</p>
            <button className="w-full text-left p-2 hover:bg-dark_bg_3 rounded dark:text-dark_text_1">
              Privacy
            </button>
            <button className="w-full text-left p-2 hover:bg-dark_bg_3 rounded dark:text-dark_text_1">
              Security
            </button>
            <button className="w-full text-left p-2 hover:bg-dark_bg_3 rounded dark:text-dark_text_1">
              Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
