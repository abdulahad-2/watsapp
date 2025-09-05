import { useState } from "react";
import { Conversations } from "./conversations";
import { SidebarHeader } from "./header";
import { Notifications } from "./notifications";
import { Search } from "./search";
import { SearchResults } from "./search";
import React from 'react';

export default function Sidebar({ onlineUsers, typing }) {
  const [searchResults, setSearchResults] = useState([]);
  return (
    <div className="w-full md:max-w-[30%] md:flex-[0_0_30%] h-full select-none border-b md:border-b-0 md:border-r dark:border-dark_border_2 overflow-hidden">
      {/*Sidebar Header*/}
      <SidebarHeader />
      {/*Notifications */}
      <Notifications />
      {/*Search*/}
      <Search
        searchLength={searchResults.length}
        setSearchResults={setSearchResults}
      />
      <div className="h-[calc(100%-160px)] overflow-y-auto custom-scrollbar px-2">
      {searchResults.length > 0 ? (
        <>
          {/*Search results*/}
          <SearchResults
            searchResults={searchResults}
            setSearchResults={setSearchResults}
          />
        </>
      ) : (
        <>
          {/*Conversations*/}
          <Conversations onlineUsers={onlineUsers} typing={typing} />
        </>
      )}
      </div>
    </div>
  );
}
