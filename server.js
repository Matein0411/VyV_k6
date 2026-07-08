const express = require('express');
const app = express();

const PORT = 5001;

// Contador simple para ver la carga concurrente en tiempo real en la consola
let activeRequests = 0;

// Middleware para simular latencia variable y logging básico
function simulateWork(req, res, next) {
  activeRequests++;
  const start = Date.now();

  // Latencia base + variacion aleatoria (simula un endpoint real con trabajo)
  const baseDelay = 50 + Math.random() * 150; // 50ms - 200ms

  // A partir de cierta carga concurrente, el servidor se "degrada"
  const degradationPenalty = activeRequests > 150 ? (activeRequests - 150) * 5 : 0;
  const delay = baseDelay + degradationPenalty;

  setTimeout(() => {
    activeRequests--;
    const duration = Date.now() - start;

    // Simula fallos ocasionales cuando hay mucha carga concurrente (breaking point)
    if (activeRequests > 300 && Math.random() < 0.3) {
      return res.status(503).json({ error: 'Service Unavailable', activeRequests });
    }

    req._duration = duration;
    next();
  }, delay);
}

app.use(simulateWork);

app.get('/youtube', (req, res) => {
  res.status(200).json({
    source: 'youtube',
    message: 'Datos simulados de YouTube',
    ms: req._duration,
    activeRequests,
  });
});

app.get('/github', (req, res) => {
  res.status(200).json({
    source: 'github',
    message: 'Datos simulados de GitHub',
    ms: req._duration,
    activeRequests,
  });
});

app.get('/twitter', (req, res) => {
  res.status(200).json({
    source: 'twitter',
    message: 'Datos simulados de Twitter',
    ms: req._duration,
    activeRequests,
  });
});

// Endpoint de salud para verificar que el server esta arriba
app.get('/', (req, res) => {
  res.status(200).send('Mock API corriendo. Endpoints: /youtube, /github, /twitter');
});

app.listen(PORT, () => {
  console.log(`Mock API escuchando en http://localhost:${PORT}`);
  console.log('Endpoints disponibles: /youtube, /github, /twitter');
});
