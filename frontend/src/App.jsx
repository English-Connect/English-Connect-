import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Registro from './components/Registro';
import Login from './components/Login';
import DashboardAlumno from './components/DashboardAlumno';
import DashboardProfesor from './components/DashboardProfesor';
import ClaseOnline from './components/ClaseOnline';
import Perfil from './pages/Perfil';
import ListaProfesores from './components/ListaProfesores';
import './styles/App.css';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  return usuario ? children : <Navigate to="/login" />;
};

// Componente para el dashboard según el rol
const Dashboard = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  
  if (usuario.rol === 'PROFESOR') {
    return <DashboardProfesor />;
  } else {
    return <DashboardAlumno />;
  }
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clase/:claseId" 
            element={
              <ProtectedRoute>
                <ClaseOnline />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profesores" 
            element={
              <ProtectedRoute>
                <ListaProfesores />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;