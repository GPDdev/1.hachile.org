const filters = document.querySelector('.filters');
const cards = document.querySelectorAll('.work-card');
filters.hidden = false;
filters.addEventListener('click', event => {
  const selected = event.target.closest('[data-filter]');
  if (!selected) return;
  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button === selected));
  }
  for (const card of cards) {
    card.hidden = selected.dataset.filter !== '全部' && card.dataset.category !== selected.dataset.filter;
  }
});
