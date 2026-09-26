function MessageBubble({ message, own }) {
  return (
    <div
      className={`flex mb-3 ${
        own ? "justify-end" : "justify-start"
      }`}
    >

      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
          own
            ? "bg-gradient-to-r from-purple-600 to-purple-500 rounded-br-md"
            : "bg-[#171A22] border border-white/5 rounded-bl-md"
        }`}
      >

        <p className="text-sm leading-relaxed">
          {message.text}
        </p>

        <div
          className={`text-[10px] mt-1 ${
            own ? "text-purple-200" : "text-gray-500"
          }`}
        >
          {message.time}
        </div>

      </div>

    </div>
  );
}

export default MessageBubble;