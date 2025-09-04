import React from 'react';
import axios from "axios";
import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { FilterIcon, ReturnIcon, SearchIcon } from "../../../svg";

export default function Search({ searchLength, setSearchResults }) {
  const { user } = useSelector((state) => state.user);
  const { token } = user;
  const [show, setShow] = useState(false);
  
  const handleSearch = useCallback(async (searchTerm) => {
    if (searchTerm && searchTerm.trim().length > 0) {
      try {
        const { data } = await axios.get(
          `${(process.env.REACT_APP_API_ENDPOINT || "http://localhost:5000").replace(/\/$/, '')}/api/v1/user?search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Search results:", data); // Debug log
        setSearchResults(data);
      } catch (error) {
        console.log("Search error:", error.response?.data?.error?.message || error.message);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, [token, setSearchResults]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    handleSearch(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e.target.value);
    }
  };
  return (
    <div className="h-[49px] py-1.5">
      {/*Container*/}
      <div className="px-[10px]">
        {/*Search input container*/}
        <div className="flex items-center gap-x-2">
          <div className="w-full flex dark:bg-dark_bg_2 rounded-lg pl-2">
            {show || searchLength > 0 ? (
              <span
                className="w-8 flex items-center justify-center rotateAnimation cursor-pointer"
                onClick={() => setSearchResults([])}
              >
                <ReturnIcon className="fill-green_1 w-5" />
              </span>
            ) : (
              <span className="w-8 flex items-center justify-center ">
                <SearchIcon className="dark:fill-dark_svg_2 w-5" />
              </span>
            )}
            <input
              type="text"
              placeholder="Search or start a new chat"
              className="input"
              onFocus={() => setShow(true)}
              onBlur={() => searchLength === 0 && setShow(false)}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button className="btn">
            <FilterIcon className="dark:fill-dark_svg_2" />
          </button>
        </div>
      </div>
    </div>
  );
}
