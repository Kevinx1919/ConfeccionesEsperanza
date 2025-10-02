import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// importar login
import Login from "./compomentes/InicioSesion/login";
//importar barras de navegacion y dashboard
import BarraLateral from "./compomentes/menu/BarraLateral";
import BarraSuperior from "./compomentes/menu/BarraSuperior";
import Dashboard from "./compomentes/DashBoard/Dashboard";
//importaciones para empleados
import MenuEmpleado from "./compomentes/Empleados/MenuEmpleado";
import ListarEmpleados from "./compomentes/Empleados/ListarEmpleados";
import EditarEmpleado from "./compomentes/Empleados/Editarempleado";
import EliminarEmpleado from "./compomentes/Empleados/EliminarEmpleado";
import RegistroEmpleado from "./compomentes/Empleados/RegistroEmpleado";
//importaciones para clientes
import MenuCliente from "./compomentes/Clientes/MenuCliente";
import Listarcliente from "./compomentes/Clientes/Listarcliente";
import RegistrarCliente from "./compomentes/Clientes/RegistrarCliente";
import EditarCliente from "./compomentes/Clientes/EditarCliente";
import EliminarCliente from "./compomentes/Clientes/EliminarCliente";
//importaciones para stock
import MenuStock from "./compomentes/Stock/MenuStock";
import ListarMaterial from "./compomentes/Stock/ListarMaterial";
import EditarMaterial from "./compomentes/Stock/EditarMaterial";
import EliminarMaterial from "./compomentes/Stock/EliminarMaterial";
import RegistrarMaterial from "./compomentes/Stock/RegistrarMaterial";

//importaciones para pedidps
import MenuPedido from "./compomentes/Pedidos/MenuPedido";
import ConsultarPedido from "./compomentes/Pedidos/ConsultarPedido";
import DetallePedido from "./compomentes/Pedidos/DetallePedido";
import RegistrarPedido from "./compomentes/Pedidos/RegistrarPedido";
//importaciones para tareas
import MenuTarea from "./compomentes/Tareas/MenuTarea";
import ConsultarTareas from "./compomentes/Tareas/ConsultarTareas";
import RegistrarTarea from "./compomentes/Tareas/RegistrarTarea";
import EditarTarea from "./compomentes/Tareas/EditarTarea";
import EliminarTarea from "./compomentes/Tareas/EliminarTarea";
import AsignacionTarea from "./compomentes/Tareas/AsignacionTarea";
//importaciones para reposrtes
import MenuReporte from "./compomentes/Reportes/MenuReporte";
//importaciones para el perfil de usuario 
import Perfil from "./compomentes/Perfil/Perfil";

const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#667eea'
  }}>
    <div>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      Verificando autenticación...
    </div>
  </div>
);
// Componente principal de la aplicación (protegido)
const MainApp = () => {
  return (
    <div style={{ marginLeft: 80, marginTop: 60, padding: 20 }}>
      <BarraLateral />
      <BarraSuperior />
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Rutas para empleados */}
        <Route path="/empleados" element={<MenuEmpleado />} />
        <Route path="/listarEmpleados" element={<ListarEmpleados />} />
        <Route path="/editarEmpleado/:id" element={<EditarEmpleado />} />
        <Route path="/eliminarEmpleado/:id" element={<EliminarEmpleado />} />
        <Route path="/registroEmpleado" element={<RegistroEmpleado />} />
        
        {/* Rutas para clientes */}
        <Route path="/clientes" element={<MenuCliente />} />
        <Route path="/listarcliente" element={<Listarcliente />} />
        <Route path="/registrarCliente" element={<RegistrarCliente />} />
        <Route path="/editarCliente/:id" element={<EditarCliente />} />
        <Route path="/eliminarCliente/:id" element={<EliminarCliente />} />
        
        {/* Rutas para Stock */}
        <Route path="/stock" element={<MenuStock />} />
        <Route path="/listarMaterial" element={<ListarMaterial />} />
        <Route path="/registrarMaterial" element={<RegistrarMaterial />} />
        <Route path="/editarMaterial/:id" element={<EditarMaterial />} />
        <Route path="/eliminarMaterial/:id" element={<EliminarMaterial />} />
        
        {/* Rutas para pedidos */}
        <Route path="/pedidos" element={<MenuPedido />} />
        <Route path="/consularPedido" element={<ConsultarPedido />} />
        <Route path="/detallePedido/:id" element={<DetallePedido />} />
        <Route path="/registarPedido" element={<RegistrarPedido />} />
        
        {/* Rutas para tareas */}
        <Route path="/tareas" element={<MenuTarea />} />
        <Route path="/consultarTareas" element={<ConsultarTareas />} />
        <Route path="/registrarTarea" element={<RegistrarTarea />} />
        <Route path="/editarTarea/:id" element={<EditarTarea />} />
        <Route path="/eliminarTarea/:id" element={<EliminarTarea />} />
        <Route path="/asignacionTarea" element={<AsignacionTarea />} />
        
        {/* Rutas para reportes */}
        <Route path="/reportes" element={<MenuReporte />} />
        {/* Rutas para usuarios */}
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </div>
  );
};
// Componente que decide qué mostrar basado en la autenticación
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar pantalla de carga mientras verifica la autenticación
  if (loading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Si está autenticado, mostrar la aplicación principal
  return (
    <Router>
      <MainApp />
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      {/*<style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>*/}
    </AuthProvider>
  );
}

export default App;



