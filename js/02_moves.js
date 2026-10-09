'use strict';
/* ===== MOVES ===== */
const GOJO_MOVES={
  light:{name:'Cursed Jab',kind:'light',startup:5,active:4,recovery:8,damage:6,hitstun:15,blockstun:9,kbx:2,kby:0,hitbox:{x:22,y:-90,w:58,h:32},advance:1.5,hitstop:5,meter:4,cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:5,cancelTo:19},
  heavy:{name:'Impact Strike',kind:'heavy',startup:12,active:5,recovery:18,damage:17,hitstun:24,blockstun:14,kbx:8,kby:-6,hitbox:{x:24,y:-94,w:74,h:44},advance:3.2,hitstop:9,meter:8,cancels:{skill:1,dash:1,ult:1},cancelFrom:14,cancelTo:33},
  air:{name:'Aerial Kick',kind:'air',startup:6,active:6,recovery:11,damage:8,hitstun:16,blockstun:10,kbx:4,kby:1.5,hitbox:{x:14,y:-64,w:64,h:48},advance:1,hitstop:6,meter:5,cancels:{dash:1},cancelFrom:7,cancelTo:20},
  s1:{name:'Blue',kind:'skill1',startup:16,active:30,recovery:20,damage:4,hitstun:9,blockstun:6,kbx:0,kby:0,hitbox:{x:60,y:-118,w:170,h:140},multiHit:true,hitInterval:6,hitstop:2,meter:3,cost:20,cd:360,field:{pull:1.05,radius:130},aura:'blue',cancels:{dash:1},cancelFrom:46,cancelTo:62},
  s2:{name:'Red',kind:'skill2',startup:24,active:8,recovery:24,damage:26,hitstun:32,blockstun:20,kbx:15,kby:-8,hitbox:{x:36,y:-104,w:200,h:120},advance:2.5,hitstop:12,meter:12,cost:30,cd:480,aura:'red',cancels:{dash:1},cancelFrom:32,cancelTo:52},
  s3:{name:'Hollow Purple',kind:'skill3',startup:60,active:20,recovery:35,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'purple',damage:45,hitstun:44,blockstun:26,kbx:18,kby:-9,speed:15,w:96,h:76,life:140,hitstop:16,armorBreak:true},cost:60,cd:1080,meter:20,aura:'purple',cancels:{dash:1},cancelFrom:82,cancelTo:104},
  def:{name:'Infinity',kind:'def',startup:4,active:150,recovery:16,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:25,cd:600,meter:0,aura:'infinity'},
  ult:{name:'Domain Expansion: Unlimited Void',kind:'ult',startup:90,active:1,recovery:60,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:0,cd:0,domain:'void',invuln:120}
};
const SUKUNA_MOVES={
  light:{name:'Light Slash',kind:'light',startup:6,active:4,recovery:9,damage:7,hitstun:15,blockstun:9,kbx:2.2,kby:0,hitbox:{x:24,y:-92,w:62,h:36},advance:1.8,hitstop:5,meter:4,cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:6,cancelTo:20},
  heavy:{name:'Heavy Slash',kind:'heavy',startup:14,active:6,recovery:20,damage:18,hitstun:25,blockstun:15,kbx:8.5,kby:-5,hitbox:{x:26,y:-98,w:80,h:52},advance:3.4,hitstop:9,meter:8,cancels:{skill:1,dash:1,ult:1},cancelFrom:16,cancelTo:36},
  air:{name:'Air Slash',kind:'air',startup:7,active:5,recovery:12,damage:9,hitstun:17,blockstun:10,kbx:4,kby:1.5,hitbox:{x:16,y:-66,w:68,h:50},advance:1.2,hitstop:6,meter:5,cancels:{dash:1},cancelFrom:8,cancelTo:22},
  s1:{name:'Dismantle',kind:'skill1',startup:8,active:5,recovery:12,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'dismantle',damage:10,hitstun:16,blockstun:9,kbx:5,kby:0,speed:17,w:78,h:26,life:90,hitstop:5},cost:12,cd:180,meter:6,aura:'slash'},
  s2:{name:'Cleave',kind:'skill2',startup:18,active:7,recovery:22,damage:24,hitstun:30,blockstun:0,kbx:6,kby:-7,hitbox:{x:20,y:-100,w:86,h:70},advance:3,hitstop:12,meter:11,cost:20,cd:300,armorBreak:true,aura:'cleave',cancels:{dash:1},cancelFrom:25,cancelTo:44},
  s3:{name:'Fuga — Divine Flame',kind:'skill3',startup:48,active:6,recovery:30,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'fuga',damage:40,hitstun:38,blockstun:24,kbx:14,kby:-10,speed:20,w:56,h:56,life:130,hitstop:15,armorBreak:true,spawnPillar:true,pillarH:280,pillarDur:70},cost:50,cd:900,meter:16,aura:'flame',cancels:{dash:1},cancelFrom:64,cancelTo:88},
  def:{name:"King's Guard",kind:'def',startup:5,active:40,recovery:14,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:20,cd:480,meter:0,aura:'guard'},
  ult:{name:'Domain Expansion: Malevolent Shrine',kind:'ult',startup:96,active:1,recovery:60,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:0,cd:0,domain:'shrine',invuln:126}
};
const YUJI_MOVES={
  light:{name:'Jab Combo',kind:'light',startup:5,active:4,recovery:8,damage:8,hitstun:16,blockstun:9,kbx:2,kby:0,hitbox:{x:22,y:-92,w:60,h:34},advance:1.6,hitstop:5,meter:4,cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:5,cancelTo:19},
  heavy:{name:'Heavy Fist',kind:'heavy',startup:13,active:6,recovery:20,damage:19,hitstun:26,blockstun:15,kbx:9,kby:-5,hitbox:{x:24,y:-96,w:76,h:50},advance:3.6,hitstop:10,meter:9,cancels:{skill:1,dash:1,ult:1},cancelFrom:16,cancelTo:36},
  air:{name:'Flying Kick',kind:'air',startup:6,active:6,recovery:12,damage:10,hitstun:18,blockstun:10,kbx:4.5,kby:1.5,hitbox:{x:14,y:-66,w:68,h:52},advance:1.4,hitstop:6,meter:5,cancels:{dash:1},cancelFrom:7,cancelTo:22},
  s1:{name:'Rush Combo',kind:'skill1',startup:14,active:20,recovery:22,damage:6,hitstun:12,blockstun:7,kbx:1.5,kby:0,hitbox:{x:26,y:-100,w:90,h:70},advance:5.5,hitstop:4,meter:5,multiHit:true,hitInterval:5,cost:24,cd:360,aura:'rush',cancels:{dash:1},cancelFrom:34,cancelTo:52},
  s2:{name:'Cursed Energy Strike',kind:'skill2',startup:22,active:8,recovery:24,damage:28,hitstun:32,blockstun:20,kbx:12,kby:-7,hitbox:{x:30,y:-104,w:110,h:90},advance:4,hitstop:13,meter:12,cost:28,cd:420,aura:'cestrike',armorBreak:true,cancels:{dash:1},cancelFrom:30,cancelTo:52},
  s3:{name:'Black Flash',kind:'skill3',startup:16,active:5,recovery:26,damage:42,hitstun:40,blockstun:26,kbx:14,kby:-9,hitbox:{x:28,y:-102,w:96,h:80},advance:3.4,hitstop:20,meter:14,cost:34,cd:540,aura:'bf',cancels:{dash:1},cancelFrom:21,cancelTo:44},
  s4:{name:'Divergent Impact',kind:'skill4',startup:18,active:8,recovery:26,damage:20,hitstun:22,blockstun:16,kbx:7,kby:-4,hitbox:{x:26,y:-100,w:86,h:70},advance:3,hitstop:9,meter:10,delayedHit:{delay:14,damage:14,hitstun:26,kbx:6,kby:-3},cost:26,cd:480,aura:'divergent',cancels:{dash:1},cancelFrom:26,cancelTo:46},
  def:{name:'Guard',kind:'def',startup:5,active:40,recovery:14,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:18,cd:480,meter:0,aura:'guard'},
  ult:{name:'Divergent Fist Barrage',kind:'ult',startup:80,active:30,recovery:40,damage:10,hitstun:12,blockstun:8,kbx:2,kby:0,hitbox:{x:20,y:-160,w:220,h:200},multiHit:true,hitInterval:5,hitstop:5,meter:0,cost:0,cd:0,ultType:'yuji',invuln:120,aura:'yujiult'}
};
const YUTA_MOVES={
  light:{name:'Katana Slash',kind:'light',startup:5,active:4,recovery:9,damage:8,hitstun:16,blockstun:10,kbx:2.5,kby:0,hitbox:{x:24,y:-96,w:72,h:42},advance:1.8,hitstop:5,meter:4,cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:5,cancelTo:19},
  heavy:{name:'Power Slash',kind:'heavy',startup:14,active:6,recovery:20,damage:19,hitstun:26,blockstun:15,kbx:9,kby:-6,hitbox:{x:28,y:-102,w:96,h:60},advance:3.4,hitstop:11,meter:9,cancels:{skill:1,dash:1,ult:1},cancelFrom:16,cancelTo:36},
  air:{name:'Air Slash',kind:'air',startup:6,active:5,recovery:12,damage:10,hitstun:18,blockstun:11,kbx:4,kby:1.5,hitbox:{x:18,y:-68,w:76,h:54},advance:1.3,hitstop:6,meter:5,cancels:{dash:1},cancelFrom:7,cancelTo:22},
  s1:{name:"Cursed Speech: DON'T MOVE",kind:'skill1',startup:16,active:1,recovery:24,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,immobilize:{duration:180},cost:26,cd:560,meter:10,aura:'speech'},
  s2:{name:'Rika Rush',kind:'skill2',startup:16,active:1,recovery:26,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,spawnRika:{damage:26,hitstun:32,blockstun:18,kbx:11,kby:-6,speed:13,w:72,h:118,life:60,hitstop:11},cost:28,cd:480,meter:10,aura:'rika'},
  s3:{name:'Copy',kind:'skill3',startup:20,active:1,recovery:22,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,doCopy:true,cost:20,cd:420,meter:8,aura:'copy'},
  s4:{name:'Sky Manipulation',kind:'skill4',startup:22,active:8,recovery:24,damage:22,hitstun:30,blockstun:18,kbx:9,kby:-5,hitbox:{x:44,y:-130,w:190,h:160},advance:2,hitstop:12,meter:10,cost:32,cd:600,aura:'sky',armorBreak:true,cancels:{dash:1},cancelFrom:30,cancelTo:54},
  s5:{name:'Reverse Cursed Technique',kind:'skill5',startup:24,active:1,recovery:30,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,heal:36,cost:40,cd:900,meter:0,aura:'rct'},
  def:{name:'Rika Guard',kind:'def',startup:5,active:60,recovery:14,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:22,cd:540,meter:0,aura:'rikaguard'},
  ult:{name:'Menacing Beam / Domain',kind:'ult',startup:70,active:30,recovery:40,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:0,cd:0,invuln:130,customYuta:true}
};
const HAKARI_MOVES={
  light:{name:'Rush Punch',kind:'light',startup:5,active:4,recovery:8,damage:7,hitstun:15,blockstun:9,kbx:2.2,kby:0,hitbox:{x:22,y:-92,w:64,h:34},advance:1.8,hitstop:5,meter:4,cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:5,cancelTo:19},
  heavy:{name:'Spinning Kick',kind:'heavy',startup:13,active:6,recovery:20,damage:20,hitstun:26,blockstun:15,kbx:9.5,kby:-6,hitbox:{x:26,y:-98,w:86,h:58},advance:3.6,hitstop:10,meter:9,cancels:{skill:1,dash:1,ult:1},cancelFrom:16,cancelTo:36},
  air:{name:'Diving Kick',kind:'air',startup:6,active:6,recovery:12,damage:10,hitstun:18,blockstun:10,kbx:4.5,kby:1.5,hitbox:{x:14,y:-66,w:72,h:56},advance:1.5,hitstop:6,meter:5,cancels:{dash:1},cancelFrom:7,cancelTo:22},
  s1:{name:'Private Pure Love Train',kind:'skill1',startup:10,active:5,recovery:20,damage:22,hitstun:28,blockstun:18,kbx:14,kby:-5,hitbox:{x:30,y:-102,w:120,h:100},advance:5,hitstop:12,meter:10,cost:20,cd:360,aura:'door',cancels:{dash:1},cancelFrom:18,cancelTo:34},
  s2:{name:'Rough Energy',kind:'skill2',startup:20,active:8,recovery:24,damage:30,hitstun:34,blockstun:20,kbx:13,kby:-7,hitbox:{x:28,y:-106,w:130,h:110},advance:3,hitstop:14,meter:12,cost:28,cd:480,aura:'rough',armorBreak:true,cancels:{dash:1},cancelFrom:28,cancelTo:52},
  s3:{name:'Domain Expansion: Idle Death Gamble',kind:'skill3',startup:70,active:1,recovery:55,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:55,cd:900,meter:20,aura:'idle',doJackpot:true,rollDuration:150,invuln:110},
  s4:{name:'Jackpot Roll',kind:'skill4',startup:34,active:1,recovery:30,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:25,cd:600,meter:10,aura:'jackpotroll',doJackpot:true,rollDuration:90,invuln:60},
  s5:{name:'Restless Gambler',kind:'skill5',startup:22,active:1,recovery:22,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,buff:{name:'restless',duration:420,dmgMult:1.20,speedMult:1.15},cost:26,cd:540,meter:8,aura:'restless'},
  def:{name:'Guard',kind:'def',startup:5,active:40,recovery:14,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:18,cd:480,meter:0,aura:'guard'},
  ult:{name:'JACKPOT OVERDRIVE',kind:'ult',startup:85,active:20,recovery:45,damage:14,hitstun:22,blockstun:14,kbx:8,kby:-6,hitbox:{x:24,y:-140,w:200,h:180},multiHit:true,hitInterval:6,hitstop:8,meter:0,cost:0,cd:0,ultType:'hakari',invuln:120,aura:'overdrive'}
};
const YOUNG_GOJO_MOVES={
  light:{name:'Prodigy Jab',kind:'light',startup:5,active:4,recovery:8,damage:6,hitstun:15,blockstun:9,kbx:2.1,kby:0,hitbox:{x:22,y:-91,w:60,h:34},advance:1.9,hitstop:5,meter:4,cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:5,cancelTo:19},
  heavy:{name:'Blue-Assisted Impact',kind:'heavy',startup:11,active:6,recovery:18,damage:16,hitstun:24,blockstun:14,kbx:7.5,kby:-6,hitbox:{x:26,y:-98,w:82,h:50},advance:4.2,hitstop:9,meter:8,cancels:{skill:1,dash:1},cancelFrom:13,cancelTo:33},
  air:{name:'Aerial Step Kick',kind:'air',startup:6,active:6,recovery:12,damage:8,hitstun:17,blockstun:10,kbx:4,kby:1.5,hitbox:{x:14,y:-66,w:68,h:52},advance:1.3,hitstop:6,meter:5,cancels:{dash:1},cancelFrom:7,cancelTo:22},
  s1:{name:'Blue Vector',kind:'young_blue',startup:4,active:82,recovery:10,duration:96,damage:7,hitstun:18,blockstun:8,kbx:4,kby:-2,hitbox:{x:30,y:-120,w:150,h:118},cost:16,cd:220,meter:11,aura:'youngBlue'},
  s2:{name:'Red Counterforce',kind:'young_red',startup:6,active:78,recovery:10,duration:94,damage:15,hitstun:28,blockstun:17,kbx:14,kby:-8,hitbox:{x:34,y:-118,w:196,h:126},cost:20,cd:280,meter:12,aura:'youngRed'},
  s3:{name:'Six Eyes // Read the Future',kind:'young_sixeyes',startup:8,active:132,recovery:10,duration:154,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:24,cd:420,meter:10,aura:'youngSix'},
  s4:{name:'Infinity // Distance Lock',kind:'young_limitless',startup:8,active:132,recovery:10,duration:150,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:20,cd:400,meter:8,aura:'youngInfinity'},
  s5:{name:'Maximum Output: Blue',kind:'young_maxblue',startup:8,active:180,recovery:12,duration:198,damage:20,hitstun:36,blockstun:20,kbx:15,kby:-9,hitbox:{x:42,y:-144,w:250,h:176},cost:30,cd:520,meter:18,aura:'youngBlueMax',armorBreak:true},
  def:{name:'Limitless Guard',kind:'def',startup:4,active:46,recovery:14,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:20,cd:480,meter:0,aura:'infinity'},
  z:{name:'Red Counter // Inverted Reversal',kind:'young_z',startup:4,active:34,recovery:10,duration:72,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:16,cd:420,meter:10,aura:'youngRed'},
  x:{name:'Limitless // Awakened',kind:'young_x',startup:10,active:252,recovery:16,duration:278,damage:42,hitstun:50,blockstun:28,kbx:18,kby:-11,hitbox:{x:24,y:-148,w:300,h:166},cost:40,cd:900,meter:24,aura:'youngPurple',armorBreak:true},
  ult:{name:'Limitless Awakening // Purple Release',kind:'young_x',startup:10,active:252,recovery:16,duration:278,damage:42,hitstun:50,blockstun:28,kbx:18,kby:-11,hitbox:{x:24,y:-148,w:300,h:166},cost:0,cd:0,meter:0,aura:'youngPurple',armorBreak:true}
};
const TOJI_MOVES={
  light:{name:'Inventory Draw // Spear Combo',kind:'light',startup:4,active:30,recovery:10,duration:44,tojiOverhaul:'basicLight',damage:7,hitstun:17,blockstun:9,kbx:3,kby:-1,hitbox:{x:24,y:-116,w:150,h:82},advance:3.6,hitstop:5,meter:4,cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:28,cancelTo:42},
  heavy:{name:'Inventory Draw // Long Rake + Backflip',kind:'heavy',startup:8,active:44,recovery:18,duration:70,tojiOverhaul:'basicHeavy',damage:24,hitstun:30,blockstun:15,kbx:10,kby:-5,hitbox:{x:14,y:-126,w:255,h:96},advance:4.2,hitstop:12,meter:9,cancels:{skill:1,dash:1,ult:1},cancelFrom:22,cancelTo:58},
  air:{name:'Air Knee',kind:'air',startup:5,active:6,recovery:11,damage:10,hitstun:18,blockstun:10,kbx:4.5,kby:1.5,hitbox:{x:16,y:-68,w:76,h:54},advance:2.2,hitstop:6,meter:5,cancels:{dash:1},cancelFrom:6,cancelTo:21},
  /* Toji Animated Motion V3: fast attacks, real run/dash travel, blink reposition, compact timing. */
  s1:{name:'Quick Draw // Split Soul Katana',kind:'skill1',startup:8,active:78,recovery:24,duration:110,tojiOverhaul:'katana',damage:7,hitstun:18,blockstun:8,kbx:6,kby:-3,hitbox:{x:28,y:-118,w:118,h:82},meter:18,cost:18,cd:300,armorBreak:true,aura:'tojiKatana'},
  s2:{name:'Heaven Pierce // Inverted Spear of Heaven',kind:'skill2',startup:10,active:91,recovery:24,duration:125,tojiOverhaul:'isoh',damage:8,hitstun:20,blockstun:9,kbx:8,kby:-4,hitbox:{x:34,y:-112,w:178,h:78},meter:18,cost:22,cd:360,armorBreak:true,aura:'tojiSpear'},
  s3:{name:'Chain Catch // Chain of a Thousand Miles',kind:'skill3',startup:8,active:118,recovery:24,duration:150,tojiOverhaul:'chain',damage:6,hitstun:17,blockstun:8,kbx:5,kby:-2,hitbox:null,meter:16,cost:20,cd:380,aura:'tojiChain'},
  s4:{name:'Weapon Stance // Playful Cloud',kind:'skill4',startup:14,active:142,recovery:24,duration:180,tojiOverhaul:'cloud',damage:8,hitstun:19,blockstun:10,kbx:6,kby:-4,hitbox:{x:24,y:-128,w:180,h:118},meter:20,cost:24,cd:430,armorBreak:true,aura:'tojiCloud'},
  s5:{name:'ZERO PRESENCE // Predator Step',kind:'skill5',startup:10,active:176,recovery:24,duration:210,tojiOverhaul:'zero',damage:12,hitstun:24,blockstun:10,kbx:9,kby:-5,hitbox:{x:20,y:-108,w:126,h:88},buff:{name:'tojiHunt',duration:210,dmgMult:1.08,speedMult:1.26},cost:26,cd:540,meter:10,aura:'tojiHunt'},
  z:{name:'ZERO PRESENCE // Predator Step',kind:'toji_z',startup:8,active:146,recovery:18,duration:180,tojiOverhaul:'zero',damage:10,hitstun:22,blockstun:10,kbx:8,kby:-5,hitbox:{x:20,y:-108,w:126,h:88},buff:{name:'tojiHunt',duration:180,dmgMult:1.08,speedMult:1.26},cost:22,cd:480,meter:10,aura:'tojiHunt'},
  def:{name:'Weapon Guard',kind:'def',startup:4,active:38,recovery:13,duration:55,tojiOverhaul:'guard',damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:16,cd:420,meter:0,aura:'guard'},
  x:{name:'HEAVENLY EXECUTION // CINEMATIC COMBAT',kind:'toji_cinematic_x',startup:8,active:996,recovery:24,duration:1020,tojiOverhaul:'cinematicX',damage:8,hitstun:26,blockstun:12,kbx:7,kby:-4,hitbox:{x:22,y:-128,w:230,h:110},meter:0,cost:30,cd:900,invuln:30,aura:'tojiUlt'},
  ult:{name:'CURSED ARSENAL // Inventory Death',kind:'ult',startup:12,active:264,recovery:24,duration:300,tojiOverhaul:'arsenal',damage:10,hitstun:22,blockstun:11,kbx:7,kby:-5,hitbox:{x:24,y:-142,w:230,h:150},meter:0,cost:0,cd:0,invuln:110,ultType:'toji',aura:'tojiUlt'}
};
const HEIAN_SUKUNA_MOVES={
  light:{name:'Four-Arm Light Combo',kind:'light',startup:5,active:6,recovery:9,damage:5,hitstun:11,blockstun:8,kbx:1.6,kby:0,hitbox:{x:22,y:-92,w:70,h:46},advance:1.6,hitstop:4,meter:4,multiHit:true,hitInterval:6,cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:6,cancelTo:22},
  heavy:{name:'Four-Arm Heavy Smash',kind:'heavy',startup:18,active:8,recovery:24,damage:22,hitstun:30,blockstun:17,kbx:11,kby:-7,hitbox:{x:26,y:-102,w:110,h:92},advance:4,hitstop:12,meter:10,cancels:{skill:1,dash:1,ult:1},cancelFrom:22,cancelTo:48},
  air:{name:'Four-Arm Air Slam',kind:'air',startup:8,active:6,recovery:14,damage:12,hitstun:18,blockstun:10,kbx:5,kby:1.5,hitbox:{x:16,y:-68,w:88,h:64},advance:1.5,hitstop:7,meter:5,cancels:{dash:1},cancelFrom:10,cancelTo:26},
  s1:{name:'Dismantle',kind:'skill1',startup:8,active:5,recovery:12,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'dismantle_heian',damage:11,hitstun:16,blockstun:9,kbx:5,kby:0,speed:19,w:82,h:26,life:100,hitstop:5},cost:12,cd:200,meter:6,aura:'slash'},
  s2:{name:'Cleave',kind:'cleave_seq',startup:38,active:56,recovery:30,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,advance:0,hitstop:0,meter:0,cost:22,cd:340,armorBreak:true,aura:'cleave_seq'},
  s3:{name:'Fuga — Divine Flame',kind:'skill3',startup:64,active:6,recovery:66,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'heianfuga',damage:48,hitstun:42,blockstun:28,kbx:16,kby:-11,speed:26,w:96,h:72,life:120,hitstop:18,armorBreak:true,spawnPillar:false},cost:52,cd:960,meter:18,aura:'heianfuga',cancels:{dash:1},cancelFrom:86,cancelTo:120},
  s5:{name:'Hiten',kind:'skill5',startup:36,active:16,recovery:29,damage:30,hitstun:34,blockstun:20,kbx:13,kby:-8,hitbox:{x:40,y:-108,w:280,h:120},advance:2,hitstop:14,meter:12,cost:28,cd:600,armorBreak:true,aura:'hiten',cancels:{dash:1},cancelFrom:44,cancelTo:64},
  wcs:{name:'World-Cutting Slash',kind:'wcs',startup:38,active:8,recovery:40,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'wcs',damage:55,hitstun:52,blockstun:30,kbx:16,kby:-9,speed:24,w:220,h:130,life:40,hitstop:22,armorBreak:true,spatial:true},cost:45,cd:900,meter:0,aura:'wcs'},
  def:{name:'Kamutoke',kind:'def',startup:57,active:7,recovery:57,duration:121,damage:26,hitstun:30,blockstun:18,kbx:10,kby:-6,hitbox:{x:20,y:-220,w:220,h:280},advance:0,hitstop:12,meter:10,cost:26,cd:560,aura:'kamutoke'},
  ult:{name:'Domain Expansion: Malevolent Shrine',kind:'ult',startup:70,active:1,recovery:55,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:0,cd:0,domain:'shrine_heian',invuln:130}
};
/* =====================================================================
   THE STRONGEST OF TODAY — Move Definitions
   Two completely independent movesets swapped by Six Eyes Overdrive.
   ===================================================================== */
