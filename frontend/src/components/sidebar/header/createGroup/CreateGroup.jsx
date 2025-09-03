import React, { useState } from "react";
import { ReturnIcon, ValidIcon } from "../../../../svg";
import UnderlineInput from "./UnderlineInput";
import MultipleSelect from "./MultipleSelect";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { createGroupConversation } from "../../../../features/chatSlice";

export default function CreateGroup({ setShowCreateGroup }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user) || {};
  const { status } = useSelector((state) => state.chat) || {};
  const [name, setName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "http://localhost:5000";

  const handleSearch = async (e) => {
    if (e.target.value && e.key === "Enter") {
      setSearchResults([]);
      if (!user?.token) return;

      try {
        const { data } = await axios.get(
          `${API_ENDPOINT}/api/v1/user?search=${e.target.value}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        const tempArray = data?.map((u) => ({
          value: u._id,
          label: u.name,
          picture: u.picture,
        })) || [];

        setSearchResults(tempArray);
      } catch (error) {
        console.error(error?.response?.data?.error?.message || error.message);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const createGroupHandler = async () => {
    if (status === "loading") return;

    if (!name.trim() || selectedUsers.length === 0) {
      alert("Group name and at least one user are required");
      return;
    }

    const usersIds = selectedUsers.map((u) => u.value);

    try {
      await dispatch(createGroupConversation({ name, users: usersIds, token: user?.token }));
      setShowCreateGroup(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create group. Try again.");
    }
  };

  return (
    <div className="createGroupAnimation relative flex0030 h-full z-40">
      <div className="mt-5">
        {/* Return/Close button */}
        <button
          className="btn w-6 h-6 border"
          onClick={() => setShowCreateGroup(false)}
        >
          <ReturnIcon className="fill-white" />
        </button>

        {/* Group name input */}
        <UnderlineInput name={name} setName={setName} />

        {/* Multiple select */}
        <MultipleSelect
          selectedUsers={selectedUsers}
          searchResults={searchResults}
          setSelectedUsers={setSelectedUsers}
          handleSearch={handleSearch}
        />

        {/* Create group button */}
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
          <button
            className="btn bg-green_1 scale-150 hover:bg-green-500"
            onClick={createGroupHandler}
          >
            {status === "loading" ? (
              <ClipLoader color="#E9EDEF" size={25} />
            ) : (
              <ValidIcon className="fill-white mt-2 h-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
