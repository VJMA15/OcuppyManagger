import ApiService from './apiService';
import API_CONFIG from '@/config/api';

class AuthService extends ApiService {
  async verifyUser(cc, password) {
    // ... existing code ...
  }

  isAuthenticated() {
    // ... existing code ...
  }

  getUser() {
    // ... existing code ...
  }

  logout() {
    // ... existing code ...
  }
}

const authService = new AuthService();
export default authService;