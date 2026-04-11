# MacroPulse — The Living Ledger

> 한미 기준금리 · USD/KRW 환율 실시간 대시보드 & Gemini AI 거시경제 분석

[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://macro-pulse.cc)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)

---

https://macro-pulse.cc/

## 주요 기능

| 기능 | 설명 |
|:-----|:-----|
| 📈 **금리 대시보드** | 한국(BOK) · 미국(FED) 기준금리 실시간 비교 차트 |
| 📊 **금리 스프레드** | BOK−FED 금리 차이 추이 (Area Chart) |
| 💱 **환율 차트** | USD/KRW 원달러 환율 추이 |
| 🔀 **상관 분석** | 기준금리 × 환율 듀얼 Y축 결합 차트 |
| 🤖 **AI 분석** | Gemini 2.5 Flash 기반 거시경제 채팅 (SSE 스트리밍) |
| 🎨 **WebGL 셰이더** | Three.js 크로매틱 사인 웨이브 히어로 배경 |
| 📅 **이벤트 타임라인** | FOMC, 금통위 등 주요 경제 일정 |
| ⏳ **데이터 범위** | 6개월 ~ MAX (1990년~, 최대 35년) |

---

## 기술 스택

```
Frontend    React 19 + Vite 8 + Tailwind CSS 3
Charts      Chart.js (react-chartjs-2)
3D/WebGL    Three.js (크로매틱 셰이더)
AI          Google Gemini 2.5 Flash (SSE)
Backend     Cloudflare Pages Functions (Workers)
Hosting     Cloudflare Pages
```

---

## 프로젝트 구조

```
MacroPulse/
├── functions/api/           # Cloudflare Workers (Backend)
│   ├── rates.js             # GET /api/rates — BOK + FED 금리
│   ├── exchange.js          # GET /api/exchange — USD/KRW 환율
│   └── gemini.js            # POST /api/gemini — AI 분석 (SSE)
├── public/                  # 정적 파일
│   ├── og-image.png         # Open Graph 이미지
│   ├── favicon.svg          # 파비콘
│   ├── robots.txt           # 검색엔진 크롤러
│   └── sitemap.xml          # 사이트맵
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # 글래스모픽 플로팅 네비바
│   │   ├── Hero.jsx         # WebGL 셰이더 히어로
│   │   ├── WebGLShader.jsx  # Three.js 셰이더 컴포넌트
│   │   ├── Dashboard.jsx    # 금리/환율 차트 + 카드
│   │   ├── GeminiChat.jsx   # AI 채팅 패널
│   │   ├── EventTimeline.jsx
│   │   └── Footer.jsx
│   ├── utils/
│   │   ├── api.js           # API 클라이언트 + SSE 스트리밍
│   │   └── chartConfig.js   # Chart.js 프리셋
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css            # Organic Tech 디자인 시스템
├── wrangler.toml            # Cloudflare 설정
├── .dev.vars                # 로컬 개발용 시크릿 (git 제외)
└── tailwind.config.js       # 디자인 토큰
```

---

## 빠른 시작

### 1. 설치

```bash
git clone <repo-url>
cd MacroPulse
npm install
```

### 2. API 키 발급

| API | 발급 페이지 |
|:----|:-----------|
| 한국은행 ECOS | https://ecos.bok.or.kr/api/#/MyPage |
| FRED (St. Louis Fed) | https://fredaccount.stlouisfed.org/apikeys |
| Google Gemini | https://aistudio.google.com/app/apikey |

### 3. 로컬 환경변수 설정

`.dev.vars` 파일 생성:

```env
ECOS_API_KEY=your_ecos_key
FRED_API_KEY=your_fred_key
GEMINI_API_KEY=your_gemini_key
```

### 4. 로컬 실행

```bash
# 프론트엔드만 (API 미포함)
npm run dev

# 풀스택 (프론트 + Workers Functions)
npm run dev:full
```

---

## 배포

### Cloudflare Pages

```bash
# 1. 빌드
npm run build

# 2. 배포
npx wrangler pages deploy ./dist --commit-dirty=true

# 3. 시크릿 등록 (최초 1회)
echo "YOUR_KEY" | npx wrangler pages secret put ECOS_API_KEY --project-name macropulse
echo "YOUR_KEY" | npx wrangler pages secret put FRED_API_KEY --project-name macropulse
echo "YOUR_KEY" | npx wrangler pages secret put GEMINI_API_KEY --project-name macropulse
```

> `functions/` 디렉토리는 `pages deploy` 시 자동으로 Workers로 변환됩니다. 별도 배포 불필요.

---

## API 엔드포인트

| Method | Path | 설명 |
|:-------|:-----|:-----|
| `GET` | `/api/rates?start_date=&end_date=` | 한미 기준금리 병합 데이터 |
| `GET` | `/api/exchange?start_date=&end_date=&frequency=m` | USD/KRW 환율 |
| `POST` | `/api/gemini` | Gemini AI 분석 (SSE 스트리밍) |

---

## 디자인 시스템

**Organic Tech — "The Living Ledger"**

- 팔레트: Moss (`#182a21`) / Clay (`#a53c19`) / Cream (`#fbf9f2`)
- 타이포: Plus Jakarta Sans · Cormorant Garamond · IBM Plex Mono
- 글래스모픽 네비바 · 그레인 오버레이 · 앰비언트 섀도우
- 3rem 코너 라디어스 · No-Line 규칙

---

## 라이선스

MIT