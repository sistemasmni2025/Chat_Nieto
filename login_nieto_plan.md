# Sistema de Autenticación y Administración para Chat Nieto (Proyecto login_nieto)

Este plan detalla los pasos y la arquitectura necesaria en el backend para implementar un sistema de usuarios con roles y permisos (estilo Open WebUI), un modal de inicio de sesión y la protección de las rutas de Inteligencia Artificial.

*Documento guardado para ejecución futura cuando la infraestructura permanente esté lista.*

## 1. Actualización de Dependencias

Para manejar la autenticación de una forma segura y robusta, añadiremos nuevas herramientas al entorno de Python.

- `python-jose[cryptography]`: Para la generación y validación de tokens JWT (JSON Web Tokens).
- `passlib[bcrypt]`: Para el hasheo unidireccional de contraseñas.
- `python-multipart`: Para manejar peticiones de inicio de sesión del tipo `x-www-form-urlencoded` estándar de OAuth2.

## 2. Estructura de la Base de Datos

Necesitaremos almacenar de forma persistente y segura a nuestros usuarios locales, sus roles y sus métricas de actividad (como "última actividad").

Se creará una tabla llamada `chat_usuarios` en PostgreSQL con los siguientes campos clave que coinciden con los que necesitas en tu Admin UI:
- `id` (UUID o Serial)
- `email` (String único, usado para login)
- `nombre` (String)
- `hashed_password` (String encriptado, JAMÁS en texto plano)
- `rol` (String - ej: 'ADMIN', 'USUARIO')
- `is_active` (Booleano - útil para dehabilitar usuarios temporalmente)
- `creado_en` (Timestamp)
- `ultima_actividad` (Timestamp)

## 3. Capa Lógica de Seguridad (Módulo Auth)

Centralizaremos toda la seguridad en un módulo dedicado (`auth.py`). Contendrá la lógica fuerte de seguridad:
- `verify_password()` y `get_password_hash()`: Validaciones con Bcrypt.
- `create_access_token()`: Función para emitir el JWT que la interfaz usará en sus peticiones para mantenerse autenticado.
- `get_current_user()`: Dependencia de FastAPI para obtener la sesión actual e inyectar el usuario local en las peticiones.
- `get_current_admin_user()`: Dependencia estricta que validará no solo la sesión, sino que el perfil tenga rol `'ADMIN'`. En caso contrario lanzará un `HTTPException 403 Forbidden`.

## 4. Rutas y Endpoints

Crearemos los puntos de control (API) exactamente como los requiere una interfaz administrativa tipo Open WebUI.

**Público (Para el Modal de Login):**
- `POST /api/auth/login`: Recibe email/password, valida internamente contra Postgres, devuelve un Token JWT.

**Protegidos (Solo para Usuarios Registrados):**
- Modificaremos `POST /api/chat` para que solo acepte peticiones si incluyen el Token JWT válido en los Headers (`Authorization: Bearer <token>`). También esto permitirá luego vincular las consultas al usuario (auditoría).
- `GET /api/auth/me`: Devuelve los detalles del usuario logueado en la sesión activa.

**Administración (Solo para Rol 'ADMIN'):**
- `GET /api/admin/users`: Obtiene la lista completa de usuarios (Rol, Nombre, Email, Última Actividad).
- `POST /api/admin/users`: Endpoint para que el Admin registre/invite a un nuevo usuario internamente (sin abrir registros públicos).
- `PUT /api/admin/users/{user_id}/role`: Cambia el rol de un usuario existente (Ej: ascender de USUARIO a ADMIN).
- `DELETE /api/admin/users/{user_id}` o `PUT /api/admin/users/{user_id}/status`: Para dar de baja a usuarios.

## 5. Implementación de Auditoría Básica
Para poder decir "Última actividad: hace unos segundos" como lo muestra Open WebUI, implementaremos un mecanismo donde cada vez que un usuario envíe algo al endpoint `/api/chat`, el backend mandará actualizar silenciosamente su campo `ultima_actividad` en Postgres.

---
**Pendientes a definir al retomar este proyecto:**
1. Definir cómo se creará el primer super-admin (vía script inicial o inserción manual SQL).
2. Definir la expiración del token JWT (caducidad corta como 60 mins vs caducidad larga como 7 días).
