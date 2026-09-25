const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'seats.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- 공연 회차 정의 (필요하면 날짜/라벨만 수정하세요) ----
const SESSIONS = [
  { id: '1009-lunch', label: '10/9 (금) 점심' },
  { id: '1009-dinner', label: '10/9 (금) 저녁' },
  { id: '1010-lunch', label: '10/10 (토) 점심' },
  { id: '1010-dinner', label: '10/10 (토) 저녁' },
  { id: '1011-lunch', label: '10/11 (일) 점심' },
  { id: '1011-dinner', label: '10/11 (일) 저녁' },
];

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function saveData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 회차 목록
app.get('/api/sessions', (req, res) => {
  res.json(SESSIONS);
});

// 특정 회차의 좌석 상태 (앉은 좌석만 true로 저장됨)
app.get('/api/state/:session', (req, res) => {
  const data = loadData();
  res.json(data[req.params.session] || {});
});

// 좌석 체크/해제 토글
app.post('/api/toggle', (req, res) => {
  const { session, seatId } = req.body || {};
  if (!session || !seatId) {
    return res.status(400).json({ error: 'session, seatId가 필요합니다.' });
  }
  const data = loadData();
  if (!data[session]) data[session] = {};

  if (data[session][seatId]) {
    delete data[session][seatId];
  } else {
    data[session][seatId] = true;
  }

  saveData(data);
  res.json(data[session]);
});

// 특정 회차 전체 초기화
app.post('/api/reset', (req, res) => {
  const { session } = req.body || {};
  if (!session) return res.status(400).json({ error: 'session이 필요합니다.' });
  const data = loadData();
  data[session] = {};
  saveData(data);
  res.json({});
});

app.listen(PORT, () => {
  console.log(`Seat checker running on port ${PORT}`);
});
