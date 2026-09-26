import { useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="h-screen bg-[#08090C] flex">

      {/* Sidebar */}

      <Sidebar
        onSelectUser={setSelectedUser}
        selectedUser={selectedUser}
      />


      {/* Chat Area */}

      <main className="hidden md:flex flex-1 flex-col">

        {selectedUser ? (
          <>
            <ChatHeader user={selectedUser} />

            <div className="flex-1">
              {/* Messages will come here */}
            </div>

            <MessageInput />
          </>
        ) : (

          <div className="flex-1 flex items-center justify-center">

            <div className="text-center">

              <h2 className="text-2xl text-white font-semibold">
                Welcome to Chatly 💬
              </h2>

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