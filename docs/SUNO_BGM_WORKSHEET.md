# 프로젝트 세카이 랜덤 디펜스 — Suno 오리지널 BGM 제작표 (v1.25)

원작 프로젝트 세카이의 기존 곡 멜로디, 곡명, 작곡가, 공식 효과음은 프롬프트에서 참조하지 않는다. 모든 음악은 독립적인 게임 BGM이며 별도 승인 후 사용한다.

## 공통 Suno 설정

**Custom → Instrumental 켜기**. Lyrics 칸은 비워 두기. 출력 목표 2분~3분, 약 4/4의 8마디 단위 반복 구조, 첫 2~4초 안에 리듬 시작. 전투 효과음·캐릭터 대사에 비해 BGM이 앞으로 튀지 않게 믹스 요청.

**공통 금지:** vocals, lyrics, voice samples, spoken word, chanting, choir, vocal chops, loud synthetic beeps, endless risers, huge EDM drops, aggressive limiting. 실제 AI 음악에서는 생성 모델이 길이/루프를 확정하지 않으므로 최종 음원을 직접 잘라 반복 가능한 구간을 검수한다.

## 교실의 세카이 — roof.mp3

상황: 석양의 교실, 합주, 조용한 긴장감. 약 154 BPM.

Suno Style Prompt:

> Original instrumental JRPG defense music for a band rehearsal at sunset, 154 BPM, steady live drum kit, picked electric bass, two crisp rhythmic electric guitars, subtle overdrive, clean melodic guitar accents and soft warm piano. Nostalgic school band energy with light battle tension. Immediate 4/4 groove, evolving 8-bar phrases, controlled dry mix, compact instrumental hooks, no endless solos, no exaggerated drops, no singers, no choir, no voice samples. Around 2:30, arrangement suitable for an unobtrusive seamless-loop battle BGM.

## 스테이지의 세카이 — stage.mp3

상황: 응원을 되찾는 아이돌 공연장. 약 136 BPM.

Suno Style Prompt:

> Original instrumental upbeat idol-stage defense theme, 136 BPM, bouncy disco-pop groove, tight kick and snare, warm melodic bass, clean funk guitar, short keyboard stabs, light strings and handclap percussion. Bright determined performance atmosphere, short catchy instrumental motifs alternating with quieter accompaniment for game sound effects, clean controlled mix, 8-bar loops. No excessive supersaws, no electronic riser, no lyrical voice, no choir or vocal chops. About 2:30.

## 스트리트의 세카이 — city.mp3

상황: 라이브 하우스, 거리 음악, 대결. 약 108 BPM.

Suno Style Prompt:

> Original instrumental urban battle groove, 108 BPM, syncopated breakbeat drums, tight round electric bass, Rhodes keyboard chords, muted guitar, sparse brass hits and lightly dusty live-house texture. Confident rhythmic urban energy, minor-key instrumental hook, no overcompression, immediate groove, strong beat without distracting lead, evolving 8-bar phrases. No rap, no spoken word, no vocals, no vocal chops, no trap hi-hat overload, no cheesy synthesizer sounds. 2:30, loopable arrangement.

## 원더랜드의 세카이 — wonderland.mp3

상황: 유쾌하지만 위기 있는 놀이공원 쇼. 약 140 BPM.

Suno Style Prompt:

> Original instrumental theatrical amusement-park defense soundtrack, 140 BPM, playful accordion, clarinet phrases, pizzicato strings, toy percussion, lively upright bass, marching snare and a clear drum pulse. Whimsical musical theater adventure with a mischievous minor-key twist, regular 4/4 rhythm, short motifs with clear breathing space, expressive but tidy acoustic ensemble. No carnival sound-effect samples, no choir, no singing, no spoken words, no oversized cinematic climax. Around 2:30, looping game music.

## 아무도 없는 세카이 — night.mp3

상황: 고요한 빈 공간, 불안과 감정. 약 96 BPM.

Suno Style Prompt:

> Original instrumental introspective defense music, 96 BPM, felt piano ostinato, warm electric piano, soft pulsing low bass, restrained electronic percussion, subtle bowed string harmonics and distant clean guitar. Fragile empty atmosphere, calm but uneasy progression, space between notes, gradual harmonic development, steady rhythm under the quiet surface, repeated 8-bar ideas. No vocals, no choir, no soaring emotional pop lead, no harsh glitch or high pitched beeps. About 2:35, loop-friendly.

## 닫힌 창의 세카이 — closedwindow.mp3

상황: 갇힌 공간과 창문의 불안, 낮은 긴장. 약 114 BPM.

Suno Style Prompt:

> Original instrumental dark chamber-electronic battle loop, 114 BPM, layered low strings, sparse minor piano, soft analog bass pulses, firm unobtrusive drum groove, subtle glass mallet accents and repeating string figures. Closed window atmosphere, unsettled yet graceful tension, 4/4 meter, restrained evolving motifs, clean low-frequency separation, immediate groove. No cinematic impacts, no horror stingers, no synthetic beeping, no big EDM drops, no chanting, no singing. Around 2:30, seamless-loop-friendly.

## 열린 창의 세카이 — openwindow.mp3

상황: 바람·빛·함께 나아가는 결심. 약 126 BPM.

Suno Style Prompt:

> Original instrumental hopeful chamber-pop game battle theme, 126 BPM, warm piano arpeggios, clean electric guitar, soft precise drum kit, melodic bass, gentle strings and marimba accents. Bright airy open-window atmosphere with cautious resolve, six small instrumental motifs gradually joining into a united groove, 8-bar repeating phrases with balanced dynamics, concise intro and no overblown ending. No singers, no choir, no voice samples, no exaggerated synth swells. Around 2:30, loopable video game BGM.

## 제작·검수

1. 먼저 교실의 세카이 2~3개 버전 생성.
2. 멤버 피격·소환·필살기 효과음과 함께 듣고, 보컬 유사 소리/과도한 고역/무한 반복 피로 확인.
3. 음원을 승인한 후에만 Assets/music 폴더에 저장.
4. src/data/musicTracks.js의 해당 맵 항목을 파일 경로로 변경. 지금은 일곱 슬롯 모두 null로 유지한다.

반복 편집은 오디오 파일의 드럼 박자를 기준으로 자르고 수십~수백 밀리초의 크로스페이드로 연결하되, 실제 재생 테스트를 통해 루프 이음새를 확인한다.
