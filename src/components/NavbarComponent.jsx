import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const NavbarComponent = () => {
  const { auth, signout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signout();
    navigate('/signin');
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <Link className="navbar-brand" to="/">Chimera</Link>

      <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarCollapse">
        <div className="navbar-nav">
          {auth.isSignedIn ? (
            <>
              {auth.role === 'employee' ? (
                <Link className="nav-link" to="/addproduct">Add Product</Link>
              ) : (
                <Link className="nav-link" to="/">Products</Link>
              )}
              <Link className="nav-link" to="/cart">Cart ({cart.length})</Link>
              <Link className="nav-link" to="/account">My Account</Link>
            </>
          ) : (
            <Link className="nav-link" to="/">Home</Link>
          )}
        </div>

        <div className="navbar-nav ms-auto">
          {auth.isSignedIn ? (
            <button className="btn btn-outline-light ms-2" onClick={handleSignOut}>
              Sign Out
            </button>
          ) : (
            <>
              <Link className="nav-link" to="/signin">Sign In</Link>
              <Link className="nav-link" to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;
