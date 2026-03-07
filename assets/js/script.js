
document.querySelectorAll('.group-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const group = chip.dataset.group;
    document.querySelectorAll('.group-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    document.querySelectorAll('[data-group-section]').forEach(section => {
      section.style.display = (group === 'all' || section.dataset.groupSection === group) ? '' : 'none';
    });
  });
});
const modal = document.getElementById('galleryModal');
const stage = document.getElementById('modalStage');
const caption = document.getElementById('modalCaption');
let zoomed = false;
document.querySelectorAll('[data-gallery-title]').forEach(card => {
  card.addEventListener('click', () => {
    if (!modal) return;
    modal.classList.add('open');
    caption.textContent = card.dataset.galleryTitle;
    stage.style.background = getComputedStyle(card).background;
    stage.classList.remove('zoomed');
    zoomed = false;
    const zoomBtn = document.getElementById('modalZoom');
    if (zoomBtn) zoomBtn.textContent = 'Zoom';
  });
});
const closeBtn = document.getElementById('modalClose');
const zoomBtn = document.getElementById('modalZoom');
if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
if (zoomBtn) zoomBtn.addEventListener('click', () => {
  zoomed = !zoomed;
  stage.classList.toggle('zoomed', zoomed);
  zoomBtn.textContent = zoomed ? 'Reset' : 'Zoom';
});
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
