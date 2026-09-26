import api from "./api";

export const createOrGetConversation = async (
  userId
) => {
  const response = await api.post(
    "/conversations",
    {
      userId,
    }
  );

  return response.data;
};