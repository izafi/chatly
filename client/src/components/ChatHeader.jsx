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
    <header
      className="
        flex
        h-16
        shrink-0
        items-center
        justify-between
        border-b
        border-white/10
        bg-[#0C0D12]
        px-3
        sm:px-5
      "
    >
      {/* LEFT */}

      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-purple-600
              text-sm
              font-semibold
              sm:h-10
              sm:w-10
            "
          >
            {user?.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          {isOnline && (
            <span
              className="
                absolute
                bottom-0
                right-0
                h-2.5
                w-2.5
                rounded-full
                border-2
                border-[#0C0D12]
                bg-green-500
              "
            />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">
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

      {/* RIGHT */}

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            hover:bg-white/5
          "
        >
          <Phone size={17} />
        </button>

        <button
          type="button"
          className="
            hidden
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            hover:bg-white/5
            sm:flex
          "
        >
          <Video size={18} />
        </button>

        <button
          type="button"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            hover:bg-white/5
          "
        >
          <MoreVertical
            size={18}
          />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;