import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = formData;

    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await register(name, email, password);

      toast.success("Account created successfully!");

      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090C] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        <div className="bg-[#0F1117] border border-white/10 rounded-2xl p-8 shadow-2xl">

          <h1 className="text-3xl font-bold text-white text-center">
            Create Account
          </h1>

          <p className="text-gray-400 text-center mt-2">
            Join Chatly today
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {/* Name */}
            <div>
              <label className="text-sm text-gray-300">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Muhammad Huzaifa"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-[#08090C] border border-white/10 text-white outline-none focus:border-purple-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-[#08090C] border border-white/10 text-white outline-none focus:border-purple-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-300">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-[#08090C] border border-white/10 text-white outline-none focus:border-purple-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold transition"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300"
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;