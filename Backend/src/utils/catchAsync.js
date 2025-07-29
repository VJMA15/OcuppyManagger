/**
 * Envuelve una función asíncrona para manejar errores de manera centralizada
 * @param {Function} fn - Función asíncrona a envolver
 * @returns {Function} Función middleware que maneja errores
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
