import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

test.describe('Flujo de Compra', () => {

  test('compra de multiples productos y descarga de PDF', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOne = new CheckoutStepOnePage(page);
    const checkoutStepTwo = new CheckoutStepTwoPage(page);
    const checkoutComplete = new CheckoutCompletePage(page);

    await test.step('Iniciar sesion', async () => {
      await loginPage.goto();
      await loginPage.login('standard_user', 'secret_sauce');
      await expect(page).toHaveURL(/inventory\.html/);
    });

    await test.step('Agregar dos productos al carrito', async () => {
      await inventoryPage.addToCart('sauce-labs-backpack');
      await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
      await expect(inventoryPage.cartBadge).toHaveText('2');
    });

    await test.step('Abrir el carrito', async () => {
      await inventoryPage.openCart();
      await expect(page).toHaveURL(/cart\.html/);
      await expect(cartPage.cartItems).toHaveCount(2);
    });

    await test.step('Completar datos del cliente', async () => {
      await cartPage.proceedToCheckout();
      await expect(page).toHaveURL(/checkout-step-one\.html/);
      await checkoutStepOne.fillCustomerInfo('johan', 'ospitia', '123545');
      await checkoutStepOne.continue();
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('Confirmar el pedido', async () => {
      await checkoutStepTwo.finish();
      await expect(page).toHaveURL(/checkout-complete\.html/);
      await expect(checkoutComplete.completeHeader).toContainText(
        'Thank you for your order!',
      );
    });

    await test.step('Descargar el PDF de la orden', async () => {
      const downloadPromise = page.waitForEvent('download');
      await checkoutComplete.downloadPdf();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });

    await test.step('Volver al inventario', async () => {
      await checkoutComplete.backToProducts();
      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.cartBadge).toBeHidden();
    });
  });

  test('compra de un solo producto', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOne = new CheckoutStepOnePage(page);
    const checkoutStepTwo = new CheckoutStepTwoPage(page);
    const checkoutComplete = new CheckoutCompletePage(page);

    await test.step('Iniciar sesion y agregar un producto', async () => {
      await loginPage.goto();
      await loginPage.login('standard_user', 'secret_sauce');
      await inventoryPage.addToCart('sauce-labs-backpack');
      await expect(inventoryPage.cartBadge).toHaveText('1');
    });

    await test.step('Verificar unico item en el carrito', async () => {
      await inventoryPage.openCart();
      await expect(cartPage.cartItems).toHaveCount(1);
    });

    await test.step('Completar el checkout', async () => {
      await cartPage.proceedToCheckout();
      await checkoutStepOne.fillCustomerInfo('pablo', 'pepito', '23156');
      await checkoutStepOne.continue();
      await checkoutStepTwo.finish();
      await expect(checkoutComplete.completeHeader).toBeVisible();
    });
  });

  test('el resumen refleja el precio del producto', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOne = new CheckoutStepOnePage(page);
    const checkoutStepTwo = new CheckoutStepTwoPage(page);

    await test.step('Agregar fleece jacket ($49.99) al carrito', async () => {
      await loginPage.goto();
      await loginPage.login('standard_user', 'secret_sauce');
      await inventoryPage.addToCart('sauce-labs-fleece-jacket');
    });

    await test.step('Avanzar hasta el resumen del pedido', async () => {
      await inventoryPage.openCart();
      await cartPage.proceedToCheckout();
      await checkoutStepOne.fillCustomerInfo('juan', 'perez', '11111');
      await checkoutStepOne.continue();
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('Validar subtotal, impuesto y total', async () => {
      await expect(checkoutStepTwo.subtotalLabel).toContainText(
        'Item total: $49.99',
      );
      await expect(checkoutStepTwo.taxLabel).toContainText('Tax: $4.00');
      await expect(checkoutStepTwo.totalLabel).toContainText('Total: $53.99');
    });
  });

  test('campos vacios bloquean el avance del checkout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOne = new CheckoutStepOnePage(page);

    await test.step('Avanzar al checkout sin completar el formulario', async () => {
      await loginPage.goto();
      await loginPage.login('standard_user', 'secret_sauce');
      await inventoryPage.addToCart('sauce-labs-backpack');
      await inventoryPage.openCart();
      await cartPage.proceedToCheckout();
      await checkoutStepOne.continue();
    });

    await test.step('Validar que no avanza y muestra error', async () => {
      await expect(page).toHaveURL(/checkout-step-one\.html/);
      await expect(page.getByText('First Name is required')).toBeVisible();
    });
  });
});