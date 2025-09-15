import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  UserPlus,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/auth-context';
import usersService from '../services/users';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export default function GestionUsuariosPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getAllUsers();
      
      if (response.success) {
        setUsers(response.users);
        setError('');
      } else {
        setError(response.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setDeleteLoading(true);
      const response = await usersService.deleteUser(userId);
      
      if (response.success) {
        setUsers(users.filter(u => u._id !== userId));
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        setError(response.error || 'Error al eliminar usuario');
      }
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cc.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'guardia': return 'bg-green-100 text-green-800';
      case 'estudiante': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'instructor': return 'Instructor';
      case 'guardia': return 'Guardia';
      case 'estudiante': return 'Estudiante';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sena-soft-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Gestión de Usuarios
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Administra los usuarios del sistema
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/registrar-usuario')}
            className="bg-sena-soft-600 hover:bg-sena-soft-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nombre, email o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sena-soft-500 focus:border-transparent"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="instructor">Instructor</option>
                  <option value="guardia">Guardia</option>
                  <option value="estudiante">Estudiante</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sena-soft-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-sena-soft-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {user.nombre}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        CC: {user.cc}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedUser(selectedUser === user._id ? null : user._id)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {selectedUser === user._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                        <button
                          onClick={() => navigate(`/dashboard/usuarios/${user._id}/editar`)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {user.estado || 'Activo'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || filterRole !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay usuarios registrados en el sistema'
              }
            </p>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Eliminar Usuario
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser.nombre}</strong>?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={deleteLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Eliminando...
                    </div>
                  ) : (
                    'Eliminar'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}