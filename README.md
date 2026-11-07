# SEKAI RANDOM DEFENSE — HTML5 v0.6

정적 HTML5/CSS/JavaScript 기반의 **비공식·비영리 팬게임 프로토타입**입니다. 이미지 에셋 없이 실행되며, 캐릭터는 현재 코드로 그린 임시 픽셀 스프라이트입니다.

## GitHub Pages 업데이트 방법

1. ZIP을 압축 해제합니다.
2. 기존 `Proseka_Defense` 저장소의 **최상위 경로**에 `index.html`, `src/`, `styles/`, `.nojekyll`, `README.md` 등을 동일한 폴더 구조로 업로드해 덮어씁니다.
3. `src/core/SekaiMapArt.js`, `src/data/maps.js`, `src/core/Renderer.js`, `styles/v06.css`, `index.html`이 최신 버전인지 확인합니다.
4. 커밋 후 기존 GitHub Pages 주소를 새로고침합니다. 구버전이 나타나면 강력 새로고침(Ctrl+F5)을 시도하세요.

빌드 단계나 npm 설치는 필요하지 않습니다. `index.html`은 저장소 루트에 둡니다.

## v0.6 변경 사항

- 맵 3종을 **공식 세카이의 설정과 시각 특징**을 참고해 다시 구성했습니다.
  - 교실의 세카이: 석양 창문, 나무 바닥, 칠판, 교실 책상과 음악 장비
  - 스트리트의 세카이: 벽돌 건물, 공연 포스터·그래피티, 상점·카페 요소
  - 아무도 없는 세카이: 밝고 텅 빈 기하학적 공간, 철골과 삼각형 구조물
- 적의 **단일 폐회로 경로**를 바닥과 명확히 구분하고, 각 맵에서 다른 굴곡을 사용합니다.
- 캐릭터 배치 가능 영역과 장식물의 위치가 겹치지 않게 했습니다.
- 전투판 면적을 늘리고, 스마트폰 세로·가로 및 태블릿에서 각각 별도로 맞춥니다.
- 빈 캐릭터 패널을 숨기고, 강화 패널은 요청할 때만 표시합니다.
- 가로 화면의 결과창에서 세 버튼이 잘리는 문제를 수정했습니다.
- 크리스탈 소환, 마음의 조각 강화, 26명, 합성, 세카이의 마음, 1/2배속, 슬로모션 등 기존 로직 유지.

## 테스트

- 데이터 및 전투 규칙: `node tests/validate.mjs`
- 브라우저: 검은 안내 → 타이틀 → 입장 → 소환 → 선택 → 강화 → 가로 회전 → 감속 후 결과 화면을 Playwright로 점검했습니다.
- 이 테스트는 데스크톱 브라우저의 모바일/태블릿 **뷰포트 시뮬레이션**입니다. 실제 휴대전화 기기별 테스트까지 완료되었다는 뜻은 아닙니다.

## 자료·권리

공식 세계관 참고: https://www.colorfulstage.com/sekai/

배경 원본 이미지를 게임에 포함하거나 복사하지 않았고, Canvas 코드로 직접 제작한 팬게임용 도트 그래픽입니다. 비영리 고지와 별개로, 공개·배포 권리는 권리자의 별도 지침을 확인해야 합니다.


## v0.7 title logo update
- Three supplied Korean/Japanese/English logos placed under `assets/logos/`.
- Title shows the corresponding logo instantly when changing language in Settings.
- Replaced only the temporary title wordmark. Gameplay, battle UI, maps, notice, and rules are unchanged from v0.6.
- Static site: upload the complete contents of the ZIP to GitHub Pages (`main` / `(root)`).
