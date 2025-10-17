import React, { useMemo, useState } from 'react';
import { BarChart3, Calendar, FileText, Search, Users as UsersIcon } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export default function RegistrosUsuariosPage() {
  const { users, loading, error } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('todos');

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const inicioDeSemana = (d = new Date()) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // ajustar lunes
    const inicio = new Date(date.setDate(diff));
    inicio.setHours(0,0,0,0);
    return inicio;
  };

  const inicioDeMes = (d = new Date()) => {
    const date = new Date(d.getFullYear(), d.getMonth(), 1);
    date.setHours(0,0,0,0);
    return date;
  };

  const filteredUsers = useMemo(() => {
    const hoyStr = new Date().toDateString();
    const inicioSemana = inicioDeSemana();
    const inicioMes = inicioDeMes();

    return (users || []).filter(u => {
      const matchesSearch = (
        (u.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.cc || '').includes(searchTerm)
      );
      const matchesRole = filterRole === 'todos' || u.role === filterRole;

      let matchesFecha = true;
      if (filterFecha !== 'todos') {
        const created = new Date(u.createdAt);
        switch (filterFecha) {
          case 'hoy':
            matchesFecha = created.toDateString() === hoyStr; break;
          case 'semana':
            matchesFecha = created >= inicioSemana; break;
          case 'mes':
            matchesFecha = created >= inicioMes; break;
          default:
            matchesFecha = true;
        }
      }

      return matchesSearch && matchesRole && matchesFecha;
    });
  }, [users, searchTerm, filterRole, filterFecha]);

  const stats = useMemo(() => {
    const total = (users || []).length;
    const hoyStr = new Date().toDateString();
    const inicioSemana = inicioDeSemana();
    const inicioMes = inicioDeMes();

    const creadosHoy = (users || []).filter(u => new Date(u.createdAt).toDateString() === hoyStr).length;
    const creadosSemana = (users || []).filter(u => new Date(u.createdAt) >= inicioSemana).length;
    const creadosMes = (users || []).filter(u => new Date(u.createdAt) >= inicioMes).length;

    const porRol = (users || []).reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    const porMes = (users || []).reduce((acc, u) => {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const serieMensual = Object.entries(porMes)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([mes, cantidad]) => ({ mes, cantidad }));

    return { total, creadosHoy, creadosSemana, creadosMes, porRol, serieMensual };
  }, [users]);

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registros de Usuarios</h1>
              <p className="text-gray-600 dark:text-gray-300">Visualiza usuarios creados, estadísticas y actividad relacionada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuarios</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
              </div>
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Creados Hoy</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.creadosHoy}</h3>
              </div>
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Semana</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.creadosSemana}</h3>
              </div>
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mes</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.creadosMes}</h3>
              </div>
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, email o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="instructor">Instructor</option>
              <option value="guardia">Guardia</option>
              <option value="estudiante">Estudiante</option>
            </select>
            <select
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="todos">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Usuarios creados ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cédula</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha de creación</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.cc}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatearFecha(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Bitácora eliminada por no aportar funcionalidad en esta vista */}
    </div>
  );
}