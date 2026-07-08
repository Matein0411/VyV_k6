import http from 'k6/http';
import { sleep, check } from 'k6';
import { SharedArray } from 'k6/data';

var hostname = __ENV.HOSTNAME;
if (hostname == null) hostname = 'localhost:5157';

export const options = {
    stages: [
        { duration: '5m', target: 200 },  // ramp-up (subida en 5 minutos)
        { duration: '15m', target: 200 }, // stable (mantiene 200 usuarios durante 15 minutos)
        { duration: '5m', target: 0 },    // ramp-down to 0 users (bajada en 5 minutos)
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],    // Menos del 1% de errores
        http_req_duration: ['p(95)<500'],  // El 95% de las peticiones por debajo de 500ms
    },
};

// Bloque SharedArray con datos de ejemplo
const dates = new SharedArray('dates', function () {
    return ['18', '25', '30', '40', '50', '65'];
});

export default () => {
    // Selecciona un parámetro aleatorio del SharedArray
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    
    // Ejecuta la petición GET parametrizada
    const res = http.get(`http://${hostname}/age/${randomDate}`);
    
    // Validación de la respuesta HTTP 200
    check(res, { '200': (r) => r.status === 200 });
    
    sleep(1);
};
