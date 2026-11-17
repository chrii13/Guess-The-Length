import { test, expect, type Page } from '@playwright/test'

// Il percorso principale: un ospite arriva in home, gioca una partita intera e vede il risultato.
// La partita usa la tastiera sul gancio del metro, così il test copre anche l'accessibilità.

async function confermaTentativo(page: Page, frecce: number) {
  const gancio = page.getByRole('button', { name: /Gancio del metro/ })
  await gancio.focus()
  for (let i = 0; i < frecce; i++) await page.keyboard.press('ArrowRight')
  await page.getByRole('button', { name: 'Conferma', exact: true }).click()
}

test('la home spiega il gioco e porta alla partita da ospite', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Misura a occhio')
  await expect(page.getByRole('heading', { name: 'Come si gioca' })).toBeVisible()
  await expect(page.getByText('Da ospite il punteggio non viene salvato')).toBeVisible()

  await page.getByRole('link', { name: 'Gioca come ospite' }).first().click()
  await expect(page).toHaveURL(/\/play$/)
  await expect(page.getByRole('button', { name: 'Inizia partita' })).toBeVisible()
})

test('un ospite gioca tre round e vede il punteggio non salvato', async ({ page }) => {
  await page.goto('/play')
  await expect(page.getByText('Stai giocando come ospite')).toBeVisible()
  await page.getByRole('button', { name: 'Inizia partita' }).click()

  for (let round = 1; round <= 3; round++) {
    await expect(page.getByRole('heading', { name: `Round ${round} di 3` })).toBeVisible()
    await expect(page.getByText('Tentativo 1 di 2')).toBeVisible()
    await confermaTentativo(page, 2)

    await expect(page.getByText('Tentativo 2 di 2')).toBeVisible()
    await expect(page.getByText(/Tentativo 1: \d+,\d{2} cm, scarto \d+,\d{2} cm/)).toBeVisible()
    await confermaTentativo(page, 5)

    // Risultato del round: lo scarto e i due tentativi
    await expect(page.getByText('Hai sbagliato di')).toBeVisible()
    const avanti = round < 3 ? 'Prossimo round' : 'Vedi il risultato finale'
    await page.getByRole('button', { name: avanti }).click()
  }

  await expect(page.getByRole('heading', { name: 'Partita terminata' })).toBeVisible()
  await expect(page.getByText(/questo punteggio non è stato salvato/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Rigioca' })).toBeVisible()
  // Senza account non c'è un resoconto da vedere
  await expect(page.getByRole('button', { name: 'Vedi resoconto' })).toHaveCount(0)
})

test('il gancio del metro si allunga e si accorcia con le frecce', async ({ page }) => {
  await page.goto('/play')
  await page.getByRole('button', { name: 'Inizia partita' }).click()

  const nastro = page.locator('.metro-nastro')
  const larghezza = async () => (await nastro.boundingBox())?.width ?? 0
  const prima = await larghezza()

  await page.getByRole('button', { name: /Gancio del metro/ }).focus()
  await page.keyboard.press('Shift+ArrowRight')
  await expect.poll(larghezza).toBeGreaterThan(prima + 15)

  await page.keyboard.press('Shift+ArrowLeft')
  await page.keyboard.press('Shift+ArrowLeft')
  await expect.poll(larghezza).toBeLessThan(prima)
})

test('la classifica si apre anche senza account', async ({ page }) => {
  await page.goto('/leaderboard')
  await expect(page.getByRole('heading', { level: 1, name: 'Classifica' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Aggiorna classifica' })).toBeVisible()
})

test('il footer non mostra indirizzi email', async ({ page }) => {
  await page.goto('/')
  const footer = page.locator('footer')
  await expect(footer.getByRole('link', { name: 'Segnala su GitHub' })).toBeVisible()
  await expect(footer).not.toContainText('@')
})

for (const pagina of ['/login', '/register']) {
  test(`da ${pagina} il bottone Google porta all'accesso di Google`, async ({ page }) => {
    // Fermiamo la richiesta prima che esca verso Supabase e Google
    let richiesta = ''
    await page.route('**/auth/v1/authorize**', (route) => {
      richiesta = route.request().url()
      return route.fulfill({ status: 200, body: 'ok' })
    })

    await page.goto(pagina)
    await page.getByRole('button', { name: 'Continua con Google' }).click()
    await expect.poll(() => richiesta).toContain('provider=google')
    expect(new URL(richiesta).searchParams.get('redirect_to')).toMatch(/^http:\/\/localhost:\d+\/$/)
  })
}

test('la pagina privacy si apre dal footer', async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('link', { name: 'Privacy' }).click()
  await expect(page).toHaveURL(/\/privacy$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Con un account' })).toBeVisible()
})
