import http from 'k6/http';
import { sleep, check } from 'k6';
import { SharedArray } from 'k6/data';

var hostname = __ENV.HOSTNAME;
if (hostname == null) hostname = 'localhost:5001';

export const options = {
    stages: [
        { duration: '5s', target: 200 },  // ramp-up (subida en 5 minutos)
        { duration: '30s', target: 200 }, // stable (mantiene 200 usuarios durante 15 minutos)
        { duration: '5s', target: 0 },    // ramp-down to 0 users (bajada en 5 minutos)
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],    // Menos del 1% de errores
        http_req_duration: ['p(95)<500'],  // El 95% de las peticiones por debajo de 500ms
    },
};

const endpoints = new SharedArray('social_endpoints', function () {
    return ['youtube', 'github', 'twitter'];
});

export default () => {
    // Selecciona una ruta aleatoria: 'youtube', 'github' o 'twitter'
    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    
    // Ejecuta la petición GET parametrizada a un endpoint que SÍ existe
    const res = http.get(`http://${hostname}/${randomEndpoint}`);
    
    // Validación de la respuesta HTTP 200 OK
    check(res, { '200': (r) => r.status === 200 });
    
    sleep(1);
};
