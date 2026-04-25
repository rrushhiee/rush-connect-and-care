# Deployment Notes

## Hosting choice

This site is set up for GitHub Pages with GitHub Actions.

## Custom domain

Keep your DNS with your existing registrar.

In GitHub repository settings:

1. Open `Settings` -> `Pages`
2. Set the source to `GitHub Actions`
3. Add `rushconnectandcare.com.au` as the custom domain
4. Verify the domain in GitHub if available

At your registrar:

1. Point the apex domain and/or `www` records to GitHub Pages
2. Keep DNS managed at the registrar
3. Leave HTTPS enabled in GitHub Pages once the domain is active

## Form setup

This site is wired for Formspree.

1. Create a free Formspree form
2. Copy the form endpoint
3. Replace `https://formspree.io/f/YOUR_FORM_ID` in [site-config.js](./site-config.js)
4. Commit and deploy

## CI checks

Pull requests run:

- HTML linting
- CSS linting
- accessibility checks
- resource link checks
- form submission tests
