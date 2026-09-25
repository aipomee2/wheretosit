async function loadSessionButtons() {
  const res = await fetch('/api/sessions');
  const sessions = await res.json();

  const wrap = document.getElementById('sessionButtons');
  wrap.innerHTML = '';

  sessions.forEach((s) => {
    const btn = document.createElement('a');
    btn.className = 'session-btn';
    btn.href = `session.html?session=${encodeURIComponent(s.id)}`;
    btn.innerHTML = `<span class="date">${s.label}</span><span class="enter">입장 →</span>`;
    wrap.appendChild(btn);
  });
}

loadSessionButtons();
