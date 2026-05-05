import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GetproductComponent from './components/GetproductComponent';
import AddproductComponent from './components/AddproductComponent';
import SigninComponent from './components/SigninComponent';
import SignupComponent from './components/SignupComponent';
import MakepaymentComponent from './components/Makepayment';
import NavbarComponent from './components/NavbarComponent'; // fixed import name
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js"
function App() {
  return (
    <BrowserRouter>
     <div className="container-fluid">
      <div className="App">
        <NavbarComponent/>
        <header className="App-header">
         <h1>Chimera - Window Shopping Online</h1>
        </header>

      <Routes>
            <Route path='/' element={<GetproductComponent/>} />
            <Route path='/addproduct' element={<AddproductComponent/>} />
            <Route path='/signin' element={<SigninComponent/>} />
            <Route path='/signup' element={<SignupComponent/>} />
            <Route path='/makepayment' element={<MakepaymentComponent/>} />
      </Routes>
      </div>
     </div>
    </BrowserRouter>
  );
}

export default App;
