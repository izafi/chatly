import { useEffect, useState } from "react";
import { Search, User } from "lucide-react";

import { getUsers, searchUsers } from "../services/userService";

const Sidebar = ({ onSelectUser, selectedUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Get all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();

        setUsers(data.users);
      } catch (error) {
        console.error(
          "Failed to fetch users:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  // Search users
  useEffect(() => {
    const searchUser = async () => {
      if (!search.trim()) {
        try {
          const data = await getUsers();

          setUsers(data.users);
        } catch (error) {
          console.error(error);
        }

        return;
      }

      try {
        const data = await searchUsers(search);

        setUsers(data.users);
      } catch (error) {
        console.error(error);
      }
    };


    const timer = setTimeout(() => {
      searchUser();
    }, 400);

    return () => clearTimeout(timer);

  }, [search]);


  return (
    <aside className="w-full md:w-80 h-full bg-[#0F1117] border-r border-white/10 flex flex-col">

      {/* Header */}

      <div className="p-5 border-b border-white/10">

        <h1 className="text-2xl font-bold text-white">
          Chatly
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Messages
        </p>

      </div>


      {/* Search */}

      <div className="p-4">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search users..."
            className="w-full bg-[#08090C] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500"
          />

        </div>

      </div>


      {/* Users */}

      <div className="flex-1 overflow-y-auto px-3">

        {loading ? (
          <p className="text-center text-gray-500 py-5">
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 py-5">
            No users found
          </p>
        ) : (

          users.map((user) => (

            <button
              key={user._id}
              onClick={() =>
                onSelectUser(user)
              }
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 text-left transition ${
                selectedUser?._id === user._id
                  ? "bg-purple-600/20"
                  : "hover:bg-white/5"
              }`}
            >

              {/* Avatar */}

              <div className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold shrink-0">

                {user.name
                  ?.charAt(0)
                  ?.toUpperCase() || (
                  <User size={20} />
                )}

              </div>


              {/* User Info */}

              <div className="min-w-0">

                <h3 className="text-white font-medium truncate">
                  {user.name}
                </h3>

                <p className="text-sm text-gray-500 truncate">
                  {user.email}
                </p>

              </div>

            </button>

          ))

        )}

      </div>

    </aside>
  );
};

export default Sidebar;