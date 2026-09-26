import { useAuth } from "../context/AuthContext";

const MessageBubble = ({ message }) => {
  const { user } = useAuth();

  const currentUserId = String(
    user?._id || user?.id || ""
  );

  const senderId = String(
    message?.sender?._id ||
    message?.sender?.id ||
    message?.sender ||
    ""
  );

  const isOwnMessage =
    currentUserId === senderId;

  return (
    <div
      className={`flex w-full ${
        isOwnMessage
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
          isOwnMessage
            ? "bg-purple-600 text-white rounded-br-md"
            : "bg-[#1A1B22] text-white border border-white/5 rounded-bl-md"
        }`}
      >
        <p className="text-sm break-words">
          {message.text}
        </p>

        <p
          className={`text-[10px] mt-1 ${
            isOwnMessage
              ? "text-purple-200"
              : "text-gray-500"
          }`}
        >
          {new Date(
            message.createdAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;