import axios from "axios";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const SigninComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const { signin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading("Signing in. Please wait ...");

    const endpoint =
      role === "employee"
        ? "https://faradays.alwaysdata.net/api/employee_signin"
        : "https://faradays.alwaysdata.net/api/user_signin";

    try {
      const response = await axios.post(endpoint, { email, password });

      if (response.status === 200) {
        const payload = response.data || {};
        signin({
          role,
          user: {
            id: payload.id || payload.userId || null,
            username: payload.username || payload.name || payload.email || email,
            email: payload.email || email,
          },
          token: payload.token || "",
          personalData: payload,
        });

        setLoading("");
        navigate(role === "employee" ? "/addproduct" : "/");
      } else {
        setLoading("");
        setError(response.data?.message || "Sign in failed. Please try again.");
      }
    } catch (err) {
      setLoading("");
      setError(err.response?.data?.message || err.message || "Sign in failed.");
    }
  };

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-md-6 card shadow p-4">
        <h2>Sign In</h2>

        <h5 className="text-warning">{loading}</h5>
        <h5 className="text-danger">{error}</h5>

        <form onSubmit={handleSubmit}>
          <select
            className="form-control mb-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User / Customer</option>
            <option value="employee">Employee</option>
          </select>

          <input
            type="email"
            className="form-control"
            placeholder="Enter Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />

          <input
            type="password"
            className="form-control"
            placeholder="Enter Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />

          <button className="btn btn-success">Sign In</button>
          <br />
          <Link to="/signup">Need an account? Sign Up</Link>
        </form>
      </div>
    </div>
  );
};

export default SigninComponent;
