import http from 'k6/http';
import { sleep, check } from 'k6';
import { SharedArray } from 'k6/data';

const endpoints = new SharedArray('rutas de la api', function () {
  return ['/youtube', '/github', '/twitter'];
});

export const options = {
  stages: [
    { duration: '5s', target: 20 },   // 1. Base tranquila (5 segundos)
    { duration: '5s', target: 1500 },  // 2. ¡EL GOLPE! Sube a 1500 usuarios en solo 5 segundos
    { duration: '20s', target: 1500 }, // 3. Mantiene el pico por 20 segundos (Suficiente para colapsar la API)
    { duration: '5s', target: 20 },   // 4. Bajada drástica en 5 segundos
    { duration: '10s', target: 0 },   // 5. Enfriamiento final
  ],
};

export default function () {
  const rutaAleatoria = endpoints[Math.floor(Math.random() * endpoints.length)];
  const respuesta = http.get(`http://localhost:5001${rutaAleatoria}`);
  
  check(respuesta, {
    'Respuesta exitosa (200 OK)': (r) => r.status === 200,
    'Servidor saturado (503 Unavailable)': (r) => r.status === 503,
  });

  sleep(1);
}