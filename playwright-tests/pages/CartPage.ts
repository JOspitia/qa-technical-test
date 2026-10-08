import { Page, Locator } from '@playwright/test';

/**
 * Page Object para la página del Carrito de SauceDemo.
 */
export class CartPage {
  readonly page: Page;
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartContentsContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartList = page.getByTestId('cart-list');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.cartContentsContainer = page.getByTestId('cart-contents-container');
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async removeItem(productId: string): Promise<void> {
    await this.page.getByTestId(`remove-${productId}`).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
