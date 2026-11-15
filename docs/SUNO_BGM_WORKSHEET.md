# 프로젝트 세카이 랜덤 디펜스 — Suno 전투 BGM 제작표 (v1.26)

## 방향 전면 수정

**세카이 분위기는 악기·화성의 개성이고, 음악의 중심은 타워디펜스 전투다.** 이전 시안의 학교 밴드 노래, 아이돌 무대곡, 몽환 피아노곡 같은 독립적인 테마송 지향은 삭제한다.

- 실제 플레이: 멤버 소환 → 같은 멤버 합성 → 적이 폐회로를 계속 순환 → 웨이브 압박 상승 → 5웨이브마다 보스 → 마지막 방어. 1판 약 10분.
- 음악이 담당할 역할: 반복 가능한 박자, 적이 몰리는 압박감, 소환과 공격 효과음 위에 얹히는 추진력. 첫 1~2초에 맥박을 제시하고, 8/16마디마다 타악기·베이스·짧은 동기 정도만 변주한다.
- 피할 것: 전면적인 노래 멜로디, AB형 팝 벌스·후렴, 길게 끊어지는 분위기 전환, 연주자 솔로, 영화 예고편식 빌드업/드롭, 대사처럼 들리는 보컬, 비싸지 않은 전자음 비프, 무의미한 과밀 레이어, 잔잔하게만 흘러가는 앰비언트.
- **모든 곡은 실제로 게임에서 반복되는 2~3분 구간을 만든다는 전제.** Suno가 분량·구간·매끄러운 루프를 정확히 보장하는 건 아니므로, 좋은 구간을 골라 별도로 오디오 편집한다.
- Suno Custom에서 **Instrumental**을 켠다. Lyrics는 비운다. 볼륨은 전투 효과음을 덮지 않도록 일정하게 구성한다.
- 곡 내부에 '보스 같은 압박 구간'을 넣는 것과 실제 보스 출현 시 BGM이 변하는 것은 다르다. 정확한 웨이브 동기화가 필요하면 훗날 전투용/보스용 2트랙을 분리하고 게임 코드에서 보스 전환을 구현해야 한다. 현재 맵당 BGM 한 슬롯뿐이다.

## 공통 Suno Style — 타워디펜스 코어

> Instrumental tactical tower-defense battle BGM, driving repetitive combat groove, immediate pulse from the first beat, relentless bass ostinato, tightly programmed drums with a strong kick and snare, short tense staccato motifs, rising pressure through subtle rhythmic variations every 8 to 16 bars. Music for continuously spawning enemies, summoning allies, merging units and defending against boss waves. High energy without a pop-song chorus; melody stays concise and secondary to rhythm. Clear midrange space for combat UI sounds, steady perceived loudness, clean layered mix, loop-friendly structure. No vocals, no choir, no spoken words, no long intro, no solos, no giant EDM drop, no cinematic trailer climax, no beeping effects, no slow ambient interlude, no fade-out.

아래 개별 프롬프트는 공통 원칙을 맵별로 구체화한 **완전한 독립 Style 입력**이다.

## 01 교실의 세카이 — roof.mp3

**전투 역할:** 경쾌하고 긴박한 초반 디펜스. 밴드의 악기 질감만 암시하고 밴드 '공연곡'으로 만들지 않는다. BPM 142.

> Original instrumental tower-defense battle loop, 142 BPM, tight live drums and repetitive driving electric-bass ostinato, rhythmic muted electric guitars and short urgent piano stabs, compact minor-key two-bar motif. Constant motion for endless incoming enemy waves, tactical urgency, short percussive rises every 8 bars, measured low-tom boss accents and immediate return to the core pulse. Light school-band instrument character but never a school rock song or concert performance, restrained guitar melody, controlled mids and crisp but not piercing treble. No vocal, no choir, no chorus, no long intro, no breakdown, no solo, no fade-out, loop-friendly.

## 02 스테이지의 세카이 — stage.mp3

**전투 역할:** 활기찬 방어전과 점점 빨라지는 대응. 아이돌 팝이 아니라 바운스가 살아 있는 전투 루프. BPM 144.

> Original instrumental tactical tower defense music, 144 BPM, persistent dance-funk combat rhythm, round punchy kick, snappy snare, syncopated melodic bass, tight clean guitar chops, concise bright synth stabs and controlled percussion layers. Energetic tactical pressure under a lively stage atmosphere, rapid 8-bar rhythmic development and brief stronger enemy-wave accents. Minimal short melodic motifs, steady groove with no pop chorus or song vocals, no huge EDM drop, no long buildup, no break in pulse, no bright chime spam, no fade-out, clean loop-ready game BGM.

## 03 스트리트의 세카이 — city.mp3

