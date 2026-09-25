# Maryhall 소극장 좌석 체크

공연 관객이 좌석에 앉으면 스태프가 체크하는 웹앱입니다.
- 메인 페이지에서 포스터를 보고 6개 회차(10/9~11 점심/저녁) 버튼 중 하나를 눌러 입장
- A~H열, 총 94석 (Maryhall 소극장 좌석도 기준)
- 회차별 체크 데이터는 완전히 분리되어 저장됨
- 3초마다 자동으로 서버와 동기화 → 여러 기기(스태프 여러 명)가 동시에 같은 링크에 접속해도 서로 체크한 내용이 자동으로 반영됨
- 로그인 없음 (링크만 알면 접속 가능)

## 포스터 넣는 방법

`public/poster.jpg` 라는 이름으로 포스터 이미지 파일을 `public` 폴더 안에 넣으면 메인 페이지에 자동으로 표시됩니다. (파일이 없으면 "포스터 이미지 자리" 안내가 대신 보여요.)

## 로컬에서 실행해보기

```bash
npm install
npm start
```

브라우저에서 http://localhost:3000 접속

## GitHub에 올리기

```bash
git init
git add .
git commit -m "seat checker init"
git branch -M main
git remote add origin <본인 GitHub 저장소 주소>
git push -u origin main
```

## Render에 배포하기

1. https://render.com 로그인 → **New +** → **Web Service**
2. 방금 만든 GitHub 저장소 연결
3. 설정값
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free로도 동작하지만 아래 "주의사항" 꼭 확인
4. Deploy 누르면 몇 분 뒤 `https://프로젝트이름.onrender.com` 주소가 생성됨 → 이 링크를 스태프에게 공유

## ⚠️ 주의사항 (중요)

좌석 체크 데이터는 서버의 `data/seats.json` 파일에 저장됩니다.

- Render **무료 플랜**은 재배포하거나 컨테이너가 재시작되면 파일 시스템이 초기화될 수 있어, 체크해둔 데이터가 사라질 위험이 있습니다.
- 공연 당일에는 **코드를 재배포하지 않는 것**을 추천드립니다 (배포는 미리 끝내두고 그대로 사용).
- 더 안전하게 하려면 Render의 유료 플랜(Starter 이상)에서 "Persistent Disk"를 `/opt/render/project/src/data` 경로에 추가하면 재시작해도 데이터가 유지됩니다.
- 정말 중요한 공연이라면, 예비로 중간중간 `/api/state/:session`에 접속해 화면을 캡처하거나, 수동으로 `data/seats.json` 내용을 복사해두는 것도 방법입니다.

## 회차(공연 날짜) 수정하기

`server.js` 상단의 `SESSIONS` 배열에서 날짜/라벨을 자유롭게 수정할 수 있습니다.

## 좌석 배치 수정하기

`public/seat.js` 상단의 `ROWS` 배열에서 열(row)별 좌석 수를 수정할 수 있습니다.
