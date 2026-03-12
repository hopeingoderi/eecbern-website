
(function(){
  const calendarEl = document.getElementById('calendar');
  const monthEl = document.getElementById('calendarMonth');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const eventDays = {0:[2,9,16,23,30],4:[6,13,20,27]}; // Sunday/Thursday highlights
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let current = new Date();
  function renderCalendar(date){
    if(!calendarEl || !monthEl) return;
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const today = new Date();
    calendarEl.innerHTML = '';
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(label => {
      const div = document.createElement('div');
      div.className = 'calendar-name';
      div.textContent = label;
      calendarEl.appendChild(div);
    });
    monthEl.textContent = `${monthNames[month]} ${year}`;
    const offset = (first.getDay() + 6) % 7;
    for(let i=0;i<offset;i++){
      const blank = document.createElement('div');
      blank.className = 'calendar-day is-empty';
      calendarEl.appendChild(blank);
    }
    for(let day=1; day<=last.getDate(); day++){
      const cell = document.createElement('div');
      const d = new Date(year, month, day);
      const weekday = d.getDay();
      cell.className = 'calendar-day';
      cell.textContent = day;
      if(day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) cell.classList.add('is-today');
      if((weekday === 0 && eventDays[0].includes(day)) || (weekday === 4 && eventDays[4].includes(day))) cell.classList.add('is-event');
      calendarEl.appendChild(cell);
    }
  }
  if(calendarEl){
    renderCalendar(current);
    prevBtn && prevBtn.addEventListener('click', ()=>{ current = new Date(current.getFullYear(), current.getMonth()-1, 1); renderCalendar(current); });
    nextBtn && nextBtn.addEventListener('click', ()=>{ current = new Date(current.getFullYear(), current.getMonth()+1, 1); renderCalendar(current); });
  }

  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    });
  }, {threshold: .12}) : null;
  document.querySelectorAll('.reveal, .reveal-rise').forEach(el => io ? io.observe(el) : el.classList.add('is-visible'));
})();
