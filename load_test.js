import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 50 }, // sube progresivamente hasta 50 usuarios
        { duration: '20s', target: 50 }, // mantiene 50 usuarios como carga normal
        { duration: '10s', target: 0 },  // baja progresivamente hasta 0 usuarios
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],      // menos del 5% de errores
        http_req_duration: ['p(95)<1000'],   // 95% de respuestas deben completarse en menos de 1 segundo
    },
};

export default () => {
    let response = http.get('http://localhost:5001/youtube');

    sleep(1);
};