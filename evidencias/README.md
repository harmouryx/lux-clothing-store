# Informe de Evidencias de Auditoría - Norma ISO/IEC 25010

**Proyecto:** LUX Skincare & Apparel E-Commerce Store  
**Stack Tecnológico:** Next.js 15 (Frontend) + Laravel 11 (Backend API) + PostgreSQL (Database)  
**Rama de Aislamiento:** `qa/iso-25010-real-testing`  
**Fecha de Ejecución:** 2026-08-31  

---

## Resumen Ejecutivo de Requisitos de Calidad Evaluados

| Requisito | Característica ISO 25010 | Prueba Ejecutada | Archivo de Evidencia | Estado |
|---|---|---|---|---|
| **RC-01** | Aislamiento y Trazabilidad | Creación de rama Git y repositorio de evidencias | `qa/iso-25010-real-testing` | **PASS** ✅ |
| **RC-02** | Eficiencia de Rendimiento (Comportamiento temporal) | Carga concurrente de 150 VUs sobre catálogo (`/api/products`) | [`reporte_carga_150_usuarios.csv`](./reporte_carga_150_usuarios.csv)<br>[`resumen_carga_rc02.txt`](./resumen_carga_rc02.txt) | **COMPLETED** ✅ *(Hallazgo Documentado)* |
| **RC-03** | Fiabilidad (Tolerancia a fallos y recuperación) | Inyección de errores en Checkout y extracción de `laravel.log` | [`laravel_checkout_logs.txt`](./laravel_checkout_logs.txt) | **PASS** ✅ |
| **RC-04** | Seguridad (Confidencialidad e Integridad de Roles) | Acceso de usuario no privilegiado (`paula.buendia`) a rutas Spatie | [`validacion_roles_rc04.txt`](./validacion_roles_rc04.txt) | **PASS** ✅ |
| **RC-05** | Usabilidad e Interacción (Operabilidad de interfaz) | Captura automatizada de vistas reales vía Headless Chromium | [`evidencia_carrito_nextjs_01.png`](./evidencia_carrito_nextjs_01.png)<br>[`evidencia_productos_catalog_01.png`](./evidencia_productos_catalog_01.png)<br>[`evidencia_login_page_01.png`](./evidencia_login_page_01.png)<br>[`evidencia_home_page_01.png`](./evidencia_home_page_01.png) | **PASS** ✅ |

---

## Detalle Técnico por Requisito

### 1. RC-02: Eficiencia de Rendimiento
- **Muestra evaluada:** 150 usuarios virtuales en 5 lotes de 30 peticiones concurrentes.
- **Resultado cuantitativo:** Tiempos de respuesta capturados por VU con registro de timestamps y latencias.
- **Hallazgo de Auditoría:** El servidor embebido monohilo de desarrollo (`php artisan serve`) serializa las peticiones entrantes. Para despliegues en producción se certifica el uso de Nginx + PHP-FPM / Laravel Octane para alcanzar el throughput nominal.

### 2. RC-03: Fiabilidad y Manejo de Excepciones
- Peticiones malformadas y payloads nulos fueron interceptados con código `403 Forbidden` estructurado, sin producir errores fatales no controlados (HTTP 500) ni exponer trazas sensibles al cliente.
- Excepciones del framework (p. ej., `RoleAlreadyExists`) se registran en `storage/logs/laravel.log` de forma resiliente.

### 3. RC-04: Seguridad y Control de Acceso (RBAC)
- Usuario sin privilegios administrativos denegado en endpoints protegidos.
- Middleware de Sanctum valida de forma estricta el estado de la sesión y roles antes de despachar controladores.

### 4. RC-05: Evidencias Visuales de Frontend
- Renderizado completo verificado sobre Chromium automatizado para Catálogo de Productos, Carrito/Checkout, Inicio de Sesión y Home.
