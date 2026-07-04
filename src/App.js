import './App.css';
import React, { Suspense, useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

const GetproductComponent = React.lazy(() => import('./components/GetproductComponent'));
const AddproductComponent = React.lazy(() => import('./components/AddproductComponent'));
const EmployeeCatalogueComponent = React.lazy(() => import('./components/EmployeeCatalogueComponent'));
const SigninComponent = React.lazy(() => import('./components/SigninComponent'));
const SignupComponent = React.lazy(() => import('./components/SignupComponent'));
const MakepaymentComponent = React.lazy(() => import('./components/Makepayment'));
const NavbarComponent = React.lazy(() => import('./components/NavbarComponent'));
const AccountComponent = React.lazy(() => import('./components/AccountComponent'));
const CartComponent = React.lazy(() => import('./components/CartComponent'));
const FavoritesComponent = React.lazy(() => import('./components/FavoritesComponent'));
const FooterComponent = React.lazy(() => import('./components/FooterComponent'));

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
                <Suspense fallback={<div>Loading...</div>}>
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
                </Suspense>
              </div>
            </div>
           </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );
}

export default App;
