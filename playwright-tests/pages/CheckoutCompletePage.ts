import { Page, Locator } from '@playwright/test';

/**
 * Page Object para la página de checkout completo.
 */
export class CheckoutCompletePage {
  readonly page: Page;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backToProductsButton: Locator;
  readonly generatePdfButton: Locator;
  readonly orderImage: Locator;
  readonly checkoutCompleteContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backToProductsButton = page.getByTestId('back-to-products');
    this.generatePdfButton = page.getByTestId('generate-pdf-order');
    this.orderImage = page.getByTestId('pony-express');
    this.checkoutCompleteContainer = page.getByTestId('checkout-complete-container');
  }

  async getConfirmationMessage(): Promise<string> {
    return (await this.completeHeader.textContent()) || '';
  }

  async downloadPdf(): Promise<void> {
    await this.generatePdfButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}
