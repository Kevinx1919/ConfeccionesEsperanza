import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Download,
  FileSpreadsheet,
  FileText,
  LineChart,
  PackageCheck,
  RefreshCw,
  ShieldUser,
  Users,
  Wrench,
} from 'lucide-react';
import '../DashBoard/chart-setup';
import { Bar, Doughnut } from 'react-chartjs-2';
import { analizarReporte } from './analisis/analizarReporte';
import { generarReporte } from './exportadores/generarReporte';
import { obtenerDatosReporte } from './exportadores/obtenerDatosReporte';

const reportes = [
  {
    id: 'stock',
    nombre: 'Reporte general de stock',
    descripcion: 'Consolida materiales, cantidades, tipos y movimientos clave del inventario.',
    icono: Boxes,
    acento: 'from-sky-500 via-blue-500 to-blue-700',
    brillo: 'shadow-[0_20px_45px_rgba(37,99,235,0.18)]',
    fondo: 'from-sky-50 via-white to-blue-50/80',
  },
  {
    id: 'pedidos',
    nombre: 'Reporte general de pedidos',
    descripcion: 'Resume estados, vencimientos, montos y seguimiento de pedidos activos.',
    icono: ClipboardList,
    acento: 'from-orange-400 via-amber-500 to-orange-600',
    brillo: 'shadow-[0_20px_45px_rgba(245,158,11,0.20)]',
    fondo: 'from-orange-50 via-white to-amber-50/80',
  },
  {
    id: 'empleados',
    nombre: 'Reporte general de empleados',
    descripcion: 'Muestra usuarios, roles, estados de cuenta y datos principales del personal.',
    icono: ShieldUser,
    acento: 'from-emerald-400 via-teal-500 to-emerald-600',
    brillo: 'shadow-[0_20px_45px_rgba(16,185,129,0.18)]',
    fondo: 'from-emerald-50 via-white to-teal-50/80',
  },
  {
    id: 'tareas',
    nombre: 'Reporte general de tareas',
    descripcion: 'Organiza tareas, asignaciones, estado de avance y prioridades pendientes.',
    icono: Wrench,
    acento: 'from-fuchsia-500 via-violet-500 to-indigo-600',
    brillo: 'shadow-[0_20px_45px_rgba(139,92,246,0.22)]',
    fondo: 'from-fuchsia-50 via-white to-violet-50/80',
  },
  {
    id: 'clientes',
    nombre: 'Reporte general de clientes',
    descripcion: 'Reune informacion de contacto, documentos y seguimiento comercial.',
    icono: Users,
    acento: 'from-cyan-500 via-sky-500 to-indigo-600',
    brillo: 'shadow-[0_20px_45px_rgba(14,165,233,0.18)]',
    fondo: 'from-cyan-50 via-white to-sky-50/80',
  },
];

