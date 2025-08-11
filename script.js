// script.js: Interactivity. Prettified with 80-char width. Customize functions.
// Efficient: No heavy DOM manipulation.

// Glitch init - runs on load. Customize target element.
document.addEventListener('DOMContentLoaded', () => {
  const glitch = document.getElementById('glitch');
  glitch.classList.add('glitch'); // Enable animation
});

// Form submission handler - uses Fetch for async. Sanitize inputs here.
// Customize endpoint or add validation (e.g., regex for email).
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  // Basic sanitization: Trim and escape - add more for security.
  const data = {
    name: formData.get('name').trim().replace(/</g, '&lt;'),
    email: formData.get('email').trim().replace(/</g, '&lt;'),
    message: formData.get('message').trim().replace(/</g, '&lt;')
  };
  try {
    const res = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) alert('Message sent securely!');
    else alert('Error - check console.');
  } catch (err) {
    console.error('Submission failed:', err);
  }
});
