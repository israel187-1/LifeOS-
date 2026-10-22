import { expect, test, type Page } from '@playwright/test';
import { getLesson } from '../src/content';
import type { Exercise, Lesson } from '../src/domain/types';

const first = getLesson('l1-print')!;

async function typeCode(page: Page, code: string) {
  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(code);
}

async function solve(page: Page, ex: Exercise) {
  if (ex.kind === 'python') {
    await typeCode(page, ex.solution);
    await page.getByTestId('check-button').click();
    await expect(page.getByTestId('check-feedback')).toContainText('¡Correcto!');
  } else if (ex.kind === 'choice') {
    await page.getByRole('button', { name: ex.options[ex.correctIndex].text, exact: true }).click();
    await expect(page.locator('.feedback.good')).toBeVisible();
  } else {
    for (let target = 0; target < ex.steps.length; target++) {
      const items = await page.locator('ol.order li > span:first-child').allTextContents();
      let pos = items.indexOf(ex.steps[target]);
      while (pos > target) {
        await page.locator('ol.order li').nth(pos).getByRole('button', { name: 'Subir' }).click();
        pos--;
      }
    }
    await page.getByRole('button', { name: 'Comprobar orden' }).click();
    await expect(page.locator('.feedback.good')).toBeVisible();
  }
}

async function answerAll(page: Page, lesson: Lesson) {
  for (const [i, q] of lesson.retrieval.entries()) {
    const block = page.getByTestId('question').nth(i);
    await block.getByRole('button', { name: q.options[q.correctIndex], exact: true }).click();
  }
}

const next = (page: Page) => page.getByTestId('next-button').click();
const step = (page: Page) => page.getByTestId('step-indicator');

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await page.goto('/');
  await expect(page.getByTestId('start-button')).toBeVisible();
});

test('criterios 1, 2, 3, 4 y 7: lección completa, retroalimentación, persistencia y siguiente paso', async ({ page }) => {
  await expect(page.getByTestId('next-action-title')).toHaveText(first.title);
  await page.getByTestId('start-button').click();
  await expect(page.getByRole('heading', { name: first.objective })).toBeVisible();
  await next(page); // concepto
  await next(page); // ejemplo
  await page.getByRole('button', { name: 'Siguiente paso del ejemplo' }).click();
  await next(page); // guiado
  await expect(step(page)).toContainText('Ejercicio');

  // Retroalimentación ante un intento incorrecto antes de resolver
  if (first.guided.kind === 'python') {
    await typeCode(page, 'print("algo distinto")');
    await page.getByTestId('check-button').click();
    await expect(page.getByTestId('check-feedback')).toContainText('Aún no');
    await expect(page.getByTestId('check-feedback')).toContainText('Se esperaba');
    await typeCode(page, 'print("hola"');
    await page.getByTestId('check-button').click();
    await expect(page.locator('.error-box').first()).toBeVisible();
  }
  await solve(page, first.guided);
  await next(page); // errores frecuentes
  await next(page); // bugfix
  await solve(page, first.bugfix);
  await next(page); // independiente
  await solve(page, first.independent);
  await next(page); // recuperación
  await expect(page.getByTestId('next-button')).toBeDisabled();
  await answerAll(page, first);
  await next(page); // reto (opcional)
  await next(page); // feynman
  const words = first.feynman.keyIdeas.map((k) => k.keywords[0]).join(', ');
  await page.getByLabel('Tu explicación').fill(`Con mis palabras: ${words}. Así se resume lo que aprendí hoy en esta lección de programación.`);
  await page.getByRole('button', { name: 'Revisar mi explicación' }).click();
  await expect(page.getByText('Explicación registrada.')).toBeVisible();
  await next(page); // resumen
  await expect(page.getByText(`Dominaste «${first.title}».`)).toBeVisible();
  await page.getByTestId('finish-button').click();

  const second = getLesson('l1-errores')!;
  await expect(page.getByTestId('next-action-title')).toHaveText(second.title);
  await expect(page.getByTestId('week-summary')).toContainText('1 días con práctica');

  await page.reload();
  await expect(page.getByTestId('next-action-title')).toHaveText(second.title);
  await expect(page.getByTestId('last-session')).toContainText('dominaste');
  await page.getByRole('button', { name: /Ruta/ }).click();
  await expect(page.getByText('Dominada').first()).toBeVisible();
});

test('criterio 5: retomar una sesión interrumpida tras cerrar la página', async ({ page, context }) => {
  await page.getByTestId('start-button').click();
  await next(page);
  await next(page);
  await expect(step(page)).toContainText('Paso 3 de');
  await page.waitForTimeout(600);
  await page.close();

  const again = await context.newPage();
  await again.goto('/');
  await expect(again.getByTestId('start-button')).toHaveText('Continuar donde lo dejé');
  await again.getByTestId('start-button').click();
  await expect(again.getByTestId('step-indicator')).toContainText('Paso 3 de');
});

test('criterio 6: sesión mínima de cinco minutos', async ({ page }) => {
  await page.getByRole('radio', { name: /Modo mínimo/ }).click();
  await expect(page.getByTestId('next-action-title')).toHaveText('Modo mínimo: 5 minutos');
  await page.getByTestId('start-button').click();
  await expect(page.getByText('/ 5 min')).toBeVisible();
  while (!(await step(page).textContent())?.includes('Ejercicio')) await next(page);
  await solve(page, first.guided);
  await next(page);
  await expect(page.getByRole('heading', { name: 'Hecho. Esto cuenta.' })).toBeVisible();
  await page.getByTestId('finish-button').click();
  await expect(page.getByTestId('last-session')).toBeVisible();
  await expect(page.getByTestId('week-summary')).toContainText('1 ejercicios resueltos');
});

test('criterio 8: diseño adaptable sin desbordamiento horizontal', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.getByTestId('start-button').click();
  await next(page);
  await next(page);
  await next(page);
  await expect(page.locator('.cm-content')).toBeVisible();
  const overflowSession = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowSession).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `test-results/sesion-${test.info().project.name}.png`, fullPage: true });
});

test('un bucle infinito se detiene y se explica', async ({ page }) => {
  await page.getByTestId('start-button').click();
  await next(page);
  await next(page);
  await next(page);
  await typeCode(page, 'while True:\n    x = 1');
  await page.getByRole('button', { name: 'Ejecutar' }).click();
  await expect(page.locator('.error-box')).toContainText(/demasiado|tiempo/i, { timeout: 30_000 });
});
