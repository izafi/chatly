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

  const [
    socket,
    setSocket,
  ] = useState(null);

  const [
    connected,
    setConnected,
  ] = useState(false);

  const [
    onlineUsers,
    setOnlineUsers,
  ] = useState([]);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setConnected(false);
      setOnlineUsers([]);

      return;
    }

    console.log(
      "🔌 Connecting Socket.IO..."
    );

    const newSocket = io(
      "http://localhost:5000",
      {
        withCredentials: true,
      }
    );

    // ======================================
    // CONNECT
    // ======================================

    newSocket.on("connect", () => {
      console.log(
        "🟢 Socket connected:",
        newSocket.id
      );

      setConnected(true);

      const userId =
        user._id || user.id;

      console.log(
        "👤 Sending user online:",
        userId
      );

      newSocket.emit(
        "user:online",
        userId
      );
    });

    // ======================================
    // ONLINE USERS
    // ======================================

    newSocket.on(
      "users:online",
      (users) => {
        console.log(
          "🟢 Online users:",
          users
        );

        setOnlineUsers(users);
      }
    );

    // ======================================
    // CONNECT ERROR
    // ======================================

    newSocket.on(
      "connect_error",
      (error) => {
        console.error(
          "❌ Socket error:",
          error.message
        );

        setConnected(false);
      }
    );

    // ======================================
    // DISCONNECT
    // ======================================

    newSocket.on(
      "disconnect",
      () => {
        console.log(
          "🔴 Socket disconnected"
        );

        setConnected(false);
      }
    );

    setSocket(newSocket);

    // ======================================
    // CLEANUP
    // ======================================

    return () => {
      console.log(
        "🧹 Cleaning socket..."
      );

      newSocket.disconnect();

      setSocket(null);
      setConnected(false);
      setOnlineUsers([]);
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUsers,
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