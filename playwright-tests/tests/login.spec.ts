import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

const PASSWORD = 'secret_sauce';

test.describe('Autenticacion', () => {

  test('standard_user accede al inventario', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await test.step('Navegar a la pagina de login', async () => {
      await loginPage.goto();
    });

    await test.step('Ingresar credenciales validas', async () => {
      await loginPage.login('standard_user', PASSWORD);
    });

    await test.step('Validar redireccion y contenido del inventario', async () => {
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.titleHeader).toHaveText('Products');
      await expect(inventoryPage.inventoryItems).toHaveCount(6);
    });
  });

  test('locked_out_user es rechazado con mensaje de bloqueo', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Ingresar con locked_out_user', async () => {
      await loginPage.goto();
      await loginPage.login('locked_out_user', PASSWORD);
    });

    await test.step('Validar mensaje de bloqueo', async () => {
      await expect(loginPage.errorMessage).toContainText(
        'this user has been locked out',
      );
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  });

  test('usuario inexistente es rechazado', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Ingresar con usuario inexistente', async () => {
      await loginPage.goto();
      await loginPage.login('usuario_inexistente', 'password_incorrecto');
    });

    await test.step('Validar mensaje de credenciales invalidas', async () => {
      await expect(loginPage.errorMessage).toContainText(
        'Username and password do not match any user in this service',
      );
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  });

  test('password incorrecta con usuario valido es rechazada', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Ingresar usuario valido con clave incorrecta', async () => {
      await loginPage.goto();
      await loginPage.login('standard_user', 'clave_mala');
    });

    await test.step('Validar que no accede al inventario', async () => {
      await expect(loginPage.errorMessage).toContainText(
        'Username and password do not match',
      );
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  });

  test('campos vacios muestran errores de validacion', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Enviar formulario completamente vacio', async () => {
      await loginPage.goto();
      await loginPage.login('', '');
    });

    await test.step('Validar error de campo obligatorio', async () => {
      await expect(loginPage.errorMessage).toContainText('Username is required');
    });
  });

  test('logout cierra la sesion correctamente', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await test.step('Iniciar sesion', async () => {
      await loginPage.goto();
      await loginPage.login('standard_user', PASSWORD);
      await expect(page).toHaveURL(/inventory\.html/);
    });

    await test.step('Abrir menu lateral y cerrar sesion', async () => {
      await loginPage.logout();
    });

    await test.step('Validar retorno al formulario de login', async () => {
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.errorMessage).toBeHidden();
      await expect(inventoryPage.inventoryList).toBeHidden();
    });
  });

  test('problem_user accede al inventario', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await test.step('Ingresar con problem_user', async () => {
      await loginPage.goto();
      await loginPage.login('problem_user', PASSWORD);
    });

    await test.step('Validar catalogo completo', async () => {
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.inventoryItems).toHaveCount(6);
    });
  });

  test('performance_glitch_user accede al inventario', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Ingresar con performance_glitch_user', async () => {
      await loginPage.goto();
      await loginPage.login('performance_glitch_user', PASSWORD);
    });

    await test.step('Validar redireccion', async () => {
      await expect(page).toHaveURL(/inventory\.html/);
    });
  });

  test('visual_user accede al inventario', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await test.step('Ingresar con visual_user', async () => {
      await loginPage.goto();
      await loginPage.login('visual_user', PASSWORD);
    });

    await test.step('Validar redireccion', async () => {
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.titleHeader).toHaveText('Products');
    });
  });
});