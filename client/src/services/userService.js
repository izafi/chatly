import api from "./api";


// Get all users
export const getUsers = async () => {
  const response = await api.get("/users");

  return response.data;
};


// Search users
export const searchUsers = async (query) => {
  const response = await api.get(
    `/users/search?query=${encodeURIComponent(query)}`
  );

  return response.data;
};