import React from 'react';
import { useState } from "react";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { ReturnIcon, ValidIcon } from "../../svg";

export default function ProfileEdit({ setShowProfileEdit }) {
  const { user } = useSelector((state) => state.user);
  const [name, setName] = useState(user.name || "");
  const [status, setStatus] = useState(user.status || "");
  const [picture, setPicture] = useState(user.picture || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Implement actual profile update API call
      console.log("Profile update:", { name, status, picture });
      alert("Profile updated successfully!");
      setShowProfileEdit(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-dark_bg_2 rounded-lg p-6 w-96 max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowProfileEdit(false)}
            className="btn"
          >
            <ReturnIcon className="dark:fill-dark_svg_1" />
          </button>
          <h2 className="text-lg font-semibold dark:text-dark_text_1">Edit Profile</h2>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn"
          >
            {loading ? (
              <ClipLoader color="#E9EDEF" size={20} />
            ) : (
              <ValidIcon className="dark:fill-green_1" />
            )}
          </button>
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <img
              src={picture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            type="url"
            placeholder="Profile picture URL"
            value={picture}
            onChange={(e) => setPicture(e.target.value)}
            className="w-full p-2 bg-dark_bg_3 border border-dark_border_1 rounded text-dark_text_1 focus:outline-none focus:border-green_1"
          />
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium dark:text-dark_text_2 mb-2">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-dark_bg_3 border border-dark_border_1 rounded text-dark_text_1 focus:outline-none focus:border-green_1"
          />
        </div>

        {/* Status Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium dark:text-dark_text_2 mb-2">
            Status
          </label>
          <input
            type="text"
            placeholder="Enter your status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 bg-dark_bg_3 border border-dark_border_1 rounded text-dark_text_1 focus:outline-none focus:border-green_1"
          />
        </div>
      </div>
    </div>
  );
}
