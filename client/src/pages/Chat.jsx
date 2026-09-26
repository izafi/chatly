import { useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";

const messages = [
  {
    id: 1,
    text: "Hey bro! How are you?",
    time: "2:30 PM",
    own: false,
  },
  {
    id: 2,
    text: "I'm good bro! What about you?",
    time: "2:31 PM",
    own: true,
  },
  {
    id: 3,
    text: "I'm doing great. What are you working on?",
    time: "2:32 PM",
    own: false,
  },
  {
    id: 4,
    text: "My new real-time chat application 😄",
    time: "2:33 PM",
    own: true,
  },
];

function Chat() {
  const [selectedUser, setSelectedUser] = useState({
    id: 1,
    name: "Ahmed",
    online: true,
  });

  const [showChat, setShowChat] = useState(false);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowChat(true);
  };

  return (
    <main className="h-screen bg-[#08090C] flex overflow-hidden">

      {/* Sidebar */}
      <div
        className={`${
          showChat ? "hidden md:block" : "block"
        } h-full`}
      >
        <Sidebar onSelectUser={handleSelectUser} />
      </div>

      {/* Chat */}
      <section
        className={`flex-1 h-full ${
          showChat ? "flex" : "hidden md:flex"
        } flex-col`}
      >

        <ChatHeader
          user={selectedUser}
          onBack={() => setShowChat(false)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          <div className="max-w-4xl mx-auto">

            <div className="text-center mb-6">
              <span className="text-xs text-gray-500 bg-[#0F1117] px-3 py-1.5 rounded-full">
                Today
              </span>
            </div>

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                own={message.own}
              />
            ))}

          </div>

        </div>

        <MessageInput />

      </section>

    </main>
  );
}

export default Chat;