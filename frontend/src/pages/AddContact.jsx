import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../axiosConfig";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function AddContact() {
  const query = useQuery();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const id = query.get("id")?.trim();

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      setResult(null);
      try {
        const base = (process.env.REACT_APP_API_ENDPOINT || "http://localhost:5000").replace(/\/$/, "");
        const { data } = await api.get(`${base}/users/by-id/${encodeURIComponent(id)}`);
        setResult(Array.isArray(data) ? data[0] : null);
      } catch (e) {
        setError(e?.response?.data?.error?.message || e?.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const copyId = async () => {
    if (!result?._id) return;
    try {
      await navigator.clipboard.writeText(result._id);
      alert("ID copied to clipboard");
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const startChat = () => {
    // Placeholder: navigate back home; in a real app, dispatch create/open conversation here
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark_bg_1 text-dark_text_1 p-4">
      <div className="bg-dark_bg_2 border border-dark_border_1 rounded-lg p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Add Contact</h1>
        {!id && <p className="text-sm text-dark_text_2">No ID provided.</p>}
        {id && loading && <p className="text-sm">Loading…</p>}
        {id && error && <p className="text-sm text-red-400">{error}</p>}
        {id && !loading && !error && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={result.picture || user.picture}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{result.name || "Unknown"}</div>
                <div className="text-xs text-dark_text_2">{result.email || "hidden"}</div>
                <div className="text-xs text-dark_text_2">ID: {result._id}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={copyId}>Copy ID</button>
              <button className="btn" onClick={startChat}>Start Chat</button>
            </div>
          </div>
        )}
        {id && !loading && !error && !result && (
          <p className="text-sm text-dark_text_2">No user found for this ID.</p>
        )}
      </div>
    </div>
  );
}
