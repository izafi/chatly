import {
  Paperclip,
  Smile,
  Send,
} from "lucide-react";

function MessageInput() {
  return (
    <div className="p-4 border-t border-white/10 bg-[#0F1117]">

      <div className="flex items-center gap-2">

        <button className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">

          <input
            type="text"
            placeholder="Type a message..."
            className="w-full bg-[#08090C] border border-white/10 rounded-xl py-3.5 pl-4 pr-12 outline-none focus:border-purple-500"
          />

          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white">
            <Smile size={20} />
          </button>

        </div>

        <button className="p-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 transition">
          <Send size={19} />
        </button>

      </div>

    </div>
  );
}

export default MessageInput;