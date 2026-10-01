import {
  useEffect,
  useState,
} from "react";

import {
  Search,
  MessageCircle,
  X,
  UserPlus,
  Check,
  UserRound,
} from "lucide-react";

import api from "../services/api";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useSocket,
} from "../context/SocketContext";

import ProfilePanel from "./ProfilePanel";


const Sidebar = ({
  onSelectUser,
  selectedUser,
  onClose,
}) => {
  const {
    user,
  } = useAuth();

  const {
    onlineUsers,
  } = useSocket();


  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    friends,
    setFriends,
  ] = useState([]);

  const [
    requests,
    setRequests,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);


  // ===================================================
  // GET FRIENDS
  // ===================================================

  const fetchFriends =
    async () => {
      try {
        const response =
          await api.get(
            "/friends"
          );

        setFriends(
          response.data.friends ||
            []
        );
      } catch (error) {
        console.error(
          "GET FRIENDS ERROR:",
          error
        );
      }
    };


  // ===================================================
  // GET REQUESTS
  // ===================================================

  const fetchRequests =
    async () => {
      try {
        const response =
          await api.get(
            "/friends/requests"
          );

        setRequests(
          response.data.requests ||
            []
        );
      } catch (error) {
        console.error(
          "GET REQUESTS ERROR:",
          error
        );
      }
    };


  // ===================================================
  // SEARCH
  // ===================================================

  const searchUsers =
    async (
      searchValue
    ) => {
      if (
        !searchValue.trim()
      ) {
        setUsers([]);

        return;
      }

      try {
        setLoading(true);

        const response =
          await api.get(
            "/users/search",
            {
              params: {
                query:
                  searchValue.trim(),
              },
            }
          );

        setUsers(
          response.data.users ||
            []
        );
      } catch (error) {
        console.error(
          "SEARCH ERROR:",
          error
        );

        setUsers([]);
      } finally {
        setLoading(false);
      }
    };


  // ===================================================
  // INITIAL
  // ===================================================

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);


  // ===================================================
  // SEARCH DEBOUNCE
  // ===================================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        searchUsers(search);
      }, 400);

    return () =>
      clearTimeout(timer);
  }, [search]);


  // ===================================================
  // SEND FRIEND REQUEST
  // ===================================================

  const handleAddFriend =
    async (
      userId
    ) => {
      try {
        await api.post(
          `/friends/request/${userId}`
        );

        // Remove from search
        setUsers(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  item._id
                ) !==
                String(
                  userId
                )
            )
        );
      } catch (error) {
        alert(
          error?.response?.data
            ?.message ||
            "Could not send request"
        );
      }
    };


  // ===================================================
  // ACCEPT
  // ===================================================

  const handleAccept =
    async (
      requestId
    ) => {
      try {
        await api.put(
          `/friends/request/${requestId}/accept`
        );

        await fetchFriends();
        await fetchRequests();
      } catch (error) {
        alert(
          error?.response?.data
            ?.message ||
            "Could not accept request"
        );
      }
    };


  // ===================================================
  // REJECT
  // ===================================================

  const handleReject =
    async (
      requestId
    ) => {
      try {
        await api.put(
          `/friends/request/${requestId}/reject`
        );

        await fetchRequests();
      } catch (error) {
        alert(
          error?.response?.data
            ?.message ||
            "Could not reject request"
        );
      }
    };


  // ===================================================
  // SELECT FRIEND
  // ===================================================

  const handleUserClick =
    (selected) => {
      onSelectUser(
        selected
      );

      onClose?.();
    };


  // ===================================================
  // AVATAR
  // ===================================================

  const Avatar = ({
    person,
    size = "h-10 w-10",
  }) => {
    const personId =
      person?._id ||
      person?.id;

    const isOnline =
      onlineUsers.some(
        (onlineId) =>
          String(
            onlineId
          ) ===
          String(
            personId
          )
      );

    return (
      <div
        className="
          relative
          shrink-0
        "
      >
        <div
          className={`
            ${size}
            flex
            items-center
            justify-center
            overflow-hidden
            rounded-full
            bg-purple-600
            font-semibold
          `}
        >
          {person?.avatar ? (
            <img
              src={person.avatar}
              alt={person.name}
              className="
                h-full
                w-full
                object-cover
              "
            />
          ) : (
            person?.name
              ?.charAt(0)
              ?.toUpperCase()
          )}
        </div>

        {isOnline && (
          <span
            className="
              absolute
              bottom-0
              right-0
              h-2.5
              w-2.5
              rounded-full
              border-2
              border-[#0C0D12]
              bg-green-500
            "
          />
        )}
      </div>
    );
  };


  return (
    <>
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

        {/* =========================================
            HEADER
        ========================================= */}

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
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
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
              <h1
                className="
                  text-sm
                  font-semibold
                "
              >
                Chatly
              </h1>

              <p
                className="
                  text-[10px]
                  text-gray-500
                "
              >
                Real-time chat
              </p>
            </div>
          </div>


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


        {/* =========================================
            MY PROFILE
        ========================================= */}

        <button
          type="button"
          onClick={() =>
            setProfileOpen(true)
          }
          className="
            border-b
            border-white/10
            p-4
            text-left
            transition
            hover:bg-white/5
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <Avatar
              person={user}
            />

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {user?.name}
              </p>

              <p
                className="
                  truncate
                  text-xs
                  text-purple-400
                "
              >
                @{user?.username}
              </p>
            </div>

            <UserRound
              size={17}
              className="
                shrink-0
                text-gray-500
              "
            />
          </div>
        </button>


        {/* =========================================
            SEARCH
        ========================================= */}

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
              className="
                shrink-0
                text-gray-500
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search name or @username..."
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


        {/* =========================================
            SEARCH RESULTS
        ========================================= */}

        {search.trim() && (
          <div
            className="
              max-h-56
              overflow-y-auto
              border-b
              border-white/10
              px-2
              pb-3
            "
          >
            <p
              className="
                px-3
                pb-2
                text-xs
                font-medium
                uppercase
                tracking-wider
                text-gray-500
              "
            >
              Search Results
            </p>

            {loading ? (
              <p
                className="
                  px-3
                  py-4
                  text-center
                  text-sm
                  text-gray-500
                "
              >
                Searching...
              </p>
            ) : users.length === 0 ? (
              <p
                className="
                  px-3
                  py-4
                  text-center
                  text-sm
                  text-gray-500
                "
              >
                No users found
              </p>
            ) : (
              <div
                className="
                  space-y-1
                "
              >
                {users.map(
                  (item) => {
                    const alreadyFriend =
                      friends.some(
                        (friend) =>
                          String(
                            friend._id
                          ) ===
                          String(
                            item._id
                          )
                      );

                    return (
                      <div
                        key={
                          item._id
                        }
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          p-3
                          hover:bg-white/5
                        "
                      >
                        <Avatar
                          person={
                            item
                          }
                        />

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <p
                            className="
                              truncate
                              text-sm
                              font-medium
                            "
                          >
                            {item.name}
                          </p>

                          <p
                            className="
                              truncate
                              text-xs
                              text-purple-400
                            "
                          >
                            @{item.username}
                          </p>
                        </div>

                        {alreadyFriend ? (
                          <span
                            className="
                              text-xs
                              text-green-400
                            "
                          >
                            Friend
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleAddFriend(
                                item._id
                              )
                            }
                            className="
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-purple-600
                              hover:bg-purple-500
                            "
                          >
                            <UserPlus
                              size={16}
                            />
                          </button>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        )}


        {/* =========================================
            FRIEND REQUESTS
        ========================================= */}

        {!search.trim() &&
          requests.length > 0 && (
            <div
              className="
                border-b
                border-white/10
                px-2
                py-3
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-3
                  pb-2
                "
              >
                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-gray-500
                  "
                >
                  Friend Requests
                </p>

                <span
                  className="
                    rounded-full
                    bg-purple-600
                    px-2
                    py-0.5
                    text-[10px]
                    text-white
                  "
                >
                  {requests.length}
                </span>
              </div>

              <div className="space-y-1">
                {requests.map(
                  (request) => (
                    <div
                      key={
                        request._id
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        p-3
                        hover:bg-white/5
                      "
                    >
                      <Avatar
                        person={
                          request.sender
                        }
                      />

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className="
                            truncate
                            text-sm
                            font-medium
                          "
                        >
                          {
                            request
                              .sender
                              ?.name
                          }
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            text-purple-400
                          "
                        >
                          @
                          {
                            request
                              .sender
                              ?.username
                          }
                        </p>
                      </div>

                      <div
                        className="
                          flex
                          gap-1
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleAccept(
                              request._id
                            )
                          }
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-green-600
                            hover:bg-green-500
                          "
                        >
                          <Check
                            size={15}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleReject(
                              request._id
                            )
                          }
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-red-600/80
                            hover:bg-red-500
                          "
                        >
                          <X
                            size={15}
                          />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}


        {/* =========================================
            FRIENDS
        ========================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-2
            pb-3
          "
        >
          <p
            className="
              px-3
              pb-2
              pt-3
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Friends
          </p>

          {friends.length === 0 ? (
            <div
              className="
                px-3
                py-8
                text-center
              "
            >
              <UserPlus
                size={28}
                className="
                  mx-auto
                  mb-3
                  text-gray-700
                "
              />

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                No friends yet
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-700
                "
              >
                Search someone above
                to add them.
              </p>
            </div>
          ) : (
            <div
              className="
                space-y-1
              "
            >
              {friends.map(
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
                      <Avatar
                        person={item}
                      />

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className="
                            truncate
                            text-sm
                            font-medium
                          "
                        >
                          {item.name}
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            text-gray-500
                          "
                        >
                          @{item.username}
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


      {/* PROFILE MODAL */}

      {profileOpen && (
        <ProfilePanel
          onClose={() =>
            setProfileOpen(false)
          }
        />
      )}
    </>
  );
};


export default Sidebar;