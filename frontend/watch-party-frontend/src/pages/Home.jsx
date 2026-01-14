import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../api/roomApi";
import "./Home.css";

const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const room = await createRoom();
      navigate(`/room/${room.roomCode}`);
    } catch {
      alert("Room creation failed");
    }
  };

  const handleJoin = async () => {
    try {
      await joinRoom(roomCode);
      navigate(`/room/${roomCode}`);
    } catch {
      alert("Invalid room code");
    }
  };

  return (
    <div className="home-container">
      {/* LEFT SIDE */}
      <div className="home-left">
        <img src="/watch-party.png" alt="Watch Party" />
      </div>

      {/* RIGHT SIDE */}
      <div className="home-right">
        <div className="home-card">
          <h2>🎬 Watch Party</h2>
          <p>Watch videos together in real time</p>

          <button className="primary-btn" onClick={handleCreate}>
            Create Room
          </button>

          <div className="divider">OR</div>

          <input
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />

          <button className="secondary-btn" onClick={handleJoin}>
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
