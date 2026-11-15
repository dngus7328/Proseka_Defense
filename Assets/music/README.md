# Suno 배경음악 넣는 위치

배경음악은 개발자가 Suno로 만든 뒤 승인한 파일만 사용합니다. 자동 생성된 합성 BGM은 v1.19에서 제거되었습니다.

준비한 MP3 또는 OGG 파일을 이 폴더에 넣고, `src/data/musicTracks.js`의 해당 맵 값을 정확한 파일 경로로 변경하면 됩니다.

예: `roof: './Assets/music/roof.mp3'`

각 맵: `roof`, `stage`, `city`, `wonderland`, `night`, `closedwindow`, `openwindow`.

**음원이 등록되지 않은 맵은 무음**이 맞습니다. 효과음은 별도입니다. 음원이 자동으로 추가되지는 않습니다.
