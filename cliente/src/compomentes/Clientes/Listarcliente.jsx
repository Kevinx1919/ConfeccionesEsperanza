import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { apiUrl } from '../../config/api';
import { readCollection } from '../../utils/apiResponse';

const API_URL_CLIENTE = apiUrl('/api/Customer');

const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

function Listarcliente() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const clientesPorPagina = 4;

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(API_URL_CLIENTE, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los clientes');
      }

      const data = await response.json();
      const clientesRecibidos = readCollection(data, ['clientes', 'items', 'data']);
      setClientes(clientesRecibidos);
    } catch (fetchError) {
      setError(fetchError.message || 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) {
      return clientes;
    }

    const normalizedTerm = searchTerm.toLowerCase();
    return clientes.filter((cliente) => {
      const nombre = cliente.nombreCliente?.toLowerCase() || '';
      const apellido = cliente.apellidoCliente?.toLowerCase() || '';
      const correo = cliente.emailCliente?.toLowerCase() || '';
      const telefono = cliente.telefonoCliente?.toLowerCase() || '';
      const documento = cliente.numeroDocCliente?.toString() || '';

      return (
        nombre.includes(normalizedTerm) ||
        apellido.includes(normalizedTerm) ||
        correo.includes(normalizedTerm) ||
        telefono.includes(normalizedTerm) ||
        documento.includes(normalizedTerm)
      );
    });
  }, [clientes, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPaginas = Math.max(1, Math.ceil(filteredClientes.length / clientesPorPagina));
  const indexOfLastCliente = currentPage * clientesPorPagina;
  const indexOfFirstCliente = indexOfLastCliente - clientesPorPagina;
  const clientesActuales = filteredClientes.slice(indexOfFirstCliente, indexOfLastCliente);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <p className="text-base font-medium text-slate-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <h2 className="text-2xl font-bold text-slate-900">Error</h2>
          <p className="mt-3 text-sm text-rose-700">{error}</p>
          <button
            id="boton_reintentar_listado_cliente"
            className={`${buttonBaseClass} mt-6 bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-5 py-3 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200 boton_reintentar_listado_cliente`}
            onClick={fetchClientes}
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[150rem] px-4 py-2 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#eef2ff_100%)] px-5 py-3 sm:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                Gestion comercial
              </span>
              <h2 className="mt-2 text-[1.6rem] font-bold tracking-tight text-slate-900 sm:text-[2rem]">
                Lista de Clientes
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-slate-600">
                Revisa la informacion principal de cada cliente y accede a sus acciones.
              </p>
            </div>

            <div className="w-full max-w-5xl">
              <label
                className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
                htmlFor="campo_busqueda_cliente"
              >
                <span className="rounded-lg bg-sky-100 p-1 text-sky-700">
                  <Search className="h-4 w-4" />
                </span>
                Buscar cliente
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="campo_busqueda_cliente"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  type="text"
                  placeholder="Nombre, apellido, correo, telefono o documento"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 sm:px-8 sm:py-4">
          {clientesActuales.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <h3 className="text-xl font-semibold text-slate-900">No se encontraron clientes</h3>
              <p className="mt-3 text-sm text-slate-600">
                {searchTerm
                  ? 'Prueba con otro criterio de busqueda.'
                  : 'Todavia no hay clientes registrados.'}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-100">
                      <tr className="text-left text-[12px] font-semibold text-slate-700">
                        <th className="px-4 py-2">Cliente</th>
                        <th className="px-4 py-2">Correo</th>
                        <th className="px-4 py-2">Telefono</th>
                        <th className="px-4 py-2">Documento</th>
                        <th className="px-4 py-2">Direccion</th>
                        <th className="px-4 py-2">Codigo postal</th>
                        <th className="px-4 py-2">Pedidos</th>
                        <th className="px-4 py-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-[12px] text-slate-700">
                      {clientesActuales.map((cliente, index) => (
                        <tr
                          key={cliente.idCliente}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                        >
                          <td className="px-4 py-2.5">
                            <div className="min-w-[14rem]">
                              <p className="font-semibold text-slate-900">
                                {cliente.nombreCliente} {cliente.apellidoCliente}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                ID {cliente.idCliente}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">{cliente.emailCliente}</td>
                          <td className="px-4 py-2.5">{cliente.telefonoCliente || 'No registrado'}</td>
                          <td className="px-4 py-2.5">{cliente.numeroDocCliente}</td>
                          <td className="px-4 py-2.5">{cliente.direccionCliente || 'No registrada'}</td>
                          <td className="px-4 py-2.5">{cliente.codigoPostalCliente || 'No asignado'}</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                              {cliente.totalPedidos ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <button
                                id={`boton_editar_listado_cliente_tabla_${cliente.idCliente}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 boton_editar_listado_cliente_tabla"
                                onClick={() => navigate(`/editarCliente/${cliente.idCliente}`)}
                                title="Editar cliente"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                id={`boton_eliminar_listado_cliente_tabla_${cliente.idCliente}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 boton_eliminar_listado_cliente_tabla"
                                onClick={() => navigate(`/eliminarCliente/${cliente.idCliente}`)}
                                title="Eliminar cliente"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {clientesActuales.map((cliente) => (
                  <article
                    key={cliente.idCliente}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                          Cliente
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">
                          {cliente.nombreCliente} {cliente.apellidoCliente}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{cliente.emailCliente}</p>
                      </div>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {cliente.totalPedidos ?? 0} pedidos
                      </span>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-slate-900">Telefono</dt>
                        <dd className="mt-1">{cliente.telefonoCliente || 'No registrado'}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Documento</dt>
                        <dd className="mt-1">{cliente.numeroDocCliente}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-slate-900">Direccion</dt>
                        <dd className="mt-1">{cliente.direccionCliente || 'No registrada'}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Codigo postal</dt>
                        <dd className="mt-1">{cliente.codigoPostalCliente || 'No asignado'}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        id={`boton_editar_listado_cliente_tarjeta_${cliente.idCliente}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 boton_editar_listado_cliente_tarjeta"
                        onClick={() => navigate(`/editarCliente/${cliente.idCliente}`)}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        id={`boton_eliminar_listado_cliente_tarjeta_${cliente.idCliente}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 boton_eliminar_listado_cliente_tarjeta"
                        onClick={() => navigate(`/eliminarCliente/${cliente.idCliente}`)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-2">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      id="boton_paginacion_anterior_cliente"
                      className={`${buttonBaseClass} bg-white px-4 py-3 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 focus:ring-slate-200 boton_paginacion_anterior_cliente`}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>

                    <span className="text-center text-sm font-semibold text-slate-700 sm:text-left">
                      Pagina {currentPage} de {totalPaginas}
                    </span>

                    <button
                      id="boton_paginacion_siguiente_cliente"
                      className={`${buttonBaseClass} bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_100%)] px-4 py-3 text-white shadow-lg shadow-sky-500/20 focus:ring-sky-200 boton_paginacion_siguiente_cliente`}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))}
                      disabled={currentPage === totalPaginas}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="text-sm text-slate-600">
                      Mostrando {filteredClientes.length === 0 ? 0 : indexOfFirstCliente + 1} a{' '}
                      {Math.min(indexOfLastCliente, filteredClientes.length)} de {filteredClientes.length} clientes
                    </span>

                    {totalPaginas > 1 ? (
                      <select
                        id="selector_pagina_cliente"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                        value={currentPage}
                        onChange={(event) => setCurrentPage(Number(event.target.value))}
                      >
                        {Array.from({ length: totalPaginas }, (_, index) => index + 1).map((pageNumber) => (
                          <option key={pageNumber} value={pageNumber}>
                            Pagina {pageNumber}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-4 flex justify-center md:justify-end">
            <button
              id="boton_volver_menu_cliente_desde_listado"
              className={`${buttonBaseClass} bg-slate-900 px-5 py-3 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 focus:ring-slate-300 boton_volver_menu_cliente_desde_listado`}
              onClick={() => navigate('/clientes')}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Menu Clientes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Listarcliente;
