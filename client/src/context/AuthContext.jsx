import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";


const AuthContext =
  createContext();


export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // ===================================================
  // GET CURRENT USER
  // ===================================================

  const getCurrentUser =
    async () => {
      try {
        const response =
          await api.get(
            "/auth/me"
          );

        setUser(
          response.data.user
        );
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };


  // ===================================================
  // REGISTER
  // ===================================================

  const register = async (
    name,
    username,
    email,
    password
  ) => {
    const response =
      await api.post(
        "/auth/register",
        {
          name,
          username,
          email,
          password,
        }
      );

    setUser(
      response.data.user
    );

    return response.data;
  };


  // ===================================================
  // LOGIN
  // ===================================================

  const login = async (
    email,
    password
  ) => {
    const response =
      await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

    setUser(
      response.data.user
    );

    return response.data;
  };


  // ===================================================
  // LOGOUT
  // ===================================================

  const logout =
    async () => {
      try {
        await api.post(
          "/auth/logout"
        );

        setUser(null);
      } catch (error) {
        console.error(
          "LOGOUT ERROR:",
          error
        );
      }
    };


  // ===================================================
  // UPDATE USER
  // ===================================================

  const updateUser = (
    updatedUser
  ) => {
    setUser(
      updatedUser
    );
  };


  useEffect(() => {
    getCurrentUser();
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () =>
  useContext(
    AuthContext
  );