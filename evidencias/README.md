# Matriz de Evidencias de Auditoría - Norma ISO/IEC 25010

**Proyecto:** LUX Skincare & Apparel E-Commerce Store  
**Stack Tecnológico:** Next.js 15 (Frontend) + Laravel 11 (Backend API) + PostgreSQL (Database)  
**Rama de Trabajo:** `qa/iso-25010-real-testing`  
**Fecha de Ejecución:** 2026-08-31  

---

## Tabla de Mapeo de Evidencias Requeridas

| Req. Evaluado | Tipo de Evidencia (¿Qué es?) | Nombre del Archivo / Enlace de Respaldo | Estado |
|---|---|---|---|
| **RC-01 (Adecuación)** | Capturas de pantalla del frontend | [`evidencia_carrito_nextjs_01.png`](./evidencia_carrito_nextjs_01.png) | **COMPLETED** ✅ |
| **RC-02 (Eficiencia)** | Reporte de tiempos | [`reporte_carga_150_usuarios.csv`](./reporte_carga_150_usuarios.csv) | **COMPLETED** ✅ |
| **RC-03 (Fiabilidad)** | Log de errores del servidor | [`laravel_checkout_logs.txt`](./laravel_checkout_logs.txt) | **COMPLETED** ✅ |
| **RC-04 (Seguridad)** | Captura de red y bloqueo de permisos | [`spatie_roles_denegado.png`](./spatie_roles_denegado.png) | **COMPLETED** ✅ |
| **RC-05 (Interacción)** | Grabación de pantalla de las tareas | [`test_usabilidad_lux_frontend.mp4`](./test_usabilidad_lux_frontend.mp4) | **COMPLETED** ✅ |

---

## Detalle de los Archivos de Respaldo Generados

1. **RC-01 (Adecuación):**
   - [`evidencia_carrito_nextjs_01.png`](./evidencia_carrito_nextjs_01.png): Captura del checkout y flujo de compra del frontend en Next.js.
   - Complementarias: [`evidencia_productos_catalog_01.png`](./evidencia_productos_catalog_01.png), [`evidencia_home_page_01.png`](./evidencia_home_page_01.png), [`evidencia_login_page_01.png`](./evidencia_login_page_01.png).

2. **RC-02 (Eficiencia):**
   - [`reporte_carga_150_usuarios.csv`](./reporte_carga_150_usuarios.csv): Muestreo de 150 usuarios virtuales concurrentes con timestamps y latencias.
   - [`resumen_carga_rc02.txt`](./resumen_carga_rc02.txt): Análisis técnico de rendimiento y comportamiento temporal.

3. **RC-03 (Fiabilidad):**
   - [`laravel_checkout_logs.txt`](./laravel_checkout_logs.txt): Log de captura de excepciones y respuestas semánticas 403 en checkout sin fallos fatales 500.

4. **RC-04 (Seguridad):**
   - [`spatie_roles_denegado.png`](./spatie_roles_denegado.png): Captura de auditoría de red que evidencia el bloqueo HTTP 403 Forbidden para usuarios sin rol de administrador (Spatie RBAC).
   - [`validacion_roles_rc04.txt`](./validacion_roles_rc04.txt): Detalle de rutas y pruebas de denegación de permisos.

5. **RC-05 (Interacción):**
   - [`test_usabilidad_lux_frontend.mp4`](./test_usabilidad_lux_frontend.mp4): Grabación de video de alta definición (1280x720) ejecutando tareas interactivas en el catálogo, filtros de precio, checkout y vistas de autenticación.
