// Original fan-made situational reactions, not official character dialogue.
// Group-specific short chatter intentionally differs from rare cinematic skill lines.
const GROUP_LINES={
 leo:{
  summon:{ko:'우리의 연주로 막아 보자.',ja:'私たちの演奏で守ろう。',en:"Let's hold the line with our music."},
  danger:{ko:'저 표시… 바로 피해야 해!',ja:'あの印……すぐに避けて！',en:'That marker! Move away now!'},
  avoid:{ko:'휴… 박자를 놓치지 않았어.',ja:'よかった……間に合った。',en:'Good, we made it in time.'},
  hit:{ko:'잠깐… 소리가 멈췄어.',ja:'ちょっと……音が止まった。',en:'Wait... The sound stopped.'},
  boss:{ko:'커다란 소리가 와. 조심해!',ja:'大きな音が来る。気をつけて！',en:'Something huge is coming. Be careful!'}
 },
 mmj:{
  summon:{ko:'모두의 희망을 지켜 낼게!',ja:'みんなの希望を守るよ！',en:"We'll protect everyone's hope!"},
  danger:{ko:'위험 표시야! 얼른 이동하자!',ja:'危険の印だよ！早く移動して！',en:'Danger marker! We need to move!'},
  avoid:{ko:'좋아! 다음 무대도 힘내자!',ja:'よし！次のステージも頑張ろう！',en:"Great! Let's keep it up!"},
  hit:{ko:'아앗, 잠깐만! 다시 맞추자!',ja:'あっ！もう一度合わせよう！',en:'Ah! We can recover our rhythm!'},
  boss:{ko:'모두 준비됐지? 무대가 시작돼!',ja:'みんな準備はいい？始まるよ！',en:'Everyone ready? Here comes the big act!'}
 },
 vbs:{
  summon:{ko:'지금부터 제대로 보여 주자.',ja:'ここから本気を見せよう。',en:"Let's show them what we've got."},
  danger:{ko:'저 위치 위험해! 옮겨!',ja:'その場所は危ない！移動して！',en:'That spot is dangerous! Move!'},
  avoid:{ko:'좋아, 타이밍 딱 맞았어.',ja:'よし、タイミングぴったりだ。',en:'Nice. Perfect timing.'},
  hit:{ko:'젠장, 템포가 꼬였어!',ja:'くっ、テンポが乱れた！',en:'Tch, our tempo is off!'},
  boss:{ko:'큰 놈이 왔네. 제대로 가자!',ja:'大物が来た。本気でいこう！',en:'A big one? Bring it on!'}
 },
 wxs:{
  summon:{ko:'자, 멋진 쇼를 시작하자!',ja:'さあ、最高のショーを始めよう！',en:"Let's put on a wonderful show!"},
  danger:{ko:'앗! 무대 장치가 이상해! 피해!',ja:'あっ！装置が変だよ！逃げて！',en:'Uh-oh! That contraption is going wild!'},
  avoid:{ko:'세이프! 계속 공연하자!',ja:'セーフ！ショーを続けよう！',en:'Safe! The show goes on!'},
  hit:{ko:'아야! 이것도 연출…은 아니겠지?',ja:'いたっ！これは演出じゃないよね？',en:'Ouch! That was not part of the show!'},
  boss:{ko:'대형 출연자 등장! 모두 조심!',ja:'大物登場！みんな気をつけて！',en:'A giant guest star! Watch out!'}
 },
 n25:{
  summon:{ko:'…이 곡이 도움이 될 수 있다면.',ja:'……この曲が力になれるなら。',en:'...If this song can help.'},
  danger:{ko:'…저 자리는 위험해. 옮겨야 해.',ja:'……そこは危ない。移動して。',en:'...That position is dangerous. Move.'},
  avoid:{ko:'…다행이야. 아직 이어 갈 수 있어.',ja:'……よかった。まだ続けられる。',en:'...Good. We can keep going.'},
  hit:{ko:'…괜찮아. 다시 시작하면 돼.',ja:'……大丈夫。またやり直せる。',en:"...It's okay. We can start again."},
  boss:{ko:'…큰 이상현상이 느껴져. 조심해.',ja:'……大きな異変がする。気をつけて。',en:'...Something big is wrong. Be careful.'}
 },
 vs:{
  summon:{ko:'모두의 노래를 하나로 모아 보자!',ja:'みんなの歌をひとつにしよう！',en:"Let's bring our songs together!"},
  danger:{ko:'이상신호야! 표시된 곳을 피하자!',ja:'異常信号だよ！印の場所を避けて！',en:'Interference! Avoid the marked spot!'},
  avoid:{ko:'신호 회복! 좋아, 계속 가자!',ja:'信号回復！よし、続けよう！',en:'Signal restored! Keep it going!'},
  hit:{ko:'신호가 끊겼어! 잠깐만 버텨!',ja:'信号が切れた！少し耐えて！',en:'We lost the signal! Hold on!'},
  boss:{ko:'큰 신호가 다가와! 준비해!',ja:'大きな信号が来る！準備して！',en:'A powerful signal is coming! Get ready!'}
 }
};
export function situationalLine(group,event,lang='ko'){
 const set=GROUP_LINES[group]||GROUP_LINES.vs;
 const line=set[event]||set.summon;
 return line[lang]||line.ko;
}
export const PAIR_LINES={
 'star-siblings':{ko:'사키와 츠카사, 별빛을 하나로!',ja:'咲希と司、星の光をひとつに！',en:'Saki and Tsukasa shine together!'},
 'sisters':{ko:'시호와 시즈쿠, 서로의 소리에 응답했어.',ja:'志歩と雫、互いの音が重なった。',en:'Shiho and Shizuku found their harmony.'},
 'colors':{ko:'아키토와 에나의 색이 맞닿았어.',ja:'彰人と絵名の色が重なった。',en:'Akito and Ena found a shared color.'},
 'rooftop':{ko:'루이와 미즈키, 새로운 무대가 열려.',ja:'類と瑞希、新しい舞台が開く。',en:'Rui and Mizuki open a new stage.'},
 'twins':{ko:'린과 렌, 하나의 박자로!',ja:'リンとレン、同じリズムで！',en:'Rin and Len, in one rhythm!'},
 'miku-ichika':{ko:'미쿠와 이치카의 첫 노래가 이어져.',ja:'ミクと一歌の始まりの歌が続く。',en:"Miku and Ichika's first song lives on."},
 'miku-kanade':{ko:'미쿠와 카나데, 조용한 마음이 이어져.',ja:'ミクと奏、静かな想いがつながる。',en:'Miku and Kanade connect their hopes.'},
 'an-kohane':{ko:'안과 코하네, 둘의 비트가 맞춰졌어!',ja:'杏とこはね、ビートが合った！',en:'An and Kohane are in sync!'},
 'emu-nene':{ko:'에무와 네네, 깜짝 공연 준비 완료!',ja:'えむと寧々、びっくり公演の準備完了！',en:'Emu and Nene are ready for the show!'},
 'mafuyu-kanade':{ko:'마후유와 카나데의 멜로디가 이어져.',ja:'まふゆと奏のメロディーが重なる。',en:'Mafuyu and Kanade share a melody.'}
};
export function pairDiscoveryLine(heartId,lang='ko'){
 const data=PAIR_LINES[heartId];return data?(data[lang]||data.ko):null;
}
