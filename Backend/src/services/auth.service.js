const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

class AuthService {
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }
  
  static async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 401);
      }
      
      return user;
    } catch (error) {
      throw new AppError('Token inválido', 401);
    }
  }
  
  static async login(cc, password) {
    const user = await User.findOne({ cc }).select('+password');
    
    if (!user || !(await user.compararPassword(password))) {
      throw new AppError('Credenciales incorrectas', 401);
    }
    
    const token = this.generateToken(user._id);
    user.password = undefined;
    
    return { user, token };
  }
}

module.exports = AuthService;