/* --- MOVESET 1: BASE --- */
const STRONGEST_BASE_MOVES={
  light:{name:'Spatial Palm',kind:'light',startup:12,active:5,recovery:15,
    damage:8,hitstun:16,blockstun:10,kbx:2.5,kby:0,
    hitbox:{x:26,y:-96,w:76,h:44},advance:2.2,hitstop:5,meter:4,
    cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:14,cancelTo:28},
  heavy:{name:'Heavy Palm Burst',kind:'heavy',startup:24,active:6,recovery:24,
    damage:20,hitstun:28,blockstun:16,kbx:9,kby:-6,
    hitbox:{x:30,y:-102,w:96,h:56},advance:3.5,hitstop:11,meter:8,
    cancels:{skill:1,dash:1,ult:1},cancelFrom:26,cancelTo:50},
  air:{name:'Aerial Spatial Kick',kind:'air',startup:8,active:6,recovery:14,
    damage:10,hitstun:18,blockstun:10,kbx:4,kby:1.5,
    hitbox:{x:16,y:-68,w:74,h:52},advance:1.2,hitstop:6,meter:5,
    cancels:{dash:1},cancelFrom:10,cancelTo:26},
  wcs:{name:'Spatial Shift',kind:'strongest_shift',startup:22,active:1,recovery:22,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:15,cd:300,meter:0,aura:'strongest'},
  s1:{name:'Reverse Cursed Technique',kind:'strongest_rct',startup:30,active:1,recovery:40,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:30,cd:720,meter:0,aura:'strongest'},
  s2:{name:'Simple Domain',kind:'strongest_simpledomain',startup:22,active:50,recovery:20,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:25,cd:600,meter:0,aura:'strongest'},
  s3:{name:'Black Flash',kind:'strongest_bf',startup:24,active:6,recovery:28,
    damage:42,hitstun:40,blockstun:26,kbx:14,kby:-9,
    hitbox:{x:32,y:-104,w:100,h:82},advance:4.5,hitstop:22,meter:12,
    cost:30,cd:600,armorBreak:true,
    cancels:{dash:1},cancelFrom:30,cancelTo:54,aura:'strongest'},
  s4:{name:'Hollow Purple',kind:'skill4',startup:36,active:20,recovery:30,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    projectile:{type:'strongest_purple',damage:42,hitstun:42,blockstun:26,
      kbx:17,kby:-9,speed:18,w:90,h:70,life:110,hitstop:16,armorBreak:true},
    cost:45,cd:900,meter:20,aura:'strongest',
    cancels:{dash:1},cancelFrom:52,cancelTo:76},
  s5:{name:'Domain Expansion: Unlimited Void',kind:'ult',startup:40,active:1,recovery:70,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:60,cd:1200,meter:0,domain:'void',invuln:80,aura:'strongest'},
  ult:{name:'Six Eyes Overdrive',kind:'strongest_transform',startup:80,active:1,recovery:50,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:0,cd:0,meter:0,aura:'strongest',transform:true}
};
/* --- MOVESET 2: SIX EYES OVERDRIVE --- */
const STRONGEST_OVERDRIVE_MOVES={
  light:{name:'Overdrive Palm',kind:'light',startup:8,active:5,recovery:12,
    damage:10,hitstun:16,blockstun:10,kbx:3,kby:0,
    hitbox:{x:28,y:-98,w:84,h:48},advance:2.8,hitstop:5,meter:4,
    cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:10,cancelTo:22},
  heavy:{name:'Overdrive Heavy Palm',kind:'heavy',startup:20,active:6,recovery:22,
    damage:24,hitstun:30,blockstun:18,kbx:10,kby:-6,
    hitbox:{x:32,y:-104,w:104,h:60},advance:4,hitstop:12,meter:9,
    cancels:{skill:1,dash:1,ult:1},cancelFrom:22,cancelTo:44},
  air:{name:'Overdrive Aerial',kind:'air',startup:6,active:6,recovery:12,
    damage:12,hitstun:18,blockstun:10,kbx:4.5,kby:1.5,
    hitbox:{x:16,y:-70,w:80,h:56},advance:1.4,hitstop:6,meter:5,
    cancels:{dash:1},cancelFrom:8,cancelTo:20},
  wcs:{name:'Maximum Output: Blue',kind:'strongest_maxblue',startup:131,active:1,recovery:18,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:30,cd:480,meter:0,aura:'strongest'},
  s1:{name:'Maximum Output: Red',kind:'strongest_maxred',startup:129,active:1,recovery:14,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:30,cd:480,meter:0,aura:'strongest'},
  s2:{name:'Hollow Purple: Chant',kind:'strongest_purplechant',startup:235,active:1,recovery:24,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:60,cd:1200,meter:0,aura:'strongest'},
  s3:{name:'Overdrive Spatial Combat',kind:'strongest_spatialcombat',startup:60,active:1,recovery:30,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:35,cd:540,meter:0,aura:'strongest'},
  s4:{name:'Overdrive Close Combat',kind:'strongest_closecombat',startup:40,active:1,recovery:50,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:35,cd:540,meter:0,aura:'strongest'},
  s5:{name:'Advanced Reverse Cursed Technique',kind:'strongest_advrct',startup:30,active:1,recovery:40,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:45,cd:720,meter:0,aura:'strongest'},
  ult:{name:'Domain Expansion: Unlimited Void (Overdrive)',kind:'ult',startup:50,active:1,recovery:80,
    damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,
    cost:0,cd:1200,meter:0,domain:'strongest_void',invuln:100,aura:'strongest'}
};