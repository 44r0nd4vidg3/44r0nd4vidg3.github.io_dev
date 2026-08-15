/* Contact page: form submit handler.
   TODO: the comms backend is not wired yet — swap the reroute below for a
   real endpoint (API route or form service) when it goes live.
   Part of aarondavidge.com — see README.md for the file map. */

(function contactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.getElementById('form-note');
    note.textContent = 'COMMS BACKEND OFFLINE \u00b7 REROUTING TO A4RON.AI...';
    note.classList.add('text-amber-400');
    setTimeout(() => { location.href = 'assistant.html'; }, 900);
  });
})();
