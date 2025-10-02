
import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import '../../compomentes/DashBoard/chart-setup';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

const API_URL = 'https://localhost:7232/api/Dashboard/metricas';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el dashboard');
        return res.json();
      })
      .then(setData)
      .catch(() => setError('No se pudo cargar el dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="dashboard-container"><h2>Cargando dashboard...</h2></div>;
  }
  if (error || !data) {
    return <div className="dashboard-container"><h2 style={{color:'red'}}>{error || 'Error desconocido'}</h2></div>;
  }

  // Tarjetas de métricas principales
  const metricas = [
    { label: 'Pedidos Activos', value: data.totalPedidosActivos, color: '#7c3aed' },
    { label: 'Pedidos Vencidos', value: data.totalPedidosVencidos, color: '#dc3545' },
    { label: 'Promedio Completado (%)', value: data.promedioCompletado, color: '#2a9d2f' },
    { label: 'Pedidos Pendientes', value: data.pedidosPendientes.length, color: '#f59c1a' },
  ];

  // Gráfica de pedidos por semestre
  const semestreLabels = Object.keys(data.pedidosPorSemestre);
  const semestreValues = Object.values(data.pedidosPorSemestre);
  const barData = {
    labels: semestreLabels,
    datasets: [
      {
        label: 'Pedidos por semestre',
        data: semestreValues,
        backgroundColor: '#7c3aed',
        borderRadius: 8,
      },
    ],
  };

  // Gráfica de estado de pedidos
  const estadoLabels = ['Pendientes', 'Vencidos', 'Completados'];
  const estadoValues = [
    data.pedidosPendientes.length,
    data.totalPedidosVencidos,
    data.totalPedidosActivos - data.totalPedidosVencidos
  ];
  const doughnutData = {
    labels: estadoLabels,
    datasets: [
      {
        data: estadoValues,
        backgroundColor: ['#f59c1a', '#dc3545', '#2a9d2f'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard de Pedidos</h1>
      <div className="dashboard-metricas">
        {metricas.map((m, i) => (
          <div className="dashboard-metrica-card" key={i} style={{backgroundColor: m.color}}>
            <span className="dashboard-metrica-label">{m.label}</span>
            <span className="dashboard-metrica-value">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-row-3col">
        <div className="dashboard-grafica-item medium-grafica">
          <h3>Pedidos por semestre</h3>
          <Bar data={barData} options={{responsive:true, plugins:{legend:{display:false}}, maintainAspectRatio: false, aspectRatio: 1.2}} height={220} />
        </div>
        <div className="dashboard-proximo-pedido dashboard-proximo-pedido-color">
          <h3>Próximo pedido</h3>
          <p><strong>Cliente:</strong> {data.proximoPedido.clienteNombre}</p>
          <p><strong>Fecha de entrega:</strong> {new Date(data.proximoPedido.fechaEntrega).toLocaleDateString()}</p>
          <p><strong>Total pedido:</strong> ${data.proximoPedido.totalPedido.toLocaleString()}</p>
        </div>
        <div className="dashboard-grafica-item medium-grafica">
          <h3>Estado de pedidos</h3>
          <Doughnut data={doughnutData} options={{responsive:true, plugins:{legend:{position:'bottom'}}, maintainAspectRatio: false, aspectRatio: 1.2}} height={220} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

