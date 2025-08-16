// Minimal per-page script
(() => {
  const btn = document.getElementById('btn');
  const msg = document.getElementById('msg');
  btn?.addEventListener('click', () => {
    msg.textContent = 'JS loaded and event listener works!';
  });
})();
