import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { io } from "socket.io-client";

import { useAuth } from "./AuthContext";

const SocketContext =
  createContext(null);

export const SocketProvider = ({
  children,
}) => {
  const { user } = useAuth();

  const [socket, setSocket] =
    useState(null);

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    // =========================
    // User not logged in
    // =========================

    if (!user) {
      return;
    }

    console.log(
      "Connecting to Socket.IO..."
    );

    // =========================
    // Create Socket Connection
    // =========================

    const newSocket = io(
      "http://localhost:5000",
      {
        withCredentials: true,
      }
    );

    // =========================
    // Socket Connected
    // =========================

    newSocket.on("connect", () => {
      console.log(
        "Socket connected:",
        newSocket.id
      );

      setConnected(true);

      // =========================
      // Get Current User ID
      // =========================

      const userId =
        user._id || user.id;

      // =========================
      // Tell Server User Is Online
      // =========================

      newSocket.emit(
        "user:online",
        userId
      );
    });

    // =========================
    // Socket Disconnected
    // =========================

    newSocket.on(
      "disconnect",
      () => {
        console.log(
          "Socket disconnected"
        );

        setConnected(false);
      }
    );

    // =========================
    // Save Socket
    // =========================

    setSocket(newSocket);

    // =========================
    // Cleanup
    // =========================

    return () => {
      console.log(
        "Cleaning up socket..."
      );

      newSocket.disconnect();

      setSocket(null);

      setConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// =========================
// Custom Hook
// =========================

export const useSocket = () => {
  return useContext(
    SocketContext
  );
};