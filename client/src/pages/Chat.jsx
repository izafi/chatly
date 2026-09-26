import { useState } from "react";
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
  sendMessage,
} from "../services/messageService";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const [conversation, setConversation] = useState(null);

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [sending, setSending] = useState(false);


  // ========================================
  // SELECT USER
  // ========================================

  const handleSelectUser = async (user) => {
    try {
      // Set selected user
      setSelectedUser(user);

      // Clear previous conversation
      setConversation(null);

      // Clear previous messages
      setMessages([]);

      // Show loading
      setLoading(true);


      // ========================================
      // CREATE / GET CONVERSATION
      // ========================================

      const conversationData =
        await createOrGetConversation(user._id);

      const currentConversation =
        conversationData.conversation;

      setConversation(currentConversation);


      // ========================================
      // GET OLD MESSAGES
      // ========================================

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


  // ========================================
  // SEND MESSAGE
  // ========================================

  const handleSendMessage = async (text) => {
    if (
      !conversation ||
      !text.trim()
    ) {
      return;
    }

    try {
      setSending(true);


      // Send message to backend
      const data = await sendMessage(
        conversation._id,
        text.trim()
      );


      // Add new message to current UI
      setMessages((prevMessages) => [
        ...prevMessages,
        data.message,
      ]);

    } catch (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error
      );

    } finally {
      setSending(false);
    }
  };


  return (
    <div className="h-screen bg-[#08090C] text-white flex overflow-hidden">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <Sidebar
        onSelectUser={handleSelectUser}
        selectedUser={selectedUser}
      />


      {/* ========================================
          MAIN CHAT
      ======================================== */}

      <main className="flex-1 flex flex-col min-w-0">

        {selectedUser ? (
          <>
            {/* ========================================
                CHAT HEADER
            ======================================== */}

            <ChatHeader
              user={selectedUser}
            />


            {/* ========================================
                MESSAGES AREA
            ======================================== */}

            <div className="flex-1 overflow-y-auto p-4">

              {loading ? (

                // Loading
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400">
                    Loading messages...
                  </p>
                </div>

              ) : messages.length === 0 ? (

                // No messages
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
                      Start a conversation with{" "}
                      {selectedUser.name}
                    </p>

                  </div>
                </div>

              ) : (

                // Messages
                <div className="max-w-4xl mx-auto space-y-3">

                  {messages.map((message) => (
                    <MessageBubble
                      key={message._id}
                      message={message}
                    />
                  ))}

                </div>

              )}

            </div>


            {/* ========================================
                MESSAGE INPUT
            ======================================== */}

            <MessageInput
              onSend={handleSendMessage}
              disabled={sending}
            />

          </>
        ) : (

          /* ========================================
             WELCOME SCREEN
          ======================================== */

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
                Select a user to start chatting
              </p>

            </div>

          </div>

        )}

      </main>
    </div>
  );
};

export default Chat;