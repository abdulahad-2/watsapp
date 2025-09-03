import React from 'react';
import { useEffect, useState } from "react";
import { CloseIcon, ValidIcon } from "../../../svg";
export default function Ringing({ call, setCall, answerCall, endCall }) {
  const { name, picture } = call;
  const [timer, setTimer] = useState(0);
  // Removed `handleTimer` as its logic is integrated into useEffect
  // Removed `interval` declaration as it's handled within useEffect

  useEffect(() => {
    let intervalId;
    // If we are receiving a call, and it's not yet accepted, and timer is below 30 seconds
    if (call.receiveingCall && !call.callAccepted && timer < 30) {
      intervalId = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (call.receiveingCall && !call.callAccepted && timer >= 30) {
      // Automatically end the ringing if it goes beyond 30 seconds and not accepted
      setCall((prevCall) => ({ ...prevCall, receiveingCall: false }));
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timer, call, setCall]); // Added call and setCall to dependencies

  return (
    <div className="dark:bg-dark_bg_1 rounded-lg fixed  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg z-30">
      {/*Container*/}
      <div className="p-4 flex items-center justify-between gap-x-8">
        {/*Call infos*/}
        <div className="flex items-center gap-x-2">
          <img
            src={picture}
            alt="Profile picture"
            className="w-28 h-28 rounded-full"
          />
          <div>
            <h1 className="dark:text-white">
              <b>{name}</b>
            </h1>
            <span className="dark:text-dark_text_2">Whatsapp video...</span>
          </div>
        </div>
        {/*Call actions*/}
        <ul className="flex items-center gap-x-2">
          <li onClick={endCall}>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500">
              <CloseIcon className="fill-white w-5" />
            </button>
          </li>
          <li onClick={answerCall}>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500">
              <ValidIcon className="fill-white w-6 mt-2" />
            </button>
          </li>
        </ul>
      </div>
      {/*Ringtone*/}
      <audio src="../../../../audio/ringtone.mp3" autoPlay loop></audio>
    </div>
  );
}
