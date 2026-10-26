// Página inicial de cada papel.
export function rotaInicial(papel) {
  return papel === 'admin' ? '/inicio-admin' : '/inicio'
}