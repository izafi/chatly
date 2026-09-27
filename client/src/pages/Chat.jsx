import {
  useEffect,
  useState,
} from "react";

import {
  Menu,
  MessageCircle,
} from "lucide-react";

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
import { useSocket } from "../context/SocketContext";

const Chat = () => {
  const { user } = useAuth();

  const {
    socket,
    connected,
  } = useSocket();

  // ==========================================
  // STATE
  // ==========================================

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

  const [
    isTyping,
    setIsTyping,
  ] = useState(false);

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  // ==========================================
  // USER IDS
  // ==========================================

  const currentUserId =
    user?._id || user?.id;

  const selectedUserId =
    selectedUser?._id ||
    selectedUser?.id;

  // ==========================================
  // RECEIVE MESSAGE
  // ==========================================

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleReceiveMessage = (
      message
    ) => {
      console.log(
        "📩 Message received:",
        message
      );

      if (!conversation) {
        return;
      }

      if (
        String(message.conversation) !==
        String(conversation._id)
      ) {
        return;
      }

      setMessages((previous) => {
        // Duplicate message avoid
        const alreadyExists =
          previous.some(
            (item) =>
              String(item._id) ===
              String(message._id)
          );

        if (alreadyExists) {
          return previous;
        }

        return [
          ...previous,
          message,
        ];
      });
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

  // ==========================================
  // MESSAGE SENT
  // ==========================================

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleMessageSent = (
      message
    ) => {
      console.log(
        "📤 Message sent:",
        message
      );

      if (conversation) {
        if (
          String(message.conversation) ===
          String(conversation._id)
        ) {
          setMessages((previous) => {
            const alreadyExists =
              previous.some(
                (item) =>
                  String(item._id) ===
                  String(message._id)
              );

            if (alreadyExists) {
              return previous;
            }

            return [
              ...previous,
              message,
            ];
          });
        }
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

  // ==========================================
  // TYPING
  // ==========================================

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleTypingStart = (
      data
    ) => {
      console.log(
        "⌨️ TYPING START RECEIVED:",
        data
      );

      if (!conversation) {
        return;
      }

      if (
        String(data.conversationId) !==
        String(conversation._id)
      ) {
        return;
      }

      if (
        String(data.senderId) !==
        String(selectedUserId)
      ) {
        return;
      }

      setIsTyping(true);
    };

    const handleTypingStop = (
      data
    ) => {
      console.log(
        "⌨️ TYPING STOP RECEIVED:",
        data
      );

      if (!conversation) {
        return;
      }

      if (
        String(data.conversationId) !==
        String(conversation._id)
      ) {
        return;
      }

      setIsTyping(false);
    };

    socket.on(
      "typing:start",
      handleTypingStart
    );

    socket.on(
      "typing:stop",
      handleTypingStop
    );

    return () => {
      socket.off(
        "typing:start",
        handleTypingStart
      );

      socket.off(
        "typing:stop",
        handleTypingStop
      );
    };
  }, [
    socket,
    conversation,
    selectedUserId,
  ]);

  // ==========================================
  // SELECT USER
  // ==========================================

  const handleSelectUser = async (
    selected
  ) => {
    try {
      console.log(
        "👤 Selected user:",
        selected
      );

      // Immediately show selected user
      setSelectedUser(selected);

      // Close mobile sidebar
      setSidebarOpen(false);

      // Reset previous chat
      setConversation(null);
      setMessages([]);
      setIsTyping(false);

      setLoading(true);

      const selectedId =
        selected?._id ||
        selected?.id;

      if (!selectedId) {
        console.error(
          "❌ Selected user ID missing"
        );

        return;
      }

      // Create / get conversation
      const conversationData =
        await createOrGetConversation(
          selectedId
        );

      console.log(
        "💬 Conversation:",
        conversationData
      );

      const currentConversation =
        conversationData.conversation;

      if (!currentConversation) {
        console.error(
          "❌ Conversation not found in response"
        );

        return;
      }

      setConversation(
        currentConversation
      );

      // Get old messages
      const messageData =
        await getMessages(
          currentConversation._id
        );

      console.log(
        "📨 Messages:",
        messageData
      );

      setMessages(
        messageData.messages || []
      );
    } catch (error) {
      console.error(
        "❌ CHAT LOAD ERROR:",
        error
      );

      setConversation(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSendMessage = (
    text
  ) => {
    if (!socket) {
      return;
    }

    if (!connected) {
      return;
    }

    if (!conversation) {
      return;
    }

    if (!selectedUser) {
      return;
    }

    if (!text.trim()) {
      return;
    }

    const receiverId =
      selectedUser?._id ||
      selectedUser?.id;

    setSending(true);

    // Stop typing
    socket.emit(
      "typing:stop",
      {
        conversationId:
          conversation._id,

        senderId:
          currentUserId,

        receiverId,
      }
    );

    setIsTyping(false);

    // Send message
    socket.emit(
      "message:send",
      {
        conversationId:
          conversation._id,

        senderId:
          currentUserId,

        receiverId,

        text: text.trim(),
      }
    );
  };

  // ==========================================
  // TYPING START
  // ==========================================

  const handleTypingStart = () => {
    if (!socket) {
      return;
    }

    if (!connected) {
      return;
    }

    if (!conversation) {
      return;
    }

    if (!selectedUser) {
      return;
    }

    const receiverId =
      selectedUser?._id ||
      selectedUser?.id;

    console.log(
      "⌨️ Sending typing:start"
    );

    socket.emit(
      "typing:start",
      {
        conversationId:
          conversation._id,

        senderId:
          currentUserId,

        receiverId,
      }
    );
  };

  // ==========================================
  // TYPING STOP
  // ==========================================

  const handleTypingStop = () => {
    if (!socket) {
      return;
    }

    if (!connected) {
      return;
    }

    if (!conversation) {
      return;
    }

    if (!selectedUser) {
      return;
    }

    const receiverId =
      selectedUser?._id ||
      selectedUser?.id;

    console.log(
      "⌨️ Sending typing:stop"
    );

    socket.emit(
      "typing:stop",
      {
        conversationId:
          conversation._id,

        senderId:
          currentUserId,

        receiverId,
      }
    );
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="
        flex
        h-[100dvh]
        w-full
        overflow-hidden
        bg-[#08090C]
        text-white
      "
    >
      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}

      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="
            fixed
            inset-0
            z-40
            bg-black/70
            md:hidden
          "
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

     <aside
  className={`
    fixed
    inset-y-0
    left-0
    z-50
    w-[85vw]
    max-w-[320px]
    transform
    transition-transform
    duration-300
    md:relative
    md:z-10
    md:flex
    md:w-[300px]
    md:max-w-none
    md:translate-x-0
    ${
      sidebarOpen
        ? "translate-x-0"
        : "-translate-x-full"
    }
  `}
>
  <Sidebar
    onSelectUser={handleSelectUser}
    selectedUser={selectedUser}
    onClose={() =>
      setSidebarOpen(false)
    }
  />
</aside>

      {/* ======================================
          MAIN CHAT AREA
      ====================================== */}

      <main
        className="
          flex
          min-w-0
          flex-1
          flex-col
          overflow-hidden
        "
      >
        {/* MOBILE TOP BAR */}

        <div
          className="
            flex
            h-14
            shrink-0
            items-center
            border-b
            border-white/10
            bg-[#0C0D12]
            px-3
            md:hidden
          "
        >
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              hover:bg-white/5
            "
          >
            <Menu size={22} />
          </button>

          <div className="ml-2">
            <p className="text-sm font-semibold">
              Chatly
            </p>

            <p
              className={`
                text-[10px]
                ${
                  connected
                    ? "text-green-400"
                    : "text-red-400"
                }
              `}
            >
              {connected
                ? "Connected"
                : "Disconnected"}
            </p>
          </div>
        </div>

        {/* ==================================
            SELECTED USER CHAT
        ================================== */}

        {selectedUser ? (
          <div
            className="
              flex
              min-h-0
              flex-1
              flex-col
            "
          >
            {/* CHAT HEADER */}

            <ChatHeader
              user={selectedUser}
            />

            {/* MESSAGES */}

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                px-3
                py-4
                sm:px-4
              "
            >
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-400">
                    Loading messages...
                  </p>
                </div>
              ) : messages.length ===
                0 ? (
                <div className="flex h-full items-center justify-center px-5">
                  <div className="text-center">
                    <MessageCircle
                      size={50}
                      className="mx-auto mb-4 text-purple-400"
                    />

                    <h2 className="text-base font-semibold sm:text-lg">
                      No messages yet
                    </h2>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      Start a conversation
                      with{" "}
                      {selectedUser.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="
                    mx-auto
                    flex
                    w-full
                    max-w-4xl
                    flex-col
                    gap-3
                  "
                >
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

            {/* TYPING INDICATOR */}

            <div
              className="
                flex
                h-6
                shrink-0
                items-center
                px-4
              "
            >
              {isTyping && (
                <p className="animate-pulse text-xs text-purple-400">
                  {selectedUser.name}{" "}
                  is typing...
                </p>
              )}
            </div>

            {/* MESSAGE INPUT */}

            <MessageInput
              onSend={
                handleSendMessage
              }
              onTypingStart={
                handleTypingStart
              }
              onTypingStop={
                handleTypingStop
              }
              disabled={
                !connected ||
                sending
              }
            />
          </div>
        ) : (
          /* ==================================
             NO USER SELECTED
          ================================== */

          <div
            className="
              flex
              min-h-0
              flex-1
              items-center
              justify-center
              px-5
            "
          >
            <div className="text-center">
              <MessageCircle
                size={55}
                className="mx-auto mb-5 text-purple-400"
              />

              <h1 className="text-xl font-semibold sm:text-2xl">
                Welcome to Chatly
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Select a user to start
                chatting
              </p>

              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="
                  mt-5
                  rounded-xl
                  bg-purple-600
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  transition
                  hover:bg-purple-500
                  md:hidden
                "
              >
                Select User
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;