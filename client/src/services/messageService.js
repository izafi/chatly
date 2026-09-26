import api from "./api";

// Get messages
export const getMessages = async (conversationId) => {
  const response = await api.get(
    `/messages/${conversationId}`
  );

  return response.data;
};

// Send message
export const sendMessage = async (
  conversationId,
  text
) => {
  const response = await api.post(
    "/messages",
    {
      conversationId,
      text,
    }
  );

  return response.data;
};