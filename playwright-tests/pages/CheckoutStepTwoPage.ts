import { Page, Locator } from '@playwright/test';

/**
 * Page Object para el paso 2 del checkout (resumen del pedido).
 */
export class CheckoutStepTwoPage {
  readonly page: Page;
  readonly checkoutSummaryContainer: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly paymentInfoValue: Locator;
  readonly shippingInfoValue: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutSummaryContainer = page.getByTestId('checkout-summary-container');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.paymentInfoValue = page.getByTestId('payment-info-value');
    this.shippingInfoValue = page.getByTestId('shipping-info-value');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async getSubtotal(): Promise<string> {
    return (await this.subtotalLabel.textContent()) || '';
  }

  async getTax(): Promise<string> {
    return (await this.taxLabel.textContent()) || '';
  }

  async getTotal(): Promise<string> {
    return (await this.totalLabel.textContent()) || '';
  }
}
