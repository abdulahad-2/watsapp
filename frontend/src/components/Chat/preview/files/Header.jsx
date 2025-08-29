import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { CloseIcon } from "../../../../svg";
import { clearFiles } from "../../../../features/chatSlice";

export default function Header({ activeIndex }) {
  const dispatch = useDispatch();
  const { files } = useSelector((state) => state.chat) || { files: [] };

  const clearFilesHandler = () => {
    dispatch(clearFiles());
  };

  // Safe current file check
  const currentFile = files?.[activeIndex]?.file;

  return (
    <div className="w-full">
      {/*Container*/}
      <div className="w-full flex items-center justify-between">
        {/*Close icon / empty files*/}
        <div
          className="translate-x-4 cursor-pointer"
          onClick={clearFilesHandler}
        >
          <CloseIcon className="dark:fill-dark_svg_1" />
        </div>

        {/* File name */}
        <h1 className="dark:text-dark_text_1 text-[15px]">
          {currentFile?.name || "No file selected"}
        </h1>

        {/*Empty tag*/}
        <span></span>
      </div>
    </div>
  );
}
