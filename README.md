# Prueba Técnica QA Tester

Entregables de una evaluación test que cubre cuatro frentes independientes: pruebas de API REST, pruebas de API SOAP, automatización de interfaz con Playwright y documentación de testing.

| Parte | Herramienta | Alcance |
|-------|-------------|---------|
| 1 | Postman | API REST — autenticación y catálogo de productos (DummyJSON) |
| 2 | Postman | API SOAP — operaciones aritméticas (DNE Online Calculator) |
| 3 | Playwright | Automatización de interfaz (SauceDemo) |
| 4 | Documentos | Caso de uso y evidencia de ejecución |

Las partes son **pruebas independientes**: cada una apunta a un sistema distinto y se ejecuta por separado. No forman una única aplicación.

## Estructura

```
qa-technical-test/
├── README.md                   Descripción general del proyecto
├── docs/
│   └── CU-001.pdf              Especificación del caso de uso (Parte 4)
├── evidence/
│   └── Evidencia.pdf           Evidencia de ejecución (Parte 4)
├── postman/                    Parte 1 — API REST
│   ├── qa-technical-test.postman_collection.json
│   └── info-api.txt                Contrato de las respuestas esperadas
├── soap/                       Parte 2 — API SOAP
│   ├── qa-technical-test-soap.postman_collection.json
│   └── info-soap-api.txt           Operaciones publicadas por el WSDL
└── playwright-tests/           Parte 3 — Automatización de interfaz
    └── README.md                   Detalle técnico de la suite
```

---

## Parte 1 — API REST

**Sistema:** `https://dummyjson.com/`

| Prueba | Solicitud | Validaciones |
|--------|-----------|--------------|
| Login exitoso | `POST /auth/login` | Código 200, existencia de `accessToken` y `refreshToken` |
| Listado de productos | `GET /products` | Estructura de la respuesta y paginación |

La colección declara las variables `accessToken` y `refreshToken`, que permiten encadenar el token de la autenticación en las solicitudes siguientes.

**Importar en Postman:** `File > Import` → `postman/qa-technical-test.postman_collection.json`

Contrato de respuestas documentado en [`postman/info-api.txt`](postman/info-api.txt).

---

## Parte 2 — API SOAP

**Sistema:** `http://www.dneonline.com/calculator.asmx` (WSDL publicado)

| Operación | Enfoque |
|-----------|---------|
| `add` | Suma de dos operandos enteros |
| `subtract` | Resta de dos operandos enteros |
| `multiply` | Multiplicación de dos operandos enteros |
| `divide` | División de dos operandos enteros |

Cada solicitud construye el sobre SOAP manualmente, define el encabezado `SOAPAction` correspondiente y verifica el código de respuesta.

**Importar en Postman:** `File > Import` → `soap/qa-technical-test-soap.postman_collection.json`

Operaciones disponibles según el WSDL: [`soap/info-soap-api.txt`](soap/info-soap-api.txt)

---

## Parte 3 — Automatización con Playwright

**Sistema:** `https://www.saucedemo.com/`

Escenarios solicitados por el enunciado:

| Escenario | Cobertura |
|-----------|-----------|
| Login exitoso | Validación de redirección y catálogo |
| Login fallido | Mensajes de rechazo por credenciales y validaciones |
| Agregar producto al carrito | Flujo completo de compra |

La suite excede los escenarios mínimos e incluye cobertura adicional: usuarios bloqueados, logout, validaciones de formulario, compra múltiple con descarga de PDF y verificación de importes. Total: **13 casos de prueba** sobre **6 Page Objects**.

```bash
cd playwright-tests
npm install
npx playwright install
npm test
```

Arquitectura, cobertura detallada y decisiones técnicas en [`playwright-tests/README.md`](playwright-tests/README.md).

---

## Parte 4 — Documentación de Testing

Documentación del caso de uso *"Ingreso correcto de un paciente cumpliendo con todos los campos obligatorios y validaciones del flujo"*.

| Documento | Contenido |
|-----------|-----------|
| [`docs/CU-001.pdf`](docs/CU-001.pdf) | Especificación del caso de uso |
| [`evidence/Evidencia.pdf`](evidence/Evidencia.pdf) | Evidencia de ejecución |

La documentación sigue la estructura requerida: precondiciones, pasos de ejecución, resultado obtenido, estado del caso, evidencias y defectos asociados.

---

## Resumen de entregables

| Entregable | Ubicación |
|------------|-----------|
| Postman | `postman/` |
| SOAP | `soap/` |
| Playwright | `playwright-tests/` |
| Evidencia | `evidence/` |
| README | Este documento |