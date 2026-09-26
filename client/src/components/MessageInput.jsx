import { useState } from "react";
import { Send } from "lucide-react";

const MessageInput = ({
  onSend,
  disabled = false,
}) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim() || disabled) {
      return;
    }

    onSend(text.trim());

    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-white/10 bg-[#0C0D12]"
    >
      <div className="max-w-4xl mx-auto flex items-center gap-3">

        <input
          type="text"
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 bg-[#15161C] border border-white/10 rounded-xl px-4 py-3 outline-none text-white placeholder-gray-500 focus:border-purple-500"
        />

        <button
          type="submit"
          disabled={
            disabled || !text.trim()
          }
          className="w-12 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
        >
          <Send size={20} />
        </button>

      </div>
    </form>
  );
};

export default MessageInput;