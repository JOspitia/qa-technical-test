# Automatización de SauceDemo con Playwright

Suite de pruebas end-to-end sobre [saucedemo.com](https://www.saucedemo.com), construida con Playwright y TypeScript bajo el patrón **Page Object Model (POM)**.

## Objetivo

Automatizar el flujo de autenticación y el proceso de compra completo, con cobertura de casos felices, validaciones de formulario y usuarios con comportamientos diferenciados.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación

```bash
npm install
npx playwright install
```

## Ejecución

```bash
npm test                        # Suite completa
npm test -- --headed            # Con navegador visible
npm test -- --debug             # Modo depurador paso a paso
npm test -- tests/login.spec.ts # Un archivo especifico
npm test -- --grep "carrito"    # Filtrar por nombre de test
npx playwright show-report      # Abrir reporte HTML
```

## Estructura

```
playwright-tests/
├── pages/                  # Page Objects: un archivo por pagina
│   ├── LoginPage.ts              # Formulario de login, logout, errores
│   ├── InventoryPage.ts          # Catalogo, carrito, menu lateral
│   ├── CartPage.ts               # Lista de items, checkout, seguir comprando
│   ├── CheckoutStepOnePage.ts    # Datos del cliente
│   ├── CheckoutStepTwoPage.ts    # Resumen e importes del pedido
│   └── CheckoutCompletePage.ts   # Confirmacion y descarga de PDF
├── tests/
│   ├── login.spec.ts             # 9 casos de autenticacion
│   └── purchase.spec.ts          # 4 casos del flujo de compra
└── playwright.config.ts
```

## Arquitectura: Page Object Model

Cada clase en `pages/` encapsula los selectores y las acciones de una única pantalla. Los tests solo orquestan pasos, sin tocar selectores.

**Beneficio concreto:** ante un cambio en la aplicación se modifica un solo archivo. Si `data-test="login-button"` cambia, se actualiza `LoginPage.ts` y los 13 tests siguen funcionando sin editar ninguno.

Ejemplo de la separación:

```typescript
// pages/InventoryPage.ts — sabe COMO agregar al carrito
async addToCart(productId: string): Promise<void> {
  await this.page.getByTestId(`add-to-cart-${productId}`).click();
}

// tests/purchase.spec.ts — sabe QUE se esta probando
await test.step('Agregar dos productos al carrito', async () => {
  await inventoryPage.addToCart('sauce-labs-backpack');
  await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
  await expect(inventoryPage.cartBadge).toHaveText('2');
});
```

## Procedimiento de construcción

**1. Exploración con `playwright codegen`.** Se recorrió el flujo real de la aplicación y se capturó el comportamiento de cada pantalla:

```bash
npx playwright codegen https://www.saucedemo.com/
```

**2. Extracción de selectores.** El `codegen` genera rutas frágiles y difíciles de mantener a mano. Se escribió un script que recorre el flujo completo y vuelca todos los atributos `data-test` reales de cada página:

```typescript
const dataTests = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-test]')).map(el => ({
    tag: el.tagName.toLowerCase(),
    testId: el.getAttribute('data-test'),
  })),
);
```

Los selectores de los Page Objects provienen de esa extracción, no de suposiciones. Esto evitó dos errores reales: `title` en lugar de `.title`, y `open-menu` en lugar de `react-burger-menu-btn`.

**3. Refactorización a POM.** El flujo monolítico generado por `codegen` se dividió en Page Objects por pantalla, y cada test quedó como un caso independiente y verificable.

**4. Trazabilidad.** Cada bloque de acción se envuelve en `test.step()`, que registra el avance en el reporte HTML y en el trace viewer.

## Decisiones técnicas

### `testIdAttribute: 'data-test'`

Playwright busca por defecto el atributo `data-testid`. SauceDemo usa `data-test`. Sin esta línea, **todos** los `getByTestId()` de los Page Objects estaban rotos silenciosamente:

```typescript
use: {
  testIdAttribute: 'data-test',
}
```

### Aislamiento de contexto

Playwright crea un `BrowserContext` nuevo por cada test: cookies, `localStorage` y `sessionStorage` no se comparten. Por eso **no** se requiere `logout()` entre casos ni limpieza manual de sesión. Un `logout()` explícito era código muerto que además generaba un cuelgue.

### `test.step()` en lugar de `console.log`

`console.log` no aparece en el reporte HTML ni en el trace viewer, y se pierde al redirigir la salida. `test.step()` produce pasos anidados visibles en ambos, lo que permite identificar el punto exacto de fallo:

```bash
npx playwright show-report
```

### Selectores verificados contra la aplicación

Los precios esperados (`$49.99`, tax `$4.00`, total `$53.99`) y el comportamiento de cada usuario fueron comprobados contra la aplicación real, no asumidos. `locked_out_user` es el único usuario bloqueado; `error_user`, `problem_user`, `performance_glitch_user` y `visual_user` acceden al inventario con comportamientos distintos sobre el catálogo.

## Cobertura

### Autenticacion (9 casos)

| Caso | Resultado esperado |
|------|--------------------|
| `standard_user` | Acceso completo, 6 productos |
| `locked_out_user` | Rechazado: usuario bloqueado |
| Usuario inexistente | Rechazado: credenciales no coinciden |
| Password incorrecta | Rechazado: credenciales no coinciden |
| Campos vacíos | Error de campo obligatorio |
| Logout | Retorno al formulario de login |
| `problem_user` | Acceso con catálogo completo |
| `performance_glitch_user` | Acceso pese al delay |
| `visual_user` | Acceso al inventario |

### Flujo de compra (4 casos)

| Caso | Resultado esperado |
|------|--------------------|
| Compra múltiple + PDF | Carrito con 2 items, orden confirmada, PDF descargado |
| Compra simple | Un item, checkout completo |
| Validación de importes | Subtotal, impuesto y total correctos |
| Formulario vacío en checkout | Bloqueo del avance con mensaje de error |

## Paralelismo

```typescript
fullyParallel: false,
workers: 4,
```

Con `fullyParallel: false`, Playwright asigna un worker por archivo de spec, por lo que la suite usa 2 workers sobre 2 archivos. `workers: 4` actúa como techo. Esta configuracion reduce la carga concurrente contra el backend compartido de SauceDemo.

### Nota

La estructura, los Page Objects y las aserciones se iteraron con asistencia de IA como herramienta de apoyo. Cada valor utilizado (selectores, precios, comportamientos de usuario) fue verificado contra la aplicación real antes de fijarse en el código, y las decisiones técnicas documentadas arriba corresponden a hallazgos obtenidos durante esa verificación.