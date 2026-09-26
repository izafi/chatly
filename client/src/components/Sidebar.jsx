import {
  Search,
  MoreVertical,
  MessageCircle,
} from "lucide-react";

const users = [
  {
    id: 1,
    name: "Ahmed",
    message: "Hey bro, how are you?",
    time: "2:35 PM",
    online: true,
  },
  {
    id: 2,
    name: "Ali",
    message: "Where are you?",
    time: "2:20 PM",
    online: false,
  },
  {
    id: 3,
    name: "Hamza",
    message: "See you soon!",
    time: "1:50 PM",
    online: true,
  },
];

function Sidebar({ onSelectUser }) {
  return (
    <aside className="w-full md:w-[350px] h-full bg-[#0F1117] border-r border-white/10 flex flex-col">

      {/* Header */}
      <div className="p-5 border-b border-white/10">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center">
              <MessageCircle size={20} />
            </div>

            <h1 className="text-xl font-bold">
              Chatly
            </h1>

          </div>

          <button className="p-2 rounded-lg hover:bg-white/5">
            <MoreVertical size={20} />
          </button>

        </div>

        {/* Search */}
        <div className="relative mt-5">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            placeholder="Search conversations..."
            className="w-full bg-[#08090C] border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-purple-500"
          />

        </div>

      </div>

      {/* Chats */}
      <div className="flex-1 overflow-y-auto">

        {users.map((user) => (

          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition text-left"
          >

            {/* Avatar */}
            <div className="relative">

              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center font-semibold">
                {user.name.charAt(0)}
              </div>

              {user.online && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0F1117] rounded-full" />
              )}

            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">

              <div className="flex justify-between">

                <h3 className="font-medium">
                  {user.name}
                </h3>

                <span className="text-xs text-gray-500">
                  {user.time}
                </span>

              </div>

              <p className="text-sm text-gray-500 truncate mt-1">
                {user.message}
              </p>

            </div>

          </button>

        ))}

      </div>

    </aside>
  );
}

export default Sidebar;