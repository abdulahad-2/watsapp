import { useState } from "react";
import { useSelector } from "react-redux";
import { ReturnIcon, ValidIcon } from "../../svg";
import { ClipLoader } from "react-spinners";
import React from 'react';

export default function NewCommunity({ setShowNewCommunity }) {
  const { user } = useSelector((state) => state.user) || {};
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!communityName.trim()) {
      alert("Community name is required");
      return;
    }

    if (!user?.token) {
      alert("You must be logged in to create a community");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_ENDPOINT || "http://localhost:5000"}/api/v1/community`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`,
          },
          body: JSON.stringify({ name: communityName, description, isPrivate }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to create community");
      }

      const newCommunity = await response.json();
      console.log("Community created:", newCommunity);
      alert("Community created successfully!");
      setShowNewCommunity(false);
    } catch (error) {
      console.error("Failed to create community:", error);
      alert("Failed to create community. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-dark_bg_2 rounded-lg p-6 w-96 max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setShowNewCommunity(false)} className="btn">
            <ReturnIcon className="dark:fill-dark_svg_1" />
          </button>
          <h2 className="text-lg font-semibold dark:text-dark_text_1">New Community</h2>
          <button onClick={handleCreate} disabled={loading} className="btn">
            {loading ? (
              <ClipLoader color="#E9EDEF" size={20} />
            ) : (
              <ValidIcon className="dark:fill-green_1" />
            )}
          </button>
        </div>

        {/* Community Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-dark_text_2 mb-2">
              Community Name
            </label>
            <input
              type="text"
              placeholder="Enter community name"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className="w-full p-2 bg-dark_bg_3 border border-dark_border_1 rounded text-dark_text_1 focus:outline-none focus:border-green_1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-dark_text_2 mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter community description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 bg-dark_bg_3 border border-dark_border_1 rounded text-dark_text_1 focus:outline-none focus:border-green_1 resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="dark:text-dark_text_1">Private Community</span>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="toggle"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
