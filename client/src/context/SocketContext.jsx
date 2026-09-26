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
    // Create Socket
    // =========================

    const newSocket = io(
      "http://localhost:5000",
      {
        withCredentials: true,
      }
    );

    // =========================
    // Connected
    // =========================

    newSocket.on("connect", () => {
      console.log(
        "Socket connected:",
        newSocket.id
      );

      setConnected(true);

      // Get current user ID
      const userId =
        user._id || user.id;

      // Register user
      newSocket.emit(
        "user:online",
        userId
      );
    });

    // =========================
    // Disconnected
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
    // Save socket
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

export const useSocket = () => {
  return useContext(
    SocketContext
  );
};