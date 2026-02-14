# GUÍA DE RESPONSES DE CINEA API

Documento completo con la estructura de todos los responses de las APIs de CINEA para usar en el desarrollo del frontend.

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Cines (Cinemas)](#cines-cinemas)
3. [Películas (Movies)](#películas-movies)
4. [Salas (Rooms)](#salas-rooms)
5. [Funciones (Screenings)](#funciones-screenings)
6. [Entradas (Tickets)](#entradas-tickets)
7. [Códigos de Estado HTTP](#códigos-de-estado-http)
8. [Errores Comunes](#errores-comunes)

---

## Autenticación

### Headers requeridos para rutas protegidas
```http
Authorization: Bearer {token}
Content-Type: application/json
```

### Obtener usuario autenticado
**Endpoint:** `GET /api/user`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "email_verified_at": "2025-12-17T10:30:00.000000Z",
  "created_at": "2025-12-17T10:30:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z"
}
```

---

## Cines (Cinemas)

### 1. Listar todos los cines
**Endpoint:** `GET /api/cinemas`

**Query Parameters:**
- Ninguno (retorna todos los cines activos)

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Cine Avenida Principal",
    "city": "Madrid",
    "address": "Avenida Principal 100",
    "phone": "+34 91 234 5678",
    "email": "info@cineavenida.es",
    "latitude": 40.4168,
    "longitude": -3.7038,
    "description": "Cine moderno con 5 salas IMAX",
    "is_active": true,
    "created_at": "2025-12-01T08:00:00.000000Z",
    "updated_at": "2025-12-01T08:00:00.000000Z",
    "rooms": [
      {
        "id": 1,
        "cinema_id": 1,
        "number": "1",
        "name": "Sala 1",
        "total_seats": 200,
        "type": "3D",
        "rows": 10,
        "columns": 20,
        "description": "Sala 3D Premium",
        "is_active": true,
        "created_at": "2025-12-01T08:00:00.000000Z",
        "updated_at": "2025-12-01T08:00:00.000000Z"
      }
    ]
  }
]
```

### 2. Obtener cine específico
**Endpoint:** `GET /api/cinemas/{cinema_id}`

**Response (200):**
```json
{
  "id": 1,
  "name": "Cine Avenida Principal",
  "city": "Madrid",
  "address": "Avenida Principal 100",
  "phone": "+34 91 234 5678",
  "email": "info@cineavenida.es",
  "latitude": 40.4168,
  "longitude": -3.7038,
  "description": "Cine moderno con 5 salas IMAX",
  "is_active": true,
  "created_at": "2025-12-01T08:00:00.000000Z",
  "updated_at": "2025-12-01T08:00:00.000000Z",
  "rooms": [
    {
      "id": 1,
      "cinema_id": 1,
      "number": "1",
      "name": "Sala 1",
      "total_seats": 200,
      "type": "3D",
      "rows": 10,
      "columns": 20,
      "description": "Sala 3D Premium",
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z",
      "screenings": [
        {
          "id": 1,
          "movie_id": 1,
          "room_id": 1,
          "start_time": "2025-12-20 19:30:00",
          "end_time": "2025-12-20 21:30:00",
          "price": 15.50,
          "format": "3D",
          "available_seats": 150,
          "is_active": true,
          "created_at": "2025-12-01T08:00:00.000000Z",
          "updated_at": "2025-12-01T08:00:00.000000Z",
          "movie": {
            "id": 1,
            "title": "Película Ejemplo",
            "genre": "Acción",
            "duration": 120,
            "rating": "PG-13",
            "poster_url": "https://example.com/poster.jpg"
          }
        }
      ]
    }
  ]
}
```

### 3. Crear cine
**Endpoint:** `POST /api/cinemas`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Cine Nuevo",
  "city": "Barcelona",
  "address": "Calle Principal 789",
  "phone": "+34 93 456 7890",
  "email": "info@cinenuevo.es",
  "latitude": 41.3851,
  "longitude": 2.1734,
  "description": "Cine moderno",
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "Cine Nuevo",
  "city": "Barcelona",
  "address": "Calle Principal 789",
  "phone": "+34 93 456 7890",
  "email": "info@cinenuevo.es",
  "latitude": 41.3851,
  "longitude": 2.1734,
  "description": "Cine moderno",
  "is_active": true,
  "created_at": "2025-12-17T10:30:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z"
}
```

**Response (422 - Validation Error):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name has already been taken."],
    "city": ["The city field is required."]
  }
}
```

### 4. Actualizar cine
**Endpoint:** `PUT /api/cinemas/{cinema_id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Cine Actualizado",
  "description": "Actualización de descripción",
  "phone": "+34 93 456 7891"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Cine Actualizado",
  "city": "Madrid",
  "address": "Avenida Principal 100",
  "phone": "+34 93 456 7891",
  "email": "info@cineavenida.es",
  "latitude": 40.4168,
  "longitude": -3.7038,
  "description": "Actualización de descripción",
  "is_active": true,
  "created_at": "2025-12-01T08:00:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z"
}
```

### 5. Eliminar cine
**Endpoint:** `DELETE /api/cinemas/{cinema_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Cinema deleted successfully"
}
```

---

## Películas (Movies)

### 1. Listar películas
**Endpoint:** `GET /api/movies`

**Query Parameters:**
- `page`: número de página (default: 1)
- `per_page`: resultados por página (default: 15)
- `genre`: filtrar por género (opcional)
- `is_active`: filtrar por estado activo (opcional)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "El Viaje Extraordinario",
      "description": "Una película emocionante sobre un viaje intergaláctico",
      "genre": "Ciencia Ficción",
      "duration": 140,
      "rating": "PG-13",
      "director": "Steven Spielberg",
      "cast": "Tom Cruise, Zendaya",
      "language": "es",
      "poster_url": "https://example.com/poster1.jpg",
      "trailer_url": "https://example.com/trailer1.mp4",
      "release_date": "2025-11-20",
      "end_date": "2025-12-20",
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z"
    },
    {
      "id": 2,
      "title": "Acción Extrema",
      "description": "Película de acción pura",
      "genre": "Acción",
      "duration": 130,
      "rating": "R",
      "director": "Michael Bay",
      "cast": "Dwayne Johnson, Jason Statham",
      "language": "es",
      "poster_url": "https://example.com/poster2.jpg",
      "trailer_url": "https://example.com/trailer2.mp4",
      "release_date": "2025-12-01",
      "end_date": "2025-12-31",
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/movies?page=1",
    "last": "http://localhost:8000/api/movies?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/movies?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "http://localhost:8000/api/movies",
    "per_page": 15,
    "to": 15,
    "total": 75
  }
}
```

### 2. Obtener película específica
**Endpoint:** `GET /api/movies/{movie_id}`

**Response (200):**
```json
{
  "id": 1,
  "title": "El Viaje Extraordinario",
  "description": "Una película emocionante sobre un viaje intergaláctico",
  "genre": "Ciencia Ficción",
  "duration": 140,
  "rating": "PG-13",
  "director": "Steven Spielberg",
  "cast": "Tom Cruise, Zendaya",
  "language": "es",
  "poster_url": "https://example.com/poster1.jpg",
  "trailer_url": "https://example.com/trailer1.mp4",
  "release_date": "2025-11-20",
  "end_date": "2025-12-20",
  "is_active": true,
  "created_at": "2025-12-01T08:00:00.000000Z",
  "updated_at": "2025-12-01T08:00:00.000000Z",
  "screenings": [
    {
      "id": 1,
      "movie_id": 1,
      "room_id": 1,
      "start_time": "2025-12-20 19:30:00",
      "end_time": "2025-12-20 21:50:00",
      "price": 15.50,
      "format": "3D",
      "available_seats": 150,
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z",
      "room": {
        "id": 1,
        "cinema_id": 1,
        "number": "1",
        "name": "Sala 1",
        "total_seats": 200,
        "type": "3D",
        "rows": 10,
        "columns": 20,
        "cinema": {
          "id": 1,
          "name": "Cine Avenida Principal",
          "city": "Madrid",
          "address": "Avenida Principal 100"
        }
      }
    }
  ]
}
```

### 3. Crear película
**Endpoint:** `POST /api/movies`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Nueva Película",
  "description": "Una película emocionante",
  "genre": "Drama",
  "duration": 150,
  "rating": "PG-13",
  "director": "Director Famoso",
  "cast": "Actor 1, Actor 2, Actor 3",
  "language": "es",
  "poster_url": "https://example.com/poster.jpg",
  "trailer_url": "https://example.com/trailer.mp4",
  "release_date": "2025-12-20",
  "end_date": "2026-01-20",
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 10,
  "title": "Nueva Película",
  "description": "Una película emocionante",
  "genre": "Drama",
  "duration": 150,
  "rating": "PG-13",
  "director": "Director Famoso",
  "cast": "Actor 1, Actor 2, Actor 3",
  "language": "es",
  "poster_url": "https://example.com/poster.jpg",
  "trailer_url": "https://example.com/trailer.mp4",
  "release_date": "2025-12-20",
  "end_date": "2026-01-20",
  "is_active": true,
  "created_at": "2025-12-17T10:30:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z"
}
```

### 4. Actualizar película
**Endpoint:** `PUT /api/movies/{movie_id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Título Actualizado",
  "description": "Descripción actualizada",
  "rating": "R"
}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Título Actualizado",
  "description": "Descripción actualizada",
  "genre": "Ciencia Ficción",
  "duration": 140,
  "rating": "R",
  "director": "Steven Spielberg",
  "cast": "Tom Cruise, Zendaya",
  "language": "es",
  "poster_url": "https://example.com/poster1.jpg",
  "trailer_url": "https://example.com/trailer1.mp4",
  "release_date": "2025-11-20",
  "end_date": "2025-12-20",
  "is_active": true,
  "created_at": "2025-12-01T08:00:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z"
}
```

### 5. Eliminar película
**Endpoint:** `DELETE /api/movies/{movie_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Movie deleted successfully"
}
```

---

## Salas (Rooms)

### 1. Listar salas
**Endpoint:** `GET /api/rooms`

**Query Parameters:**
- `cinema_id`: filtrar por cine (opcional)
- `page`: número de página (default: 1)
- `per_page`: resultados por página (default: 15)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "cinema_id": 1,
      "number": "1",
      "name": "Sala 1",
      "total_seats": 200,
      "type": "3D",
      "rows": 10,
      "columns": 20,
      "description": "Sala 3D Premium",
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z",
      "cinema": {
        "id": 1,
        "name": "Cine Avenida Principal",
        "city": "Madrid"
      }
    },
    {
      "id": 2,
      "cinema_id": 1,
      "number": "2",
      "name": "Sala 2",
      "total_seats": 150,
      "type": "IMAX",
      "rows": 10,
      "columns": 15,
      "description": "Sala IMAX de gran pantalla",
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z",
      "cinema": {
        "id": 1,
        "name": "Cine Avenida Principal",
        "city": "Madrid"
      }
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### 2. Obtener sala con asientos
**Endpoint:** `GET /api/rooms/{room_id}`

**Response (200):**
```json
{
  "id": 1,
  "cinema_id": 1,
  "number": "1",
  "name": "Sala 1",
  "total_seats": 200,
  "type": "3D",
  "rows": 10,
  "columns": 20,
  "description": "Sala 3D Premium",
  "is_active": true,
  "created_at": "2025-12-01T08:00:00.000000Z",
  "updated_at": "2025-12-01T08:00:00.000000Z",
  "cinema": {
    "id": 1,
    "name": "Cine Avenida Principal",
    "city": "Madrid",
    "address": "Avenida Principal 100"
  },
  "seats": [
    {
      "id": 1,
      "room_id": 1,
      "row_number": 1,
      "seat_number": 1,
      "seat_code": "A1",
      "type": "vip",
      "price_modifier": 1.5,
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z"
    },
    {
      "id": 2,
      "room_id": 1,
      "row_number": 1,
      "seat_number": 2,
      "seat_code": "A2",
      "type": "vip",
      "price_modifier": 1.5,
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z"
    },
    {
      "id": 11,
      "room_id": 1,
      "row_number": 2,
      "seat_number": 1,
      "seat_code": "B1",
      "type": "standard",
      "price_modifier": 1.0,
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z"
    }
  ]
}
```

### 3. Crear sala
**Endpoint:** `POST /api/rooms`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "cinema_id": 1,
  "number": "5",
  "name": "Sala 5",
  "total_seats": 300,
  "type": "3D",
  "rows": 15,
  "columns": 20,
  "description": "Sala moderna con 3D",
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 5,
  "cinema_id": 1,
  "number": "5",
  "name": "Sala 5",
  "total_seats": 300,
  "type": "3D",
  "rows": 15,
  "columns": 20,
  "description": "Sala moderna con 3D",
  "is_active": true,
  "created_at": "2025-12-17T10:30:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z",
  "seats": [
    {
      "id": 301,
      "room_id": 5,
      "row_number": 1,
      "seat_number": 1,
      "seat_code": "A1",
      "type": "vip",
      "price_modifier": 1.5,
      "is_active": true,
      "created_at": "2025-12-17T10:30:00.000000Z",
      "updated_at": "2025-12-17T10:30:00.000000Z"
    }
  ]
}
```

### 4. Actualizar sala
**Endpoint:** `PUT /api/rooms/{room_id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Sala Premium 3D",
  "description": "Actualización de descripción",
  "is_active": true
}
```

**Response (200):**
```json
{
  "id": 1,
  "cinema_id": 1,
  "number": "1",
  "name": "Sala Premium 3D",
  "total_seats": 200,
  "type": "3D",
  "rows": 10,
  "columns": 20,
  "description": "Actualización de descripción",
  "is_active": true,
  "created_at": "2025-12-01T08:00:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z"
}
```

### 5. Eliminar sala
**Endpoint:** `DELETE /api/rooms/{room_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Room deleted successfully"
}
```

---

## Funciones (Screenings)

### 1. Listar funciones
**Endpoint:** `GET /api/screenings`

**Query Parameters:**
- `movie_id`: filtrar por película (opcional)
- `cinema_id`: filtrar por cine (opcional)
- `date`: filtrar por fecha (formato: YYYY-MM-DD, opcional)
- `page`: número de página (default: 1)
- `per_page`: resultados por página (default: 20)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "movie_id": 1,
      "room_id": 1,
      "start_time": "2025-12-20 19:30:00",
      "end_time": "2025-12-20 21:50:00",
      "price": 15.50,
      "format": "3D",
      "available_seats": 150,
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z",
      "movie": {
        "id": 1,
        "title": "El Viaje Extraordinario",
        "genre": "Ciencia Ficción",
        "duration": 140,
        "poster_url": "https://example.com/poster1.jpg"
      },
      "room": {
        "id": 1,
        "number": "1",
        "name": "Sala 1",
        "type": "3D",
        "total_seats": 200,
        "cinema": {
          "id": 1,
          "name": "Cine Avenida Principal",
          "city": "Madrid"
        }
      }
    },
    {
      "id": 2,
      "movie_id": 1,
      "room_id": 2,
      "start_time": "2025-12-20 22:00:00",
      "end_time": "2025-12-21 00:20:00",
      "price": 12.50,
      "format": "2D",
      "available_seats": 100,
      "is_active": true,
      "created_at": "2025-12-01T08:00:00.000000Z",
      "updated_at": "2025-12-01T08:00:00.000000Z",
      "movie": {
        "id": 1,
        "title": "El Viaje Extraordinario",
        "genre": "Ciencia Ficción",
        "duration": 140,
        "poster_url": "https://example.com/poster1.jpg"
      },
      "room": {
        "id": 2,
        "number": "2",
        "name": "Sala 2",
        "type": "IMAX",
        "total_seats": 150,
        "cinema": {
          "id": 1,
          "name": "Cine Avenida Principal",
          "city": "Madrid"
        }
      }
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### 2. Obtener función específica
**Endpoint:** `GET /api/screenings/{screening_id}`

**Response (200):**
```json
{
  "id": 1,
  "movie_id": 1,
  "room_id": 1,
  "start_time": "2025-12-20 19:30:00",
  "end_time": "2025-12-20 21:50:00",
  "price": 15.50,
  "format": "3D",
  "available_seats": 150,
  "is_active": true,
  "created_at": "2025-12-01T08:00:00.000000Z",
  "updated_at": "2025-12-01T08:00:00.000000Z",
  "movie": {
    "id": 1,
    "title": "El Viaje Extraordinario",
    "description": "Una película emocionante sobre un viaje intergaláctico",
    "genre": "Ciencia Ficción",
    "duration": 140,
    "rating": "PG-13",
    "director": "Steven Spielberg",
    "cast": "Tom Cruise, Zendaya",
    "poster_url": "https://example.com/poster1.jpg"
  },
  "room": {
    "id": 1,
    "cinema_id": 1,
    "number": "1",
    "name": "Sala 1",
    "type": "3D",
    "total_seats": 200
  },
  "tickets": [
    {
      "id": 1,
      "screening_id": 1,
      "user_id": 1,
      "seat_id": 1,
      "ticket_number": "TKT-20251220-ABC12345",
      "price": 23.25,
      "status": "confirmed",
      "created_at": "2025-12-17T10:30:00.000000Z",
      "updated_at": "2025-12-17T10:30:00.000000Z",
      "seat": {
        "id": 1,
        "room_id": 1,
        "row_number": 1,
        "seat_number": 1,
        "seat_code": "A1",
        "type": "vip",
        "price_modifier": 1.5
      }
    }
  ]
}
```

### 3. Obtener asientos disponibles
**Endpoint:** `GET /api/screenings/{screening_id}/available-seats`

**Response (200):**
```json
{
  "screening_id": 1,
  "available_seats_count": 150,
  "seats": [
    {
      "id": 1,
      "seat_code": "A1",
      "type": "vip",
      "row_number": 1,
      "seat_number": 1
    },
    {
      "id": 2,
      "seat_code": "A2",
      "type": "vip",
      "row_number": 1,
      "seat_number": 2
    },
    {
      "id": 11,
      "seat_code": "B1",
      "type": "standard",
      "row_number": 2,
      "seat_number": 1
    },
    {
      "id": 12,
      "seat_code": "B2",
      "type": "standard",
      "row_number": 2,
      "seat_number": 2
    }
  ]
}
```

### 4. Crear función
**Endpoint:** `POST /api/screenings`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "movie_id": 1,
  "room_id": 1,
  "start_time": "2025-12-20 19:30:00",
  "end_time": "2025-12-20 21:50:00",
  "price": 15.50,
  "format": "3D",
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 10,
  "movie_id": 1,
  "room_id": 1,
  "start_time": "2025-12-20 19:30:00",
  "end_time": "2025-12-20 21:50:00",
  "price": 15.50,
  "format": "3D",
  "available_seats": 200,
  "is_active": true,
  "created_at": "2025-12-17T10:30:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z"
}
```

### 5. Actualizar función
**Endpoint:** `PUT /api/screenings/{screening_id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "price": 12.50,
  "format": "2D",
  "is_active": true
}
```

**Response (200):**
```json
{
  "id": 1,
  "movie_id": 1,
  "room_id": 1,
  "start_time": "2025-12-20 19:30:00",
  "end_time": "2025-12-20 21:50:00",
  "price": 12.50,
  "format": "2D",
  "available_seats": 150,
  "is_active": true,
  "created_at": "2025-12-01T08:00:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z"
}
```

### 6. Eliminar función
**Endpoint:** `DELETE /api/screenings/{screening_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Screening deleted successfully"
}
```

---

## Entradas (Tickets)

### 1. Listar mis entradas
**Endpoint:** `GET /api/tickets`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: número de página (default: 1)
- `per_page`: resultados por página (default: 10)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "screening_id": 1,
      "user_id": 1,
      "seat_id": 1,
      "ticket_number": "TKT-20251217-ABC12345",
      "price": 23.25,
      "status": "confirmed",
      "created_at": "2025-12-17T10:30:00.000000Z",
      "updated_at": "2025-12-17T10:30:00.000000Z",
      "screening": {
        "id": 1,
        "movie_id": 1,
        "room_id": 1,
        "start_time": "2025-12-20 19:30:00",
        "end_time": "2025-12-20 21:50:00",
        "price": 15.50,
        "format": "3D",
        "movie": {
          "id": 1,
          "title": "El Viaje Extraordinario",
          "genre": "Ciencia Ficción",
          "duration": 140,
          "poster_url": "https://example.com/poster1.jpg"
        },
        "room": {
          "id": 1,
          "name": "Sala 1",
          "cinema": {
            "id": 1,
            "name": "Cine Avenida Principal",
            "city": "Madrid"
          }
        }
      },
      "seat": {
        "id": 1,
        "seat_code": "A1",
        "type": "vip",
        "row_number": 1,
        "seat_number": 1
      }
    },
    {
      "id": 2,
      "screening_id": 1,
      "user_id": 1,
      "seat_id": 2,
      "ticket_number": "TKT-20251217-XYZ98765",
      "price": 23.25,
      "status": "confirmed",
      "created_at": "2025-12-17T10:30:00.000000Z",
      "updated_at": "2025-12-17T10:30:00.000000Z",
      "screening": {...},
      "seat": {
        "id": 2,
        "seat_code": "A2",
        "type": "vip",
        "row_number": 1,
        "seat_number": 2
      }
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### 2. Obtener entrada específica
**Endpoint:** `GET /api/tickets/{ticket_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "screening_id": 1,
  "user_id": 1,
  "seat_id": 1,
  "ticket_number": "TKT-20251217-ABC12345",
  "price": 23.25,
  "status": "confirmed",
  "created_at": "2025-12-17T10:30:00.000000Z",
  "updated_at": "2025-12-17T10:30:00.000000Z",
  "screening": {
    "id": 1,
    "movie_id": 1,
    "room_id": 1,
    "start_time": "2025-12-20 19:30:00",
    "end_time": "2025-12-20 21:50:00",
    "price": 15.50,
    "format": "3D",
    "available_seats": 150,
    "is_active": true,
    "movie": {
      "id": 1,
      "title": "El Viaje Extraordinario",
      "description": "Una película emocionante",
      "genre": "Ciencia Ficción",
      "duration": 140,
      "rating": "PG-13",
      "director": "Steven Spielberg",
      "cast": "Tom Cruise, Zendaya",
      "poster_url": "https://example.com/poster1.jpg"
    },
    "room": {
      "id": 1,
      "cinema_id": 1,
      "number": "1",
      "name": "Sala 1",
      "type": "3D",
      "total_seats": 200,
      "cinema": {
        "id": 1,
        "name": "Cine Avenida Principal",
        "city": "Madrid",
        "address": "Avenida Principal 100"
      }
    }
  },
  "seat": {
    "id": 1,
    "room_id": 1,
    "row_number": 1,
    "seat_number": 1,
    "seat_code": "A1",
    "type": "vip",
    "price_modifier": 1.5,
    "is_active": true
  }
}
```

### 3. Comprar entradas (Crear)
**Endpoint:** `POST /api/tickets`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "screening_id": 1,
  "seat_ids": [1, 2, 3]
}
```

**Response (201):**
```json
{
  "message": "Tickets created successfully",
  "tickets": [
    {
      "id": 10,
      "screening_id": 1,
      "user_id": 1,
      "seat_id": 1,
      "ticket_number": "TKT-20251217-XYZ12345",
      "price": 23.25,
      "status": "confirmed",
      "created_at": "2025-12-17T10:30:00.000000Z",
      "updated_at": "2025-12-17T10:30:00.000000Z",
      "seat": {
        "id": 1,
        "seat_code": "A1",
        "type": "vip",
        "row_number": 1,
        "seat_number": 1
      },
      "screening": {
        "id": 1,
        "movie_id": 1,
        "title": "El Viaje Extraordinario"
      }
    },
    {
      "id": 11,
      "screening_id": 1,
      "user_id": 1,
      "seat_id": 2,
      "ticket_number": "TKT-20251217-ABC98765",
      "price": 23.25,
      "status": "confirmed",
      "created_at": "2025-12-17T10:30:00.000000Z",
      "updated_at": "2025-12-17T10:30:00.000000Z",
      "seat": {
        "id": 2,
        "seat_code": "A2",
        "type": "vip",
        "row_number": 1,
        "seat_number": 2
      },
      "screening": {
        "id": 1,
        "movie_id": 1,
        "title": "El Viaje Extraordinario"
      }
    },
    {
      "id": 12,
      "screening_id": 1,
      "user_id": 1,
      "seat_id": 3,
      "ticket_number": "TKT-20251217-DEF54321",
      "price": 15.50,
      "status": "confirmed",
      "created_at": "2025-12-17T10:30:00.000000Z",
      "updated_at": "2025-12-17T10:30:00.000000Z",
      "seat": {
        "id": 3,
        "seat_code": "A3",
        "type": "standard",
        "row_number": 1,
        "seat_number": 3
      },
      "screening": {
        "id": 1,
        "movie_id": 1,
        "title": "El Viaje Extraordinario"
      }
    }
  ]
}
```

**Response (422 - Asientos no disponibles):**
```json
{
  "message": "One or more seats are already booked"
}
```

### 4. Mis entradas para una función específica
**Endpoint:** `GET /api/screenings/{screening_id}/my-tickets`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "screening_id": 1,
    "user_id": 1,
    "seat_id": 1,
    "ticket_number": "TKT-20251217-ABC12345",
    "price": 23.25,
    "status": "confirmed",
    "created_at": "2025-12-17T10:30:00.000000Z",
    "updated_at": "2025-12-17T10:30:00.000000Z",
    "seat": {
      "id": 1,
      "seat_code": "A1",
      "type": "vip",
      "row_number": 1,
      "seat_number": 1
    }
  },
  {
    "id": 2,
    "screening_id": 1,
    "user_id": 1,
    "seat_id": 2,
    "ticket_number": "TKT-20251217-XYZ98765",
    "price": 23.25,
    "status": "confirmed",
    "created_at": "2025-12-17T10:30:00.000000Z",
    "updated_at": "2025-12-17T10:30:00.000000Z",
    "seat": {
      "id": 2,
      "seat_code": "A2",
      "type": "vip",
      "row_number": 1,
      "seat_number": 2
    }
  }
]
```

### 5. Cancelar entrada
**Endpoint:** `DELETE /api/tickets/{ticket_id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Ticket cancelled successfully"
}
```

**Response (422 - Entrada ya cancelada):**
```json
{
  "message": "Ticket is already cancelled"
}
```

**Response (422 - Función ya pasó):**
```json
{
  "message": "Cannot cancel a ticket for a past screening"
}
```

---

## Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| **200** | OK | La solicitud fue exitosa |
| **201** | Created | El recurso fue creado exitosamente |
| **400** | Bad Request | La solicitud tiene un formato inválido |
| **401** | Unauthorized | Se requiere autenticación |
| **403** | Forbidden | No tiene permisos para acceder al recurso |
| **404** | Not Found | El recurso no fue encontrado |
| **422** | Unprocessable Entity | Datos de validación inválidos |
| **500** | Internal Server Error | Error interno del servidor |

---

## Errores Comunes

### 1. Error de Validación
**Status:** 422

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email must be a valid email address."],
    "seat_ids": ["The seat_ids field is required."]
  }
}
```

### 2. No Autorizado
**Status:** 401

```json
{
  "message": "Unauthorized"
}
```

### 3. Recurso No Encontrado
**Status:** 404

```json
{
  "message": "Not Found"
}
```

### 4. Conflicto - Nombre Duplicado
**Status:** 422

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name has already been taken."]
  }
}
```

