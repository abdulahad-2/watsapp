import { useRef } from "react";
import { useDispatch } from "react-redux";
import { addFiles } from "../../../../../features/chatSlice";
import { getFileType } from "../../../../../utils/file";
import { VideoCallIcon } from "../../../../../svg";

export default function VideoAttachment() {
  const inputRef = useRef(null);
  const dispatch = useDispatch();

  const videoHandler = (e) => {
    let files = Array.from(e.target.files);
    files.forEach((file) => {
      if (
        file.type !== "video/mp4" &&
        file.type !== "video/mpeg" &&
        file.type !== "video/webm" &&
        file.type !== "video/mov" &&
        file.type !== "video/avi"
      ) {
        files = files.filter((item) => item.name !== file.name);
        return;
      } else if (file.size > 1024 * 1024 * 100) { // 100MB limit
        files = files.filter((item) => item.name !== file.name);
        return;
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          dispatch(
            addFiles({
              file: file,
              fileData: e.target.result,
              type: getFileType(file.type),
            })
          );
        };
      }
    });
  };

  return (
    <li>
      <button
        type="button"
        className="bg-[#BF59CF] rounded-full"
        onClick={() => inputRef.current.click()}
      >
        <VideoCallIcon />
      </button>
      <input
        type="file"
        hidden
        multiple
        ref={inputRef}
        accept="video/*"
        onChange={videoHandler}
      />
    </li>
  );
}
