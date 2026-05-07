import React from 'react';

const FooterComponent = () => {
  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>Chimera Window</h5>
            <p>Your one-stop shop for all your fashion needs. Quality products at affordable prices.</p>
          </div>
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light">Home</a></li>
              <li><a href="/cart" className="text-light">Cart</a></li>
              <li><a href="/account" className="text-light">Account</a></li>
              <li><a href="/signin" className="text-light">Sign In</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Contact Us</h5>
            <p>Email: support@chimerawindow.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-12 text-center">
            <p>&copy; 2024 Chimera Window. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;