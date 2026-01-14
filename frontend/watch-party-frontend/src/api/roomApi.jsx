import api from "./axios";

export const createRoom = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:8080/rooms/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔥 REQUIRED
    },
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  return response.json();
};


export const joinRoom = async (roomCode) => {
  const res = await api.post(`/rooms/join`,{
    roomCode
  });
  return res.data;
};
