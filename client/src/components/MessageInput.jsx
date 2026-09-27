import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Send } from "lucide-react";

const MessageInput = ({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled = false,
}) => {
  const [
    text,
    setText,
  ] = useState("");

  const typingTimer =
    useRef(null);

  const typingStarted =
    useRef(false);

  // ======================================
  // INPUT CHANGE
  // ======================================

  const handleChange = (e) => {
    const value =
      e.target.value;

    setText(value);

    // Empty input
    if (!value.trim()) {
      if (typingTimer.current) {
        clearTimeout(
          typingTimer.current
        );
      }

      if (
        typingStarted.current
      ) {
        onTypingStop?.();

        typingStarted.current =
          false;
      }

      return;
    }

    // Start typing only once
    if (
      !typingStarted.current
    ) {
      onTypingStart?.();

      typingStarted.current =
        true;
    }

    // Reset timer
    if (typingTimer.current) {
      clearTimeout(
        typingTimer.current
      );
    }

    // Stop after 1 second
    typingTimer.current =
      setTimeout(() => {
        onTypingStop?.();

        typingStarted.current =
          false;
      }, 1000);
  };

  // ======================================
  // SEND
  // ======================================

  const handleSubmit = (e) => {
    e.preventDefault();

    const message =
      text.trim();

    if (!message || disabled) {
      return;
    }

    if (typingTimer.current) {
      clearTimeout(
        typingTimer.current
      );
    }

    if (
      typingStarted.current
    ) {
      onTypingStop?.();

      typingStarted.current =
        false;
    }

    onSend(message);

    setText("");
  };

  // ======================================
  // CLEANUP
  // ======================================

  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(
          typingTimer.current
        );
      }
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full shrink-0 border-t border-white/10 bg-[#0C0D12] p-3 sm:p-4"
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-2 sm:gap-3">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Type a message..."
          disabled={disabled}
          className="
            min-w-0
            flex-1
            rounded-xl
            border
            border-white/10
            bg-[#15161C]
            px-3
            py-3
            text-sm
            text-white
            outline-none
            placeholder:text-gray-500
            focus:border-purple-500
            sm:px-4
          "
        />

        <button
          type="submit"
          disabled={
            disabled ||
            !text.trim()
          }
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-purple-600
            transition
            hover:bg-purple-500
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:h-12
            sm:w-12
          "
        >
          <Send
            size={18}
          />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;