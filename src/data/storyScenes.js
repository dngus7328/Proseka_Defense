// Fan-created story. These are original lines for the game, not official script.
// Every SEKAI has a two-speaker introduction and its own five difficulty scenes.
const tr=(ko,ja,en)=>({ko,ja,en});
export const OPENING=[
 {speaker:'miku',line:tr('모두에게 전해야 할 이야기가 있어.','みんなに伝えたいことがあるの。','There is something I need to tell everyone.')},
 {speaker:'miku',line:tr('세카이 곳곳에서 이상한 반응이 나타났어. 우리가 아끼는 장소까지 조금씩 변하고 있어.','セカイのあちこちで異常な反応が出ているの。大切な場所まで、少しずつ変わり始めている。','Strange signals are appearing across the SEKAI. Even the places we treasure are changing.')},
 {speaker:'miku',line:tr('혼자서는 막기 어려워. 각 세카이의 멤버들과 힘을 합쳐 줘.','一人では止められない。各セカイの仲間たちと力を合わせてほしいの。','I cannot stop this alone. Please help the members of each SEKAI protect their worlds.')}
];
const WORLD={
 roof:{
  lead:'ichika',partner:'saki',
  intro:[
   tr('어제까진 평범한 교실이었는데… 악기 소리가 이상하게 뒤틀리고 있어.','昨日まではいつもの教室だったのに…楽器の音が変に歪んでる。','This was our usual classroom yesterday… but the instruments sound distorted.'),
   tr('우리가 다시 함께 연주할 수 있도록, 이 교실을 지키자!','またみんなで演奏できるように、この教室を守ろう！','Then let us protect this classroom, so we can play together again!')
  ],
  tiers:[
   tr('처음엔 작은 이상 신호뿐이야. 멤버를 모으면서 침착하게 막아 보자.','まだ小さな異変だけ。落ち着いてメンバーを集めよう。','Only small disturbances for now. Let us gather everyone and hold steady.'),
   tr('소리가 한 박자씩 어긋나. 빈 곳이 생기지 않도록 연계를 지켜 줘.','音が少しずつずれてる。連携が途切れないようにしないと。','The rhythm is slipping. We cannot let the band lose its coordination.'),
   tr('적이 합주를 끊으려는 것 같아. 더 빠르게 연결해 반격하자.','敵は私たちの合奏を止めたいみたい。連携を速めて反撃しよう。','They are trying to break up our performance. We will answer with faster teamwork.'),
   tr('교실 전체에 왜곡이 퍼졌어. 마지막까지 네 명이 함께 버텨야 해.','教室中に歪みが広がった。最後まで4人で支え合おう。','The distortion has spread across the classroom. All four of us must hold on.'),
   tr('노래가 끝나도 이상 신호는 계속돼. 끝이 보이지 않아도 연주를 이어 가자.','曲が終わっても異変は止まらない。終わりが見えなくても演奏しよう。','The anomaly continues after the song. Let us keep playing, even without an end.')
  ],
  win:tr('교실에 다시 익숙한 소리가 돌아왔어. 다음 합주도 모두와 함께할 수 있겠네.','教室にいつもの音が戻った。またみんなで演奏できるね。','Our familiar sound is back in the classroom. We can rehearse together again.'),
  lose:tr('아직 소리가 어긋나고 있어. 편성을 다시 맞춰서 한 번 더 해 보자.','まだ音が乱れてる。編成を立て直して、もう一度挑もう。','The sound is still out of tune. Let us adjust the lineup and try again.')
 },
 stage:{
  lead:'minori',partner:'haruka',
  intro:[
   tr('무대의 조명도, 음악도 이상해졌어… 하지만 기다리는 사람들이 있어!','ステージの照明も音楽もおかしくなった…でも待ってくれる人がいる！','The lights and the music have gone strange… but people are counting on us!'),
   tr('우리의 무대를 되찾자. 모두가 다시 웃을 수 있도록.','私たちのステージを取り戻そう。みんながまた笑えるように。','Let us reclaim the stage so everyone can smile again.')
  ],
  tiers:[
   tr('무대의 작은 흔들림부터 막아 보자. 첫 공연은 차분히 시작하는 거야!','まずは小さな異変から。落ち着いて始めよう！','We will start with the smallest disturbance and settle into the show.'),
   tr('조명이 엇갈려도 괜찮아. 서로의 위치를 확인하면 돼!','照明がずれても大丈夫。お互いの位置を確かめよう！','Even if the lights shift, we can watch out for each other.'),
   tr('공연 중간에 강한 적이 들어오고 있어. 흐름을 끊기지 않게 해 줘!','公演の途中で強い敵が来る。流れを止めないで！','A powerful enemy is approaching mid-show. We cannot lose the momentum!'),
   tr('마지막 조명까지 꺼지려 해… 여기서 포기할 수는 없어!','最後の照明まで消えそう…ここで諦めるわけにはいかない！','Even the last lights are going out… but we cannot give up here!'),
   tr('관객의 응원이 계속되는 한, 이 무대도 계속될 거야!','応援が続く限り、このステージも続けていこう！','As long as people keep cheering, this stage will stay alive!')
  ],
  win:tr('무대에 다시 빛이 켜졌어! 이 노래를 기다려 준 모두에게 고마워.','ステージに光が戻った！待っていてくれたみんなにありがとう。','The stage lights are back! Thank you to everyone who waited for us.'),
  lose:tr('지금은 막이 내려갔지만… 다음엔 꼭 모두에게 노래를 전할 거야.','今は幕が下りたけど…次こそ歌を届けたい。','The curtain fell early this time… but next time our song will reach everyone.')
 },
 city:{
  lead:'kohane',partner:'an',
  intro:[
   tr('우리가 연습하던 거리까지 이상해졌어… 그래도 도망치고 싶진 않아.','練習していたストリートまでおかしくなった…でも逃げたくない。','Even the street where we practiced has changed… but I do not want to run away.'),
   tr('그럼 같이 맞서자! 이곳의 음악은 우리가 지키는 거야.','だったら一緒に立ち向かおう！ここの音楽は私たちが守るんだ。','Then we face it together! We are protecting the music of this place.')
  ],
  tiers:[
   tr('첫 비트에 맞춰 시작하자. 흐름을 타면 이길 수 있어.','最初のビートから合わせよう。流れをつかめば勝てるよ。','Catch the first beat and stay in the groove. We can do this.'),
   tr('거리의 이상 신호가 빨라졌어. 한 박자도 놓치지 말자.','ストリートの異変が速くなった。一拍も逃さないで。','The signal is getting faster. We cannot miss a beat.'),
   tr('강한 적이 박자를 흔들고 있어. 서로의 타이밍을 믿어!','強い敵がリズムを乱してる。みんなのタイミングを信じて！','The stronger enemies are breaking our rhythm. Trust the timing!'),
   tr('이곳을 내줄 생각은 없어. 지금까지 연습한 모든 걸 쏟아붓자!','ここを渡すつもりはない。練習してきた全部をぶつけよう！','We are not giving this place up. Put everything we practiced into it!'),
   tr('비트가 멈추지 않는 한, 우린 계속 앞으로 나아갈 거야.','ビートが止まらない限り、私たちも進み続ける。','As long as the beat goes on, we keep moving forward.')
  ],
  win:tr('들려? 스트리트의 비트가 다시 살아났어. 이제 우리 차례야!','聞こえる？ストリートのビートが戻ってきた。今度は私たちの番！','Hear that? The street beat is back. Now it is our turn!'),
  lose:tr('한 번의 실수로 끝내진 않아. 다음엔 더 정확한 타이밍으로 맞서자.','一度の失敗じゃ終わらない。次はもっと正確にいこう。','One setback will not stop us. Next time, we hit every beat.')
 },
 wonderland:{
  lead:'tsukasa',partner:'emu',
  intro:[
   tr('원더랜드에 이상한 손님이 들어왔군! 쇼를 망치게 둘 순 없다!','ワンダーランドに妙なお客が来たな！ショーを壊させるものか！','We have some very strange guests! I will not let them ruin the show!'),
   tr('그럼 우리 모두를 웃게 만드는 무대를 지키자! 원더호이!','じゃあみんなを笑顔にするステージを守ろう！わんだほーい！','Then let us protect the stage that makes everyone smile! Wonderhoy!')
  ],
  tiers:[
   tr('첫 번째 공연이다! 멋진 시작을 보여 주자!','第一幕だ！華々しく始めよう！','The first act begins! Let us put on a splendid opening!'),
   tr('예상 밖의 방해가 나왔군! 무대 장치를 활용해 대응하자!','予想外の邪魔が入った！舞台装置で切り抜けよう！','An unexpected interruption! We will use the stage to our advantage!'),
   tr('적이 계속 몰려오는군… 하지만 쇼는 끝나지 않았다!','敵が次々と来る…だがショーは終わらない！','The enemies keep coming… but the show is not over!'),
   tr('최고의 무대를 위한 마지막 시험이다! 모두 준비됐나?','最高のショーへの最後の試練だ！皆、準備はいいか？','The ultimate test for our greatest show! Is everyone ready?'),
   tr('끝나지 않는 앙코르다! 지치지 말고 관객을 웃게 하자!','終わらないアンコールだ！笑顔を届け続けよう！','An endless encore! Let us keep bringing smiles!')
  ],
  win:tr('커튼콜이다! 원더랜드에 다시 웃음이 가득해졌어!','カーテンコールだ！ワンダーランドに笑顔が戻ったぞ！','Curtain call! The Wonderland is filled with smiles again!'),
  lose:tr('오늘의 공연은 잠시 중단이다… 다음 막에서는 반드시 성공하자!','今日の公演は一時中断だ…次の幕で必ず成功するぞ！','The show is paused for today… but the next act will be a triumph!')
 },
 night:{
  lead:'kanade',partner:'mafuyu',
  intro:[
   tr('여기는 늘 조용했는데… 이제는 이 공간 자체가 흔들리는 것 같아.','ここはいつも静かだったのに…今は空間そのものが揺れているみたい。','This place used to be quiet… now it feels as if the space itself is shaking.'),
   tr('이상이 번지기 전에 막자. 아직 이곳에 남겨야 할 소리가 있어.','異変が広がる前に止めよう。ここにはまだ残したい音がある。','Let us stop it before it spreads. There is still music I want to leave here.')
  ],
  tiers:[
   tr('지금 보이는 작은 균열부터 천천히 막아 보자.','見える小さな亀裂から、少しずつ止めていこう。','Let us start with the small cracks we can see.'),
   tr('소리가 사라지는 구간이 늘고 있어… 멤버들의 위치를 살펴줘.','音が消える場所が増えている…みんなの位置を確認して。','More places are losing their sound… keep an eye on everyone.'),
   tr('왜곡이 예상보다 깊어. 그래도 난 멈추고 싶지 않아.','歪みが思ったより深い。それでも私は止まりたくない。','The distortion runs deeper than I thought. But I do not want to stop.'),
   tr('이대로라면 모든 게 사라질지도 몰라… 여기서 막을게.','このままだと全部消えてしまうかもしれない…ここで止める。','If this continues, everything may vanish… I have to stop it here.'),
   tr('끝이 보이지 않더라도, 아직 전하고 싶은 마음이 남아 있어.','終わりが見えなくても、伝えたい想いはまだある。','Even without an end, there are still feelings I want to share.')
  ],
  win:tr('아직 전부 해결된 건 아니야. 그래도… 이곳의 조용한 소리가 돌아왔어.','全部解決したわけじゃない。でも…この場所に静かな音が戻った。','It is not all resolved. But… this place has its quiet sound again.'),
  lose:tr('내가 놓친 게 있었나 봐… 다음에는 이곳을 지킬 수 있게 다시 생각할게.','見落としていたことがあるみたい…次は守れるように考え直す。','I must have overlooked something… I will rethink the plan and try again.')
 },
 closedwindow:{
  lead:'miku',partner:'kaito',
  intro:[
   tr('닫힌 창 너머에서 이상한 흔들림이 느껴져. 아직 움직이지 않는 마음들이 있어.','閉ざされた窓の向こうから異変を感じる。まだ動けない想いがあるんだ。','I can sense a disturbance beyond these closed windows. Some feelings are still trapped.'),
   tr('모두 여기에 있어. 여섯 명이 함께라면 길을 찾을 수 있을 거야.','みんなここにいる。6人なら道を見つけられるはずだよ。','All six of us are here. Together, we can find a way through.')
  ],
  tiers:[
   tr('첫 번째 창의 틈을 확인하자. 작은 변화부터 놓치지 말아 줘.','最初の窓の隙間を調べよう。小さな変化も見逃さないで。','Look for the first crack in the window. Even small changes matter.'),
   tr('창마다 다른 신호가 들려. 여섯 명의 연결을 잃지 말자.','窓ごとに違う信号がある。6人のつながりを失わないように。','Each window carries a different signal. Keep all six of us connected.'),
   tr('흔들림이 커졌어. 서로의 소리를 따라 움직여야 해.','揺らぎが強くなった。互いの音を追って進もう。','The disturbance is growing. Follow each other’s voices.'),
   tr('거의 모든 창이 닫히고 있어… 그래도 마지막까지 함께할 거야.','ほとんどの窓が閉じかけている…最後まで一緒だよ。','Almost every window is closing… but we will stay together.'),
   tr('닫힌 창이 끝없이 나타나도, 우리 마음까지 가둘 수는 없어.','窓がどれだけ閉ざされても、想いまでは閉じ込められない。','No matter how many windows close, our feelings cannot be locked away.')
  ],
  win:tr('창 너머에서 작은 빛이 보이기 시작했어. 모두의 목소리가 닿은 것 같아.','窓の向こうに小さな光が見えた。みんなの声が届いたみたい。','A little light is appearing beyond the window. Our voices must have reached it.'),
  lose:tr('아직 창이 열리지 않았어. 서두르지 말고 여섯 명의 힘을 다시 모으자.','まだ窓は開かなかった。焦らず6人の力を集め直そう。','The window remains shut. We will gather our strength again, without rushing.')
 },
 openwindow:{
  lead:'miku',partner:'luka',
  intro:[
   tr('이번에는 창이 열려 있어. 하지만 열린 틈으로 이상 신호가 들어오고 있어.','今度は窓が開いている。でも隙間から異変が入り込んでいるの。','These windows are open now, but something strange is slipping through them.'),
   tr('열린 길을 지키는 것도 중요해. 우리 여섯 명이 함께할게.','開いた道を守ることも大切よ。私たち6人が一緒にいるわ。','Keeping this path open matters, too. All six of us will stand together.')
  ],
  tiers:[
   tr('열린 창 가까이에서 시작하자. 작은 이상 신호부터 막아 줘.','開いた窓のそばから始めよう。小さな異変を止めて。','Start near the open window. Hold off the smallest disturbances.'),
   tr('새로운 바람과 함께 적도 빨라졌어. 길을 놓치지 말자.','新しい風と一緒に敵も速くなった。進路を見失わないで。','The new breeze has brought faster enemies. Keep watch over the path.'),
   tr('창문 사이로 왜곡이 밀려와… 서로 연결해서 버텨야 해.','窓の間から歪みが押し寄せる…力を合わせて守ろう。','The distortion is pouring through the windows… hold the line together.'),
   tr('이 문을 닫지 않기 위해서라도 끝까지 싸워야 해.','この扉を閉じないためにも、最後まで戦わないと。','We must fight to the end, so these windows can stay open.'),
   tr('빛이 계속 들어오고 있어. 우리도 끝없이 지켜 나가자.','光はまだ差し込んでいる。私たちも守り続けよう。','The light keeps coming in. Let us protect this place as long as it takes.')
  ],
  win:tr('바람이 다시 부드러워졌어. 이 창을 통해 더 많은 마음이 이어질 거야.','風がまた穏やかになった。この窓からもっと多くの想いがつながるわ。','The breeze feels gentle again. More feelings will be able to pass through this window.'),
  lose:tr('창은 아직 흔들리고 있어. 다시 힘을 모아 이 길을 지키자.','窓はまだ揺れている。また力を合わせてこの道を守ろう。','The window is still shaking. Let us regroup and protect the path.')
 }
};
export function getOpening(lang='ko'){
 return OPENING.map((v,i)=>({speaker:v.speaker,tag:i===0?'PROLOGUE':'ANOMALY',text:v.line[lang]||v.line.ko}));
}
export function getMissionStory(mapId,difficulty,firstWorld,firstDifficulty,lang='ko'){
 const world=WORLD[mapId];if(!world)return[];
 const out=[];
 if(firstWorld){
  for(const [i,line] of world.intro.entries())
   out.push({speaker:i?world.partner:world.lead,tag:'SEKAI',text:line[lang]||line.ko});
 }
 if(firstDifficulty){
  const tierIndex={normal:0,advanced:1,expert:2,extreme:3,endless:4}[difficulty]||0;
  const entry=world.tiers[tierIndex];
  out.push({speaker:tierIndex%2?world.partner:world.lead,tag:'MISSION '+String(tierIndex+1).padStart(2,'0'),text:entry[lang]||entry.ko});
 }
 return out;
}
// Narration for the mission panel is deliberately separate from character
// dialogue: objective text is formal, while spoken story lines remain casual.
export const MISSION_OBJECTIVES={
 roof:tr('왜곡된 악기 소리가 퍼지는 교실의 적 이동 경로를 방어합니다.','異変が広がる教室の敵の進路を防衛します。','Defend the enemy route through the distorted classroom.'),
 stage:tr('이상현상이 발생한 스테이지의 적 이동 경로를 방어합니다.','異変が起きたステージの敵の進路を防衛します。','Defend the stage against the incoming anomaly.'),
 city:tr('스트리트에 나타난 적의 순환 경로를 방어합니다.','ストリートの敵の巡回ルートを防衛します。','Defend the enemy circuit through the street.'),
 wonderland:tr('원더랜드의 공연 시설과 적 이동 경로를 방어합니다.','ワンダーランドの施設と敵の進路を防衛します。','Defend the Wonderland attractions and enemy route.'),
 night:tr('아무도 없는 세카이에 나타난 적의 순환 경로를 방어합니다.','誰もいないセカイの敵の巡回ルートを防衛します。','Defend the enemy route through the Empty SEKAI.'),
 closedwindow:tr('닫힌 창 주변에 나타난 적의 이동 경로를 방어합니다.','閉ざされた窓の周囲の敵の進路を防衛します。','Defend the enemy route around the closed windows.'),
 openwindow:tr('열린 창을 통해 접근하는 적의 이동 경로를 방어합니다.','開かれた窓から接近する敵の進路を防衛します。','Defend the route of enemies approaching through the open windows.')
};
export function getMissionObjective(mapId,lang='ko'){
 const objective=MISSION_OBJECTIVES[mapId];
 return objective?.[lang]||objective?.ko||'';
}
export function getEndStory(mapId,won,firstClear,lang='ko'){
 const world=WORLD[mapId]||WORLD.roof;
 return {speaker:won?world.partner:world.lead,
  tag:won?(firstClear?'SEKAI SECURED':'DEFENSE COMPLETE'):'MISSION INCOMPLETE',
  text:(won?world.win:world.lose)[lang]||(won?world.win:world.lose).ko};
}
