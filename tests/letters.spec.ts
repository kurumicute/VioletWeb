import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function writeLetter(page: Page, title: string) {
  await page.goto('/')
  await page.getByRole('button', { name: '留下一封信' }).click()
  const dialog = page.getByRole('dialog', { name: '寫一封信' })
  await dialog.getByLabel('信件標題').fill(title)
  await dialog.getByLabel('收信人', { exact: true }).fill('未來的自己')
  await dialog.getByLabel('你的署名').fill('測試旅人')
  await dialog
    .getByLabel('你的心意')
    .fill('願你記得每一份溫柔 💜\n<script>window.untrusted = true</script>')
  return dialog
}

test('公開信件儲存到 MySQL，另一位訪客能閱讀全文', async ({ page, browser }) => {
  const title = `花園來信 ${Date.now()}`
  const dialog = await writeLetter(page, title)
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: '儲存並公開信件' }).click()
  await expect(dialog.getByRole('status')).toContainText('你的心意，已在花園裡綻放。')
  await dialog.getByRole('button', { name: '回到花園' }).click()
  await expect(page.getByRole('button', { name: `閱讀 ${title}` })).toBeVisible()

  const visitor = await browser.newContext()
  const reader = await visitor.newPage()
  await reader.goto('/')
  await reader.getByRole('button', { name: `閱讀 ${title}` }).click()
  const reading = reader.getByRole('dialog', { name: title })
  await expect(reading).toContainText('願你記得每一份溫柔 💜')
  await expect(reading).toContainText('<script>window.untrusted = true</script>')
  expect(await reader.evaluate(() => 'untrusted' in window)).toBe(false)
  await reader.keyboard.press('Escape')
  await expect(reading).not.toBeVisible()
  await visitor.close()
})

test('私人信件不會進入公開信箱，且不再提供下載', async ({ page, request }) => {
  const title = `私人信件 ${Date.now()}`
  const dialog = await writeLetter(page, title)
  await expect(dialog.getByRole('button', { name: /下載/ })).toHaveCount(0)
  await expect(dialog.getByRole('checkbox')).not.toBeChecked()
  await dialog.getByRole('button', { name: '儲存私人信件' }).click()
  await expect(dialog.getByRole('status')).toContainText('這封心意，已為你珍藏。')
  await expect(dialog.getByRole('button', { name: /下載/ })).toHaveCount(0)
  const response = await request.get('/api/letters')
  expect(JSON.stringify(await response.json())).not.toContain(title)
})

test('送出失敗會保留草稿，重試後只會出現一張卡片', async ({ page }) => {
  const title = `重試來信 ${Date.now()}`
  let firstAttempt = true
  await page.route('**/api/letters', async (route) => {
    if (route.request().method() === 'POST' && firstAttempt) {
      firstAttempt = false
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: '測試連線失敗，請重試。' }),
      })
    } else await route.continue()
  })
  const dialog = await writeLetter(page, title)
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: '儲存並公開信件' }).click()
  await expect(dialog.getByRole('alert')).toContainText('測試連線失敗')
  await expect(dialog.getByLabel('信件標題')).toHaveValue(title)
  await dialog.getByRole('button', { name: '關閉視窗' }).click()
  await page.reload()
  await page.getByRole('button', { name: '留下一封信' }).click()
  await expect(dialog.getByLabel('信件標題')).toHaveValue(title)
  await dialog.getByRole('button', { name: '儲存並公開信件' }).click()
  await expect(dialog.getByRole('status')).toBeVisible()
  await dialog.getByRole('button', { name: '回到花園' }).click()
  await expect(page.getByRole('button', { name: `閱讀 ${title}` })).toHaveCount(1)
})

test('桌面和手機使用頂部圖片，官方網站位於頁尾中央', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 950 })
    await page.goto('/')
    const images = page.locator('main img')
    for (const image of await images.all()) {
      expect(
        await image.evaluate((element) => getComputedStyle(element).objectPosition),
      ).toBe('0% 0%')
      expect(await image.evaluate((element) => getComputedStyle(element).marginTop)).toBe(
        '0px',
      )
    }
    await expect(page.locator('.topbar a')).toHaveCount(0)
    const official = page.getByRole('link', { name: '官方網站', exact: false }).last()
    await official.scrollIntoViewIfNeeded()
    await expect(official).toBeVisible()
    expect(await official.evaluate((element) => element.closest('footer') !== null)).toBe(
      true,
    )
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBe(true)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.screenshot({ path: `test-results/garden-${width}.png`, fullPage: true })
  }
})
