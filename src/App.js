import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import GetproductComponent from './components/GetproductComponent';
import AddproductComponent from './components/AddproductComponent';
import EmployeeCatalogueComponent from './components/EmployeeCatalogueComponent';
import SigninComponent from './components/SigninComponent';
import SignupComponent from './components/SignupComponent';
import MakepaymentComponent from './components/Makepayment';
import NavbarComponent from './components/NavbarComponent';
import AccountComponent from './components/AccountComponent';
import CartComponent from './components/CartComponent';
import FavoritesComponent from './components/FavoritesComponent';
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
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            
              <div className="container-fluid">
              <div className="App">
                <NavbarComponent />
                <header className="App-header">
                  <h1>Chimera - Window Shopping Online</h1>
                </header>

                <Routes>
                  <Route path='/' element={
                    <RequireAuth>
                      <GetproductComponent />
                    </RequireAuth>
                  } />
                  <Route path='/category/:category' element={
                    <RequireAuth>
                      <GetproductComponent />
                    </RequireAuth>
                  } />
                  <Route path='/addproduct' element={
                    <RequireEmployee>
                      <AddproductComponent />
                    </RequireEmployee>
                  } />
                  <Route path='/employee-catalogue' element={
                    <RequireEmployee>
                      <EmployeeCatalogueComponent />
                    </RequireEmployee>
                  } />
                  <Route path='/account' element={
                    <RequireAuth>
                      <AccountComponent />
                    </RequireAuth>
                  } />
                  <Route path='/cart' element={
                    <RequireAuth>
                      <CartComponent />
                    </RequireAuth>
                  } />
                  <Route path='/favorites' element={
                    <RequireAuth>
                      <FavoritesComponent />
                    </RequireAuth>
                  } />
                  <Route path='/signin' element={<SigninComponent />} />
                  <Route path='/signup' element={<SignupComponent />} />
                  <Route path='/makepayment' element={
                    <RequireAuth>
                      <MakepaymentComponent />
                    </RequireAuth>
                  } />
                  <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>
                <FooterComponent />
              </div>
            </div>
           </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
}

export default App;
