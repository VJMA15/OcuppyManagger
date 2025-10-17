// Mapa de ocupaciones ficticias para modo invitado
// Clave: ID del ambiente
// Valor: objeto con claves de día de la semana (0=Dom,1=Lun,...,6=Sáb) o '*' para regla general
// Cada día mapea a un arreglo de jornadas ocupadas: ['mañana','tarde','noche']

export const guestOcupaciones = {
  'guest-amb-001': {
    1: ['mañana'],      // Lunes
    3: ['mañana'],      // Miércoles
    4: ['tarde']        // Jueves
  },
  'guest-amb-002': {
    1: ['tarde'],       // Lunes
    2: ['mañana']       // Martes
  },
  'guest-amb-003': {
    1: ['mañana','tarde'], // Lunes
    2: ['tarde'],          // Martes
    3: ['mañana','noche'], // Miércoles
    4: ['tarde'],          // Jueves
    5: ['mañana']          // Viernes
  },
  'guest-amb-004': {
    5: ['mañana']       // Viernes
  },
  'guest-amb-005': {
    '*': []             // Mantenimiento, sin ocupaciones
  },
  'guest-amb-006': {
    2: ['tarde'],       // Martes
    4: ['mañana']       // Jueves
  }
};