**전투 역할:** 박자와 배치의 긴장. 브레이크비트·베이스가 메인이지만 힙합 감상곡이 되지 않도록 한다. BPM 136.

> Original instrumental defense battle loop, 136 BPM, fast syncopated breakbeat drums, deep controlled bass ostinato, tight rhythmic Rhodes stabs, sparse brass accents and short dark synth patterns. Aggressive but clean live-house street battle energy. Continuous enemy-wave pressure, pulsing minor-key motif every two bars, rhythmic layers evolving without losing the beat, compact boss-wave drum fills and immediate return to the main groove. Music built for strategy gameplay rather than a hip-hop single; no rap, no vocals, no pop sections, no turntable voice samples, no excessive high hats, no giant drop, no fade-out.

## 04 원더랜드의 세카이 — wonderland.mp3

**전투 역할:** 놀이공원의 불규칙한 방해와 급박한 쇼 방어. 우스꽝스러운 효과음 대신 장난기 있는 전투 리듬. BPM 148.

> Original instrumental whimsical tower defense battle music, 148 BPM, brisk marching snare and kick, busy but controlled pizzicato bass ostinato, sharp accordion and clarinet stabs, short mallet and string phrases in tense minor harmony. Clockwork-like repeating combat pulse, unpredictable rhythmic accents that suggest incoming enemy waves, recurring 8-bar motif, sudden but very brief tactical tension spikes, immediately resuming the main groove. Playful, urgent and precise, not a theater song or circus performance. No voices, no choir, no cartoon sound effects, no giant orchestral climax, no long interlude, no ending flourish.

## 05 아무도 없는 세카이 — night.mp3

**전투 역할:** 차갑고 불안한 생존형 방어. 공허한 감성 피아노곡이 아니라 위협적인 저역 박동으로 전투를 유지. BPM 128.

> Original instrumental dark survival tower-defense battle loop, 128 BPM, restrained but relentless electronic percussion with precise kick and snare, repetitive low piano ostinato, deep warm sub-bass pulse, distant muted strings and sparse glassy accents. Empty, fragile and unsettling atmosphere over a clearly audible combat beat, repeating two-bar dissonant motif, intensifying rhythmic accents every 8 to 16 bars as enemy pressure increases. Subtle emotional tone without turning into sad ambient piano music. No soft ballad, no vocals, no choir, no long pauses, no artificial glitch beeps, no ambient-only passages, no fade-out.

## 06 닫힌 창의 세카이 — closedwindow.mp3

**전투 역할:** 압도적인 적의 침입을 견디는 어두운 긴장전. BPM 134.

> Original instrumental tense tactical tower defense music, 134 BPM, unbroken mechanical drum and low-string pulse, syncopated dark analog bass, sparse short piano notes, clipped strings, restrained metallic percussion. Constrained closed-window atmosphere, ominous but disciplined minor harmony, repeated 2-bar combat motif and heavier accents as enemy waves intensify. Avoid drifting ambience; keep persistent forward momentum and room for game sound effects, short dramatic hits without stopping the groove, no vocals, no choir, no cinematic trailer impact sequence, no EDM drops, no piercing beeps, no fade-out, loop-oriented.

## 07 열린 창의 세카이 — openwindow.mp3

**전투 역할:** 밝은 희망을 품었지만 적과 싸우는 방어전. 따뜻함은 화성에서, 리듬은 계속 긴장감 있게. BPM 138.

> Original instrumental hopeful but urgent tower defense battle loop, 138 BPM, precise driving kick and snare, warm elastic bass ostinato, rhythmic piano chords, bright clean-guitar pulses, short high-string counter-motifs, subtle marimba accents. Determined pressure from continuous approaching enemies, bright harmony over a tense repetitive combat rhythm, gradual percussive layering every 8 bars, concise boss-like accents followed by a smooth return to the main beat. Warm and courageous but never a soft uplifting pop track; no big sung chorus, no vocals, no choral pads, no lengthy buildup, no quiet bridge, no fade-out, loop-ready.

## 만드는 순서

1. **교실 맵**으로 먼저 2~3개 생성. 무엇보다 '타워디펜스 전투 BGM'처럼 들리는가를 우선 검수한다. 기타·피아노가 노래의 주인공이 되면 탈락.
2. 재생을 계속 반복하면서 소환·합성·적 공격 SFX가 가려지지 않는지 확인한다. 대사가 나오는 구간에도 보컬처럼 들리는 질감을 피한다.
3. 선택한 트랙에서 8/16마디 반복 단위를 맞추고 필요하면 짧은 크로스페이드로 편집한다. 실제 루프 테스트 후에만 Assets/music에 추가한다.
4. **승인 전까지 src/data/musicTracks.js의 7개 슬롯은 null**로 유지한다.

