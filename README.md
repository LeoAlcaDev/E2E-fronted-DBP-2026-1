# UberFake — Frontend

Frontend web para el backend tipo Uber del curso (CS2031 DBP). Es una aplicación de una sola página hecha en React que consume los 12 endpoints del backend y cubre las 7 pantallas de la rúbrica.

Está construido con Vite, React, TypeScript, TailwindCSS v4, React Router y Axios. La sesión del usuario se maneja con Context API.

## Requisitos

Antes de abrir el frontend, el backend tiene que estar corriendo en `http://localhost:8080`. Desde la carpeta del backend (`cs2031-2026-1-week14-e2e-2`):

```bash
./mvnw spring-boot:run
```

El backend usa una base de datos en memoria, así que cada vez que se reinicia vuelve a cargar los usuarios y viajes de prueba.

## Cómo levantar el frontend

Desde esta carpeta:

```bash
pnpm install
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173`. El backend ya acepta peticiones desde cualquier origen, así que no hay que configurar nada más.

Para comprobar que el proyecto compila sin errores de tipos:

```bash
pnpm build
```

## Usuarios de prueba

Todos usan la contraseña `pass123`.

| Email | Rol |
|-------|-----|
| carlos@uber.com | Conductor (disponible) |
| pedro@uber.com | Conductor (disponible) |
| lucia@uber.com | Conductor (ocupado) |
| ana@uber.com | Pasajero |
| mario@uber.com | Pasajero |
| sofia@uber.com | Pasajero |

## Cómo probar el flujo completo

La forma más clara de ver todo funcionando es abrir dos sesiones a la vez: una como pasajero y otra como conductor, por ejemplo una ventana normal y otra en incógnito.

1. Entra como pasajero (`ana@uber.com`) y pide un viaje con un origen y un destino. El viaje queda en estado PENDING y te lleva a su detalle, que se va actualizando solo.
2. En la otra ventana entra como conductor (`carlos@uber.com`). En su panel aparece el viaje pendiente. Dale a Aceptar: el viaje pasa a IN_PROGRESS y el conductor queda ocupado.
3. Abre el detalle del viaje como conductor y dale a Completar viaje. El viaje pasa a COMPLETED.
4. Vuelve a la ventana del pasajero. El detalle se actualiza solo a COMPLETED y aparece el formulario de calificación. Elige las estrellas, escribe un comentario opcional y envíalo.
5. Entra a Historial desde cualquiera de los dos roles: la tabla lista los viajes y puedes filtrarlos por estado.

## Verificación de la rúbrica (20 puntos)

Cada fila indica la pantalla, cómo comprobarla y los endpoints del backend que consume. Entre todas las pantallas se usan los 12 endpoints.

| Pantalla | Cómo verificarla | Endpoints |
|----------|------------------|-----------|
| Login y registro | Inicia sesión o crea una cuenta eligiendo el rol; el token se guarda y te redirige según seas pasajero o conductor | POST /auth/register, POST /auth/login, GET /users/me |
| Panel del pasajero | Muestra tu nombre, el botón para pedir viaje y la lista de tus viajes con su estado | GET /users/me, GET /trips |
| Solicitar viaje | Antes de confirmar ves los conductores disponibles con su rating; al confirmar te lleva al detalle del viaje creado | GET /drivers/available, POST /trips |
| Detalle del viaje (pasajero) | Muestra el viaje, el conductor asignado y el estado; se actualiza solo mientras está en curso y deja calificar cuando termina | GET /trips/{id}, POST /trips/{id}/rate |
| Panel del conductor | Muestra tu rating, el viaje activo y la lista de viajes pendientes con el botón para aceptarlos | GET /users/me, GET /trips/pending, GET /trips/my, PATCH /trips/{id}/accept |
| Detalle del viaje (conductor) | Muestra los datos del pasajero y el botón para completar el viaje; al terminar muestra el resumen | GET /trips/{id}, PATCH /trips/{id}/complete |
| Historial | Tabla de viajes de ambos roles con filtro por estado | GET /trips, GET /trips/my |

## Estructura del proyecto

```
src/
  api/axios.ts        instancia de axios con los interceptores de token y de errores
  auth/               contexto de sesión y protección de rutas
  components/         StatusBadge, StarRating y el layout con la cabecera
  pages/              las 7 pantallas de la rúbrica
  types.ts            tipos del dominio
  ui.ts               clases de Tailwind reutilizables y el formato de fechas
  App.tsx             rutas
  main.tsx            punto de entrada
```
