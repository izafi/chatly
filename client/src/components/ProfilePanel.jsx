import {
  useRef,
  useState,
} from "react";

import {
  Camera,
  LogOut,
  X,
  Save,
} from "lucide-react";

import api from "../services/api";

import {
  useAuth,
} from "../context/AuthContext";


const ProfilePanel = ({
  onClose,
}) => {
  const {
    user,
    updateUser,
    logout,
  } = useAuth();


  const [name, setName] =
    useState(
      user?.name || ""
    );

  const [
    username,
    setUsername,
  ] = useState(
    user?.username || ""
  );

  const [bio, setBio] =
    useState(
      user?.bio || ""
    );

  const [avatar, setAvatar] =
    useState(
      user?.avatar || ""
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const fileInputRef =
    useRef(null);


  // ===================================================
  // PROFILE IMAGE
  // ===================================================

  const handleImageChange =
    (e) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          "Please select a valid image."
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Image must be smaller than 5MB."
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        const image =
          new Image();

        image.onload = () => {
          const canvas =
            document.createElement(
              "canvas"
            );

          const maxSize = 500;

          let width =
            image.width;

          let height =
            image.height;

          if (
            width > maxSize ||
            height > maxSize
          ) {
            if (
              width > height
            ) {
              height =
                (height *
                  maxSize) /
                width;

              width =
                maxSize;
            } else {
              width =
                (width *
                  maxSize) /
                height;

              height =
                maxSize;
            }
          }

          canvas.width =
            width;

          canvas.height =
            height;

          const context =
            canvas.getContext(
              "2d"
            );

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );

          const result =
            canvas.toDataURL(
              "image/jpeg",
              0.75
            );

          setAvatar(result);
          setError("");
        };

        image.src =
          reader.result;
      };

      reader.readAsDataURL(
        file
      );
    };


  // ===================================================
  // SAVE PROFILE
  // ===================================================

  const handleSave =
    async () => {
      try {
        setSaving(true);
        setError("");

        const response =
          await api.put(
            "/users/profile",
            {
              name,
              username,
              bio,
              avatar,
            }
          );

        updateUser(
          response.data.user
        );

        onClose?.();
      } catch (error) {
        setError(
          error?.response?.data
            ?.message ||
            "Profile update failed"
        );
      } finally {
        setSaving(false);
      }
    };


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout =
    async () => {
      await logout();
    };


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-end
        justify-center
        bg-black/70
        backdrop-blur-sm
        sm:items-center
        sm:p-4
      "
    >

      <div
        className="
          flex
          max-h-[94vh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-3xl
          border
          border-white/10
          bg-[#0C0D12]
          shadow-2xl
          sm:max-h-[90vh]
          sm:max-w-lg
          sm:rounded-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-white/10
            px-4
            py-4
            sm:px-6
          "
        >
          <div>
            <h2
              className="
                text-base
                font-semibold
                text-white
                sm:text-lg
              "
            >
              My Profile
            </h2>

            <p
              className="
                mt-0.5
                text-[11px]
                text-gray-500
                sm:text-xs
              "
            >
              Manage your Chatly account
            </p>
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
              rounded-full
              bg-white/5
              text-gray-400
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>


        {/* SCROLLABLE CONTENT */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            py-5
            sm:px-6
            sm:py-6
          "
        >

          {/* AVATAR */}

          <div
            className="
              mb-6
              flex
              flex-col
              items-center
            "
          >
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                group
                relative
                h-24
                w-24
                overflow-hidden
                rounded-full
                bg-purple-600
                ring-4
                ring-purple-500/10
                sm:h-28
                sm:w-28
              "
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                <span
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    text-3xl
                    font-bold
                    text-white
                    sm:text-4xl
                  "
                >
                  {name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </span>
              )}

              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  bg-black/55
                  opacity-0
                  transition
                  group-hover:opacity-100
                  group-focus:opacity-100
                "
              >
                <Camera
                  size={24}
                />
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
              className="hidden"
            />

            <p
              className="
                mt-2
                text-[11px]
                text-gray-600
              "
            >
              Tap photo to change
            </p>
          </div>


          {/* ERROR */}

          {error && (
            <div
              className="
                mb-4
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-3
                py-2.5
                text-xs
                text-red-400
              "
            >
              {error}
            </div>
          )}


          {/* NAME */}

          <div className="mb-4">
            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                text-gray-500
              "
            >
              Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-[#15161C]
                px-3.5
                py-3
                text-sm
                text-white
                outline-none
                transition
                focus:border-purple-500/60
                focus:ring-2
                focus:ring-purple-500/10
              "
            />
          </div>


          {/* USERNAME */}

          <div className="mb-4">
            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                text-gray-500
              "
            >
              Chatly ID
            </label>

            <div
              className="
                flex
                items-center
                rounded-xl
                border
                border-white/10
                bg-[#15161C]
                px-3.5
              "
            >
              <span
                className="
                  text-sm
                  text-purple-400
                "
              >
                @
              </span>

              <input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                      .toLowerCase()
                  )
                }
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-2
                  py-3
                  text-sm
                  text-white
                  outline-none
                "
              />
            </div>

            <p
              className="
                mt-1.5
                text-[10px]
                text-gray-600
              "
            >
              Friends can find you using
              this ID.
            </p>
          </div>


          {/* EMAIL */}

          <div className="mb-4">
            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                text-gray-500
              "
            >
              Email
            </label>

            <input
              value={
                user?.email || ""
              }
              disabled
              className="
                w-full
                cursor-not-allowed
                rounded-xl
                border
                border-white/10
                bg-[#111217]
                px-3.5
                py-3
                text-sm
                text-gray-500
                outline-none
              "
            />
          </div>


          {/* BIO */}

          <div className="mb-6">
            <div
              className="
                mb-2
                flex
                items-center
                justify-between
              "
            >
              <label
                className="
                  text-xs
                  font-medium
                  text-gray-500
                "
              >
                Bio
              </label>

              <span
                className="
                  text-[10px]
                  text-gray-600
                "
              >
                {bio.length}/150
              </span>
            </div>

            <textarea
              value={bio}
              maxLength={150}
              rows={3}
              onChange={(e) =>
                setBio(
                  e.target.value
                )
              }
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-white/10
                bg-[#15161C]
                px-3.5
                py-3
                text-sm
                leading-5
                text-white
                outline-none
                transition
                focus:border-purple-500/60
                focus:ring-2
                focus:ring-purple-500/10
              "
            />
          </div>


          {/* SAVE */}

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={saving}
            className="
              flex
              min-h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-purple-600
              px-4
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-purple-500
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>


          {/* LOGOUT */}

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="
              mt-3
              flex
              min-h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-500/20
              bg-red-500/5
              px-4
              py-3
              text-sm
              font-medium
              text-red-400
              transition
              hover:bg-red-500/10
            "
          >
            <LogOut size={17} />

            Logout
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;