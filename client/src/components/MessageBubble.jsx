import { useAuth } from "../context/AuthContext";

const MessageBubble = ({
  message,
}) => {
  const { user } =
    useAuth();

  const currentUserId =
    String(
      user?._id ||
        user?.id ||
        ""
    );

  const senderId =
    String(
      message?.sender?._id ||
        message?.sender?.id ||
        message?.sender ||
        ""
    );

  const isOwnMessage =
    currentUserId ===
    senderId;

  return (
    <div
      className={`
        flex
        w-full
        ${
          isOwnMessage
            ? "justify-end"
            : "justify-start"
        }
      `}
    >
      <div
        className={`
          max-w-[85%]
          px-3
          py-2.5
          sm:max-w-[70%]
          sm:px-4
          ${
            isOwnMessage
              ? "rounded-2xl rounded-br-md bg-purple-600 text-white"
              : "rounded-2xl rounded-bl-md border border-white/5 bg-[#1A1B22] text-white"
          }
        `}
      >
        <p className="break-words text-sm">
          {message.text}
        </p>

        <p
          className={`
            mt-1
            text-[10px]
            ${
              isOwnMessage
                ? "text-purple-200"
                : "text-gray-500"
            }
          `}
        >
          {new Date(
            message.createdAt
          ).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;