### 5. Asientos No Disponibles
**Status:** 422

```json
{
  "message": "One or more seats are already booked"
}
```

---

## Notas Importantes

1. **Paginación:** Todos los endpoints que retornan listas incluyen paginación. Usa `page` y `per_page` para navegar.

2. **Dates:** Los timestamps se retornan en formato ISO 8601 (UTC). Las fechas sin hora son en formato YYYY-MM-DD.

3. **Moneda:** Los precios están en euros (€).

4. **Tipos de Asientos:**
   - `vip`: Asientos premium (primera y última fila)
   - `standard`: Asientos estándar

5. **Estados de Entradas:**
   - `confirmed`: Entrada confirmada
   - `cancelled`: Entrada cancelada

6. **Modificador de Precio:** Los asientos VIP tienen un multiplicador de 1.5x sobre el precio base de la función.

7. **Autenticación:** Usa Sanctum API tokens. Incluye el token en el header `Authorization: Bearer {token}`.

8. **CORS:** La API está configurada para aceptar requests desde el frontend.

---

## Ejemplos de Uso en JavaScript/TypeScript

```javascript
// Obtener todas las películas
async function getMovies() {
  const response = await fetch('/api/movies');
  return response.json();
}

// Obtener películas específicas
async function getMovie(movieId) {
  const response = await fetch(`/api/movies/${movieId}`);
  return response.json();
}

// Comprar entradas (requiere token)
async function buyTickets(screeningId, seatIds, token) {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      screening_id: screeningId,
      seat_ids: seatIds
    })
  });
  return response.json();
}

// Obtener mis entradas
async function getMyTickets(token) {
  const response = await fetch('/api/tickets', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// Obtener asientos disponibles
async function getAvailableSeats(screeningId) {
  const response = await fetch(`/api/screenings/${screeningId}/available-seats`);
  return response.json();
}
```

---

**Última actualización:** 17 de diciembre de 2025
