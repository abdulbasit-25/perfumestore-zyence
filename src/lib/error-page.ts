export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/src/styles/styles.css" />
  </head>
  <body class="error-page">
    <div class="error-page__card">
      <h1>This page didn't load</h1>
      <p class="error-page__message">Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="error-page__actions">
        <button class="error-page__primary" onclick="location.reload()">Try again</button>
        <a class="error-page__secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
