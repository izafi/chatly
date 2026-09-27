import {
  Phone,
  Video,
  MoreVertical,
} from "lucide-react";

import { useSocket } from "../context/SocketContext";

const ChatHeader = ({
  user,
}) => {
  const {
    onlineUsers,
  } = useSocket();

  const userId =
    user?._id || user?.id;

  const isOnline =
    onlineUsers.some(
      (onlineUserId) =>
        String(onlineUserId) ===
        String(userId)
    );

  return (
    <header className="h-16 px-5 border-b border-white/10 bg-[#0C0D12] flex items-center justify-between">
      {/* =========================
          User Info
      ========================= */}

      <div className="flex items-center gap-3">
        {/* Avatar */}

        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-semibold">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          {/* Online Dot */}

          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0C0D12] rounded-full" />
          )}
        </div>

        {/* Name + Status */}

        <div>
          <h2 className="font-semibold text-sm">
            {user?.name}
          </h2>

          <p
            className={`text-xs ${
              isOnline
                ? "text-green-400"
                : "text-gray-500"
            }`}
          >
            {isOnline
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      {/* =========================
          Actions
      ========================= */}

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center transition">
          <Phone size={18} />
        </button>

        <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center transition">
          <Video size={18} />
        </button>

        <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center transition">
          <MoreVertical size={18} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;