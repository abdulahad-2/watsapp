import React from 'react';
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ClipLoader } from "react-spinners";
import { ReturnIcon, ValidIcon } from "../../svg";
import { updateUserProfile } from "../../features/userSlice";
import { toast } from "../../utils/toast";
import { supabase } from "../../lib/supabase";

export default function ProfileEdit({ setShowProfileEdit }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [name, setName] = useState(user.name || "");
  const [status, setStatus] = useState(user.status || "");
  const [picture, setPicture] = useState(user.picture || "");
  const [loading, setLoading] = useState(false);
  const [myId, setMyId] = useState(user.id || user._id || "");

  // Fallback: if Redux doesn't have id, try Supabase auth user
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!myId) {
          // Prefer session (faster) then fallback to getUser
          const s = await supabase.auth.getSession();
          const sessionUserId = s?.data?.session?.user?.id;
          if (sessionUserId && mounted) {
            setMyId(sessionUserId);
            return;
          }
          const { data, error } = await supabase.auth.getUser();
          if (!error && data?.user?.id && mounted) setMyId(data.user.id);
        }
      } catch (_) {}
    })();
    return () => {
      mounted = false;
    };
  }, [myId]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    
    setLoading(true);
    try {
      // Pure client-side persistence: Redux + localStorage
      dispatch(updateUserProfile({ name, status, picture }));
      console.log("Profile saved locally:", { name, status, picture });
      toast("Profile updated", { type: "success" });
      setShowProfileEdit(false);
    } catch (error) {
      console.error("Failed to save profile locally:", error);
      toast("Failed to update profile. Please try again.", { type: "error" });
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

        {/* Shareable User ID + Copy actions (after Status) */}
        <div className="mb-2 text-xs text-dark_text_2">Share your ID so others can add you.</div>
        <div className="mb-2 p-3 rounded bg-dark_bg_3/80 border border-dark_border_1">
          <p className="text-xs text-dark_text_2 mb-2">My ID</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={myId || "—"}
              className="flex-1 px-2 py-1 rounded bg-dark_bg_1 text-dark_text_1 text-xs border border-dark_border_1 focus:outline-none"
            />
            <button
              type="button"
              className="btn px-3 py-1"
              onClick={async () => {
                try {
                  const val = myId || "";
                  await navigator.clipboard.writeText(val);
                  toast("ID copied", { type: "success" });
                } catch (e) {
                  console.error("Copy ID failed", e);
                }
              }}
            >
              Copy ID
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/add-contact?id=${encodeURIComponent(myId || "")}`}
              className="flex-1 px-2 py-1 rounded bg-dark_bg_1 text-dark_text_1 text-xs border border-dark_border_1 focus:outline-none"
            />
            <button
              type="button"
              className="btn px-3 py-1"
              onClick={async () => {
                const link = `${window.location.origin}/add-contact?id=${encodeURIComponent(myId || "")}`;
                try {
                  await navigator.clipboard.writeText(link);
                  toast("Share link copied", { type: "success" });
                } catch (e) {
                  console.error("Copy link failed", e);
                }
              }}
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
