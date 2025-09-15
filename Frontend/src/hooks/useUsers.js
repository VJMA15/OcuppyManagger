import { useState, useEffect } from 'react';
import usersService from '../services/users';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getAllUsers();
      
      if (response.success) {
        setUsers(response.users);
      } else {
        setError(response.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (userData) => {
    try {
      const response = await usersService.createUser(userData);
      if (response.success) {
        setUsers(prev => [...prev, response.user]);
        return response;
      } else {
        throw new Error(response.error || 'Error al crear usuario');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const response = await usersService.updateUser(id, userData);
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === id ? response.user : user
        ));
        return response;
      } else {
        throw new Error(response.error || 'Error al actualizar usuario');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await usersService.deleteUser(id);
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== id));
        return response;
      } else {
        throw new Error(response.error || 'Error al eliminar usuario');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  const getUserById = async (id) => {
    try {
      const response = await usersService.getUserById(id);
      if (response.success) {
        return response.user;
      } else {
        throw new Error(response.error || 'Error al obtener usuario');
      }
    } catch (err) {
      console.error('Error getting user by id:', err);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById
  };
};

export default useUsers;