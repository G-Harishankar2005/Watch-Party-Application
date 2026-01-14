import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import YouTube from "react-youtube";
import { connectSocket, sendWatchEvent, sendChat } from "../websocket/socket";
import "./Room.css";

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
        if (event.action === "LOAD") {
          setVideoId(event.videoId);
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
    setVideoId(videoInput.trim());
    sendWatchEvent(roomCode, { action: "LOAD", videoId: videoInput.trim() });
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
                placeholder="Enter YouTube Video ID"
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
              />
              <button onClick={loadVideo}>Load</button>
            </div>
          )}

          {videoId ? (
            <YouTube
              videoId={videoId}
              opts={{
                width: "100%",
                height: "420",
                playerVars: {
                  controls: isHost ? 1 : 0,
                  disablekb: 1,
                },
              }}
              onReady={(e) => {
                playerRef.current = e.target;
                setPlayerReady(true);
              }}
            />
          ) : (
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
