import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import YouTube from "react-youtube";
import { connectSocket, sendWatchEvent, sendChat } from "../websocket/socket";
import "./Room.css";

const extractVideoId = (urlOrId) => {
  if (!urlOrId) return "";
  const trimmed = typeof urlOrId === 'string' ? urlOrId.trim() : String(urlOrId).trim();
  
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : trimmed;
};

const Room = () => {
  const { roomCode } = useParams();
  const playerRef = useRef(null);

  const [isHost, setIsHost] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [videoInput, setVideoInput] = useState("");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [playerReady, setPlayerReady] = useState(false);

  /* ---------------- HOST CHECK ---------------- */
  useEffect(() => {
    fetch(`http://localhost:8080/rooms/${roomCode}/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => setIsHost(data.host));
  }, [roomCode]);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    connectSocket(localStorage.getItem("token"), roomCode, {
      onWatch: (event) => {
        console.log("RECEIVED WATCH EVENT:", event);

        if (event.action === "LOAD") {
          const rawId = event.videoId || event.payload?.videoId;
          const cleanId = extractVideoId(rawId);
          console.log("EXTRACTED VIDEO ID:", cleanId);
          setVideoId(cleanId);
          return;
        }
        if (!playerRef.current) return;

        if (event.action === "PLAY") {
          playerRef.current.seekTo(event.timestamp, true);
          playerRef.current.playVideo();
        }
        if (event.action === "PAUSE") {
          playerRef.current.seekTo(event.timestamp, true);
          playerRef.current.pauseVideo();
        }
        if (event.action === "SEEK") {
          playerRef.current.seekTo(event.timestamp, true);
        }
      },
      onChat: (msg) => setChat(prev => [...prev, msg]),
    });
  }, [roomCode]);

  /* ---------------- CONTROLS ---------------- */
  const loadVideo = () => {
    if (!videoInput.trim()) return;
    const cleanId = extractVideoId(videoInput);
    console.log("Loading Local Video ID:", cleanId);
    setVideoId(cleanId);
    sendWatchEvent(roomCode, { action: "LOAD", videoId: cleanId });
  };

  const play = () => {
    if (!playerReady || !playerRef.current) return;
    sendWatchEvent(roomCode, {
      action: "PLAY",
      timestamp: playerRef.current.getCurrentTime(),
    });
  };

  const pause = () => {
    if (!playerReady || !playerRef.current) return;
    sendWatchEvent(roomCode, {
      action: "PAUSE",
      timestamp: playerRef.current.getCurrentTime(),
    });
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    sendChat(roomCode, chatInput);
    setChatInput("");
  };

  return (
    <div className="room-container">
      {/* LEFT */}
      <div className="video-section">
        <h2 className="room-title">Room: {roomCode}</h2>

        <div className="video-card">
          {isHost && (
            <div className="video-load">
              <input
                placeholder="Paste YouTube Link or Video ID"
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
              />
              <button onClick={loadVideo}>Load</button>
            </div>
          )}

          <div style={{ display: videoId ? "block" : "none" }}>
            <YouTube
              videoId={videoId || "jNQXAC9IVRw"}
              opts={{
                width: "100%",
                height: "420",
                playerVars: {
                  controls: isHost ? 1 : 0,
                  disablekb: 1,
                  autoplay: 0,
                },
              }}
              onReady={(e) => {
                console.log("YouTube Player Ready");
                playerRef.current = e.target;
                setPlayerReady(true);
              }}
              onError={(e) => {
                console.error("YouTube Player Error:", e);
              }}
            />
          </div>

          {!videoId && (
            <div className="waiting">Waiting for host to load video…</div>
          )}

          {isHost && (
            <div className="floating-controls">
              <button onClick={play}>▶ Play</button>
              <button onClick={pause}>⏸ Pause</button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="chat-section">
        <h3>Live Chat</h3>

        <div className="chat-box">
          {chat.map((c, i) => (
            <div key={i} className="chat-msg">
              <strong>{c.sender}:</strong> {c.content}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Room;
