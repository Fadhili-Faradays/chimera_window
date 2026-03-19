import { Link } from "react-router-dom";


const NavbarComponent =()=>{
    
    return(
        <nav className="navbar navbar-expand-lg">
            <Link className="navbar-brand" to="/">Sokogarden</Link>

            <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarCollapse">
                <div className="navbar-nav">
                    <Link className="nav-link" to="/">Home</Link>
                    <Link className="nav-link" to="/addproduct">Add Product</Link>
                </div>

                <div className="navbar-nav ms-auto">
                    <Link className="nav-link" to="/signin">Sign In</Link>
                    <Link className="nav-link" to="/signup">Sign Up</Link>
                
                </div>
            </div>
        </nav>
    )
}
export default NavbarComponent;