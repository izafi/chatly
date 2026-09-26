import { useState } from "react";
import { MessageCircle } from "lucide-react";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";

import { createOrGetConversation } from "../services/conversationService";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectUser = async (user) => {
    try {
      setSelectedUser(user);
      setConversation(null);
      setLoading(true);

      const data = await createOrGetConversation(user._id);

      setConversation(data.conversation);
    } catch (error) {
      console.error(
        "CONVERSATION ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#08090C] text-white flex overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        onSelectUser={handleSelectUser}
        selectedUser={selectedUser}
      />

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">

        {selectedUser ? (
          <>
            {/* Chat Header */}
            <ChatHeader user={selectedUser} />

            {/* Chat Area */}
            <div className="flex-1 flex items-center justify-center">

              {loading ? (
                <p className="text-gray-400">
                  Opening conversation...
                </p>
              ) : conversation ? (
                <div className="text-center">

                  <MessageCircle
                    size={48}
                    className="mx-auto mb-4 text-purple-400"
                  />

                  <h2 className="text-xl font-semibold">
                    Conversation Ready
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Start chatting with{" "}
                    {selectedUser.name}
                  </p>

                  <p className="text-xs text-gray-700 mt-4">
                    Conversation ID:
                    <br />
                    {conversation._id}
                  </p>

                </div>
              ) : null}

            </div>
          </>
        ) : (
          /* Welcome Screen */
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