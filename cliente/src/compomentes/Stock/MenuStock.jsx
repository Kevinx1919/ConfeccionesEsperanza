import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Stock.css';

function MenuStock() {
  const navigate = useNavigate();

  return (
    <div className="stock-menu-wrapper">
      <h2 className="stock-menu-titulo">Stock</h2>

      <div className="stock-menu-grid">
        <button
          id="boton_registrar_material_menu_stock"
          className="stock-menu-boton stock-menu-boton--registrar boton_registrar_material_menu_stock"
          onClick={() => navigate('/registrarMaterial')}
        >
          <span className="stock-menu-boton-icono">+</span>
          Registrar material
        </button>

        <button
          id="boton_consultar_material_menu_stock"
          className="stock-menu-boton stock-menu-boton--consultar boton_consultar_material_menu_stock"
          onClick={() => navigate('/listarMaterial')}
        >
          <span className="stock-menu-boton-icono">{'\u{1F4CB}'}</span>
          Consultar material
        </button>

        <button
          id="boton_generar_reporte_menu_stock"
          className="stock-menu-boton stock-menu-boton--reporte boton_generar_reporte_menu_stock"
          type="button"
        >
          <span className="stock-menu-boton-icono">{'\u{1F4CA}'}</span>
          Generar reporte general
        </button>
      </div>

      <div className="stock-menu-volver-contenedor">
        <button
          id="boton_volver_menu_principal_stock"
          className="stock-menu-boton-volver boton_volver_menu_principal_stock"
          onClick={() => navigate('/')}
        >
          Volver
        </button>
      </div>
    </div>
  );
}

export default MenuStock;
