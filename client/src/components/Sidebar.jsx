import {
  useEffect,
  useState,
} from "react";

import {
  Search,
  MessageCircle,
  X,
} from "lucide-react";

import api from "../services/api";

import { useAuth } from "../context/AuthContext";

const Sidebar = ({
  onSelectUser,
  selectedUser,
  onClose,
}) => {
  const { user } =
    useAuth();

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  // ======================================
  // GET USERS
  // ======================================

  const fetchUsers = async (
    searchValue = ""
  ) => {
    try {
      setLoading(true);

      let response;

      if (searchValue.trim()) {
        response = await api.get(
          "/users/search",
          {
            params: {
              query:
                searchValue.trim(),
            },
          }
        );
      } else {
        response = await api.get(
          "/users"
        );
      }

      setUsers(
        response.data.users || []
      );
    } catch (error) {
      console.error(
        "GET USERS ERROR:",
        error
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // INITIAL USERS
  // ======================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ======================================
  // SEARCH DEBOUNCE
  // ======================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchUsers(search);
      }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // ======================================
  // SELECT USER
  // ======================================

  const handleUserClick = (
    selected
  ) => {
    onSelectUser(selected);

    onClose?.();
  };

  return (
    <div
      className="
        flex
        h-full
        w-full
        flex-col
        border-r
        border-white/10
        bg-[#0C0D12]
      "
    >
      {/* =================================
          HEADER
      ================================= */}

      <div
        className="
          flex
          h-16
          shrink-0
          items-center
          justify-between
          border-b
          border-white/10
          px-4
        "
      >
        <div className="flex items-center gap-2">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-purple-600
            "
          >
            <MessageCircle
              size={19}
            />
          </div>

          <div>
            <h1 className="text-sm font-semibold">
              Chatly
            </h1>

            <p className="text-[10px] text-gray-500">
              Real-time chat
            </p>
          </div>
        </div>

        {/* Mobile close */}

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            hover:bg-white/5
            md:hidden
          "
        >
          <X size={20} />
        </button>
      </div>

      {/* =================================
          CURRENT USER
      ================================= */}

      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-purple-600
              font-semibold
            "
          >
            {user?.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user?.name}
            </p>

            <p className="text-xs text-green-400">
              Online
            </p>
          </div>
        </div>
      </div>

      {/* =================================
          SEARCH
      ================================= */}

      <div className="p-4">
        <div
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-[#15161C]
            px-3
          "
        >
          <Search
            size={17}
            className="shrink-0 text-gray-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search users..."
            className="
              min-w-0
              flex-1
              bg-transparent
              py-3
              text-sm
              text-white
              outline-none
              placeholder:text-gray-500
            "
          />
        </div>
      </div>

      {/* =================================
          USERS
      ================================= */}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
          Users
        </p>

        {loading ? (
          <div className="px-3 py-5 text-center text-sm text-gray-500">
            Loading users...
          </div>
        ) : users.length ===
          0 ? (
          <div className="px-3 py-5 text-center text-sm text-gray-500">
            No users found
          </div>
        ) : (
          <div className="space-y-1">
            {users.map(
              (item) => {
                const itemId =
                  item._id ||
                  item.id;

                const selectedId =
                  selectedUser?._id ||
                  selectedUser?.id;

                const isSelected =
                  String(
                    itemId
                  ) ===
                  String(
                    selectedId
                  );

                return (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() =>
                      handleUserClick(
                        item
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      p-3
                      text-left
                      transition
                      ${
                        isSelected
                          ? "bg-purple-600/20"
                          : "hover:bg-white/5"
                      }
                    `}
                  >
                    {/* Avatar */}

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#272330]
                        font-semibold
                      "
                    >
                      {item?.name
                        ?.charAt(
                          0
                        )
                        ?.toUpperCase()}
                    </div>

                    {/* Info */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {item.email}
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;