/* ===== KRISH'S PIXEL WORLD: playable, original mini platformer ===== */
(() => {
  const root = document.getElementById('krishArcade');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const home = $('arcadeHome');
  const run = $('arcadeRun');
  const titleCanvas = $('arcadeTitleCanvas');
  const titleCtx = titleCanvas.getContext('2d');
  const canvas = $('arcadeGameCanvas');
  const ctx = canvas.getContext('2d');
  const nameInput = $('arcadePlayerName');
  const greeting = $('arcadeGreeting');
  const bestEl = $('arcadeBestScore');
  const overlay = $('arcadeOverlay');
  const primaryOverlayBtn = $('arcadeOverlayPrimary');
  const secondaryOverlayBtn = $('arcadeOverlaySecondary');
  const keys = { left: false, right: false, jump: false, down: false };
  let W = 600;
  let H = 270;
  let YSHIFT = 0;
  const BASE_H = 270, TITLE_W = 600, TITLE_H = 270;
  // Desktop keeps a wide 600x270 viewport. Phones use a narrower camera window
  // that is uniformly scaled up in CSS: the world is cropped closer, never stretched.
  function shiftLiveWorldY(delta) {
    if (!delta) return;
    if (stage) {
      stage.platforms.forEach(o => { o.y += delta; });
      stage.coins.forEach(o => { o.y += delta; });
      stage.stars.forEach(o => { o.y += delta; });
      stage.powerups.forEach(o => { o.y += delta; });
      stage.enemies.forEach(o => { o.y += delta; o.baseY += delta; });
      if (stage.boss) stage.boss.y += delta;
      stage.projectiles.forEach(o => { o.y += delta; });
      stage.particles.forEach(o => { o.y += delta; });
    }
    if (player) player.y += delta;
  }
  function resizeGameCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const compact = window.matchMedia('(max-width: 760px)').matches;
    const nextW = compact ? Math.max(260, Math.round(rect.width / 1.22)) : 600;
    const nextH = BASE_H;
    const nextShift = nextH - BASE_H;
    if (nextW === W && nextH === H && canvas.width === nextW && canvas.height === nextH) return;
    shiftLiveWorldY(nextShift - YSHIFT);
    W = nextW; H = nextH; YSHIFT = nextShift;
    canvas.width = W;
    canvas.height = H;
    if (stage && player) cameraX = Math.max(0, Math.min(stage.width - W, player.x - W * .30));
  }
  if ('ResizeObserver' in window) {
    const gameResizeObserver = new ResizeObserver(() => resizeGameCanvas());
    gameResizeObserver.observe(canvas);
  }
  window.addEventListener('resize', resizeGameCanvas, { passive: true });
  const styles = {
    krish: { skin: '#B97852', hair: '#211E1B', shirt: '#E9E2C8', trim: '#788B70', pants: '#354158', shoes: '#F4F0DE', style: 'short' },
    nova:  { skin: '#E0A47D', hair: '#4A2C2A', shirt: '#D7A8C6', trim: '#F2D77D', pants: '#60486F', shoes: '#FFF0D7', style: 'curly' },
    byte:  { skin: '#C88962', hair: '#252536', shirt: '#75B6A9', trim: '#E4D7B8', pants: '#263B4D', shoes: '#F4F0DE', style: 'cap' }
  };
  const levelDefs = [
    {
      label: '1–1', name: 'Pixel Plains', theme: 'plains', width: 1810, finishX: 1742,
      floors: [[0,232,340,38],[415,232,300,38],[782,232,330,38],[1180,232,265,38],[1510,232,300,38]],
      platforms: [[112,184,64,12],[230,151,54,12],[472,191,58,12],[590,158,64,12],[830,186,60,12],[955,151,60,12],[1250,189,64,12],[1350,151,58,12],[1582,182,62,12]],
      blocks: [[278,116],[625,125],[1008,116],[1395,116]],
      coins: [[130,163],[246,130],[490,168],[609,135],[847,163],[975,128],[1268,166],[1365,128],[1600,158],[296,95],[642,94],[1024,85],[1410,85],[1690,184]],
      enemies: [[205,145,185,272],[535,455,560,680],[900,805,870,1060],[1310,1215,1400,1400],[1640,1535,1705,1705]],
      powerups: [[288,211,'spark'],[865,211,'shield'],[1015,211,'ice'],[1280,211,'burst'],[1515,211,'speed']]
    },
    {
      label: '1–2', name: 'Pixel Pipes', theme: 'cave', width: 1810, finishX: 1742,
      floors: [[0,232,260,38],[330,232,220,38],[620,232,210,38],[900,232,300,38],[1280,232,210,38],[1550,232,260,38]],
      platforms: [[82,184,62,12],[355,191,58,12],[470,158,58,12],[666,181,64,12],[765,143,52,12],[965,187,58,12],[1070,154,65,12],[1320,182,58,12],[1437,146,60,12],[1605,186,70,12]],
      blocks: [[390,122],[698,113],[1000,124],[1465,109]],
      coins: [[96,163],[370,166],[484,133],[683,156],[780,118],[984,163],[1090,129],[1335,158],[1452,120],[1630,162],[412,95],[720,86],[1021,88],[1487,82],[1712,190]],
      enemies: [[175,115,210,232],[383,350,520,520],[697,635,790,790],[990,925,1150,1150],[1365,1297,1445,1445],[1630,1570,1730,1730]],
      powerups: [[430,211,'spark'],[1017,211,'mega'],[1135,211,'burst'],[1390,211,'lightning'],[1600,211,'spark']]
    },
    {
      label: '1–3', name: 'Skybound', theme: 'sky', width: 1810, finishX: 1742,
      floors: [[0,232,214,38],[292,219,165,51],[510,205,160,65],[735,220,155,50],[950,194,160,76],[1170,216,150,54],[1390,197,178,73],[1630,218,180,52]],
      platforms: [[105,184,53,12],[325,176,55,12],[545,162,58,12],[770,176,56,12],[990,151,55,12],[1210,173,55,12],[1430,153,58,12],[1665,175,54,12]],
      blocks: [[350,137],[565,124],[1010,114],[1450,116]],
      coins: [[117,162],[340,152],[561,138],[784,153],[1005,126],[1223,150],[1445,128],[1680,152],[365,109],[580,96],[1025,86],[1464,88],[1744,188]],
      enemies: [[155,110,188,188],[350,302,420,420],[575,520,620,620],[800,752,855,855],[1020,960,1080,1080],[1240,1190,1300,1300],[1465,1400,1520,1520],[1680,1640,1775,1775]],
      stars: [[630,130],[1290,138]],
      powerups: [[420,211,'spark'],[1005,180,'shield'],[1232,211,'burst'],[1286,211,'spark'],[1490,183,'spark'],[1518,181,'ice'],[1545,181,'lightning']], boss: true
    }
  ];
  let mode = 'home';
  let selectedStyle = 'krish';
  let stageIndex = 0;
  let stage = null;
  let player = null;
  let cameraX = 0;
  let score = 0;
  let totalCoins = 0;
  let lives = 3;
  let timeLeft = 120;
  let soundEnabled = false;
  let audioContext = null;
  let musicTimer = null;
  let musicStep = 0;
  let powerTimer = 0;
  let shieldTimer = 0;
  let attackAmmo = 0;
  let burstAmmo = 0;
  let iceAmmo = 0;
  let lightningAmmo = 0;
  let speedTimer = 0;
  let attackCooldown = 0;
  let toastText = '';
  let toastTimer = 0;
  let raf = 0;
  let lastTime = 0;
  let titleTick = 0;
  let checkpointX = 26;
  const savedBest = () => { try { return Math.max(0, Number(localStorage.getItem('krishPixelBest') || 0) || 0); } catch (_) { return 0; } };
  let bestScore = savedBest();
  try {
    const storedName = localStorage.getItem('krishPixelPlayerName');
    const storedStyle = localStorage.getItem('krishPixelPlayerStyle');
    if (storedName) nameInput.value = storedName.slice(0, 14);
    if (storedStyle && styles[storedStyle]) selectedStyle = storedStyle;
  } catch (_) {}
  bestEl.textContent = format(bestScore);

  function format(n) { return String(Math.max(0, Math.floor(n))).padStart(6, '0'); }
  function playerName() { return (nameInput.value.trim().replace(/\s+/g, ' ').slice(0, 14) || 'Krish'); }
  function updateName() {
    greeting.textContent = playerName();
    $('arcadePlayerTag').textContent = 'PLAYER: ' + playerName().toUpperCase();
  }
  nameInput.addEventListener('input', () => {
    updateName();
    try { localStorage.setItem('krishPixelPlayerName', playerName()); } catch (_) {}
  });

  function tone(freq = 660, dur = 0.06, type = 'square') {
    if (!soundEnabled) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.045, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + dur);
      osc.connect(gain); gain.connect(audioContext.destination);
      osc.start(); osc.stop(audioContext.currentTime + dur);
    } catch (_) { /* sound is optional */ }
  }

  // Original chiptune loop generated with Web Audio (not copied from any commercial game).
  const tune = [659,0,784,0,988,784,659,523,587,0,698,0,880,698,587,494,523,587,659,784,659,587,523,0];
  function musicTick() {
    if (!soundEnabled || mode !== 'playing') { musicTimer = setTimeout(musicTick, 220); return; }
    const note = tune[musicStep++ % tune.length];
    if (note) tone(note, .105, 'square');
    musicTimer = setTimeout(musicTick, 145);
  }
  function startMusic() { if (musicTimer) clearTimeout(musicTimer); musicStep = 0; musicTimer = setTimeout(musicTick, 80); }
  function rect(c, x, y, w, h, color) { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function drawHero(c, x, y, styleId, facing = 1, frame = 0, invuln = 0) {
    const p = styles[styleId] || styles.krish;
    if (invuln > 0 && Math.floor(invuln / 5) % 2 === 0) return;
    x = Math.round(x); y = Math.round(y);
    // Shadow / shoes
    rect(c, x+3, y+21, 11, 2, 'rgba(25,36,30,.18)');
    // Hair silhouette and head
    if (p.style === 'curly') {
      rect(c,x+3,y+1,10,3,p.hair); rect(c,x+2,y+3,12,3,p.hair); rect(c,x+4,y+2,2,2,p.hair); rect(c,x+9,y+0,2,3,p.hair);
    } else if (p.style === 'cap') {
      rect(c,x+3,y+0,10,3,p.hair); rect(c,x+2,y+3,12,2,p.hair); rect(c,x+7,y-1,6,2,p.trim); rect(c,x+11,y+2,5,2,p.trim);
    } else {
      rect(c,x+3,y+1,10,3,p.hair); rect(c,x+2,y+3,12,3,p.hair); rect(c,x+4,y+2,8,2,p.hair);
    }
    rect(c,x+4,y+4,9,7,p.skin); rect(c,x+2,y+6,2,3,p.skin); rect(c,x+13,y+6,2,3,p.skin);
    // Fringe, eyes, nose
    rect(c,x+3,y+3,4,2,p.hair); rect(c,x+8,y+3,4,1,p.hair);
    const eyeX = facing >= 0 ? x+10 : x+5;
    rect(c,eyeX,y+6,2,2,'#201f1b'); rect(c, facing >= 0 ? x+8 : x+7, y+9, 2,1,'#7f4a39');
    // Body, collar and arms
    rect(c,x+3,y+11,10,7,p.shirt); rect(c,x+5,y+11,6,2,p.trim);
    rect(c,x+1,y+12,3,6,p.skin); rect(c,x+12,y+12,3,6,p.skin);
    rect(c,x+4,y+17,4,4,p.pants); rect(c,x+9,y+17,4,4,p.pants);
    if (frame % 2 === 0 && Math.abs(player ? player.vx : 0) > .1) { rect(c,x+3,y+19,4,2,p.pants); rect(c,x+10,y+18,4,3,p.pants); }
    rect(c,x+2,y+21,5,2,p.shoes); rect(c,x+9,y+21,5,2,p.shoes);
  }
  function drawAvatarPreviews() {
    root.querySelectorAll('.arcade-character-choice').forEach((button) => {
      const c = button.querySelector('canvas').getContext('2d');
      c.clearRect(0,0,64,64);
      rect(c,0,0,64,64,'#f1efd9');
      rect(c,5,49,54,3,'#c7c6b4');
      c.save(); c.scale(2,2); drawHero(c,12,12,button.dataset.playerStyle,1,0,0); c.restore();
      const isSelected = button.dataset.playerStyle === selectedStyle;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });
  }
  root.querySelectorAll('[data-player-style]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedStyle = button.dataset.playerStyle;
      try { localStorage.setItem('krishPixelPlayerStyle', selectedStyle); } catch (_) {}
      drawAvatarPreviews(); tone(520,.035);
    });
  });

  function cloneLevel(i) {
    const d = levelDefs[i];
    const platforms = d.floors.map(([x,y,w,h]) => ({x,y:y+YSHIFT,w,h,type:'ground'}))
      .concat(d.platforms.map(([x,y,w,h]) => ({x,y:y+YSHIFT,w,h,type:'platform'})))
      .concat(d.blocks.map(([x,y]) => ({x,y:y+YSHIFT,w:12,h:12,type:'block',used:false})));
    const coins = d.coins.map(([x,y]) => ({x,y:y+YSHIFT,got:false,type:'coin'}));
    const stars = (d.stars || []).map(([x,y]) => ({x,y:y+YSHIFT,got:false,type:'star'}));
    const powerups = (d.powerups || []).map(([x,y,type]) => ({x,y:y+YSHIFT,got:false,type}));
    const enemies = d.enemies.map(([x,min,max,turn], idx) => {
      let surface = platforms.filter(p => x+6 >= p.x && x+6 <= p.x+p.w && p.y < 235+YSHIFT).sort((a,b)=>b.y-a.y)[0];
      const kind = idx % 3;
      const baseY = (surface ? surface.y : 232+YSHIFT)-13;
      return {x, y:baseY, baseY, w:kind===1?14:12,h:13,min,max:Math.max(min+15,turn),vx:kind===2?-.82:(kind===1?.68:.52),dead:false,wiggle:0,kind,frozen:0};
    });
    const boss = d.boss ? { x:1622, y:166+YSHIFT, w:58, h:58, hp:20, maxHp:20, dead:false, clock:0, attackClock:850, arenaStart:1578, flash:0, frozen:0, vulnerable:0, telegraph:0, engaged:false, warningShown:false, phase:1, attackType:'orb' } : null;
    return { ...d, platforms, coins, stars, powerups, enemies, boss, projectiles:[], particles:[], frame:0 };
  }
  function makePlayer(x = 26) { return { x, y:190+YSHIFT, w:16,h:23,vx:0,vy:0,onGround:false,facing:1,frame:0,invuln:0,coyoteTimer:0,jumpBuffer:0,damageFlash:0,stompCombo:0 }; }
  function beginStage(i) {
    resizeGameCanvas();
    stageIndex = i; stage = cloneLevel(i); player = makePlayer(checkpointX = 26); cameraX=0; timeLeft=120; mode='playing'; powerTimer=0; shieldTimer=0; speedTimer=0; attackCooldown=0; toastText=''; toastTimer=0;
    overlay.hidden = true; root.classList.remove('has-overlay'); updateHUD(); canvas.focus({preventScroll:true}); tone(660,.07); 
  }
  function startNewRun() {
    const firstStart = mode === 'home';
    score=0; totalCoins=0; lives=3; attackAmmo=0; burstAmmo=0; iceAmmo=0; lightningAmmo=0; speedTimer=0; checkpointX=26; home.hidden=true; run.hidden=false; resizeGameCanvas(); requestAnimationFrame(resizeGameCanvas); beginStage(0); updateHUD(); canvas.focus({preventScroll:true});
    // The Start click is a user gesture, so we can begin the original chiptune here.
    if (firstStart) { soundEnabled=true; $('arcadeSoundBtn').textContent='♫'; $('arcadeSoundBtn').setAttribute('aria-label','Turn sound off'); $('arcadeSoundBtn').title='Sound is on'; tone(740,.055); startMusic(); }
  }
  $('arcadeStartBtn').addEventListener('click', startNewRun);

  function updateHUD() {
    if (!stage) return;
    $('arcadeWorld').textContent = stage.label;
    $('arcadeScore').textContent = format(score);
    $('arcadeCoins').textContent = '× ' + String(totalCoins).padStart(2,'0');
    $('arcadeLives').textContent = lives ? ('♥ '.repeat(lives).trim()) : '—';
    $('arcadeTime').textContent = String(Math.ceil(timeLeft)).padStart(3,'0');
    const ammoEl = $('arcadeAmmo'); if (ammoEl) ammoEl.textContent = `S${String(attackAmmo).padStart(2,'0')} B${String(burstAmmo).padStart(2,'0')} I${String(iceAmmo).padStart(2,'0')} L${String(lightningAmmo).padStart(2,'0')}`;
    const shieldEl = $('arcadePower'); if (shieldEl) {
      const timed = shieldTimer > 0 ? ['SHIELD', shieldTimer] : powerTimer > 0 ? ['GIANT', powerTimer] : speedTimer > 0 ? ['SPEED', speedTimer] : null;
      const ammoPower = lightningAmmo > 0 ? `LIGHTNING ×${lightningAmmo}` : iceAmmo > 0 ? `ICE ×${iceAmmo}` : burstAmmo > 0 ? `BURST ×${burstAmmo}` : attackAmmo > 0 ? `SPARK ×${attackAmmo}` : 'NONE';
      shieldEl.textContent = timed ? `${timed[0]} ${Math.ceil(timed[1]/1000)}s` : ammoPower;
    }
    $('arcadePlayerTag').textContent = 'PLAYER: ' + playerName().toUpperCase();
    if (score > bestScore) {
      bestScore = score; bestEl.textContent = format(bestScore);
      try { localStorage.setItem('krishPixelBest', String(bestScore)); } catch (_) {}
    }
  }
  function showOverlay(eyebrow, title, text, primaryLabel, action, secondaryLabel='BACK TO MENU', secondaryAction=returnHome) {
    root.classList.add('has-overlay');
    $('arcadeOverlayEyebrow').textContent = eyebrow;
    $('arcadeOverlayTitle').textContent = title;
    $('arcadeOverlayText').textContent = text;
    primaryOverlayBtn.textContent = primaryLabel;
    primaryOverlayBtn.onclick = action;
    secondaryOverlayBtn.textContent = secondaryLabel;
    secondaryOverlayBtn.onclick = secondaryAction;
    overlay.hidden = false;
  }
  function returnHome() {
    mode='home'; home.hidden=false; run.hidden=true; overlay.hidden=true; root.classList.remove('has-overlay'); keys.left=false; keys.right=false; keys.jump=false; keys.down=false; updateName(); drawTitleScene();
  }
  function pauseGame() {
    if (mode === 'playing') {
      mode='paused'; showOverlay('PAUSED', 'Take a breather.', `${playerName()} can pick up right where you left off.`, 'RESUME GAME ↗', () => { mode='playing'; overlay.hidden=true; root.classList.remove('has-overlay'); canvas.focus({preventScroll:true}); }, 'BACK TO MENU', returnHome);
    } else if (mode === 'paused') { mode='playing'; overlay.hidden=true; root.classList.remove('has-overlay'); }
  }
  $('arcadePauseBtn').addEventListener('click', pauseGame);
  $('arcadeRestartBtn').addEventListener('click', () => startNewRun());
  $('arcadeSoundBtn').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    $('arcadeSoundBtn').textContent = soundEnabled ? '♫' : '♩';
    $('arcadeSoundBtn').setAttribute('aria-label', soundEnabled ? 'Turn sound off' : 'Turn sound on');
    $('arcadeSoundBtn').title = soundEnabled ? 'Sound is on' : 'Sound is off';
    if (soundEnabled) { tone(740,.055); startMusic(); } else if (musicTimer) { clearTimeout(musicTimer); musicTimer=null; }
  });
  $('arcadeOverlaySecondary').addEventListener('click', returnHome);
  updateName();

  function completeStage() {
    if (mode !== 'playing') return;
    score += 1000 + Math.max(0, Math.floor(timeLeft))*10;
    updateHUD();
    if (stageIndex >= levelDefs.length-1) {
      mode='victory';
      showOverlay('YOU MADE IT', 'All levels cleared!', `${playerName()} finished all three worlds with ${format(score)} points and ${totalCoins} coins. Legendary run.`, 'PLAY AGAIN ↗', startNewRun, 'BACK TO MENU', returnHome);
    } else {
      mode='stageComplete';
      showOverlay('WORLD ' + stage.label + ' COMPLETE', 'Nice run, ' + playerName() + '!', `Stage bonus added. Score: ${format(score)} · Coins collected: ${totalCoins}. Ready for the next world?`, 'NEXT STAGE ↗', () => beginStage(stageIndex+1), 'BACK TO MENU', returnHome);
    }
    tone(820,.11); setTimeout(() => tone(1040,.12),85);
  }
  function loseLife() {
    if (mode !== 'playing') return;
    lives -= 1; if(player) player.damageFlash=520; updateHUD(); tone(180,.12,'sawtooth');
    if (lives <= 0) {
      mode='gameOver';
      showOverlay('GAME OVER', 'One more try?', `${playerName()}, you scored ${format(score)} and collected ${totalCoins} coins. Your best score is ${format(bestScore)}.`, 'TRY AGAIN ↗', startNewRun, 'BACK TO MENU', returnHome);
      return;
    }
    player = makePlayer(checkpointX); player.invuln=100; cameraX=Math.max(0,checkpointX-W*.32); powerTimer=0; shieldTimer=Math.max(shieldTimer,1200);
  }

  function jump() {
    if (mode !== 'playing' || !player) return;
    player.jumpBuffer = 130;
    tryBufferedJump();
  }
  function tryBufferedJump() {
    if (player && player.jumpBuffer > 0 && (player.onGround || player.coyoteTimer > 0)) {
      player.vy = -7.55; player.onGround = false; player.coyoteTimer = 0; player.jumpBuffer = 0; tone(380,.05);
    }
  }
  function solidHit(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function addBurst(x,y,color,count=9) { if(!stage) return; for(let i=0;i<count;i++) stage.particles.push({x,y,vx:(Math.random()-.5)*3.8,vy:(Math.random()-.7)*3.8,life:20+Math.random()*18,color}); }
  function update(dt) {
    if (mode !== 'playing' || !stage || !player) return;
    stage.frame += 1;
    if (soundEnabled && !musicTimer) startMusic();
    timeLeft -= dt/1000;
    if (timeLeft <= 0) { timeLeft=120; updateHUD(); loseLife(); return; }
    const oldX=player.x, oldY=player.y;
    player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
    player.coyoteTimer = player.onGround ? 110 : Math.max(0, player.coyoteTimer - dt);
    tryBufferedJump();
    const speed = speedTimer > 0 ? 3.35 : powerTimer > 0 ? 2.65 : 2.15;
    const targetVx = keys.left && !keys.right ? -speed : keys.right && !keys.left ? speed : 0;
    player.vx += (targetVx - player.vx) * (targetVx ? .30 : .22);
    if (Math.abs(player.vx) < .08 && !targetVx) player.vx = 0;
    if (!keys.jump && player.vy < -2.2) player.vy = Math.min(-2.2, player.vy + .48);
    if (keys.left && !keys.right) player.facing=-1;
    else if (keys.right && !keys.left) player.facing=1;
    player.x += player.vx;
    player.x=Math.max(0,Math.min(stage.width-player.w,player.x));

    const solids=stage.platforms;
    for (const s of solids) {
      if (player.vx > 0 && oldX+player.w <= s.x && player.x+player.w > s.x && player.y+player.h > s.y+2 && player.y < s.y+s.h-1) player.x=s.x-player.w;
      if (player.vx < 0 && oldX >= s.x+s.w && player.x < s.x+s.w && player.y+player.h > s.y+2 && player.y < s.y+s.h-1) player.x=s.x+s.w;
    }

    if(keys.down && !player.onGround && player.vy > -1) player.vy = Math.min(10.5, player.vy + .9);
    player.vy=Math.min(keys.down && !player.onGround ? 10.5 : 7.8,player.vy+.37);
    player.y += player.vy; player.onGround=false;
    for (const s of solids) {
      const horizontal=player.x+player.w-2 > s.x && player.x+2 < s.x+s.w;
      if (!horizontal) continue;
      if (player.vy >= 0 && oldY+player.h <= s.y+2 && player.y+player.h >= s.y) {
        player.y=s.y-player.h; player.vy=0; player.onGround=true; if(keys.down){ addBurst(player.x+player.w/2,player.y+player.h,'#f2d477',8); for(const e of stage.enemies){ if(!e.dead && Math.abs((e.x+e.w/2)-(player.x+player.w/2))<42 && Math.abs(e.y-player.y-player.h)<22){ e.dead=true; score+=350; addBurst(e.x+6,e.y+6,'#f2d477',14); toastText='GROUND POUND!'; toastTimer=950; updateHUD(); } } }
      } else if (player.vy < 0 && oldY >= s.y+s.h-2 && player.y <= s.y+s.h) {
        player.y=s.y+s.h; player.vy=0;
        if (s.type==='block' && !s.used) { s.used=true; score+=300; powerTimer=9000; attackAmmo=Math.min(30,attackAmmo+2); toastText='GIANT BOOST + 2 SPARKS'; toastTimer=1500; addBurst(s.x+s.w/2,s.y,'#f2d477',10); updateHUD(); tone(760,.06); }
      }
    }
    if (player.invuln>0) player.invuln-=1;
    if (Math.abs(player.vx)>.2) player.frame++;

    // Moving enemies: a stomp earns points; a side collision costs a life.
    for (const e of stage.enemies) {
      if (e.dead) continue;
      e.frozen = Math.max(0, (e.frozen || 0) - dt);
      e.wiggle += e.frozen > 0 ? .035 : .12;
      if (e.frozen <= 0) {
        if (e.kind===2 && Math.abs(player.x-e.x) < 155 && Math.abs(player.y-e.y) < 62) e.vx = (player.x < e.x ? -1 : 1) * 1.0;
        else if (e.kind===2 && (e.x <= e.min+4 || e.x+e.w >= e.max-4)) e.vx *= -1;
        e.x += e.vx;
        if (e.kind===1) e.y = e.baseY + Math.sin(e.wiggle*.7)*8;
        if (e.x < e.min || e.x+e.w > e.max) { e.vx *= -1; e.x=Math.max(e.min,Math.min(e.max-e.w,e.x)); }
      }
      if (solidHit(player,e) && e.frozen <= 0) {
        const stomp = player.vy > 0 && oldY+player.h <= e.y+6;
        if (stomp || powerTimer>0) { e.dead=true; if(stomp) player.vy=-4.5; player.stompCombo=Math.min(5,(player.stompCombo||0)+1); score+=200+(player.stompCombo-1)*75+(powerTimer>0?150:0); addBurst(e.x+6,e.y+4,powerTimer>0?'#f2d477':'#ffe28a',powerTimer>0?18:10); if(powerTimer>0){toastText='GIANT CRUSH!';toastTimer=750;} updateHUD(); tone(540,.07); }
        else if (player.invuln<=0 && shieldTimer<=0) { loseLife(); return; }
      }
    }
    // Collectibles
    for (const coin of stage.coins) {
      if (coin.got) continue;
      const cx=coin.x+4, cy=coin.y+4;
      if (player.x < cx+7 && player.x+player.w > cx-7 && player.y < cy+7 && player.y+player.h > cy-7) {
        coin.got=true; totalCoins++; score+=100; updateHUD(); tone(900,.045);
      }
    }
    for (const star of stage.stars) {
      if (star.got) continue;
      if (player.x < star.x+10 && player.x+player.w > star.x-3 && player.y < star.y+10 && player.y+player.h > star.y-3) {
        star.got=true; score+=500; updateHUD(); tone(1100,.12,'triangle');
      }
    }
    for (const item of stage.powerups) {
      if (item.got) continue;
      if (player.x < item.x+12 && player.x+player.w > item.x-2 && player.y < item.y+13 && player.y+player.h > item.y-2) {
        item.got = true;
        if (item.type === 'spark') { attackAmmo = Math.min(30, attackAmmo + 8); score += 250; toastText = 'SPARK PICKED UP · AUTO-ATTACK READY'; tone(980,.08,'triangle'); }
        else if (item.type === 'burst') { burstAmmo = Math.min(12, burstAmmo + 4); score += 350; toastText = 'BURST · SPLASH DAMAGE'; addBurst(item.x,item.y,'#bf8de3',12); tone(420,.1,'sawtooth'); }
        else if (item.type === 'shield') { shieldTimer = 7000; score += 300; toastText = 'SHIELD ACTIVE'; tone(720,.08,'sine'); }
        else if (item.type === 'ice') { iceAmmo = Math.min(8, iceAmmo + 3); score += 350; toastText = 'ICE SHOTS · FREEZE ENEMIES / SLOW BOSS'; tone(520,.09,'triangle'); }
        else if (item.type === 'lightning') { lightningAmmo = Math.min(6, lightningAmmo + 3); score += 450; toastText = 'LIGHTNING · CHAIN DAMAGE'; addBurst(item.x,item.y,'#f6d762',12); tone(1040,.12,'sawtooth'); }
        else if (item.type === 'speed') { speedTimer = 7000; score += 250; toastText = 'SPEED BOOST'; tone(860,.07,'triangle'); }
        else { powerTimer = 9000; score += 300; toastText = 'GIANT BOOST'; tone(760,.08,'triangle'); }
        toastTimer = 1900; updateHUD();
      }
    }

    // Power duration, feedback, and contextual attack inventory.
    if (attackCooldown > 0) attackCooldown -= dt;
    shieldTimer = Math.max(0, shieldTimer - dt);
    powerTimer = Math.max(0, powerTimer - dt);
    speedTimer = Math.max(0, speedTimer - dt);
    if (toastTimer > 0) toastTimer = Math.max(0, toastTimer - dt);
    if (player.damageFlash > 0) player.damageFlash = Math.max(0, player.damageFlash - dt);

    // No attack button: acquired ammo automatically fires toward a valid target in the facing direction.
    if ((attackAmmo > 0 || burstAmmo > 0 || iceAmmo > 0 || lightningAmmo > 0) && attackCooldown <= 0) {
      const px = player.x + player.w / 2;
      const targets = stage.enemies.filter(e => !e.dead).concat(stage.boss && !stage.boss.dead ? [stage.boss] : []);
      const target = targets.filter(t => {
        const tx = t.x + t.w/2, ahead = (tx - px) * player.facing;
        const verticalGap = Math.abs((t.y + t.h/2) - (player.y + player.h*.48));
        return ahead >= -10 && ahead < (stage.boss && !stage.boss.dead ? 360 : 290) && verticalGap < (stage.boss && t === stage.boss ? 160 : 105);
      }).sort((a,b) => Math.abs((a.x+a.w/2)-px)-Math.abs((b.x+b.w/2)-px))[0];
      if (target) {
        let kind='spark', damage=1, shotW=10, shotH=7, shotSpeed=5.8, cooldown=490;
        const nearbyEnemies = stage.enemies.filter(e => !e.dead && Math.abs(e.x-target.x)<95 && Math.abs(e.y-target.y)<42).length;
        // Choose the pickup effect based on the situation: chain lightning for clusters / boss,
        // burst for groups, ice for flying/chasing enemies or to open a boss vulnerability window.
        if (lightningAmmo > 0 && (target===stage.boss || nearbyEnemies>=2 || (stage.boss && stage.boss.hp<=4))) {
          kind='lightning'; damage=3; shotW=13; shotH=10; shotSpeed=6.1; cooldown=780; lightningAmmo--;
        } else if (burstAmmo > 0 && (nearbyEnemies>=1 || target===stage.boss)) {
          kind='burst'; damage=2; shotW=16; shotH=12; shotSpeed=4.7; cooldown=730; burstAmmo--;
        } else if (iceAmmo > 0 && (target===stage.boss || target.kind===1 || target.kind===2)) {
          kind='ice'; damage=1; shotW=12; shotH=9; shotSpeed=5.2; cooldown=700; iceAmmo--;
        } else if (attackAmmo > 0) {
          attackAmmo--; kind='spark'; damage=1; cooldown=500;
        } else if (burstAmmo > 0) {
          kind='burst'; damage=2; shotW=16; shotH=12; shotSpeed=4.7; cooldown=730; burstAmmo--;
        } else if (lightningAmmo > 0) {
          kind='lightning'; damage=3; shotW=13; shotH=10; shotSpeed=6.1; cooldown=780; lightningAmmo--;
        } else if (iceAmmo > 0) {
          kind='ice'; damage=1; shotW=12; shotH=9; shotSpeed=5.2; cooldown=700; iceAmmo--;
        }
        const sourceX = player.facing > 0 ? player.x+player.w : player.x-shotW;
        const sourceY = player.y + player.h*.44;
        const targetX = target.x+target.w/2, targetY = target.y+target.h*.44;
        const dx=(targetX-sourceX), dy=(targetY-sourceY), distance=Math.max(1,Math.hypot(dx,dy));
        stage.projectiles.push({x:sourceX,y:sourceY-shotH/2,w:shotW,h:shotH,vx:dx/distance*shotSpeed,vy:dy/distance*shotSpeed,owner:'player',life:140,damage,kind});
        attackCooldown=cooldown;
        updateHUD();
        if(kind==='lightning') tone(1040,.08,'sawtooth'); else if(kind==='ice') tone(520,.07,'triangle'); else if(kind==='burst') tone(300,.08,'sawtooth'); else tone(880,.04,'square');
      }
    }

    // Boss battle: entering its arena locks the gate, starts the intro, and exposes phase changes.
    if (stage.boss && !stage.boss.dead) {
      const b=stage.boss;
      b.clock += dt;
      b.flash = Math.max(0,b.flash-dt);
      b.frozen = Math.max(0,(b.frozen||0)-dt);
      b.vulnerable = Math.max(0,(b.vulnerable||0)-dt);
      b.telegraph = Math.max(0,(b.telegraph||0)-dt);
      b.phase = b.hp <= Math.ceil(b.maxHp*.30) ? 3 : b.hp <= Math.ceil(b.maxHp*.65) ? 2 : 1;
      b.x = 1622 + Math.sin(b.clock/520)*8;
      if (!b.engaged && player.x > b.arenaStart-250) {
        b.engaged=true;
        toastText='BOSS ARENA · FACE THE GLITCH KING'; toastTimer=2400;
        tone(180,.22,'sawtooth'); setTimeout(()=>tone(125,.24,'sawtooth'),120);
      }
      if (b.engaged && b.frozen <= 0) b.attackClock -= dt;
      // A clear warning window gives the player time to jump/dodge before each attack.
      if (b.attackClock < 420 && b.telegraph <= 0 && !b.isTelegraphing) {
        b.telegraph=420; b.isTelegraphing=true;
        b.attackType = b.phase===3 ? 'shockwave' : b.phase===2 ? 'fan' : 'orb';
        toastText = b.attackType==='shockwave' ? 'DODGE · INCOMING SHOCKWAVE' : 'DODGE · INCOMING GLITCH BOLT';
        toastTimer=850;
      }
      if (b.engaged && b.attackClock <= 0 && b.telegraph <= 0) {
        const sx=b.x+b.w/2, sy=b.y+b.h*.45;
        const tx=player.x+player.w/2, ty=player.y+player.h*.45;
        const angle=Math.atan2(ty-sy,tx-sx);
        const speed=b.phase===3?2.8:b.phase===2?2.4:2.05;
        const bolt=(a,v=speed)=>stage.projectiles.push({x:sx,y:sy,w:9,h:9,vx:Math.cos(a)*v,vy:Math.sin(a)*v,owner:'boss',life:280,kind:'glitch'});
        if (b.attackType==='shockwave') {
          // Low horizontal shockwave rewards a well-timed jump.
          bolt(Math.PI, speed*1.2); bolt(Math.PI+0.22,speed*1.05); bolt(Math.PI-0.22,speed*1.05);
          stage.projectiles.push({x:b.x-12,y:224+YSHIFT,w:22,h:8,vx:-3.1,vy:0,owner:'boss',life:150,kind:'wave'});
        } else if (b.attackType==='fan') { bolt(angle); bolt(angle-.28,speed*.92); bolt(angle+.28,speed*.92); }
        else bolt(angle);
        b.vulnerable = b.frozen>0 ? 1000 : 1150;
        b.attackClock = b.phase===3?1050:b.phase===2?1320:1720;
        b.isTelegraphing=false;
        tone(230,.075,'sawtooth');
      }
    }

    // Touching the boss hurts; jumping over it does not defeat it. Spark attacks are required.
    if (stage.boss && !stage.boss.dead && solidHit(player, stage.boss) && player.invuln<=0 && shieldTimer<=0) { loseLife(); return; }

    // Move player and boss projectiles, resolve hits and expire off-screen shots.
    for (const shot of stage.projectiles) {
      shot.x += shot.vx; shot.y += shot.vy; shot.life -= 1;
      if (shot.owner === 'player') {
        let hitEnemy = null;
        for (const e of stage.enemies) {
          if (!e.dead && solidHit(shot,e)) { hitEnemy=e; break; }
        }
        if (hitEnemy) {
          shot.life=0;
          if (shot.kind==='ice') {
            hitEnemy.frozen=3000; addBurst(hitEnemy.x+6,hitEnemy.y+6,'#9cecff',14);
            toastText='FROZEN · KEEP MOVING'; toastTimer=900;
          } else {
            hitEnemy.dead=true; score+=250; player.stompCombo = Math.min(5,(player.stompCombo||0)+1);
            score += Math.max(0,player.stompCombo-1)*50;
            addBurst(hitEnemy.x+6,hitEnemy.y+6,shot.kind==='burst'?'#bf8de3':shot.kind==='lightning'?'#f6d762':'#ffe28a',shot.kind==='burst'?18:11);
            if (shot.kind==='burst' || shot.kind==='lightning') {
              const radius=shot.kind==='lightning'?140:70;
              for (const near of stage.enemies) {
                if (!near.dead && Math.abs(near.x-hitEnemy.x)<radius && Math.abs(near.y-hitEnemy.y)<46) {
                  near.dead=true; score+=150; addBurst(near.x+6,near.y+6,shot.kind==='lightning'?'#f6d762':'#bf8de3',12);
                }
              }
            }
            toastText = player.stompCombo > 1 ? `COMBO ×${player.stompCombo}` : (shot.kind==='burst'?'BURST HIT':shot.kind==='lightning'?'CHAIN HIT':'ENEMY DOWN');
            toastTimer=900;
          }
          updateHUD(); tone(610,.06);
        }
        const b = stage.boss;
        if (shot.life > 0 && b && !b.dead && solidHit(shot,b)) {
          shot.life=0;
          // Ice opens an extended window. All attacks can hurt, but the exposed core takes bonus damage.
          let damage=shot.damage || 1;
          if (shot.kind==='ice') { b.frozen=2200; b.vulnerable=Math.max(b.vulnerable,1500); toastText='BOSS FROZEN · CORE EXPOSED'; toastTimer=1400; damage=1; }
          if (b.vulnerable > 0) damage *= 2;
          b.hp -= damage; b.flash=230; score += 150*damage;
          addBurst(b.x+b.w/2,b.y+b.h/2,shot.kind==='ice'?'#9cecff':shot.kind==='lightning'?'#f6d762':shot.kind==='burst'?'#bf8de3':'#fff0a6',shot.kind==='lightning'?22:15);
          if (shot.kind==='lightning') {
            // Lightning arcs from the boss to nearby minions and weakens its next attack.
            for (const near of stage.enemies) if (!near.dead && Math.abs(near.x-b.x)<170) { near.dead=true; score+=200; addBurst(near.x+6,near.y+6,'#f6d762',14); }
            b.attackClock += 320;
          }
          updateHUD(); tone(380 + Math.max(0,b.hp)*24,.06,'square');
          if (b.hp <= 0) {
            b.hp=0; b.dead=true; score+=3000; attackAmmo=Math.min(30,attackAmmo+5); burstAmmo=Math.min(12,burstAmmo+2);
            toastText='GLITCH KING DEFEATED · GATE OPEN'; toastTimer=2600;
            addBurst(b.x+b.w/2,b.y+b.h/2,'#f3a85e',44); updateHUD(); tone(920,.15,'triangle'); setTimeout(()=>tone(1180,.18,'triangle'),110);
          }
        }
      } else if (solidHit(player,shot)) {
        shot.life=0;
        if (shieldTimer <= 0 && player.invuln <= 0) { loseLife(); return; }
        addBurst(player.x+8,player.y+10,'#94d7e0');
      }
    }
    stage.projectiles = stage.projectiles.filter(p => p.life > 0 && p.x > cameraX-50 && p.x < cameraX+W+100 && p.y > -30 && p.y < H+30).slice(-50);
    if (stage.boss && !stage.boss.dead && player.x > stage.boss.arenaStart - player.w) player.x = stage.boss.arenaStart - player.w;

    // Checkpoints are invisible, friendly progress markers.
    if (player.x > checkpointX+340) checkpointX=Math.min(player.x-12, stage.width-100);
    if (player.y > H+45) { loseLife(); return; }
    cameraX=Math.max(0,Math.min(stage.width-W,player.x-W*.30));
    if (player.x+player.w >= stage.finishX && (!stage.boss || stage.boss.dead)) completeStage();
    if (Math.floor(timeLeft) !== Math.floor(timeLeft+dt/1000)) updateHUD();
  }

  function drawBackground(c, theme, cam=0) {
    if (theme==='cave') {
      rect(c,0,0,W,H,'#303941');
      for (let row=0; row<12; row++) {
        const y=row*24;
        const offset=(row%2)*24;
        for (let x=-((cam*.3)%48)-48; x<W+48; x+=48) {
          rect(c,x+offset,y,46,22,'#3b4549'); rect(c,x+offset,y+20,46,2,'#263139');
          rect(c,x+offset+4,y+4,2,2,'#4b5557');
        }
      }
      for(let i=0;i<5;i++){ const x=((i*137-cam*.13)%(W+90)+W+90)%(W+90)-35; rect(c,x,25+(i%3)*37+YSHIFT*.22,18,3,'#475b58'); rect(c,x+5,28+(i%3)*37+YSHIFT*.22,8,6,'#55776a'); }
    } else if (theme==='sky') {
      rect(c,0,0,W,H,'#b7ddec');
      for(let i=0;i<7;i++){ const x=((i*103-cam*.20)%(W+100)+W+100)%(W+100)-45; const y=22+(i*31)%115; rect(c,x+8,y,23,5,'#eff8f2'); rect(c,x+2,y+5,38,6,'#eff8f2'); rect(c,x+11,y+11,22,3,'#d9edf0'); }
      for(let i=0;i<5;i++){ const x=((i*145-cam*.12)%(W+120)+W+120)%(W+120)-50; rect(c,x,190+YSHIFT*.65,55,6,'#9fcfc6'); rect(c,x+10,184+YSHIFT*.65,25,8,'#9fcfc6'); }
    } else {
      rect(c,0,0,W,H,'#bfe7dc');
      for(let i=0;i<5;i++){ const x=((i*127-cam*.18)%(W+110)+W+110)%(W+110)-50; const y=25+(i%3)*24; rect(c,x+10,y,25,5,'#f5f5e8'); rect(c,x+3,y+5,40,6,'#f5f5e8'); rect(c,x+13,y+11,22,3,'#e8f0df'); }
      for(let i=0;i<4;i++){ const x=((i*170-cam*.26)%(W+160)+W+160)%(W+160)-75; rect(c,x,196+YSHIFT*.65,85,27,'#94c8a8'); rect(c,x+15,187+YSHIFT*.65,53,10,'#94c8a8'); rect(c,x+23,179+YSHIFT*.65,37,8,'#94c8a8'); }
    }
  }
  function drawPlatform(c,p,cam) {
    const x=p.x-cam;
    if (x+p.w < -4 || x>W+4) return;
    if (p.type==='ground') {
      const grass = stage.theme==='cave' ? '#748c70' : stage.theme==='sky' ? '#e8f3d7' : '#5d9a68';
      const earth = stage.theme==='cave' ? '#50565a' : stage.theme==='sky' ? '#8db7c0' : '#a47755';
      rect(c,x,p.y,p.w,5,grass); rect(c,x,p.y+5,p.w,p.h-5,earth);
      for(let xx=Math.max(0,Math.floor(x/12)*12);xx<Math.min(W,x+p.w);xx+=12){ rect(c,xx,p.y+9,1,1,'rgba(30,40,28,.23)'); if ((Math.floor(xx/12)%3)===0) rect(c,xx+4,p.y+18,4,2,'rgba(30,40,28,.14)'); }
    } else if (p.type==='block') {
      rect(c,x,p.y,p.w,p.h,p.used?'#978c70':'#d4a64f'); rect(c,x+1,p.y+1,p.w-2,p.h-2,p.used?'#897d65':'#f2d477');
      if(!p.used){ rect(c,x+5,p.y+2,2,2,'#8d683b'); rect(c,x+5,p.y+8,2,2,'#8d683b'); rect(c,x+2,p.y+5,2,2,'#8d683b'); rect(c,x+8,p.y+5,2,2,'#8d683b'); }
      else { rect(c,x+3,p.y+3,6,6,'#aa9e83'); }
    } else {
      const top=stage.theme==='cave'?'#94a59a':stage.theme==='sky'?'#f5f4df':'#d9c18b';
      const side=stage.theme==='cave'?'#63776e':stage.theme==='sky'?'#9ac7c5':'#a78862';
      rect(c,x,p.y,p.w,p.h,side); rect(c,x,p.y,p.w,4,top); rect(c,x+4,p.y+6,Math.max(2,p.w-8),2,'rgba(30,40,28,.15)');
    }
  }
  function drawPipe(c,x,y,w,h,cam,themeOverride=null) {
    x-=cam; const viewW = c === titleCtx ? TITLE_W : W; if(x+w<0||x>viewW)return;
    const theme=themeOverride || (stage ? stage.theme : 'plains');
    const fill=theme==='cave'?'#698576':'#4c916a'; const light=theme==='cave'?'#a4b59b':'#88c28a';
    rect(c,x+3,y+5,w-6,h-5,fill); rect(c,x,y,w,7,light); rect(c,x+3,y+7,3,h-8,light); rect(c,x+w-5,y+7,2,h-8,'#3c7557');
  }
  function drawCoin(c,x,y,frame) {
    const bob=Math.round(Math.sin(frame*.12+x)*2); x=Math.round(x);y=Math.round(y+bob);
    rect(c,x+2,y,4,2,'#f7e29a'); rect(c,x,y+2,8,7,'#e7b843'); rect(c,x+2,y+3,4,5,'#ffe58a'); rect(c,x+3,y+4,2,3,'#bf8430');
  }
  function drawEnemy(c,e,cam) {
    const x=Math.round(e.x-cam), y=Math.round(e.y+Math.sin(e.wiggle)*.7);
    const shell=['#a45f43','#697cbd','#7b9b4e'][e.kind||0], belly=['#be7954','#8ea3df','#b2bd70'][e.kind||0];
    rect(c,x+1,y+2,10,8,shell); rect(c,x+3,y,6,3,shell); rect(c,x,y+5,12,5,belly);
    if(e.kind===1){rect(c,x+1,y-2,3,3,'#e9e7d7');rect(c,x+8,y-2,3,3,'#e9e7d7');} else if(e.kind===2){rect(c,x+2,y-3,2,4,'#d7c95c');rect(c,x+8,y-3,2,4,'#d7c95c');}
    rect(c,x+2,y+4,3,3,'#fff4db'); rect(c,x+7,y+4,3,3,'#fff4db'); rect(c,x+3+(e.vx<0?0:1),y+5,1,2,'#251f1b'); rect(c,x+8+(e.vx<0?0:1),y+5,1,2,'#251f1b');
    rect(c,x+2,y+10,3,3,'#4a3b37'); rect(c,x+8,y+10,3,3,'#4a3b37');
  }
  function drawPowerup(c,item,cam,frame) {
    const x=Math.round(item.x-cam), y=Math.round(item.y+Math.sin(frame*.12+item.x)*2);
    if(item.type==='spark') { rect(c,x+2,y,10,12,'#e9a747'); rect(c,x+4,y+2,6,8,'#fff0a6'); rect(c,x+6,y+3,2,6,'#8d683b'); rect(c,x+5,y-2,4,3,'#fff8d2'); }
    else if(item.type==='burst') { rect(c,x+1,y+1,12,10,'#684c91'); rect(c,x+3,y+3,8,6,'#c6a0e8'); rect(c,x+5,y-2,4,4,'#fff0a6'); rect(c,x+5,y+4,4,3,'#fff0a6'); rect(c,x-2,y+4,3,3,'#bd8ee0'); rect(c,x+12,y+4,3,3,'#bd8ee0'); }
    else if(item.type==='shield') { rect(c,x+2,y,10,12,'#6ab4bd'); rect(c,x+4,y+2,6,8,'#c7f0e7'); rect(c,x+5,y+3,4,6,'#5d99b1'); rect(c,x+5,y-2,4,3,'#e5ffff'); }
    else if(item.type==='ice') { rect(c,x+3,y-1,8,14,'#7ad8f3'); rect(c,x+5,y+1,4,10,'#effcff'); rect(c,x+1,y+4,3,5,'#b3efff'); rect(c,x+10,y+2,3,5,'#b3efff'); }
    else if(item.type==='lightning') { rect(c,x+6,y-1,5,6,'#f6d762'); rect(c,x+2,y+4,7,4,'#f6d762'); rect(c,x+3,y+7,5,6,'#fff1a3'); rect(c,x+7,y+1,3,5,'#fff1a3'); }
    else if(item.type==='speed') { rect(c,x+1,y+5,12,7,'#76a56d'); rect(c,x+4,y+2,6,6,'#b7df86'); rect(c,x+4,y+12,9,2,'#34533b'); rect(c,x-2,y+5,4,2,'#f6d762'); }
    else { rect(c,x+2,y,10,12,'#d2a4df'); rect(c,x+4,y+2,6,8,'#fff0ff'); rect(c,x+5,y+3,4,6,'#a36fc0'); rect(c,x+5,y-2,4,3,'#fff0ff'); }
  }
  function drawProjectile(c,shot,cam) {
    const x=shot.x-cam;
    if(shot.owner==='boss' && shot.kind==='wave') { rect(c,x,shot.y+2,shot.w,shot.h-3,'#d56a62'); rect(c,x+3,shot.y,shot.w-6,2,'#f5b17b'); rect(c,x+6,shot.y+shot.h-1,shot.w-12,2,'#8e4244'); }
    else if(shot.owner==='player' && shot.kind==='ice') { rect(c,x,shot.y,shot.w,shot.h,'#7ad8f3'); rect(c,x+3,shot.y+1,4,3,'#effcff'); rect(c,x-2,shot.y+2,2,2,'#b3efff'); }
    else if(shot.owner==='player' && shot.kind==='lightning') { rect(c,x+4,shot.y-1,4,4,'#fff0a1'); rect(c,x+1,shot.y+2,6,3,'#f6d762'); rect(c,x+4,shot.y+5,4,4,'#fff0a1'); }
    else if(shot.owner==='player' && shot.kind==='burst') { rect(c,x-2,shot.y-2,16,13,'#8658ae'); rect(c,x+1,shot.y,10,7,'#d5a6f0'); rect(c,x+4,shot.y+2,5,3,'#fff0a6'); rect(c,x-5,shot.y+2,3,4,'#cda0e8'); }
    else if(shot.owner==='player') { rect(c,x-1,shot.y-1,11,7,'#e5a348'); rect(c,x+1,shot.y,6,3,'#fff4ba'); rect(c,x-3,shot.y+1,3,3,'#fff1a6'); }
    else { rect(c,x,shot.y,shot.w,shot.h,'#8557a8'); rect(c,x+2,shot.y+2,4,4,'#ffc5b6'); rect(c,x+1,shot.y+1,2,2,'#fff5ce'); }
  }
  function drawBoss(c,b,cam) {
    const x=Math.round(b.x-cam), y=Math.round(b.y);
    const flash=b.flash>0, frozen=b.frozen>0, open=b.vulnerable>0;
    const sx=b.w/44, sy=b.h/44;
    c.save(); c.translate(x,y); c.scale(sx,sy);
    const shell=flash?'#fff4bc':frozen?'#a8e9f4':'#51456e';
    const armor=flash?'#ffffff':frozen?'#d8fbff':'#77679a';
    rect(c,5,40,35,4,'rgba(20,25,24,.24)');
    // Layered shell and shoulder armour make the boss read as a large arena enemy.
    rect(c,5,10,30,27,shell); rect(c,1,17,38,16,armor); rect(c,8,27,24,11,'#322c46');
    rect(c,6,3,8,10,'#d6b768'); rect(c,16,0,7,13,'#e7ce7a'); rect(c,27,3,8,10,'#d6b768');
    rect(c,0,17,7,12,armor); rect(c,37,17,7,12,armor);
    // Horns
    rect(c,-4,11,8,4,'#d6b768'); rect(c,-7,7,6,4,'#e7ce7a'); rect(c,40,11,8,4,'#d6b768'); rect(c,45,7,6,4,'#e7ce7a');
    rect(c,10,12,7,7,'#f7e7bd'); rect(c,24,12,7,7,'#f7e7bd'); rect(c,12,14,3,4,'#e35c58'); rect(c,26,14,3,4,'#e35c58');
    rect(c,13,23,13,3,'#f5a65f'); rect(c,9,37,8,5,'#2f293e'); rect(c,26,37,8,5,'#2f293e');
    // The central core visibly opens after attacks / ice hits and is the tactical weak point.
    rect(c,15,20,14,12,open?'#72dfc0':'#2d263c');
    rect(c,17,21,10,9,open?'#ddfff1':frozen?'#e8fcff':'#e6bf50');
    rect(c,19,22,5,5,open?'#ffffff':frozen?'#ffffff':'#fff0a6');
    if(open) { rect(c,13,18,18,2,'#9af4d1'); rect(c,13,32,18,2,'#9af4d1'); }
    c.restore();
    if(b.engaged && !b.dead) {
      // Small floor shadow + tell for charged attacks.
      if(b.telegraph>0) {
        const alpha=Math.min(1,b.telegraph/420);
        const floorY=232+YSHIFT;
        rect(c,Math.max(0,x-18),floorY-7,Math.max(0,Math.min(W,x+b.w+20)-Math.max(0,x-18)),3,`rgba(224,93,82,${.25+.5*alpha})`);
        c.fillStyle='#fff9df'; c.font='bold 8px ui-monospace,monospace'; c.textAlign='center'; c.fillText(b.phase===3?'JUMP THE SHOCKWAVE!':'DODGE!',Math.max(42,Math.min(W-42,x+b.w/2)),floorY-13);
      }
    }
  }
  function drawFlag(c,cam) {
    const x=stage.finishX-cam, sy=YSHIFT;
    rect(c,x,160+sy,3,72,'#f4f1df'); rect(c,x+3,162+sy,23,13,'#d76b4f'); rect(c,x+3,170+sy,17,5,'#f1dfaa'); rect(c,x-4,230+sy,12,3,'#5d6d58');
    rect(c,x-4,156+sy,11,4,'#f4f1df');
  }
  function drawWorld() {
    drawBackground(ctx,stage.theme,cameraX);
    // distant pixel sun / moon
    const sunX=Math.round(W*.78);
    if(stage.theme==='cave'){rect(ctx,sunX,27+YSHIFT*.18,13,13,'#cfb87d');rect(ctx,sunX+3,30+YSHIFT*.18,7,7,'#eadcb2');}
    else {rect(ctx,sunX,25+YSHIFT*.18,14,14,stage.theme==='sky'?'#fff1b8':'#f5d77f');rect(ctx,sunX+4,21+YSHIFT*.18,6,3,'#f5d77f');rect(ctx,sunX+4,40+YSHIFT*.18,6,3,'#f5d77f');}
    // Decorative pipes, always solid-looking but just scenery
    if(stage.theme!=='sky') {
      const pipeXs=stage.theme==='cave'?[210,570,1015,1367,1650]:[355,724,1125,1462];
      pipeXs.forEach((x,i)=>drawPipe(ctx,x,(stage.theme==='cave'?202:200)+YSHIFT,24,30,cameraX));
    }
    stage.platforms.forEach(p=>drawPlatform(ctx,p,cameraX));
    stage.coins.forEach(coin=>{if(!coin.got)drawCoin(ctx,coin.x-cameraX,coin.y,stage.frame);});
    stage.stars.forEach(star=>{if(!star.got){const x=star.x-cameraX,y=star.y+Math.sin(stage.frame*.09)*2; rect(ctx,x+4,y,4,12,'#f6d768');rect(ctx,x,y+4,12,4,'#f6d768');rect(ctx,x+3,y+3,6,6,'#fff1a6');}});
    stage.powerups.forEach(item=>{if(!item.got)drawPowerup(ctx,item,cameraX,stage.frame);});
    stage.enemies.forEach(e=>{if(!e.dead)drawEnemy(ctx,e,cameraX);});
    if (stage.boss && !stage.boss.dead) drawBoss(ctx,stage.boss,cameraX);
    stage.projectiles.forEach(shot=>drawProjectile(ctx,shot,cameraX));
    stage.particles = stage.particles.filter(p=>p.life-- > 0);
    stage.particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.08;rect(ctx,p.x-cameraX,p.y,2,2,p.color);});
    if (stage.boss && !stage.boss.dead) {
      const gateX=stage.boss.arenaStart-cameraX;
      rect(ctx,gateX,165+YSHIFT,3,67,'rgba(38,59,51,.4)');
      for(let gy=168+YSHIFT;gy<230+YSHIFT;gy+=12) rect(ctx,gateX-3,gy,9,2,'#e3c66e');
      if(!stage.boss.engaged){ctx.fillStyle='#f9f5dc'; ctx.font='bold 7px ui-monospace,monospace'; ctx.textAlign='center'; ctx.fillText('BOSS ARENA',gateX-6,154+YSHIFT);}
    }
    drawFlag(ctx,cameraX);
    if (stage.boss && !stage.boss.dead) {
      const b=stage.boss, barW=Math.min(142,W*.42), barX=W-barW-12; rect(ctx,barX,20,barW,7,'#4d4b4a'); rect(ctx,barX+1,21,(barW-2)*Math.max(0,b.hp/b.maxHp),5,b.vulnerable>0?'#72d7b0':'#e36b55');
      ctx.fillStyle='#171914'; ctx.font='bold 7px ui-monospace,monospace'; ctx.textAlign='right'; ctx.fillText(`GLITCH KING · PHASE ${b.phase} · ${b.hp}/${b.maxHp}`,W-12,15);
    }
    if (toastTimer>0 && toastText) { const tw=Math.min(W-24,ctx.measureText(toastText).width+22); rect(ctx,(W-tw)/2,38,tw,17,'#fffef3');ctx.strokeStyle='#b8b8aa';ctx.strokeRect((W-tw)/2,38,tw,17);ctx.fillStyle='#171914';ctx.font='bold 7px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText(toastText,(W)/2,49); }
    // Player nameplate + pixel hero
    const px=player.x-cameraX;
    ctx.font='bold 8px ui-monospace, monospace'; ctx.textAlign='center';
    const label=playerName().slice(0,14); const labelW=Math.max(26,ctx.measureText(label).width+8);
    rect(ctx,px+player.w/2-labelW/2,player.y-13,labelW,10,'#fffef3');
    ctx.fillStyle='#171914'; ctx.fillText(label,px+player.w/2,player.y-6);
    if (speedTimer > 0) { for(let i=1;i<=3;i++) rect(ctx,px-player.facing*i*4+2,player.y+13,3,2,'#9acb82'); }
    if (powerTimer > 0) { ctx.save(); ctx.translate(px, player.y-10); ctx.scale(1.55,1.55); drawHero(ctx,0,0,selectedStyle,player.facing,player.frame,player.invuln); ctx.restore(); rect(ctx,px+2,player.y-15,12,2,'#f2d477'); } else drawHero(ctx,px,player.y,selectedStyle,player.facing,player.frame,player.invuln);
    if (shieldTimer > 0) { ctx.strokeStyle = '#78cbd2'; ctx.lineWidth = 2; ctx.strokeRect(px-3, player.y-3, player.w+6, player.h+5); rect(ctx,px-1,player.y-5,3,3,'#d8fcff'); rect(ctx,px+player.w+1,player.y+7,3,3,'#d8fcff'); }
    if (iceAmmo>0 || lightningAmmo>0 || burstAmmo>0 || attackAmmo>0) { const col=lightningAmmo>0?'#f6d762':iceAmmo>0?'#7ad8f3':burstAmmo>0?'#bd8ee0':'#e9a747'; rect(ctx,px+4,player.y-20,8,3,col); }
    // tiny live progress meter
    rect(ctx,12,12,90,4,'rgba(20,21,16,.18)'); rect(ctx,12,12,90*Math.min(1,player.x/stage.finishX),4,'#263b33');
    ctx.fillStyle='rgba(20,21,16,.72)'; ctx.font='7px ui-monospace, monospace'; ctx.textAlign='left'; ctx.fillText('LEVEL PROGRESS',12,9);
  }
  function drawTitleScene() {
    if (!titleCtx) return;
    const c=titleCtx; rect(c,0,0,TITLE_W,TITLE_H,'#bfe7dc');
    for(let i=0;i<6;i++){const x=18+i*108; const y=26+(i%3)*19; rect(c,x+8,y,23,5,'#f5f5e8');rect(c,x+2,y+5,39,6,'#f5f5e8');rect(c,x+12,y+11,20,3,'#e8f0df');}
    rect(c,0,206,TITLE_W,64,'#95c9a8');rect(c,0,219,TITLE_W,51,'#a47755');rect(c,0,215,TITLE_W,6,'#5d9a68');
    // floating steps
    [[70,169,58],[167,141,48],[275,166,58],[365,130,50],[448,154,52],[520,126,54]].forEach(([x,y,w])=>{rect(c,x,y,w,11,'#a78862');rect(c,x,y,w,4,'#d9c18b');});
    // decorative blocks and pipe
    [[180,112],[305,136],[462,105]].forEach(([x,y])=>{rect(c,x,y,13,13,'#f2d477');rect(c,x+5,y+3,3,7,'#8d683b');});
    drawPipe(c,535,190,28,31,0,'plains');
    [[91,147],[185,115],[292,140],[373,108],[455,129],[532,101]].forEach(([x,y],i)=>drawCoin(c,x,y,titleTick+i));
    const bounce=Math.round(Math.sin(titleTick*.08)*2);
    drawHero(c,117,181+bounce,selectedStyle,1,titleTick,0);
    // finish pole and flag
    rect(c,562,114,3,101,'#f4f1df');rect(c,565,117,23,13,'#d76b4f');rect(c,565,125,16,5,'#f1dfaa');rect(c,555,214,18,4,'#5d6d58');
    titleTick++;
  }

  function loop(now) {
    const dt=Math.min(42,now-(lastTime||now)); lastTime=now;
    if(mode==='home') drawTitleScene();
    else if(stage && player) { update(dt); drawWorld(); }
    if(stage && mode!=='home' && mode!=='playing') drawWorld();
    raf=requestAnimationFrame(loop);
  }

  function setMove(control, on) { if(control==='left'||control==='right') keys[control]=on; if(control==='jump') { keys.jump=on; if(on) { if(player && !player.onGround && player.vy>1.2) keys.down=true; else jump(); } else keys.down=false; } }
  window.addEventListener('keydown', (e) => {
    if (document.activeElement===nameInput) return;
    if (e.key==='Escape') { if(mode==='playing'||mode==='paused') { e.preventDefault(); pauseGame(); } return; }
    if(mode!=='playing') return;
    const key=e.key.toLowerCase();
    if(['arrowleft','arrowright','arrowup',' ','a','d','w'].includes(key)) e.preventDefault();
    if(key==='arrowleft'||key==='a') keys.left=true;
    if(key==='arrowright'||key==='d') keys.right=true;
    if(key==='arrowdown'||key==='s') keys.down=true;
    if(key===' '||key==='arrowup'||key==='w') { keys.jump=true; if(!e.repeat) jump(); }
  }, {passive:false});
  window.addEventListener('keyup', (e) => {
    const key=e.key.toLowerCase();
    if(key==='arrowleft'||key==='a') keys.left=false;
    if(key==='arrowright'||key==='d') keys.right=false;
    if(key==='arrowdown'||key==='s') keys.down=false;
    if(key===' '||key==='arrowup'||key==='w') keys.jump=false;
  });
  window.addEventListener('blur', () => { keys.left=false; keys.right=false; keys.jump=false; keys.down=false; if(mode==='playing') pauseGame(); });
  root.querySelectorAll('[data-control]').forEach((button) => {
    const control=button.dataset.control;
    button.addEventListener('pointerdown',(e)=>{e.preventDefault();button.setPointerCapture?.(e.pointerId);setMove(control,true);});
    const release=(e)=>{if(e)e.preventDefault();setMove(control,false);};
    button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
    button.addEventListener('contextmenu',(e)=>e.preventDefault());
  });

  // First paint, previews, and start the single animation loop.
  resizeGameCanvas();
  drawAvatarPreviews(); drawTitleScene(); updateName();
  if (raf) cancelAnimationFrame(raf);
  raf=requestAnimationFrame(loop);
})();

