import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const AccountComponent = () => {
  const { auth } = useContext(AuthContext);
  const [profile, setProfile] = useState(auth.user || {});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.isSignedIn) return;

    const fetchProfile = async () => {
      setLoading("Loading account information...");
      setError("");

      const url =
        auth.role === "employee"
          ? "https://faradays.alwaysdata.net/api/employee_account"
          : "https://faradays.alwaysdata.net/api/user_account";

      try {
        const response = await axios.get(url, {
          params: { email: auth.user?.email },
          headers: auth.token
            ? { Authorization: `Bearer ${auth.token}` }
            : {},
        });

        if (response.status === 200 && response.data) {
          setProfile(response.data.profile || auth.user || {});
          setItems(response.data.items || []);
        } else {
          setProfile(auth.user || {});
        }
      } catch (err) {
        setError("Unable to load account details. Showing saved profile.");
        setProfile(auth.user || {});
      } finally {
        setLoading("");
      }
    };

    fetchProfile();
  }, [auth]);

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-md-8 card shadow p-4">
        <h2>My Account</h2>
        <h6 className="text-warning">{loading}</h6>
        <h6 className="text-danger">{error}</h6>

        <p>
          <strong>Name:</strong> {profile.username || profile.name || "-"}
        </p>
        <p>
          <strong>Email:</strong> {profile.email || "-"}
        </p>
        <p>
          <strong>Role:</strong> {auth.role === "employee" ? "Employee" : "User"}
        </p>

        <div className="mt-4">
          <h4>Personal dashboard</h4>
          {auth.role === "employee" ? (
            <p>
              As an employee, you can add new products, manage your catalog, and
              review your personal account details here.
            </p>
          ) : (
            <p>
              As a customer, you can browse products and make purchases from the
              store.
            </p>
          )}
        </div>

        <div className="mt-3">
          <h5>{auth.role === "employee" ? "Your personal items" : "Your recent activity"}</h5>
          {items.length > 0 ? (
            <ul className="list-group">
              {items.map((item, index) => (
                <li className="list-group-item" key={index}>
                  {item.name || item.title || JSON.stringify(item)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No personal items found yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountComponent;
