const MessageDate = ({
  date,
}) => {
  const messageDate =
    new Date(date);

  const today =
    new Date();

  const yesterday =
    new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const isToday =
    messageDate.toDateString() ===
    today.toDateString();

  const isYesterday =
    messageDate.toDateString() ===
    yesterday.toDateString();

  let label = "";

  if (isToday) {
    label = "Today";
  } else if (isYesterday) {
    label = "Yesterday";
  } else {
    label =
      messageDate.toLocaleDateString(
        [],
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
  }

  return (
    <div
      className="
        flex
        items-center
        justify-center
        py-3
      "
    >
      <div
        className="
          rounded-full
          border
          border-white/10
          bg-[#15161C]
          px-3
          py-1
          text-[10px]
          font-medium
          text-gray-500
          sm:text-xs
        "
      >
        {label}
      </div>
    </div>
  );
};

export default MessageDate;