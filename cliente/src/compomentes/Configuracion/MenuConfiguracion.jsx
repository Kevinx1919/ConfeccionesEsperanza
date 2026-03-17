import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  Building2,
  FileBarChart2,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

const opcionesConfiguracion = [
  {
    id: 'accesos',
    etiqueta: 'Control',
    titulo: 'Accesos y usuarios',
    descripcion: 'Revisa usuarios, roles y estado general de acceso del sistema.',
    icono: UsersRound,
    gradiente: 'bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_55%,#4f46e5_100%)]',
    sombra: 'shadow-[0_18px_40px_-26px_rgba(37,99,235,0.9)]',
    borde: 'border-sky-200',
    texto: 'text-sky-100/90',
    aro: 'ring-sky-200',
    ruta: '/listarEmpleados',
  },
  {
    id: 'seguridad',
    etiqueta: 'Seguridad',
    titulo: 'Proteccion de la cuenta',
    descripcion: 'Consulta el estado de seguridad y los ajustes principales de acceso.',
    icono: ShieldCheck,
    gradiente: 'bg-[linear-gradient(135deg,#10b981_0%,#059669_52%,#047857_100%)]',
    sombra: 'shadow-[0_18px_40px_-26px_rgba(16,185,129,0.8)]',
    borde: 'border-emerald-200',
    texto: 'text-emerald-50/90',
    aro: 'ring-emerald-200',
    ruta: '/perfil',
  },
  {
    id: 'catalogos',
    etiqueta: 'Catalogos',
    titulo: 'Inventario y referencias',
    descripcion: 'Accede a materiales y referencias operativas para mantener la base al dia.',
    icono: Boxes,
    gradiente: 'bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_55%,#ea580c_100%)]',
    sombra: 'shadow-[0_18px_40px_-26px_rgba(249,115,22,0.85)]',
    borde: 'border-amber-200',
    texto: 'text-amber-50/90',
    aro: 'ring-amber-200',
    ruta: '/stock',
  },
  {
    id: 'negocio',
    etiqueta: 'Negocio',
    titulo: 'Clientes y datos comerciales',
    descripcion: 'Consulta la base comercial y valida la informacion clave del negocio.',
    icono: Building2,
    gradiente: 'bg-[linear-gradient(135deg,#a855f7_0%,#7c3aed_52%,#4f46e5_100%)]',
    sombra: 'shadow-[0_18px_40px_-26px_rgba(124,58,237,0.82)]',
    borde: 'border-violet-200',
    texto: 'text-violet-100/90',
    aro: 'ring-violet-200',
    ruta: '/clientes',
  },
];

function MenuConfiguracion() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-[68rem] px-4 py-3 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_55%,#fdf2f8_100%)] px-5 py-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Administracion del sistema
            </span>
            <h2 className="mt-2.5 text-[1.8rem] font-bold tracking-tight text-slate-900 sm:text-[2.2rem]">
              Configuracion
            </h2>
            <p className="mt-1.5 text-[0.88rem] leading-5 text-slate-600 sm:text-[0.92rem]">
              Reune los accesos, catalogos y ajustes generales que apoyan el trabajo del
              sistema.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-8 sm:py-5">
          <div className="mb-4 rounded-[1.15rem] border border-violet-500/20 bg-gradient-to-r from-[#080b21] via-[#1c1e4c] to-[#6f2ee8] px-4 py-3 text-white shadow-[0_16px_34px_rgba(59,20,120,0.24)]">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.34em] text-violet-200/85">
                  Centro de control
                </p>
                <h3 className="mt-0.5 text-[1rem] font-black tracking-tight text-white">
                  Ajustes clave del sistema
                </h3>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-[0.85rem] border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <p className="text-[0.58rem] uppercase tracking-[0.28em] text-violet-200/80">
                    Secciones
                  </p>
                  <p className="mt-0.5 text-[0.84rem] font-black text-white">4 bloques</p>
                </div>
                <div className="rounded-[0.85rem] border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <p className="text-[0.58rem] uppercase tracking-[0.28em] text-violet-200/80">
                    Enlace
                  </p>
                  <p className="mt-0.5 text-[0.84rem] font-black text-white">Operativo</p>
                </div>
                <div className="rounded-[0.85rem] border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <p className="text-[0.58rem] uppercase tracking-[0.28em] text-violet-200/80">
                    Alcance
                  </p>
                  <p className="mt-0.5 text-[0.84rem] font-black text-white">Sistema</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {opcionesConfiguracion.map((opcion) => {
              const Icono = opcion.icono;

              return (
                <button
                  key={opcion.id}
                  id={`boton_${opcion.id}_menu_configuracion`}
                  type="button"
                  onClick={() => navigate(opcion.ruta)}
                  className={`group flex min-h-[6.5rem] items-center justify-between rounded-2xl border ${opcion.borde} ${opcion.gradiente} px-4 py-3 text-left text-white ${opcion.sombra} transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-24px_rgba(15,23,42,0.35)] focus:outline-none focus:ring-4 ${opcion.aro}`}
                >
                  <div className="max-w-[18rem]">
                    <p className={`text-[0.72rem] font-medium uppercase tracking-[0.16em] ${opcion.texto}`}>
                      {opcion.etiqueta}
                    </p>
                    <p className="mt-1 text-[1rem] font-semibold text-white sm:text-[1.2rem]">{opcion.titulo}</p>
                    <p className="mt-1 text-[0.8rem] leading-5 text-white/90">{opcion.descripcion}</p>
                  </div>
                  <span className="rounded-xl bg-white/15 p-2 text-white ring-1 ring-white/20 transition group-hover:bg-white/20">
                    <Icono className="h-5.5 w-5.5" strokeWidth={2.2} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2.5 md:justify-end">
            <button
              id="boton_ir_reportes_desde_configuracion"
              type="button"
              onClick={() => navigate('/reportes')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[0.88rem] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              <FileBarChart2 className="h-4 w-4" />
              Ir a reportes
            </button>

            <button
              id="boton_volver_menu_principal_configuracion"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[0.88rem] font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
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
}

export default MenuConfiguracion;
