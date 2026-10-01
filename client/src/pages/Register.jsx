import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  User,
  AtSign,
  Mail,
  Lock,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";


const Register = () => {
  const {
    register,
  } = useAuth();

  const navigate =
    useNavigate();


  const [name, setName] =
    useState("");

  const [
    username,
    setUsername,
  ] = useState("");

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");

      if (
        !name ||
        !username ||
        !email ||
        !password
      ) {
        setError(
          "Please fill all fields"
        );

        return;
      }

      try {
        setLoading(true);

        await register(
          name,
          username,
          email,
          password
        );

        navigate("/");
      } catch (error) {
        setError(
          error?.response?.data
            ?.message ||
            "Registration failed"
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#08090C]
        px-4
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-white/10
          bg-[#0C0D12]
          p-6
          shadow-2xl
          sm:p-8
        "
      >
        <div className="mb-8 text-center">
          <h1
            className="
              text-2xl
              font-bold
              text-white
            "
          >
            Create Account
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            Join Chatly
          </p>
        </div>


        {error && (
          <div
            className="
              mb-4
              rounded-lg
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-3
              text-sm
              text-red-400
            "
          >
            {error}
          </div>
        )}


        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >

          {/* Name */}
          <div>
            <label
              className="
                mb-2
                block
                text-sm
                text-gray-400
              "
            >
              Name
            </label>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/10
                bg-[#15161C]
                px-3
              "
            >
              <User
                size={18}
                className="text-gray-500"
              />

              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Muhammad Huzaifa"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  py-3
                  text-sm
                  text-white
                  outline-none
                "
              />
            </div>
          </div>


          {/* Username */}
          <div>
            <label
              className="
                mb-2
                block
                text-sm
                text-gray-400
              "
            >
              Username
            </label>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/10
                bg-[#15161C]
                px-3
              "
            >
              <AtSign
                size={18}
                className="text-gray-500"
              />

              <input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                      .toLowerCase()
                  )
                }
                placeholder="huzaifa01"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  py-3
                  text-sm
                  text-white
                  outline-none
                "
              />
            </div>

            <p
              className="
                mt-1
                text-[11px]
                text-gray-600
              "
            >
              This will be your unique
              Chatly ID.
            </p>
          </div>


          {/* Email */}
          <div>
            <label
              className="
                mb-2
                block
                text-sm
                text-gray-400
              "
            >
              Email
            </label>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/10
                bg-[#15161C]
                px-3
              "
            >
              <Mail
                size={18}
                className="text-gray-500"
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="you@example.com"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  py-3
                  text-sm
                  text-white
                  outline-none
                "
              />
            </div>
          </div>


          {/* Password */}
          <div>
            <label
              className="
                mb-2
                block
                text-sm
                text-gray-400
              "
            >
              Password
            </label>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/10
                bg-[#15161C]
                px-3
              "
            >
              <Lock
                size={18}
                className="text-gray-500"
              />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Minimum 6 characters"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  py-3
                  text-sm
                  text-white
                  outline-none
                "
              />
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-xl
              bg-purple-600
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-purple-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Creating..."
              : "Create Account"}
          </button>
        </form>


        <p
          className="
            mt-6
            text-center
            text-sm
            text-gray-500
          "
        >
          Already have an account?{" "}

          <Link
            to="/login"
            className="
              text-purple-400
              hover:text-purple-300
            "
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};


export default Register;