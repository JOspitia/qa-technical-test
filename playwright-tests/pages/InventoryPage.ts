import { Page, Locator } from '@playwright/test';

/**
 * Page Object para la página de Inventario de SauceDemo.
 * Encapsula selectores y acciones del catálogo de productos.
 */
export class InventoryPage {
  readonly page: Page;
  readonly titleHeader: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly inventoryContainer: Locator;
  readonly shoppingCartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuBurger: Locator;
  readonly logoutLink: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleHeader = page.getByTestId('title');
    this.inventoryList = page.getByTestId('inventory-list');
    this.inventoryItems = page.getByTestId('inventory-item');
    this.inventoryContainer = page.getByTestId('inventory-container');
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuBurger = page.getByTestId('open-menu');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  async getTitle(): Promise<string> {
    return (await this.titleHeader.textContent()) || '';
  }

  async addToCart(productId: string): Promise<void> {
    await this.page.getByTestId(`add-to-cart-${productId}`).click();
  }

  async removeFromCart(productId: string): Promise<void> {
    await this.page.getByTestId(`remove-${productId}`).click();
  }

  async openCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  async openMenu(): Promise<void> {
    await this.menuBurger.click();
  }

  async logout(): Promise<void> {
    await this.menuBurger.click();
    await this.logoutLink.click();
  }

  async getCartItemCount(): Promise<number> {
    if (await this.cartBadge.count() === 0) return 0;
    const text = await this.cartBadge.textContent();
    return parseInt(text || '0', 10);
  }
}
