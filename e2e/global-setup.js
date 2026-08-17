import { chromium } from '@playwright/test';

export const E2E_RUT      = '11.111.111-1';
export const E2E_PASSWORD = 'E2ETest123.#';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/login');
  await page.getByLabel('RUT').fill(E2E_RUT);
  await page.getByLabel('Contraseña').fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  // Tras loguear puede aparecer el modal de estado de WhatsApp (no hay
  // sesión de WhatsApp real en el entorno local de pruebas) — se continúa
  // sin esperar/conectar para llegar al dashboard.
  const continuarSinEsperar = page.getByRole('button', { name: 'Continuar sin esperar' });
  const continuarSinConectar = page.getByRole('button', { name: 'Continuar sin conectar (por ahora)' });
  const continuarAlPanel = page.getByRole('button', { name: 'Continuar al Panel' });

  await Promise.race([
    page.waitForURL('**/dashboard', { timeout: 15_000 }),
    continuarSinEsperar.waitFor({ timeout: 15_000 }).catch(() => {}),
  ]);

  for (const boton of [continuarSinEsperar, continuarSinConectar, continuarAlPanel]) {
    if (await boton.isVisible().catch(() => false)) {
      await boton.click();
      break;
    }
  }

  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await page.context().storageState({ path: './e2e/.auth/admin.json' });
  await browser.close();
}
