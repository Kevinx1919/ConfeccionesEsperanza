import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, ClipboardList, Plus } from 'lucide-react';

const menuButtonClass =
  'group flex min-h-28 items-center justify-between rounded-2xl border px-5 py-4 text-left text-white transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4';

const MenuPedido = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_55%,#fdf2f8_100%)] px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Gestion comercial
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pedidos
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Registra, consulta y gestiona pedidos con una interfaz consistente y estable.
            </p>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              id="boton_registrar_menu_pedido"
              className={`${menuButtonClass} border-sky-200 bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] shadow-[0_18px_40px_-26px_rgba(37,99,235,0.85)] hover:shadow-[0_22px_44px_-24px_rgba(37,99,235,0.95)] focus:ring-sky-200`}
              onClick={() => navigate('/registrarPedido')}
            >
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-100/90">Crear</p>
                <p className="mt-2 text-xl font-semibold sm:text-2xl">Registrar pedido</p>
              </div>
              <span className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20 transition group-hover:bg-white/20">
                <Plus className="h-7 w-7" strokeWidth={2.5} />
              </span>
            </button>

            <button
              id="boton_consultar_menu_pedido"
              className={`${menuButtonClass} border-amber-200 bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_100%)] shadow-[0_18px_40px_-26px_rgba(249,115,22,0.85)] hover:shadow-[0_22px_44px_-24px_rgba(249,115,22,0.95)] focus:ring-amber-200`}
              onClick={() => navigate('/consultarPedido')}
            >
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-50/90">Revision</p>
                <p className="mt-2 text-xl font-semibold sm:text-2xl">Consultar pedidos</p>
              </div>
              <span className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20 transition group-hover:bg-white/20">
                <ClipboardList className="h-7 w-7" strokeWidth={2.2} />
              </span>
            </button>

            <button
              id="boton_reporte_menu_pedido"
              className={`${menuButtonClass} border-violet-200 bg-[linear-gradient(135deg,#8b5cf6_0%,#7c3aed_55%,#4f46e5_100%)] shadow-[0_18px_40px_-26px_rgba(124,58,237,0.8)] hover:shadow-[0_22px_44px_-24px_rgba(99,102,241,0.95)] focus:ring-violet-200`}
              type="button"
            >
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-100/90">Analisis</p>
                <p className="mt-2 text-xl font-semibold sm:text-2xl">Reporte de avance</p>
              </div>
              <span className="ml-4 rounded-2xl bg-white/15 p-3 ring-1 ring-white/20 transition group-hover:bg-white/20 sm:ml-6">
                <BarChart3 className="h-7 w-7" strokeWidth={2.2} />
              </span>
            </button>
          </div>

          <div className="mt-8 flex justify-center md:justify-end">
            <button
              id="boton_volver_menu_pedido"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MenuPedido;
