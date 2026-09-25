// 좌석 배치: STAGE에서 먼 순서(H)부터 가까운 순서(A)로 렌더링
// gapAfterIndex: 왼쪽부터 몇 번째 좌석 뒤에 통로 간격을 둘지 (0-indexed, H열 전용)
const ROWS = [
  { row: 'H', seats: 10, gapAfterIndex: 4 }, // 10 9 8 7 6 | 5 4 3 2 1
  { row: 'G', seats: 12 },
  { row: 'F', seats: 12 },
  { row: 'E', seats: 12 },
  { row: 'D', seats: 12 },
  { row: 'C', seats: 12 },
  { row: 'B', seats: 12 },
  { row: 'A', seats: 12 },
];

const TOTAL_SEATS = ROWS.reduce((sum, r) => sum + r.seats, 0);

const seatMapEl = document.getElementById('seatMap');
const resetBtn = document.getElementById('resetBtn');
const checkedCountEl = document.getElementById('checkedCount');
const totalCountEl = document.getElementById('totalCount');
const sessionTitleEl = document.getElementById('sessionTitle');

totalCountEl.textContent = TOTAL_SEATS;

// URL의 ?session=xxx 값을 그대로 사용 (메인 페이지 버튼에서 넘어옴)
const currentSession = new URLSearchParams(window.location.search).get('session');
let pollTimer = null;

if (!currentSession) {
  document.body.innerHTML = '<p style="padding:24px">잘못된 접근입니다. <a href="index.html">메인 페이지로 돌아가기</a></p>';
  throw new Error('session 파라미터 없음');
}

function seatId(row, num) {
  return `${row}${num}`;
}

function buildSeatMap() {
  seatMapEl.innerHTML = '';
  ROWS.forEach(({ row, seats, gapAfterIndex }) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';

    const label = document.createElement('div');
    label.className = 'row-label';
    label.textContent = row;
    rowEl.appendChild(label);

    for (let i = 0; i < seats; i++) {
      const num = seats - i; // 왼쪽이 큰 번호 (12,11,...,1 형태)
      const btn = document.createElement('div');
      btn.className = 'seat';
      if (gapAfterIndex !== undefined && i === gapAfterIndex + 1) {
        btn.classList.add('gap-before');
      }
      const id = seatId(row, num);
      btn.dataset.seatId = id;
      btn.textContent = num;
      btn.addEventListener('click', () => toggleSeat(id));
      rowEl.appendChild(btn);
    }
    seatMapEl.appendChild(rowEl);
  });
}

function updateSeatVisuals(state) {
  let checkedCount = 0;
  document.querySelectorAll('.seat').forEach((el) => {
    const id = el.dataset.seatId;
    const isChecked = !!state[id];
    el.classList.toggle('checked', isChecked);
    if (isChecked) checkedCount++;
  });
  checkedCountEl.textContent = checkedCount;
}

let currentSessionLabel = currentSession;

async function loadSessionLabel() {
  const res = await fetch('/api/sessions');
  const sessions = await res.json();
  const match = sessions.find((s) => s.id === currentSession);
  if (match) {
    currentSessionLabel = match.label;
    sessionTitleEl.innerHTML = `Maryhall 소극장 <span class="sub">${match.label}</span>`;
    document.title = `${match.label} - 좌석 체크`;
  }
}

async function loadState() {
  if (!currentSession) return;
  const res = await fetch(`/api/state/${currentSession}`);
  const state = await res.json();
  updateSeatVisuals(state);
}

async function toggleSeat(id) {
  if (!currentSession) return;
  // 낙관적 업데이트: 서버 응답 기다리지 않고 즉시 화면 반영
  const el = document.querySelector(`.seat[data-seat-id="${id}"]`);
  el.classList.toggle('checked');

  const res = await fetch('/api/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: currentSession, seatId: id }),
  });
  const state = await res.json();
  updateSeatVisuals(state);
}

async function resetSession() {
  if (!currentSession) return;
  if (!confirm(`"${currentSessionLabel}" 회차의 모든 좌석 체크를 초기화할까요?`)) return;
  await fetch('/api/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: currentSession }),
  });
  loadState();
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(loadState, 3000); // 3초마다 서버 상태와 동기화 (여러 기기 접속 시 서로 자동 반영)
}

resetBtn.addEventListener('click', resetSession);

(async function init() {
  buildSeatMap();
  await loadSessionLabel();
  await loadState();
  startPolling();
})();
