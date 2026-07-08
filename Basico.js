import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Configuración del escenario
export let options = {
  vus: 5,          // Subimos un poquito a 5 usuarios virtuales
  duration: '10s', // 10 segundos para que alcancen a ver los resultados en vivo
};

// 2. Comportamiento del usuario
export default function () {
  // Guardamos la respuesta del servidor en una variable
  let res = http.get('http://localhost:5001/youtube');
  
  // ¡EL EFECTO WOW! Validamos que el servidor cumpla nuestros criterios
  check(res, {
    'el estado es 200 (OK)': (r) => r.status === 200,
    'responde en menos de 200ms': (r) => r.timings.duration < 200,
  });
  
  // Pausa simulando al usuario
  sleep(1);
}
