const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to root - should redirect to /login
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    
    // Check final URL
    const finalUrl = page.url();
    console.log('✓ Final URL:', finalUrl);
    
    // Check page heading
    const heading = await page.locator('h1').textContent();
    console.log('✓ Page heading:', heading);
    
    // Check for form elements
    const emailInput = await page.locator('input[type="email"]').isVisible();
    const passwordInput = await page.locator('input[type="password"]').isVisible();
    const submitButton = await page.locator('button[type="submit"]').isVisible();
    const signupLink = await page.locator('text=Sign up').isVisible();
    
    console.log('✓ Email input visible:', emailInput);
    console.log('✓ Password input visible:', passwordInput);
    console.log('✓ Submit button visible:', submitButton);
    console.log('✓ Signup link visible:', signupLink);
    
    // Screenshot
    await page.screenshot({ path: 'verify_login_page.png' });
    console.log('✓ Screenshot saved');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();
