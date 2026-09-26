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
  const { user } = useAuth();

  const {
    socket,
    connected,
  } = useSocket();

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

      // Only add message if it
      // belongs to current conversation
      if (
        conversation &&
        message.conversation ===
          conversation._id
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
  // Message Sent Confirmation
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

      // Add message to sender UI
      if (
        conversation &&
        message.conversation ===
          conversation._id
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
      setSelectedUser(user);

      setConversation(null);

      setMessages([]);

      setLoading(true);

      // Create/Get Conversation
      const conversationData =
        await createOrGetConversation(
          user._id
        );

      const currentConversation =
        conversationData.conversation;

      setConversation(
        currentConversation
      );

      // Get old messages
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
    if (
      !socket ||
      !connected ||
      !conversation ||
      !selectedUser ||
      !text.trim()
    ) {
      return;
    }

    setSending(true);

    // Current user ID
    const senderId =
      user._id || user.id;

    // Receiver ID
    const receiverId =
      selectedUser._id ||
      selectedUser.id;

    // Send through Socket.IO
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
          Main Chat
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
                Messages
            ========================= */}

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400">
                    Loading messages...
                  </p>
                </div>
              ) : messages.length ===
                0 ? (
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