const MenuReporte = () => {
  const navigate = useNavigate();
  const [seleccion, setSeleccion] = useState('');
  const [accionActiva, setAccionActiva] = useState('');
  const [reporteActivo, setReporteActivo] = useState('stock');
  const [analisisActivo, setAnalisisActivo] = useState(null);
  const [cargandoAnalisis, setCargandoAnalisis] = useState(true);
  const [errorAnalisis, setErrorAnalisis] = useState('');
  const analisisRef = useRef(null);

  const irAAnalisis = () => {
    if (!analisisRef.current) return;

    requestAnimationFrame(() => {
      analisisRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const cargarAnalisis = async (moduloId) => {
    try {
      setCargandoAnalisis(true);
      setErrorAnalisis('');
      const reporte = await obtenerDatosReporte(moduloId);
      setAnalisisActivo({
        nombre: reporte.nombre,
        ...analizarReporte(moduloId, reporte.items),
      });
    } catch (error) {
      setErrorAnalisis(error.message || 'No se pudo cargar el analisis del modulo.');
      setAnalisisActivo(null);
    } finally {
      setCargandoAnalisis(false);
    }
  };

  React.useEffect(() => {
    cargarAnalisis(reporteActivo);
  }, [reporteActivo]);

  const handleSeleccion = async (moduloId, moduloNombre, formato) => {
    const accionId = `${moduloId}-${formato}`;

    try {
      setAccionActiva(accionId);
      setSeleccion('');
      await generarReporte(moduloId, formato);
      setSeleccion(`Se descargo ${formato.toUpperCase()} para ${moduloNombre}.`);
    } catch (error) {
      setSeleccion(error.message || 'No se pudo generar el reporte seleccionado.');
    } finally {
      setAccionActiva('');
    }
  };

  return (
    <section className="px-4 pb-8 pt-6 sm:px-6 lg:px-10 lg:pt-8">
      <div className="mx-auto w-full max-w-[112rem]">
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/92 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur">
          <div className="border-b border-slate-200/80 bg-gradient-to-r from-sky-50/90 via-white to-fuchsia-50/70 px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex items-center rounded-full border border-sky-300/90 bg-white/80 px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-sky-700 shadow-sm">
                Centro de reportes
                </span>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-[2.7rem]">
                Reportes
                </h1>
                <p className="mt-2.5 max-w-2xl text-[0.92rem] leading-6 text-slate-700">
                Elige el modulo que quieres exportar y descarga su reporte en el formato
                que mejor se ajuste a tu trabajo diario.
                </p>
              </div>

              <div className="w-full max-w-[31rem] self-end rounded-[1.3rem] border border-violet-500/25 bg-gradient-to-r from-[#080b21] via-[#1c1e4c] to-[#6f2ee8] px-3.5 py-3 text-white shadow-[0_14px_28px_rgba(59,20,120,0.2)] sm:px-4 xl:mt-1">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
                  <div className="rounded-[0.95rem] border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[0.6rem] uppercase tracking-[0.28em] text-violet-200/80">
                    Formatos
                    </p>
                    <p className="mt-1 text-[0.98rem] font-black leading-tight text-white">PDF y Excel</p>
                  </div>
                  <div className="rounded-[0.95rem] border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[0.6rem] uppercase tracking-[0.28em] text-violet-200/80">
                    Alcance
                    </p>
                    <p className="mt-1 text-[0.98rem] font-black leading-tight text-white">5 modulos</p>
                  </div>
                  <div className="rounded-[0.95rem] border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[0.6rem] uppercase tracking-[0.28em] text-violet-200/80">
                    Uso
                    </p>
                    <p className="mt-1 text-[0.98rem] font-black leading-tight text-white">
                      Descarga directa
                    </p>
                  </div>
                  <div className="hidden h-8.5 w-8.5 shrink-0 items-center justify-center self-center rounded-[0.85rem] border border-white/15 bg-white/10 text-violet-100 sm:flex">
                    <Download className="h-3.5 w-3.5" strokeWidth={2.1} />
                  </div>
                </div>
              </div>
            </div>

            {seleccion ? (
              <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm font-medium text-violet-900">
                {seleccion}
              </div>
            ) : null}
          </div>

          <div className="px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
            <section
              ref={analisisRef}
              className="mb-7 overflow-hidden rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_52%,#faf5ff_100%)] shadow-[0_18px_44px_-30px_rgba(15,23,42,0.35)]"
            >
              <div className="border-b border-slate-200/80 px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-sky-700">
                      Vista analitica
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      {reportes.find((reporte) => reporte.id === reporteActivo)?.nombre || 'Analisis'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Consulta una lectura rapida antes de descargar el reporte.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {reportes.map((reporte) => (
                      <button
                        key={`selector-${reporte.id}`}
                        id={`boton_selector_analisis_${reporte.id}_reporte`}
                        type="button"
                        onClick={() => setReporteActivo(reporte.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          reporteActivo === reporte.id
                            ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
                            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {reporte.id.charAt(0).toUpperCase() + reporte.id.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6">
                {cargandoAnalisis ? (
                  <div className="flex min-h-[18rem] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 text-slate-600">
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Cargando analisis...
                    </div>
                  </div>
                ) : errorAnalisis ? (
                  <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50/80 p-5">
                    <p className="text-sm font-medium text-rose-700">{errorAnalisis}</p>
                  </div>
                ) : analisisActivo ? (
                  <div className="grid gap-5 xl:grid-cols-[1.2fr_0.95fr]">
                    <div className="space-y-5">
                      <div className="rounded-[1.45rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="rounded-xl bg-sky-100 p-2 text-sky-700">
                            <LineChart className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">Resumen automatico</p>
                            <p className="text-xs text-slate-500">Lectura general del comportamiento del modulo.</p>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-7 text-slate-700">{analisisActivo.resumen}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {analisisActivo.metricas.map((metrica) => (
                          <article
                            key={metrica.label}
                            className="rounded-[1.35rem] border border-slate-200 bg-white/85 p-4 shadow-sm"
                          >
                            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                              {metrica.label}
                            </p>
                            <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                              {metrica.value}
                            </p>
                          </article>
                        ))}
                      </div>

                      {analisisActivo.secondaryChart ? (
                        <div className="rounded-[1.45rem] border border-slate-200 bg-white/85 p-4 shadow-sm">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-xl bg-violet-100 p-2 text-violet-700">
                              <BarChart3 className="h-4.5 w-4.5" />
                            </span>
                            <p className="text-sm font-semibold text-slate-900">
                              {analisisActivo.secondaryChart.title}
                            </p>
                          </div>
                          <div className="h-[17rem]">
                          <Bar
                            data={analisisActivo.secondaryChart.data}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: {
                                  callbacks: {
                                    label: (context) =>
                                      new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        maximumFractionDigits: 0,
                                      }).format(context.parsed.y || 0),
                                  },
                                },
                              },
                              scales: {
                                x: {
                                  title: {
                                    display: true,
                                    text:
                                      reporteActivo === 'pedidos'
                                        ? 'Pedidos'
                                        : 'Categorias analizadas',
                                    color: '#334155',
                                    font: { size: 12, weight: '600' },
                                  },
                                  grid: { display: false },
                                  ticks: { color: '#475569', font: { size: 11 } },
                                },
                                y: {
                                  title: {
                                    display: true,
                                    text:
                                      reporteActivo === 'pedidos'
                                        ? 'Total del pedido (COP)'
                                        : 'Cantidad',
                                    color: '#334155',
                                    font: { size: 12, weight: '600' },
                                  },
                                  ticks: {
                                    color: '#475569',
                                    font: { size: 11 },
                                    callback: (value) =>
                                      reporteActivo === 'pedidos'
                                        ? new Intl.NumberFormat('es-CO').format(value)
                                        : value,
                                  },
                                },
                              },
                            }}
                          />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[1.45rem] border border-slate-200 bg-white/85 p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-xl bg-fuchsia-100 p-2 text-fuchsia-700">
                          <BarChart3 className="h-4.5 w-4.5" />
                        </span>
                        <p className="text-sm font-semibold text-slate-900">
                          {analisisActivo.primaryChart?.title || 'Distribucion general'}
                        </p>
                      </div>
                      <div className="h-[22rem]">
                        {analisisActivo.primaryChart?.type === 'doughnut' ? (
                          <Doughnut
                            data={analisisActivo.primaryChart.data}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    boxWidth: 12,
                                    color: '#334155',
                                    font: { size: 11 },
                                  },
                                },
                              },
                              cutout: '62%',
                            }}
                          />
                        ) : (
                          <Bar
                            data={analisisActivo.primaryChart?.data}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: {
                                  callbacks: {
                                    label: (context) =>
                                      reporteActivo === 'pedidos'
                                        ? new Intl.NumberFormat('es-CO', {
                                            style: 'currency',
                                            currency: 'COP',
                                            maximumFractionDigits: 0,
                                          }).format(context.parsed.y || 0)
                                        : `${context.parsed.y || 0}`,
                                  },
                                },
                              },
                              scales: {
                                x: {
                                  title: {
                                    display: true,
                                    text:
                                      reporteActivo === 'pedidos'
                                        ? 'Pedidos'
                                        : 'Categorias analizadas',
                                    color: '#334155',
                                    font: { size: 12, weight: '600' },
                                  },
                                  grid: { display: false },
                                  ticks: { color: '#475569', font: { size: 11 } },
                                },
                                y: {
                                  title: {
                                    display: true,
                                    text:
                                      reporteActivo === 'pedidos'
                                        ? 'Total del pedido (COP)'
                                        : 'Cantidad',
                                    color: '#334155',
                                    font: { size: 12, weight: '600' },
                                  },
                                  ticks: {
                                    color: '#475569',
                                    font: { size: 11 },
                                    callback: (value) =>
                                      reporteActivo === 'pedidos'
                                        ? new Intl.NumberFormat('es-CO').format(value)
                                        : value,
                                  },
                                },
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-2">
              {reportes.map((reporte) => {
                const Icono = reporte.icono;

                return (
                  <article
                    key={reporte.id}
                    className={`overflow-hidden rounded-[1.85rem] border border-slate-200/85 bg-gradient-to-br ${reporte.fondo} ${reporte.brillo}`}
                  >
                    <div className="flex flex-col gap-5 p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${reporte.acento} text-white shadow-lg`}
                        >
                          <Icono className="h-8 w-8" strokeWidth={2.1} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-slate-500">
                            Reporte
                          </p>
                          <h2 className="mt-2 text-xl font-black leading-tight text-slate-950 sm:text-[1.55rem]">
                            {reporte.nombre}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {reporte.descripcion}
                          </p>
                          <button
                            id={`boton_ver_analisis_${reporte.id}_reporte`}
                            type="button"
                            onClick={() => {
                              setReporteActivo(reporte.id);
                              irAAnalisis();
                            }}
                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            <BarChart3 className="h-3.5 w-3.5" />
                            Ver analisis
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          id={`boton_descargar_pdf_${reporte.id}_reporte`}
                          type="button"
                          onClick={() => handleSeleccion(reporte.id, reporte.nombre, 'pdf')}
                          disabled={accionActiva === `${reporte.id}-pdf` || accionActiva === `${reporte.id}-excel`}
                          className="group flex min-h-[5.2rem] items-center justify-between rounded-[1.35rem] border border-red-200/80 bg-white/85 px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-[0_14px_28px_rgba(239,68,68,0.12)]"
                        >
                          <div>
                            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.28em] text-red-500">
                              Documento
                            </p>
                            <p className="mt-2 text-lg font-bold text-slate-950">
                              {accionActiva === `${reporte.id}-pdf` ? 'Generando PDF...' : 'Descargar PDF'}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-red-50 p-3 text-red-500 transition group-hover:bg-red-100">
                            <FileText className="h-6 w-6" strokeWidth={2.1} />
                          </div>
                        </button>

                        <button
                          id={`boton_descargar_excel_${reporte.id}_reporte`}
                          type="button"
                          onClick={() => handleSeleccion(reporte.id, reporte.nombre, 'excel')}
                          disabled={accionActiva === `${reporte.id}-excel` || accionActiva === `${reporte.id}-pdf`}
                          className="group flex min-h-[5.2rem] items-center justify-between rounded-[1.35rem] border border-emerald-200/80 bg-white/85 px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_14px_28px_rgba(16,185,129,0.12)]"
                        >
                          <div>
                            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.28em] text-emerald-600">
                              Hoja de calculo
                            </p>
                            <p className="mt-2 text-lg font-bold text-slate-950">
                              {accionActiva === `${reporte.id}-excel`
                                ? 'Generando Excel...'
                                : 'Descargar Excel'}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 transition group-hover:bg-emerald-100">
                            <FileSpreadsheet className="h-6 w-6" strokeWidth={2.1} />
                          </div>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                id="boton_volver_menu_principal_reporte"
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-3 rounded-[1.2rem] bg-slate-950 px-6 py-3.5 text-base font-semibold text-white shadow-[0_16px_32px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-900"
              >
                <PackageCheck className="h-5 w-5" strokeWidth={2.2} />
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MenuReporte;
