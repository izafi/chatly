import { useEffect, useState } from "react";

import { MessageCircle } from "lucide-react";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";

import {
  createOrGetConversation,
} from "../services/conversationService";

import {
  getMessages,
} from "../services/messageService";

import { useAuth } from "../context/AuthContext";

import {
  useSocket,
} from "../context/SocketContext";

const Chat = () => {
  // =========================
  // Auth
  // =========================

  const { user } = useAuth();

  // =========================
  // Socket
  // =========================

  const {
    socket,
    connected,
    onlineUsers,
  } = useSocket();

  // =========================
  // States
  // =========================

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

  const [
    conversation,
    setConversation,
  ] = useState(null);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  // =========================
  // Selected User ID
  // =========================

  const selectedUserId =
    selectedUser?._id ||
    selectedUser?.id;

  // =========================
  // Check Selected User Online
  // =========================

  const isSelectedUserOnline =
    onlineUsers.some(
      (onlineUserId) =>
        String(onlineUserId) ===
        String(selectedUserId)
    );

  // =========================
  // Receive Real-Time Message
  // =========================

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleReceiveMessage = (
      message
    ) => {
      console.log(
        "Real-time message received:",
        message
      );

      // Make sure conversation exists
      if (!conversation) {
        return;
      }

      // Compare conversation IDs safely
      if (
        String(message.conversation) ===
        String(conversation._id)
      ) {
        setMessages(
          (prevMessages) => [
            ...prevMessages,
            message,
          ]
        );
      }
    };

    socket.on(
      "message:receive",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "message:receive",
        handleReceiveMessage
      );
    };
  }, [
    socket,
    conversation,
  ]);

  // =========================
  // Message Sent
  // =========================

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleMessageSent = (
      message
    ) => {
      console.log(
        "Message sent:",
        message
      );

      if (!conversation) {
        return;
      }

      // Check conversation
      if (
        String(message.conversation) ===
        String(conversation._id)
      ) {
        setMessages(
          (prevMessages) => [
            ...prevMessages,
            message,
          ]
        );
      }

      setSending(false);
    };

    socket.on(
      "message:sent",
      handleMessageSent
    );

    return () => {
      socket.off(
        "message:sent",
        handleMessageSent
      );
    };
  }, [
    socket,
    conversation,
  ]);

  // =========================
  // Select User
  // =========================

  const handleSelectUser = async (
    user
  ) => {
    try {
      // Selected user save
      setSelectedUser(user);

      // Old conversation remove
      setConversation(null);

      // Old messages clear
      setMessages([]);

      // Loading start
      setLoading(true);

      // =========================
      // Create/Get Conversation
      // =========================

      const conversationData =
        await createOrGetConversation(
          user._id
        );

      const currentConversation =
        conversationData.conversation;

      // Save conversation
      setConversation(
        currentConversation
      );

      // =========================
      // Get Old Messages
      // =========================

      const messageData =
        await getMessages(
          currentConversation._id
        );

      setMessages(
        messageData.messages || []
      );
    } catch (error) {
      console.error(
        "CHAT LOAD ERROR:",
        error
      );

      setMessages([]);

      setConversation(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Send Message
  // =========================

  const handleSendMessage = (
    text
  ) => {
    // Socket check
    if (!socket) {
      console.log(
        "Socket not available"
      );

      return;
    }

    // Connection check
    if (!connected) {
      console.log(
        "Socket is not connected"
      );

      return;
    }

    // Conversation check
    if (!conversation) {
      return;
    }

    // Selected user check
    if (!selectedUser) {
      return;
    }

    // Text check
    if (!text.trim()) {
      return;
    }

    // =========================
    // Sender ID
    // =========================

    const senderId =
      user?._id || user?.id;

    // =========================
    // Receiver ID
    // =========================

    const receiverId =
      selectedUser?._id ||
      selectedUser?.id;

    // =========================
    // Sending State
    // =========================

    setSending(true);

    // =========================
    // Send Through Socket.IO
    // =========================

    socket.emit(
      "message:send",
      {
        conversationId:
          conversation._id,

        senderId,

        receiverId,

        text: text.trim(),
      }
    );
  };

  // =========================
  // JSX
  // =========================

  return (
    <div className="h-screen bg-[#08090C] text-white flex overflow-hidden">
      {/* =========================
          Sidebar
      ========================= */}

      <Sidebar
        onSelectUser={
          handleSelectUser
        }
        selectedUser={
          selectedUser
        }
      />

      {/* =========================
          Main Chat Area
      ========================= */}

      <main className="flex-1 flex flex-col min-w-0">
        {selectedUser ? (
          <>
            {/* =========================
                Chat Header
            ========================= */}

            <ChatHeader
              user={selectedUser}
            />

            {/* =========================
                Messages Area
            ========================= */}

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                // =========================
                // Loading
                // =========================

                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400">
                    Loading messages...
                  </p>
                </div>
              ) : messages.length ===
                0 ? (
                // =========================
                // No Messages
                // =========================

                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle
                      size={50}
                      className="mx-auto mb-4 text-purple-400"
                    />

                    <h2 className="text-lg font-semibold">
                      No messages yet
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Start a
                      conversation
                      with{" "}
                      {
                        selectedUser.name
                      }
                    </p>
                  </div>
                </div>
              ) : (
                // =========================
                // Messages
                // =========================

                <div className="max-w-4xl mx-auto space-y-3">
                  {messages.map(
                    (message) => (
                      <MessageBubble
                        key={
                          message._id
                        }
                        message={
                          message
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {/* =========================
                Message Input
            ========================= */}

            <MessageInput
              onSend={
                handleSendMessage
              }
              disabled={
                sending ||
                !connected
              }
            />
          </>
        ) : (
          // =========================
          // No User Selected
          // =========================

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle
                size={64}
                className="mx-auto mb-5 text-purple-400"
              />

              <h1 className="text-2xl font-semibold">
                Welcome to Chatly
              </h1>

              <p className="text-gray-500 mt-2">
                Select a user to
                start chatting
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;