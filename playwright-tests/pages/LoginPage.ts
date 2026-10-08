import { Page, Locator } from '@playwright/test';

/**
 * Page Object para la página de Login de SauceDemo.
 * Encapsula selectores y acciones relacionadas al login.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;
  readonly closeMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    // El <img data-test="open-menu"> queda detras del <button id="react-burger-menu-btn">,
    // que es el elemento real que recibe los clicks.
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.closeMenuButton = page.getByTestId('close-menu');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
    // Condicion semantica: el formulario de login vuelve a estar disponible.
    // No se verifica la URL porque logout redirige a /index.html, no a la raiz.
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async getErrorMessage(): Promise<string> {
    const text = await this.errorMessage.textContent();
    return text || '';
  }
}
