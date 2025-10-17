import { useAuthContext } from '../../contexts/auth-context';

function AccesosPage() {
  const { user, isAuthenticated } = useAuthContext();
  
  console.log('AccesosPage está renderizando');
  console.log('Usuario:', user);
  console.log('Autenticado:', isAuthenticated);
  console.log('Rol del usuario:', user?.role);
  
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '600', 
          color: '#1e293b', 
          marginBottom: '8px',
          letterSpacing: '-0.025em'
        }}>
          Control de Accesos
        </h1>
        
        <p style={{ 
          color: '#64748b', 
          fontSize: '16px', 
          marginBottom: '32px'
        }}>
          Monitoreo y gestión de accesos en tiempo real
        </p>
        
        {/* Panel de información del usuario */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ color: '#475569', fontSize: '14px', margin: '0' }}>
            <strong>Usuario:</strong> {user?.nombre || 'No definido'} | 
            <strong>Rol:</strong> {user?.role || 'No definido'} | 
            <strong>Estado:</strong> {isAuthenticated ? 'Autenticado' : 'No autenticado'}
          </p>
        </div>
        
        {/* Estadísticas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px', 
          marginBottom: '32px' 
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '24px', 
            borderRadius: '12px', 
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#10b981', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px auto'
            }}>
              <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: '600' }}>✓</span>
            </div>
            <h3 style={{ color: '#374151', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accesos Permitidos</h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: '0' }}>15</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '24px', 
            borderRadius: '12px', 
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#ef4444', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px auto'
            }}>
              <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: '600' }}>✕</span>
            </div>
            <h3 style={{ color: '#374151', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accesos Denegados</h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: '0' }}>3</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '24px', 
            borderRadius: '12px', 
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px auto'
            }}>
              <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: '600' }}>#</span>
            </div>
            <h3 style={{ color: '#374151', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Accesos</h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: '0' }}>18</p>
          </div>
        </div>
        
        {/* Lista de accesos recientes */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1e293b', 
              margin: '0'
            }}>
              Actividad Reciente
            </h2>
          </div>
          
          <div style={{ padding: '0' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 24px', 
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#64748b', fontSize: '16px' }}>👤</span>
                </div>
                <div>
                  <p style={{ color: '#1e293b', fontSize: '14px', fontWeight: '500', margin: '0' }}>Juan Pérez</p>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>Aula 203 • Hace 5 min</p>
                </div>
              </div>
              <span style={{ 
                color: '#10b981', 
                fontWeight: '600', 
                fontSize: '12px',
                backgroundColor: '#ecfdf5',
                padding: '4px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Permitido</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 24px', 
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#64748b', fontSize: '16px' }}>👤</span>
                </div>
                <div>
                  <p style={{ color: '#1e293b', fontSize: '14px', fontWeight: '500', margin: '0' }}>María García</p>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>Laboratorio • Hace 12 min</p>
                </div>
              </div>
              <span style={{ 
                color: '#ef4444', 
                fontWeight: '600', 
                fontSize: '12px',
                backgroundColor: '#fef2f2',
                padding: '4px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Denegado</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#64748b', fontSize: '16px' }}>👤</span>
                </div>
                <div>
                  <p style={{ color: '#1e293b', fontSize: '14px', fontWeight: '500', margin: '0' }}>Carlos López</p>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: '0' }}>Oficina • Hace 18 min</p>
                </div>
              </div>
              <span style={{ 
                color: '#10b981', 
                fontWeight: '600', 
                fontSize: '12px',
                backgroundColor: '#ecfdf5',
                padding: '4px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Permitido</span>
            </div>
          </div>
        </div>
        
        {/* Footer con timestamp */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#ffffff', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0' }}>
            Última actualización: {new Date().toLocaleString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccesosPage;
