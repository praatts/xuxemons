# Xuxemons API Documentation

**Base URL:** `http://localhost:8000/api`

**Autenticación:** JWT Bearer Token en la cabecera `Authorization: Bearer <token>`  
Las rutas marcadas con 🔒 requieren token. Las marcadas con 🛡️ requieren rol `admin`.

---

## Índice

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Inventario](#inventario)
- [Xuxedex](#xuxedex)
- [Xuxemons](#xuxemons)
- [Notificaciones](#notificaciones)
- [Amistades](#amistades)
- [Configuración (Admin)](#configuración-admin)
- [Enfermedades (Admin)](#enfermedades-admin)

---

## Autenticación

### `POST /api/register`
Registra un nuevo usuario.

**Body (JSON):**
```json
{
  "player_id": "#NomJugador1234",
  "name": "Albert",
  "surname": "Prat",
  "email": "albert@example.com",
  "password": "secret123",
  "role": "user",
  "pfp": "https://..."
}
```

> `player_id` debe seguir el patrón `#[A-Za-z0-9]+[0-9]{4}` (p.ej. `#Albert1234`).  
> `role`: `user` | `admin`  
> `pfp` es opcional (se asigna una imagen por defecto).

**Response `200`:**
```json
{
  "token": "<jwt_token>",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": { ...UserResource }
}
```

---

### `POST /api/login`
Inicia sesión y devuelve un JWT.

**Body (JSON):**
```json
{
  "email": "albert@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "token": "<jwt_token>",
  "user_id": 1,
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `401`  | Credenciales incorrectas |
| `403`  | Usuario inactivo (status = 0) |

---

### `POST /api/logout` 🔒
Invalida el token JWT y marca al usuario como inactivo.

**Response `200`:**
```json
{ "message": "Successfully logged out" }
```

---

### `GET /api/check-email`
Comprueba si un email ya está registrado.

**Query param:** `email=albert@example.com`

**Response `200`:**
```json
{ "exists": true }
```

---

## Usuarios

### `GET /api/profile` 🔒
Devuelve el perfil del usuario autenticado.

**Response `200`:**
```json
{
  "id": 1,
  "player_id": "#Albert1234",
  "name": "Albert",
  "surname": "Prat",
  "email": "albert@example.com",
  "role": "user",
  "pfp": "https://...",
  "level": 0,
  "xp": 0,
  "active": true,
  "active_friends": 0,
  "streak": 0,
  "status": 1
}
```

---

### `GET /api/users` 🔒
Lista todos los usuarios con `status = 1` (activos).

**Response `200`:** Array de UserResource.

---

### `PUT /api/update` 🔒
Actualiza el perfil del usuario autenticado.

**Body (JSON, campos opcionales):**
```json
{
  "name": "Nou nom",
  "surname": "Nou cognom",
  "email": "nou@example.com",
  "pfp": "https://...",
  "password": "novacontrasenya"
}
```

**Response `200`:** Objeto usuario actualizado.

---

### `DELETE /api/user` 🔒
Desactiva la cuenta del usuario autenticado (`status = 0`, soft delete).  
No se puede eliminar un usuario con rol `admin`.

**Response `200`:**
```json
{ "message": "User deleted successfully" }
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `403`  | El usuario es admin y no se puede eliminar |

---

### `GET /api/users/all` 🔒🛡️
Lista **todos** los usuarios (activos e inactivos).

**Response `200`:** Array de UserResource.

---

### `POST /api/users/{id}/restore` 🔒🛡️
Reactiva un usuario desactivado (`status = 0 → 1`).

**Response `200`:**
```json
{
  "message": "User restored successfully",
  "user": { ...usuario }
}
```

---

### `DELETE /api/users/{id}/delete` 🔒🛡️
Desactiva un usuario por ID (`status = 1 → 0`, soft delete).  
No se puede desactivar un admin.

**Response `200`:**
```json
{ "message": "User deactivated successfully" }
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `403`  | El usuario es admin |
| `404`  | Usuario no encontrado |

---

## Inventario

### `GET /api/inventory` 🔒
Devuelve el inventario completo del usuario autenticado (con datos del xuxemon e item de cada slot).

**Response `200`:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "item_id": 2,
    "xuxe_id": null,
    "quantity": 5,
    "item": { "id": 2, "name": "Xuxe verda", ... },
    "xuxemon": null
  }
]
```

---

### `GET /api/inventory/users` 🔒
Devuelve la lista de todos los jugadores (rol `user`, activos) para uso administrativo.

**Response `200`:** Array de usuarios.

---

### `GET /api/inventory/slots/{user}` 🔒
Devuelve el número de slots disponibles en el inventario del usuario indicado.

**Param:** `{user}` → ID del usuario.

**Response `200`:**
```json
{ "available_slots": 4 }
```

---

### `GET /api/inventory/items` 🔒🛡️
Devuelve todos los items disponibles en la base de datos.

**Response `200`:**
```json
[
  { "id": 1, "name": "Xuxe verda", "stackable": true, "max_capacity": 10, ... }
]
```

---

### `POST /api/inventory/add-item/{user}` 🔒🛡️
Añade uno o varios items al inventario de un usuario.

**Param:** `{user}` → ID del usuario.

**Body (JSON):**
```json
{
  "item_id": 1,
  "quantity": 3
}
```

**Response `200` (stackable):**
```json
{
  "message": "Se han añadido 3 correctamente",
  "added": 3
}
```

**Response `200` (inventario lleno parcialmente):**
```json
{
  "message": "Solo se han podido añadir 2 items, los 1 restantes no se han añadido",
  "added": 2
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `403`  | No autorizado o inventario lleno |

---

### `POST /api/inventory/{slot_id}/evolve` 🔒
Evoluciona 3 xuxes del mismo slot al tamaño siguiente (`petit → mitja → gran`).

**Param:** `{slot_id}` → ID del slot de inventario.

**Response `200`:**
```json
{
  "message": "Evolució completada!",
  "evolved_into": {
    "id": 5,
    "name": "Xuxemon de foc",
    "type": "foc",
    "size": "mitja"
  }
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `404`  | Slot o xuxemon no encontrado |
| `422`  | El xuxemon ya es `gran` o no tienes 3 unidades |

---

## Xuxedex

### `GET /api/xuxedex/all` 🔒
Devuelve todos los xuxemons de la base de datos (sin información de propiedad).

**Response `200`:**
```json
[
  { "id": 1, "name": "Xuxemon de foc", "type": "foc", "size": "petit" }
]
```

---

### `GET /api/xuxedex` 🔒
Devuelve todos los xuxemons indicando cuáles posee el usuario autenticado.

**Response `200`:**
```json
[
  {
    "id": 1,
    "name": "Xuxemon de foc",
    "type": "foc",
    "size": "petit",
    "owned": true
  }
]
```

---

### `GET /api/xuxedex/users` 🔒
Devuelve la lista de todos los usuarios (id, player_id, name) para la gestión de la xuxedex.

**Response `200`:**
```json
[
  { "id": 1, "player_id": "#Albert1234", "name": "Albert" }
]
```

---

### `GET /api/xuxedex/owned` 🔒
Devuelve los xuxemons capturados por el usuario autenticado, con sus enfermedades.

**Response `200`:**
```json
[
  {
    "owned_xuxemon_id": 3,
    "id": 1,
    "name": "Xuxemon de foc",
    "xuxemon_id": 1,
    "number_xuxes": 2,
    "size": "petit",
    "owned": true,
    "type": "foc",
    "illnesses": []
  }
]
```

---

### `GET /api/xuxedex/owned/{user_id}` 🔒🛡️
Devuelve los xuxemons capturados de un usuario concreto (admin).

**Param:** `{user_id}` → ID del usuario.

**Response `200`:**
```json
[
  {
    "owned_xuxemon_id": 3,
    "id": 1,
    "name": "Xuxemon de foc",
    "illnesses": []
  }
]
```

---

### `POST /api/xuxedex/add-random/{user_id}` 🔒
Añade un xuxemon aleatorio de la base de datos al usuario indicado.

**Param:** `{user_id}` → ID del usuario.

**Response `201`:**
```json
{
  "owned_xuxemon_id": 7,
  "id": 3,
  "name": "Xuxemon d'aigua",
  "xuxemon_id": 3,
  "number_xuxes": 0,
  "size": "petit",
  "owned": true,
  "type": "aigua"
}
```

---

### `POST /api/xuxedex/{owned_id}/illness` 🔒🛡️
Añade una enfermedad a un xuxemon capturado.

**Param:** `{owned_id}` → ID del OwnedXuxemon.

**Body (JSON):**
```json
{ "illness": "bajon_azucar" }
```

> Valores válidos: `bajon_azucar` | `atracon`

**Response `200`:**
```json
{ "message": "Enfermedad añadida correctamente" }
```

---

### `DELETE /api/xuxedex/{owned_id}/illness/{illness}` 🔒🛡️
Elimina una enfermedad de un xuxemon capturado.

**Params:** `{owned_id}` → ID del OwnedXuxemon, `{illness}` → nombre de la enfermedad.

**Response `200`:**
```json
{ "message": "Malaltia eliminada correctament" }
```

---

## Xuxemons

### `POST /api/xuxemons/{id}/xuxe` 🔒
Da una xuxe a un xuxemon capturado del usuario. Consume un item del inventario y puede desencadenar una evolución o una infección aleatoria.

**Param:** `{id}` → `owned_xuxemon_id`.

**Body (JSON):**
```json
{ "type": "verda" }
```

> Tipos válidos: `verda` | `blava` | `vermella`

**Response `200`:**
```json
{
  "xuxes": 3,
  "size": "petit",
  "new_illnesses": [
    "Bajón de azúcar: no infectat (tret: 45%)",
    "Atracón: infectat! (tret: 12%)"
  ],
  "illnesses": [ { "id": 2, "name": "Atracón", ... } ]
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `400`  | Tipo de xuxe inválido, sin stock, xuxemon `gran` o con Atracón |
| `404`  | Item no encontrado |

---

### `POST /api/xuxemons/{owned_id}/vaccinate` 🔒
Aplica una vacuna del inventario del usuario a un xuxemon para curar una enfermedad.

**Param:** `{owned_id}` → `owned_xuxemon_id`.

**Body (JSON):**
```json
{ "item_id": 4 }
```

**Response `200`:**
```json
{
  "message": "Vacuna aplicada correctament",
  "cured": "S'ha curat la enfermetat: Atracón",
  "illnesses": []
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `400`  | El item es stackable (no es vacuna), sin stock, xuxemon sin enfermedades o la vacuna no aplica |
| `404`  | Xuxemon no encontrado |

---

## Notificaciones

### `GET /api/notifications` 🔒
Devuelve todas las notificaciones del usuario autenticado, ordenadas de más reciente a más antigua.

**Response `200`:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "message": "Has recibido una solicitud de amistad",
    "read": false,
    "created_at": "2026-04-04T10:00:00.000000Z"
  }
]
```

---

### `PUT /api/notifications/{id}/read` 🔒
Marca una notificación como leída.

**Param:** `{id}` → ID de la notificación.

**Response `200`:**
```json
{ "message": "Notificación marcada como leída" }
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `404`  | Notificación no encontrada |

---

### `PUT /api/notifications/read-all` 🔒
Marca todas las notificaciones no leídas del usuario como leídas.

**Response `200`:**
```json
{ "message": "Todas las notificaciones marcadas como leídas" }
```

---

### `DELETE /api/notifications/read` 🔒
Elimina todas las notificaciones ya leídas del usuario autenticado.

**Response `200`:**
```json
{ "message": "Se han eliminado 3 notificaciones leídas" }
```

---

## Amistades

### `GET /api/friends` 🔒
Devuelve la lista de amigos aceptados del usuario autenticado.

**Response `200`:**
```json
[
  {
    "friendship_id": 5,
    "id": 2,
    "name": "Maria",
    "player_id": "#Maria5678"
  }
]
```

---

### `GET /api/friends/players` 🔒
Devuelve todos los usuarios activos excepto el autenticado (para gestionar solicitudes).

**Response `200`:**
```json
[
  { "id": 2, "name": "Maria", "player_id": "#Maria5678" }
]
```

---

### `GET /api/friends/requests` 🔒
Devuelve las solicitudes de amistad pendientes **recibidas** por el usuario autenticado.

**Response `200`:**
```json
[
  {
    "friendship_id": 8,
    "id": 3,
    "name": "Joan",
    "player_id": "#Joan9012"
  }
]
```

---

### `GET /api/friends/requests/sent` 🔒
Devuelve las solicitudes de amistad pendientes **enviadas** por el usuario autenticado.

**Response `200`:**
```json
[
  {
    "friendship_id": 9,
    "id": 4,
    "name": "Pau",
    "player_id": "#Pau3456"
  }
]
```

---

### `GET /api/friends/status` 🔒
Devuelve el estado de todas las relaciones de amistad del usuario autenticado, indexado por el ID del otro usuario.

**Response `200`:**
```json
{
  "2": {
    "status": "accepted",
    "friendship_id": 5,
    "sender": true
  },
  "3": {
    "status": "pending",
    "friendship_id": 8,
    "sender": false
  }
}
```

> `sender: true` indica que el usuario autenticado fue quien envió la solicitud.

---

### `POST /api/friends/request` 🔒
Envía una solicitud de amistad a otro usuario.

**Body (JSON):**
```json
{ "friend_id": 3 }
```

**Response `200`:**
```json
{ "message": "Sol·licitud d'amistat enviada correctament a #Joan9012" }
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `400`  | Enviarse solicitud a uno mismo o relación ya existente |
| `404`  | Usuario no encontrado |

---

### `PUT /api/friends/{id}/accept` 🔒
Acepta una solicitud de amistad pendiente **recibida**.

**Param:** `{id}` → `friendship_id`.

**Response `200`:**
```json
{ "message": "Solicitud d'amistad aceptada" }
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `404`  | Solicitud no encontrada |

---

### `PUT /api/friends/{id}/reject` 🔒
Rechaza una solicitud de amistad pendiente **recibida** (la elimina).

**Param:** `{id}` → `friendship_id`.

**Response `200`:**
```json
{ "message": "Solicitud d'amistad rechazada" }
```

---

### `DELETE /api/friends/{id}/revoke` 🔒
Revoca una solicitud de amistad pendiente **enviada** por el usuario autenticado.

**Param:** `{id}` → `friendship_id`.

**Response `200`:**
```json
{ "message": "Solicitud d'amistad revocada correctament" }
```

---

### `DELETE /api/friends/{id}` 🔒
Elimina una amistad ya aceptada (bidireccional).

**Param:** `{id}` → `friendship_id`.

**Response `200`:**
```json
{ "message": "Relació d'amistat entre els usuaris eliminada correctament" }
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| `404`  | Amistad no encontrada |

---

## Configuración (Admin)

### `GET /api/settings` 🔒🛡️
Devuelve todos los parámetros de configuración del sistema.

**Response `200`:**
```json
[
  { "id": 1, "key": "little_to_mid", "value": "5" },
  { "id": 2, "key": "mid_to_big", "value": "10" }
]
```

> `little_to_mid`: número de xuxes para evolucionar de `petit` a `mitja`.  
> `mid_to_big`: número de xuxes para evolucionar de `mitja` a `gran`.

---

### `PUT /api/settings/update` 🔒🛡️
Actualiza los parámetros de configuración. Se pasan las claves como campos del body.

**Body (JSON):**
```json
{
  "little_to_mid": 6,
  "mid_to_big": 12
}
```

**Response `200`:**
```json
{
  "message": "Configuraciones actualizada correctamente",
  "updated_setting": [
    { "id": 1, "key": "little_to_mid", "value": "6" },
    { "id": 2, "key": "mid_to_big", "value": "12" }
  ]
}
```

---

## Enfermedades (Admin)

### `GET /api/illnesses` 🔒🛡️
Devuelve todas las enfermedades registradas con su porcentaje de infección.

**Response `200`:**
```json
[
  { "id": 1, "key": "bajon_azucar", "name": "Bajón de azúcar", "infection_percentage": 15 },
  { "id": 2, "key": "atracon", "name": "Atracón", "infection_percentage": 10 }
]
```

---

### `PUT /api/illnesses/update` 🔒🛡️
Actualiza los porcentajes de infección de las enfermedades.

**Body (JSON):** Array de objetos con `key` e `infection_percentage`.
```json
[
  { "key": "bajon_azucar", "infection_percentage": 20 },
  { "key": "atracon", "infection_percentage": 5 }
]
```

**Response `200`:**
```json
{
  "message": "Percentatges actualitzats correctament",
  "illnesses": [
    { "id": 1, "key": "bajon_azucar", "name": "Bajón de azúcar", "infection_percentage": 20 },
    { "id": 2, "key": "atracon", "name": "Atracón", "infection_percentage": 5 }
  ]
}
```

---

## Resumen de rutas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/check-email` | — | Comprobar si un email existe |
| `POST` | `/api/login` | — | Iniciar sesión |
| `POST` | `/api/register` | — | Registrar usuario |
| `POST` | `/api/logout` | 🔒 | Cerrar sesión |
| `GET` | `/api/profile` | 🔒 | Perfil del usuario autenticado |
| `GET` | `/api/users` | 🔒 | Listar usuarios activos |
| `PUT` | `/api/update` | 🔒 | Actualizar perfil |
| `DELETE` | `/api/user` | 🔒 | Desactivar cuenta propia |
| `GET` | `/api/users/all` | 🛡️ | Listar todos los usuarios |
| `POST` | `/api/users/{id}/restore` | 🛡️ | Restaurar usuario |
| `DELETE` | `/api/users/{id}/delete` | 🛡️ | Desactivar usuario |
| `GET` | `/api/inventory` | 🔒 | Inventario del usuario |
| `GET` | `/api/inventory/users` | 🔒 | Listar jugadores |
| `GET` | `/api/inventory/slots/{user}` | 🔒 | Slots disponibles |
| `GET` | `/api/inventory/items` | 🛡️ | Todos los items |
| `POST` | `/api/inventory/add-item/{user}` | 🛡️ | Añadir item a usuario |
| `POST` | `/api/inventory/{slot_id}/evolve` | 🔒 | Evolucionar xuxes |
| `GET` | `/api/xuxedex/all` | 🔒 | Todos los xuxemons |
| `GET` | `/api/xuxedex` | 🔒 | Xuxedex del usuario |
| `GET` | `/api/xuxedex/users` | 🔒 | Listar usuarios |
| `GET` | `/api/xuxedex/owned` | 🔒 | Xuxemons capturados |
| `POST` | `/api/xuxedex/add-random/{user_id}` | 🔒 | Añadir xuxemon aleatorio |
| `GET` | `/api/xuxedex/owned/{user_id}` | 🛡️ | Xuxemons de un usuario |
| `POST` | `/api/xuxedex/{owned_id}/illness` | 🛡️ | Añadir enfermedad |
| `DELETE` | `/api/xuxedex/{owned_id}/illness/{illness}` | 🛡️ | Eliminar enfermedad |
| `POST` | `/api/xuxemons/{id}/xuxe` | 🔒 | Dar xuxe a xuxemon |
| `POST` | `/api/xuxemons/{owned_id}/vaccinate` | 🔒 | Vacunar xuxemon |
| `GET` | `/api/notifications` | 🔒 | Ver notificaciones |
| `PUT` | `/api/notifications/{id}/read` | 🔒 | Marcar notificación como leída |
| `PUT` | `/api/notifications/read-all` | 🔒 | Marcar todas como leídas |
| `DELETE` | `/api/notifications/read` | 🔒 | Eliminar leídas |
| `GET` | `/api/friends` | 🔒 | Lista de amigos |
| `GET` | `/api/friends/players` | 🔒 | Todos los jugadores |
| `GET` | `/api/friends/requests` | 🔒 | Solicitudes recibidas |
| `GET` | `/api/friends/requests/sent` | 🔒 | Solicitudes enviadas |
| `GET` | `/api/friends/status` | 🔒 | Estado de relaciones |
| `POST` | `/api/friends/request` | 🔒 | Enviar solicitud |
| `PUT` | `/api/friends/{id}/accept` | 🔒 | Aceptar solicitud |
| `PUT` | `/api/friends/{id}/reject` | 🔒 | Rechazar solicitud |
| `DELETE` | `/api/friends/{id}/revoke` | 🔒 | Revocar solicitud enviada |
| `DELETE` | `/api/friends/{id}` | 🔒 | Eliminar amistad |
| `GET` | `/api/settings` | 🛡️ | Ver configuración |
| `PUT` | `/api/settings/update` | 🛡️ | Actualizar configuración |
| `GET` | `/api/illnesses` | 🛡️ | Ver enfermedades |
| `PUT` | `/api/illnesses/update` | 🛡️ | Actualizar enfermedades |
