import {
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";

function ChatHeader({ user, onBack }) {
  return (
    <header className="h-[80px] px-4 md:px-6 border-b border-white/10 flex items-center justify-between bg-[#0F1117]">

      <div className="flex items-center gap-3">

        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-white/5 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="relative">

          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center font-semibold">
            {user.name.charAt(0)}
          </div>

          {user.online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0F1117] rounded-full" />
          )}

        </div>

        <div>

          <h2 className="font-semibold">
            {user.name}
          </h2>

          <p className="text-xs text-green-400">
            {user.online ? "Online" : "Offline"}
          </p>

        </div>

      </div>

      <div className="flex items-center gap-1">

        <button className="p-2.5 rounded-lg hover:bg-white/5">
          <Phone size={19} />
        </button>

        <button className="p-2.5 rounded-lg hover:bg-white/5">
          <Video size={20} />
        </button>

        <button className="p-2.5 rounded-lg hover:bg-white/5">
          <MoreVertical size={20} />
        </button>

      </div>

    </header>
  );
}

export default ChatHeader;