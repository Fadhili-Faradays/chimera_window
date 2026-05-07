import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import GetproductComponent from './components/GetproductComponent';
import AddproductComponent from './components/AddproductComponent';
import SigninComponent from './components/SigninComponent';
import SignupComponent from './components/SignupComponent';
import MakepaymentComponent from './components/Makepayment';
import NavbarComponent from './components/NavbarComponent';
import AccountComponent from './components/AccountComponent';
import CartComponent from './components/CartComponent';
import FooterComponent from './components/FooterComponent';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import { useContext } from 'react';

const RequireAuth = ({ children }) => {
  const { auth } = useContext(AuthContext);
  return auth.isSignedIn ? children : <Navigate to="/signin" replace />;
};

const RequireEmployee = ({ children }) => {
  const { auth } = useContext(AuthContext);

  if (!auth.isSignedIn) {
    return <Navigate to="/signin" replace />;
  }
  if (auth.role !== 'employee') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="container-fluid">
            <div className="App">
              <NavbarComponent />
              <header className="App-header">
                <h1>Chimera - Window Shopping Online</h1>
              </header>

              <Routes>
                <Route path='/' element={<GetproductComponent />} />
                <Route path='/addproduct' element={
                  <RequireEmployee>
                    <AddproductComponent />
                  </RequireEmployee>
                } />
                <Route path='/account' element={
                  <RequireAuth>
                    <AccountComponent />
                  </RequireAuth>
                } />
                <Route path='/cart' element={<CartComponent />} />
                <Route path='/signin' element={<SigninComponent />} />
                <Route path='/signup' element={<SignupComponent />} />
                <Route path='/makepayment' element={<MakepaymentComponent />} />
                <Route path='*' element={<Navigate to='/' replace />} />
              </Routes>
              <FooterComponent />
            </div>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
