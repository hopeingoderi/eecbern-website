
document.querySelectorAll('.group-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const group = chip.dataset.group;
    document.querySelectorAll('.group-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    document.querySelectorAll('[data-group-section]').forEach(section => {
      section.style.display = (group === 'all' || section.dataset.groupSection === group) ? '' : 'none';
    });
    const ministries = document.getElementById('ministries');
    if (ministries) ministries.scrollIntoView({behavior:'smooth', block:'start'});
  });
});
