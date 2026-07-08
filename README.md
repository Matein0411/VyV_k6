<div align="center">

# ESCUELA POLITÉCNICA NACIONAL

**Facultad de Ingeniería de Sistemas**

### Verificación y Validación de Software

**Grupo 3**

# Práctica: Pruebas de Rendimiento con k6

</div>

## Índice

1. [Introducción](#1-introducción)
2. [Objetivos](#2-objetivos)
3. [Herramientas Utilizadas](#3-herramientas-utilizadas)
4. [Instalación del Entorno](#4-instalación-del-entorno)
   - 4.1 [Instalación de k6](#41-instalación-de-k6)
   - 4.2 [Preparación del Proyecto y API Mock](#42-preparación-del-proyecto-y-api-mock)
5. [Introducción a k6](#5-introducción-a-k6)
6. [Load Testing](#6-load-testing)
7. [Stress Testing](#7-stress-testing)
8. [Spike Testing](#8-spike-testing)
9. [Soak Testing](#9-soak-testing)
10. [Notas y Advertencias Generales](#10-notas-y-advertencias-generales)
11. [Conclusiones](#11-conclusiones)
12. [Referencias](#12-referencias)

## 1. Introducción

Esta práctica tiene como finalidad el aprendizaje y aplicación de **k6**, una herramienta de código abierto desarrollada por Grafana Labs para realizar pruebas de rendimiento sobre APIs y servicios web. A lo largo de la práctica se abordan los cuatro tipos principales de prueba que ofrece k6 — *Load*, *Stress*, *Spike* y *Soak Testing* — aplicados sobre una API simulada (*mock*) construida localmente, con el fin de observar y analizar el comportamiento del sistema ante distintos patrones de carga.

## 2. Objetivos

- Comprender los conceptos fundamentales de las pruebas de rendimiento y sus diferencias.
- Instalar y configurar k6 en un entorno Windows.
- Construir una API mock local que permita practicar sin depender de un servicio externo real.
- Diseñar e implementar scripts de k6 para cada tipo de prueba: Load, Stress, Spike y Soak Testing.
- Ejecutar cada prueba e interpretar las métricas obtenidas (latencia, tasa de error, usuarios virtuales).
- Identificar en qué escenarios reales se aplicaría cada tipo de prueba.

## 3. Herramientas Utilizadas

| Herramienta | Uso |
|---|---|
| **k6** | Ejecución de las pruebas de rendimiento |
| **Node.js / Express** | Construcción de la API mock local |
| **PowerShell / CMD** | Ejecución de comandos en Windows |
| **winget** | Gestor de paquetes para instalar k6 |

## 4. Instalación del Entorno

### 4.1 Instalación de k6

En Windows, se utilizó el gestor de paquetes `winget`:

```powershell
winget install k6 --source winget
```

<div align="center">

<img width="820" height="154" alt="Instalación de k6 mediante winget en PowerShell" src="https://github.com/user-attachments/assets/9df6b5c2-5b0b-4f58-af9d-a76174fafc45" />

*Figura 1. Instalación de k6 mediante winget*

</div>

> [!TIP]
> Si al finalizar la instalación el comando `k6 version` no es reconocido, es necesario **cerrar y volver a abrir** la terminal para que se actualicen las variables de entorno (PATH).

### 4.2 Preparación del Proyecto y API Mock

Se creó una carpeta de trabajo con los archivos base del proyecto (`server.js`, `package.json` y un script `.js` por cada tipo de prueba). Se instalaron las dependencias y se levantó el servidor mock, el cual queda corriendo durante **toda la práctica** en una terminal aparte, mientras en otra se ejecuta cada script de k6:

```powershell
npm install
node server.js
```

<div align="center">

<img width="844" height="333" alt="Servidor mock corriendo en localhost:5001" src="https://github.com/user-attachments/assets/e8d11cc2-c068-4bf5-914a-fa967a8d0a12" />

*Figura 2. API mock corriendo correctamente en `localhost:5001`*

</div>

> [!IMPORTANT]
> Si al ejecutar `npm install` aparece el error *"running scripts is disabled on this system"*, se debe habilitar la ejecución de scripts locales con:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> Alternativamente, se puede usar **CMD** en lugar de PowerShell, ya que no aplica esta restricción.

> [!IMPORTANT]
> Si Windows Defender solicita permisos para Node.js, debe **permitirse el acceso**, o k6 no podrá conectarse al servidor local.

La API mock expone tres endpoints simulados (`/youtube`, `/github`, `/twitter`) con **latencia variable** (50-200 ms) y **degradación progresiva**: a partir de cierto número de peticiones concurrentes, el tiempo de respuesta aumenta, simulando el comportamiento de un servidor real acercándose a su límite de capacidad.

## 5. Introducción a k6

k6 permite definir, mediante un script de JavaScript, un patrón de carga (`options.stages`) que indica cuántos **usuarios virtuales (VUs)** deben estar activos en cada momento de la prueba, y una función principal (`export default`) que cada VU ejecuta en bucle — típicamente una o varias peticiones HTTP seguidas de una pausa (`sleep`) que simula el tiempo de uso real de una persona.

Cada uno de los siguientes cuatro tipos de prueba se diferencia, principalmente, en **cómo se configura el arreglo `stages`**.

> [!NOTE]
> **Sobre los tiempos usados en esta práctica:** por motivos de tiempo de clase, las duraciones de los `stages` en los scripts siguientes se configuraron en **segundos** en lugar de minutos u horas. Esto permite completar la demostración en pocos minutos. **En un entorno real de pruebas, lo recomendable es usar duraciones mucho mayores** (minutos para Load/Stress/Spike, y horas para Soak), ya que se necesita tiempo suficiente para que el sistema estabilice su comportamiento bajo cada nivel de carga antes de sacar conclusiones.

## 6. Load Testing

**Objetivo:** verificar que el sistema responde correctamente bajo una carga **esperada / normal** de uso, sin llevarlo al límite.

```javascript
import http from 'k6/http';
import { sleep } from 'k6';


};
```

**Ejecución:**
```powershell
k6 run load-test.js
```

**Resultado esperado:** con una carga de 50 VUs (por debajo del umbral de degradación de la API mock, configurado en 150), la latencia debe mantenerse estable y `http_req_failed` en 0%, confirmando que el sistema opera con normalidad bajo carga esperada.

<div align="center">

*(Insertar aquí la captura de resultados obtenida al ejecutar `k6 run load-test.js`)*

**Figura 3. Resultados de la ejecución de Load Testing**

</div>

## 7. Stress Testing

**Objetivo:** incrementar progresivamente la carga **más allá** de lo esperado, con el fin de encontrar el punto de quiebre (*breaking point*) del sistema.

```javascript
import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  insecureSkipTLSVerify: true,
  noConnectionReuse: false,
  stages: [
    { duration: '2m', target: 100 },  // below normal load
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },  // normal load
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },  // around the breaking point
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 },  // beyond the breaking point
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 },   // scale down. Recovery stage.
  ],
};

const API_BASE_URL = 'http://localhost:5001';

export default () => {
  http.batch([
    ['GET', `${API_BASE_URL}/youtube`],
    ['GET', `${API_BASE_URL}/github`],
    ['GET', `${API_BASE_URL}/twitter`],
  ]);
  sleep(1);
};
```

**Ejecución:**
```powershell
k6 run stress-test.js
```

> [!NOTE]
> Esta fue la versión **completa** ejecutada inicialmente en la práctica (duración total: 38 minutos, incluyendo *graceful stop*), con las duraciones originales en minutos. Posteriormente se ejecutó también una **versión corta** (segundos, tope de 300 VUs) para efectos de demostración en clase; con carga sostenida corta, la API mock no siempre alcanza a mostrar errores, ya que necesita mantener el pico de concurrencia el tiempo suficiente para superar el umbral de degradación. El objetivo específico de un Stress Test es precisamente sostener cada nivel de carga el tiempo suficiente para observar la degradación real del sistema — por eso lo ideal sigue siendo usar minutos.

<div align="center">

*(Insertar aquí la captura de la ejecución en progreso y del resumen final de métricas)*

**Figura 4. Ejecución de la prueba de Stress Testing**

</div>

**Resultado esperado:** la latencia (`http_req_duration`) debe crecer de forma notoria a partir de los 300-400 VUs, y `http_req_failed` debe comenzar a mostrar un porcentaje de error mayor a 0%, evidenciando el punto de quiebre de la API mock (configurado a partir de 300 peticiones concurrentes).

## 8. Spike Testing

**Objetivo:** evaluar la reacción del sistema ante un incremento **repentino y abrupto** de tráfico (a diferencia del incremento gradual del Stress Testing), simulando por ejemplo un evento viral o una promoción inesperada.

```javascript
import http from 'k6/http';
import { sleep } from 'k6';

};
```

**Ejecución:**
```powershell
k6 run spike-test.js
```

**Resultado esperado:** durante el pico de 500 VUs se debe observar un incremento súbito de latencia y una probable aparición de errores 503 (simulados en la API mock a partir de 300 peticiones concurrentes), seguido de una recuperación una vez la carga desciende a 20 VUs.

<div align="center">

*(Insertar aquí la captura de resultados obtenida al ejecutar `k6 run spike-test.js`)*

**Figura 5. Resultados de la ejecución de Spike Testing**

</div>

## 9. Soak Testing

**Objetivo:** mantener una carga **moderada y constante** durante un **periodo prolongado**, con el fin de detectar problemas que solo se manifiestan a largo plazo, como fugas de memoria (*memory leaks*) o degradación progresiva del rendimiento.

```javascript
import http from 'k6/http';
import { sleep } from 'k6';


};
```

**Ejecución:**
```powershell
k6 run soak-test.js
```

> [!WARNING]
> Un Soak Test real se ejecuta durante **horas o incluso días**, no minutos. La versión de esta práctica se acortó drásticamente (a segundos/minutos) únicamente con fines demostrativos dentro del tiempo de clase. Para un análisis válido de fugas de memoria o degradación a largo plazo, **es indispensable ejecutar la prueba durante el tiempo real recomendado**.

<div align="center">

*(Insertar aquí la captura de resultados obtenida al ejecutar `k6 run soak-test.js`)*

**Figura 6. Resultados de la ejecución de Soak Testing**

</div>

**Resultado esperado:** con una carga moderada de 50 VUs sostenida en el tiempo, la latencia debe mantenerse estable y sin tendencia creciente. Si se observara un aumento progresivo del tiempo de respuesta a lo largo de la ejecución (incluso sin subir el número de VUs), sería un indicio de degradación o fuga de recursos en el sistema.

## 10. Notas y Advertencias Generales

> [!NOTE]
> La API utilizada en toda la práctica es un **mock local**, no un servicio real. Los tiempos de respuesta y fallos están simulados con fines didácticos, no representan el comportamiento real de YouTube, GitHub o Twitter.

> [!CAUTION]
> Se recomienda **no ejecutar pruebas de estrés, spike o soak reales contra servicios de terceros** sin autorización explícita, ya que puede considerarse un ataque de denegación de servicio (DoS).

> [!TIP]
> Todos los scripts de esta práctica usan duraciones reducidas por motivos de tiempo de clase. Antes de replicar estas pruebas sobre un sistema real, ajustar los `stages` a duraciones representativas (minutos para Load/Stress/Spike, horas para Soak).

## 11. Conclusiones

- k6 permite modelar de forma sencilla y declarativa distintos patrones de carga mediante `stages`, adaptando solo la configuración según el tipo de prueba requerido.
- El uso de una API mock local resultó una alternativa práctica para aprender el flujo completo de las cuatro pruebas sin depender de un servicio externo ni arriesgar afectar sistemas de producción.
- Cada tipo de prueba responde a un objetivo distinto: Load valida el comportamiento normal, Stress busca el límite del sistema, Spike evalúa la reacción ante picos súbitos, y Soak detecta problemas de largo plazo. Comprender estas diferencias es clave para elegir la prueba adecuada según el escenario real que se quiera validar.

## 12. Referencias

- Documentación oficial de k6: [https://k6.io/docs/](https://k6.io/docs/)