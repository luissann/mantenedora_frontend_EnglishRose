import { test, expect } from '@playwright/test';

// Este spec corre SIN sesión guardada (login es justo lo que prueba).
test.use({ storageState: { cookies: [], origins: [] } });

test('rechaza credenciales incorrectas con un mensaje de error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('RUT').fill('11.111.111-1');
  await page.getByLabel('Contraseña').fill('password-incorrecta');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await expect(page.getByText('RUT o contraseña incorrectos.')).toBeVisible();
  await expect(page).toHaveURL(/login/);
});

test('loguea con credenciales correctas y llega al dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('RUT').fill('11.111.111-1');
  await page.getByLabel('Contraseña').fill('E2ETest123.#');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  const continuarSinEsperar = page.getByRole('button', { name: 'Continuar sin esperar' });
  const continuarSinConectar = page.getByRole('button', { name: 'Continuar sin conectar (por ahora)' });
  const continuarAlPanel = page.getByRole('button', { name: 'Continuar al Panel' });

  await expect(page).toHaveURL(/dashboard|login/);
  for (const boton of [continuarSinEsperar, continuarSinConectar, continuarAlPanel]) {
    if (await boton.isVisible().catch(() => false)) {
      await boton.click();
      break;
    }
  }

  await expect(page).toHaveURL(/dashboard/);
});
