import React from 'react';
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ClipLoader } from "react-spinners";
import { ReturnIcon, ValidIcon } from "../../svg";
import { updateUserProfile } from "../../features/userSlice";

export default function ProfileEdit({ setShowProfileEdit }) {
  const dispatch = useDispatch();
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
      // Update user profile in Redux store and localStorage
      dispatch(updateUserProfile({ name, status, picture }));
      console.log("Profile updated:", { name, status, picture });
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

        {/* Shareable User ID + Copy actions */}
        <div className="mb-6 p-3 rounded bg-dark_bg_3 border border-dark_border_1">
          <p className="text-xs text-dark_text_2 mb-2">My ID</p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-[11px] break-all text-dark_text_1 bg-dark_bg_1 px-2 py-1 rounded flex-1">
              {user.id || "—"}
            </code>
            <button
              type="button"
              className="btn whitespace-nowrap"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(user.id || "");
                  alert("ID copied to clipboard");
                } catch (e) {
                  console.error("Copy ID failed", e);
                }
              }}
            >
              Copy ID
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3">
            <span className="text-xs text-dark_text_2">Share link</span>
            <button
              type="button"
              className="btn"
              onClick={async () => {
                const base = window.location.origin;
                const link = `${base}/add-contact?id=${encodeURIComponent(user.id || "")}`;
                try {
                  await navigator.clipboard.writeText(link);
                  alert("Share link copied");
                } catch (e) {
                  console.error("Copy link failed", e);
                }
              }}
            >
              Copy Link
            </button>
          </div>
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
