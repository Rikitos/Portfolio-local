/**
 * seed-data.ts — static content for the Discord Clone.
 *
 * Contains 4 servers, each with multiple channels pre-seeded with messages.
 * Bot users and member lists are defined in USERS.
 * All timestamps are relative to a fixed "today" so the demo looks fresh.
 *
 * ChatEngine (Phase 3) will reference BOT_USERS and REPLY_POOLS to generate
 * fake live interactions.
 */

import type { User, Server, LocalUser, Message } from './types'

// ── Fixed "now" reference ─────────────────────────────────────────────────────
// Seed messages use offsets from this so the chat always looks recent.
const NOW = new Date()
function minsAgo(m: number): string {
  return new Date(NOW.getTime() - m * 60_000).toISOString()
}

// ── Local user ────────────────────────────────────────────────────────────────

export const LOCAL_USER: LocalUser = {
  id: 'local_user',
  name: 'you',
  displayName: 'You',
  avatarColor: '#5865F2',
  status: 'online',
}

// ── Bot users (seed members) ──────────────────────────────────────────────────

export const USERS: Record<string, User> = {
  nova: {
    id: 'nova',
    name: 'Nova',
    displayName: 'Nova',
    avatarColor: '#ED4245',
    status: 'online',
    role: 'Moderator',
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel',
    displayName: 'Pixel',
    avatarColor: '#57F287',
    status: 'online',
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    displayName: 'Sage',
    avatarColor: '#FEE75C',
    status: 'idle',
  },
  cipher: {
    id: 'cipher',
    name: 'Cipher',
    displayName: 'Cipher',
    avatarColor: '#EB459E',
    status: 'online',
  },
  arc: {
    id: 'arc',
    name: 'Arc',
    displayName: 'Arc',
    avatarColor: '#9B59B6',
    status: 'dnd',
    role: 'Admin',
  },
  echo: {
    id: 'echo',
    name: 'Echo',
    displayName: 'Echo',
    avatarColor: '#1ABC9C',
    status: 'offline',
  },
  drift: {
    id: 'drift',
    name: 'Drift',
    displayName: 'Drift',
    avatarColor: '#E67E22',
    status: 'online',
  },
}

// ── Reply pools (used by ChatEngine in Phase 3) ───────────────────────────────
// Keyed by a loose topic so each server's bot activity feels on-theme.

export const REPLY_POOLS: Record<string, string[]> = {
  general: [
    'yeah same honestly',
    'lmao fr',
    'wait what',
    'no way 💀',
    'that actually slaps',
    'bro wake up',
    'LMAOO',
    'okay but hear me out',
    'classic',
    'certified moment',
  ],
  tech: [
    'just use Rust bro',
    'have you tried turning it off and on again',
    'it works on my machine 🤷',
    'skill issue',
    'git blame yourself',
    'type safety is a lie',
    'touch grass then come back',
    'rubber duck debugging saved my career',
    'just rewrite it in TypeScript',
    'that\'s what unit tests are for... if we had any',
  ],
  gaming: [
    'ez',
    'skill diff',
    'gg no re',
    'I was lagging I swear',
    'this game is actually broken',
    'nerf this NOW',
    'my teammates are holding me back',
    'poggers',
    'git gud',
    'first try obv',
  ],
  music: [
    'this slaps so hard',
    'underrated fr',
    'the chorus goes crazy',
    'I can\'t stop replaying this',
    'this is my current sleep playlist',
    'put me onto this artist pls',
    'the production on this 🔥',
    'ok this is actually lowkey fire',
    'who is this??',
    'adding to playlist immediately',
  ],
  random: [
    'why did I click this',
    'send help',
    'this is cursed',
    'I don\'t know what I expected',
    'LMAO what',
    'daily dose of internet called',
    'why does this exist',
    'somehow this made my day',
    'ok that\'s hilarious',
    'not clicking that at 2am again',
  ],
  football: [
    'that offside was closer than my last relationship',
    'VAR said no 💀',
    'the ref is blind bro',
    'GOAAAAAAL',
    'that tackle was actually criminal',
    'counter press looking clean ngl',
    'what formation is this even',
    'he bottled it from the spot 💔',
    'handball? my man tripped',
    'added time for WHAT exactly',
    'bro the keeper is a brick wall today',
    'that pass was filthy 🔥',
    'yellow card was soft as hell',
    'they need to sub him off already',
    'parking the bus again I see',
    'that finish was ice cold',
    'VAR overturned it lmaoooo',
    '0-0 and somehow compelling television',
    'this ref is getting trolled on twitter tonight',
    'top corner, no keeper in the world saves that',
  ],
}

export const REACTION_POOL = ['😂', '🔥', '💀', '👀', '😭', '🫡', '💯', '🤣', '✅', '👏']

// Gifs are static URLs — no external API needed. These are publicly hosted stable URLs.
export const GIF_POOL = [
  { url: 'https://static2.klipy.com/ii/c3a19a0b747a76e98651f2b9a3cca5ff/53/aa/jtikXsr3.gif', alt: 'Bear waving Hello', tag: "hello" },
  { url: 'https://static2.klipy.com/ii/935d7ab9d8c6202580a668421940ec81/5b/2d/hX40MunW.gif', alt: 'Cat Drawing - Hello', tag: "hello" },
  { url: 'https://static2.klipy.com/ii/935d7ab9d8c6202580a668421940ec81/c2/4a/3ROhIYTQ.gif', alt: 'spitting coffe', tag: "lol, funny" },
  { url: 'https://static2.klipy.com/ii/d7aec6f6f171607374b2065c836f92f4/6c/f5/yAOgECjL.gif', alt: 'Jerry laughing', tag: "lol, funny" },
  { url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', alt: 'mind blown', tag: "wow, what" },
  { url: 'https://static2.klipy.com/ii/39f2394ae36df6e199be9eb7c9fa1012/30/5c/38hpM6wC.gif', alt: 'man nodding in agreement', tag: "yes, agree" },
  { url: 'https://static2.klipy.com/ii/d7aec6f6f171607374b2065c836f92f4/3d/31/l33k2Oo2.gif', alt: 'man thumbs up', tag: "thumb-up, agree, okay" },
  { url: 'https://static2.klipy.com/ii/c3a19a0b747a76e98651f2b9a3cca5ff/2b/1c/AOEvaJTk.gif', alt: 'spongbob thumbs up', tag: "thumb-up, agree" },
  { url: 'https://static2.klipy.com/ii/4493325008d34b7bf8cd6813cd5c1619/d2/ac/Ytkz5n8PPWrPrGKOgA7F.gif', alt: 'dog crying holding phone', tag: "sad" },
  { url: 'https://static2.klipy.com/ii/935d7ab9d8c6202580a668421940ec81/b4/a4/SVCdZ9ez.gif', alt: 'dog crying', tag: "sad" },
  { url: 'https://static2.klipy.com/ii/925f17378dd1893b674a723c07535afe/38/8e/0pYAIwH2.gif', alt: 'man standing in rain', tag: "sad" },
  { url: 'https://static2.klipy.com/ii/867d9eb2b3abaf7dd7b0ac048a90efee/0c/01/cDHISiCx.gif', alt: 'Jim carrey no', tag: "no, disagree" },
  { url: 'https://static2.klipy.com/ii/d7aec6f6f171607374b2065c836f92f4/2f/e0/nO242QpL.gif', alt: 'Cat moving head left-right', tag: "no, disagree" },
  { url: 'https://static2.klipy.com/ii/71b2873e478b9d8d0482ea3ec777ba7f/36/02/1Dc9olJr.gif', alt: 'dog walking into heart-shaped hands', tag: "like, wholesome" },
  { url: 'https://static2.klipy.com/ii/925f17378dd1893b674a723c07535afe/e0/82/clTlhHaU.gif', alt: 'ironman smirking', tag: "yes, maybe" },
  { url: 'https://static2.klipy.com/ii/f87f46a2c5aeaeed4c68910815f73eaf/f7/26/W4fYOuqL.gif', alt: 'jim carrey laughing then frown', tag: "maybe, semi-funny" },
  { url: 'https://static2.klipy.com/ii/35ccce3d852f7995dd2da910f2abd795/b9/4d/pZ5cIOPM.gif', alt: 'cat dancing', tag: "happy, wholesome, nice" },
  { url: 'https://static2.klipy.com/ii/71b2873e478b9d8d0482ea3ec777ba7f/53/12/975mLe0o.gif', alt: 'pascal creepy smile', tag: "okay, maybe, semi-funny" },
  { url: 'https://static2.klipy.com/ii/35ccce3d852f7995dd2da910f2abd795/b4/58/1q4JtoHm.gif', alt: 'cat jumping happily', tag: "happy, wholesome" },
  { url: 'https://static2.klipy.com/ii/c3a19a0b747a76e98651f2b9a3cca5ff/d7/3a/gwl2mI9W.gif', alt: 'man excited', tag: "excited, happy, nice, wow" },
  { url: 'https://static2.klipy.com/ii/a15b48460c436e1e92c85ffc680932cc/ef/86/U3L6Lhlw.gif', alt: 'kid happy excited after team scores', tag: "excited, happy, nice" },

]

// ── Helper: build a message ───────────────────────────────────────────────────

let _msgId = 0
function msg(
  userId: string,
  content: string,
  minsBack: number,
  reactions: { emoji: string; userIds: string[] }[] = [],
): Message {
  return {
    id: `seed_${_msgId++}`,
    userId,
    timestamp: minsAgo(minsBack),
    type: 'text',
    content,
    reactions,
  }
}

// ── Servers ───────────────────────────────────────────────────────────────────

export const SERVERS: Server[] = [
  // ── Server 1: Gaming Den ──────────────────────────────────────────────────
  {
    id: 'gaming-den',
    name: 'Gaming Den',
    iconLabel: '🎮',
    iconColor: '#ED4245',
    memberIds: ['nova', 'pixel', 'cipher', 'echo', 'drift'],
    categories: [
      { id: 'general', name: 'GENERAL', channelIds: ['lobby', 'clips'] },
      { id: 'games', name: 'GAMES', channelIds: ['valorant', 'minecraft', 'elden-ring'] },
    ],
    channels: [
      {
        id: 'lobby',
        name: 'lobby',
        type: 'text',
        topic: 'Main hangout — LFG here',
        messages: [
          msg('echo', 'who\'s on tonight?', 180),
          msg('pixel', 'me after 9', 175),
          msg('cipher', 'same, got valorant ranked?', 170),
          msg('pixel', 'say less', 168, [{ emoji: '🫡', userIds: ['cipher', 'echo'] }]),
          msg('nova', 'I\'ll watch and offer completely unhelpful commentary', 160, [{ emoji: '😂', userIds: ['pixel', 'cipher', 'echo'] }]),
          msg('drift', 'I peaked plat so my commentary is actually useful', 155, [{ emoji: '💀', userIds: ['nova', 'pixel', 'cipher'] }]),
          msg('echo', 'peaked is the right word lmaooo', 150, [{ emoji: '😂', userIds: ['nova', 'pixel'] }]),
          msg('drift', 'I walked into that one', 145),
          msg('cipher', 'alright 9pm then, lobby up', 60),
          msg('pixel', '👍', 55),
        ],
      },
      {
        id: 'clips',
        name: 'clips',
        type: 'text',
        topic: 'Drop your best moments',
        messages: [
          msg('echo', 'just hit a 4k through smoke I will NEVER recreate this', 400, [{ emoji: '🔥', userIds: ['nova', 'pixel', 'cipher', 'drift'] }]),
          msg('cipher', 'ECHO??', 395),
          msg('nova', 'report him for hacking', 390, [{ emoji: '😂', userIds: ['pixel', 'echo', 'drift'] }]),
          msg('echo', 'I am CLEAN I just got lucky', 385),
          msg('pixel', 'this clip has me re-evaluating my life choices', 380, [{ emoji: '💀', userIds: ['echo', 'cipher'] }]),
          msg('drift', 'mine is less impressive, I accidentally wall bounced and won a 1v3', 200, [{ emoji: '🤣', userIds: ['nova', 'pixel', 'echo', 'cipher'] }]),
        ],
      },
      {
        id: 'valorant',
        name: 'valorant',
        type: 'text',
        topic: 'Valorant chat — agents, patches, meta',
        messages: [
          msg('cipher', 'the new agent is kind of busted ngl', 300),
          msg('pixel', 'give it a week and riot will nerf it into the ground', 295, [{ emoji: '✅', userIds: ['cipher', 'echo'] }]),
          msg('nova', 'classic riot patch cycle: op → nerf → useless → buff → repeat', 290, [{ emoji: '💯', userIds: ['pixel', 'drift'] }]),
          msg('echo', 'my elo has been the same for 3 months', 200),
          msg('drift', 'it\'s not the elo that\'s stuck it\'s you', 195, [{ emoji: '💀', userIds: ['nova', 'pixel', 'cipher'] }]),
          msg('echo', 'I hate all of you', 190, [{ emoji: '😂', userIds: ['nova', 'pixel', 'drift', 'cipher'] }]),
        ],
      },
      {
        id: 'minecraft',
        name: 'minecraft',
        type: 'text',
        topic: 'Blocks and builds',
        messages: [
          msg('nova', 'built a fully automated farms setup this weekend, 3 hours and I don\'t regret anything', 600, [{ emoji: '👏', userIds: ['echo', 'drift'] }]),
          msg('drift', 'the serotonin from a working redstone contraption is unmatched', 595, [{ emoji: '✅', userIds: ['nova', 'pixel'] }]),
          msg('pixel', 'I have never once made redstone work on the first try', 590),
          msg('echo', 'first try is a myth, there is only the debug session', 585, [{ emoji: '😂', userIds: ['nova', 'drift', 'pixel'] }]),
        ],
      },
      {
        id: 'elden-ring',
        name: 'elden-ring',
        type: 'text',
        topic: '⚠️ Spoilers allowed here',
        messages: [
          msg('drift', 'just got to Malenia after 80 hours into my first playthrough', 500),
          msg('cipher', 'F', 495, [{ emoji: '🫡', userIds: ['nova', 'pixel', 'echo'] }]),
          msg('nova', 'I\'m so sorry', 490),
          msg('pixel', 'she\'s actually not that bad if you learn the second phase timing', 485),
          msg('drift', 'pixel I have attempted this 47 times', 480, [{ emoji: '💀', userIds: ['nova', 'cipher', 'echo'] }]),
          msg('echo', '47 is nothing, I got her first try (I used a summon and I will die with that secret)', 475, [{ emoji: '😂', userIds: ['nova', 'pixel', 'cipher', 'drift'] }]),
          msg('drift', 'ECHO YOU CAN\'T JUST', 470),
          msg('cipher', 'no judgement zone, I also summoned', 465, [{ emoji: '✅', userIds: ['echo', 'drift'] }]),
        ],
      },
    ],
  },

  // ── Server 2: World Cup HQ ────────────────────────────────────────────────
  {
    id: 'world-cup-hq',
    name: 'World Cup HQ',
    iconLabel: '⚽',
    iconColor: '#57F287',
    memberIds: ['nova', 'pixel', 'sage', 'cipher', 'arc', 'echo', 'drift'],
    categories: [
      { id: 'info', name: 'INFO', channelIds: ['wc-announcements'] },
      { id: 'main', name: 'MAIN', channelIds: ['general-chat', 'match-reactions', 'predictions'] },
      { id: 'groups', name: 'GROUPS & MATCHES', channelIds: ['group-stage', 'knockouts', 'final'] },
    ],
    channels: [
      {
        id: 'wc-announcements',
        name: 'announcements',
        type: 'announcement',
        topic: 'Official tournament news and schedule',
        messages: [
          msg('arc', '🏆 Welcome to World Cup HQ! The 2026 FIFA World Cup kicks off June 11 across USA, Canada & Mexico.', 2880),
          msg('arc', '📅 Group stage runs June 11 – June 27. Use #predictions to post your bracket before it starts!', 2800),
          msg('arc', '🔴 LIVE MATCH THREAD: Use #match-reactions during games. Keep it hype, keep it clean.', 1440),
          msg('arc', '🥇 Knockout stage begins June 29. 48 teams, 8 groups — chaos incoming.', 500),
        ],
      },
      {
        id: 'general-chat',
        name: 'general-chat',
        type: 'text',
        topic: 'Main football chat — anything goes',
        messages: [
          msg('nova', 'okay I need to say it: this is the most hyped I\'ve been for a World Cup in years', 300, [{ emoji: '🔥', userIds: ['pixel', 'echo', 'drift'] }]),
          msg('drift', '48 teams is genuinely wild, so many more games', 295, [{ emoji: '✅', userIds: ['nova', 'cipher'] }]),
          msg('pixel', 'more games = more upsets = more chaos = I\'m in', 290, [{ emoji: '💯', userIds: ['nova', 'echo', 'drift'] }]),
          msg('cipher', 'who is everyone actually supporting? I feel like half this server is going to pick different teams', 280),
          msg('sage', 'Spain 🇪🇸 and I will not be taking questions', 275, [{ emoji: '✅', userIds: ['arc'] }]),
          msg('echo', 'Brazil 🇧🇷 obviously, don\'t @ me', 270, [{ emoji: '💀', userIds: ['drift', 'nova'] }]),
          msg('drift', 'France 🇫🇷 still have the squad to do it', 265, [{ emoji: '✅', userIds: ['cipher'] }]),
          msg('nova', 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿 this time it\'s coming home. I say this every time.', 260, [{ emoji: '😂', userIds: ['pixel', 'echo', 'sage', 'drift', 'cipher'] }]),
          msg('pixel', 'Argentina 🇦🇷 defending champions, never write them off', 255, [{ emoji: '✅', userIds: ['cipher', 'drift'] }]),
          msg('arc', 'Portugal 🇵🇹. No further elaboration needed.', 250, [{ emoji: '👀', userIds: ['nova', 'pixel'] }]),
          msg('echo', 'the usual suspects lmao, someone root for Senegal or Morocco', 240, [{ emoji: '😂', userIds: ['sage', 'drift'] }]),
          msg('sage', 'Morocco 🇲🇦 2022 run still gives me chills honestly', 235, [{ emoji: '🔥', userIds: ['echo', 'nova', 'pixel', 'cipher'] }]),
          msg('drift', 'that Morocco semi-final run was the best story of the whole tournament', 230, [{ emoji: '💯', userIds: ['sage', 'echo', 'arc'] }]),
          msg('nova', 'okay can we talk schedules, when are the first big matches?', 120),
          msg('pixel', 'check #group-stage I posted the full bracket', 115, [{ emoji: '✅', userIds: ['nova', 'echo'] }]),
        ],
      },
      {
        id: 'match-reactions',
        name: 'match-reactions',
        type: 'text',
        topic: '🔴 LIVE — react to matches here',
        messages: [
          msg('echo', 'ARGENTINA VS FRANCE IN THE GROUP STAGE IS SENDING ME', 180, [{ emoji: '😭', userIds: ['nova', 'pixel', 'drift', 'cipher', 'sage'] }]),
          msg('nova', 'the draw was not kind to either of them', 175),
          msg('drift', 'whoever loses that one is basically done mentally for the rest of the tournament', 170, [{ emoji: '💀', userIds: ['pixel', 'echo'] }]),
          msg('pixel', 'Mbappe vs Mac Allister is the matchup I didn\'t know I needed', 165, [{ emoji: '🔥', userIds: ['cipher', 'nova', 'echo'] }]),
          msg('cipher', 'GOAAAAL — Spain just went 1-0 up against Germany, 22nd minute', 90, [{ emoji: '🔥', userIds: ['sage', 'nova', 'drift'] }]),
          msg('sage', 'YAMAAAAAAL', 88, [{ emoji: '🔥', userIds: ['cipher', 'echo', 'pixel', 'arc'] }]),
          msg('nova', 'he\'s 17 YEARS OLD what is happening', 85, [{ emoji: '😭', userIds: ['pixel', 'drift', 'cipher', 'sage'] }]),
          msg('drift', 'Germany equalised, 1-1, this game is insane', 70, [{ emoji: '👀', userIds: ['nova', 'echo'] }]),
          msg('echo', 'my heart cannot take this', 65),
          msg('pixel', 'SPAIN PENALTY 88TH MINUTE', 20, [{ emoji: '😭', userIds: ['nova', 'drift', 'echo', 'cipher'] }]),
          msg('sage', 'MORATAAAAA', 18, [{ emoji: '🎉', userIds: ['arc', 'cipher', 'pixel'] }]),
          msg('nova', 'Spain fans watching that penalty: 💀', 15, [{ emoji: '😂', userIds: ['drift', 'echo', 'pixel'] }]),
          msg('drift', 'full time Spain 2-1 Germany, what a match', 10, [{ emoji: '🔥', userIds: ['nova', 'pixel', 'cipher', 'sage', 'echo'] }]),
        ],
      },
      {
        id: 'predictions',
        name: 'predictions',
        type: 'text',
        topic: 'Post your bracket — bragging rights on the line',
        messages: [
          msg('arc', '📋 Post your winner prediction. One pick per person. No edits after group stage starts.', 2000),
          msg('nova', 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿 — I know, I know. But hear me out. Southgate is gone, new vibe, new energy.', 1800, [{ emoji: '💀', userIds: ['drift', 'pixel', 'echo', 'sage'] }]),
          msg('pixel', 'Argentina 🇦🇷 — defending champions with the same core squad. Don\'t fix what isn\'t broken.', 1750, [{ emoji: '✅', userIds: ['cipher'] }]),
          msg('echo', 'Brazil 🇧🇷 — they\'ve been building for this. Vinicius Jr. is on a completely different planet right now.', 1700, [{ emoji: '🔥', userIds: ['nova', 'drift'] }]),
          msg('drift', 'France 🇫🇷 — depth is unmatched. Even with injuries they find a way.', 1650, [{ emoji: '✅', userIds: ['cipher', 'pixel'] }]),
          msg('sage', 'Spain 🇪🇸 — youngest squad in the tournament, most exciting. Lamine Yamal is going to break people.', 1600, [{ emoji: '🔥', userIds: ['arc', 'pixel', 'echo'] }]),
          msg('cipher', 'Portugal 🇵🇹 — Ronaldo\'s last World Cup, the squad around him is actually great now.', 1550, [{ emoji: '👀', userIds: ['arc', 'nova'] }]),
          msg('arc', 'Portugal 🇵🇹 — and I\'m counting on Rúben Neves to run the midfield.', 1500, [{ emoji: '✅', userIds: ['cipher'] }]),
          msg('echo', 'dark horse mention: Morocco 🇲🇦 again. That 2022 run wasn\'t luck.', 1200, [{ emoji: '🔥', userIds: ['sage', 'nova', 'drift'] }]),
          msg('nova', 'also dark horse: USA 🇺🇸 — home tournament, passionate crowd, could cause some upsets', 1000, [{ emoji: '👀', userIds: ['pixel'] }]),
          msg('pixel', 'current standings: Argentina and France are the community picks, England is a meme pick with love', 800, [{ emoji: '😂', userIds: ['nova', 'echo', 'drift'] }]),
          msg('nova', 'it\'s a CONFIDENT meme pick thank you', 795, [{ emoji: '😂', userIds: ['pixel', 'sage', 'echo', 'drift'] }]),
        ],
      },
      {
        id: 'group-stage',
        name: 'group-stage',
        type: 'text',
        topic: 'Group results, tables, and drama',
        messages: [
          msg('pixel', '📊 Group A standings after matchday 1:', 600),
          msg('pixel', 'USA 🇺🇸 3pts | Wales 🏴󠁧󠁢󠁷󠁬󠁳 1pt | England 🏴󠁧󠁢󠁥󠁮󠁧󠁿 1pt | Iran 🇮🇷 0pts', 598),
          msg('nova', 'England drawing with Wales is sending me 💀', 590, [{ emoji: '😂', userIds: ['pixel', 'echo', 'drift'] }]),
          msg('drift', 'Group B is a bloodbath: Argentina, France, Portugal and Germany all in the same group somehow', 500, [{ emoji: '😭', userIds: ['nova', 'pixel', 'cipher', 'echo'] }]),
          msg('sage', 'that cannot be real', 495),
          msg('drift', 'it is very real and I am not okay', 490, [{ emoji: '💀', userIds: ['sage', 'nova', 'echo'] }]),
          msg('echo', 'whoever drew that group needs to be investigated', 485, [{ emoji: '😂', userIds: ['pixel', 'drift', 'cipher'] }]),
          msg('cipher', 'Spain and Brazil in the same group too, the draw just said chaos only', 400, [{ emoji: '💀', userIds: ['nova', 'pixel', 'drift', 'echo'] }]),
          msg('nova', 'this is genuinely the most chaotic group stage draw in history', 395, [{ emoji: '💯', userIds: ['drift', 'echo', 'cipher', 'sage'] }]),
          msg('arc', 'reminder: 48 teams means more depth in the groups this time, not every group is a death group', 380),
          msg('pixel', 'arc trying to calm us down when the draw literally put half the world\'s best teams together', 375, [{ emoji: '😂', userIds: ['nova', 'drift', 'echo'] }]),
        ],
      },
      {
        id: 'knockouts',
        name: 'knockouts',
        type: 'text',
        topic: 'Round of 32 onwards — knockout bracket',
        messages: [
          msg('echo', 'BRACKET IS SET. Round of 32 confirmed:', 400),
          msg('echo', 'Spain 🇪🇸 vs Japan 🇯🇵 | Argentina 🇦🇷 vs Senegal 🇸🇳 | France 🇫🇷 vs Morocco 🇲🇦 | Brazil 🇧🇷 vs USA 🇺🇸', 398),
          msg('nova', 'Brazil vs USA on home soil for the Americans... that\'s going to be unreal atmosphere', 390, [{ emoji: '🔥', userIds: ['pixel', 'drift', 'echo'] }]),
          msg('drift', 'France vs Morocco again?? 2022 all over again', 385, [{ emoji: '😭', userIds: ['sage', 'nova', 'cipher'] }]),
          msg('sage', 'Morocco will be ready for them this time', 380, [{ emoji: '💪', userIds: ['echo', 'drift'] }]),
          msg('cipher', 'Spain vs Japan is the hidden banger of this round, Japan are no joke', 375, [{ emoji: '👀', userIds: ['nova', 'pixel', 'echo'] }]),
          msg('pixel', 'Japan eliminated Germany and Spain in 2022, they\'ll be up for it', 370, [{ emoji: '🔥', userIds: ['cipher', 'drift'] }]),
          msg('arc', 'England somehow made it through... as a 3rd place group finisher. Nova your pick survives.', 300, [{ emoji: '😂', userIds: ['nova', 'pixel', 'echo', 'drift', 'cipher', 'sage'] }]),
          msg('nova', 'I TOLD YOU I TOLD ALL OF YOU', 295, [{ emoji: '🎉', userIds: ['arc'] }]),
        ],
      },
      {
        id: 'final',
        name: 'final',
        type: 'text',
        topic: '🏆 THE FINAL — July 19, MetLife Stadium, New Jersey',
        messages: [
          msg('arc', '🏆 THE FINAL IS SET. July 19, MetLife Stadium, New Jersey.', 120),
          msg('echo', 'SPAIN VS ARGENTINA 🇪🇸⚽🇦🇷', 115, [{ emoji: '😭', userIds: ['nova', 'pixel', 'drift', 'cipher', 'sage', 'arc'] }]),
          msg('nova', 'this is the final everyone wanted and I cannot believe it\'s actually happening', 110, [{ emoji: '🔥', userIds: ['pixel', 'echo', 'drift'] }]),
          msg('drift', 'Lamine Yamal vs the Argentina back line, this is cinema', 105, [{ emoji: '👀', userIds: ['nova', 'cipher', 'echo', 'pixel'] }]),
          msg('sage', 'new generation vs defending champions. perfect story.', 100, [{ emoji: '💯', userIds: ['arc', 'drift', 'nova'] }]),
          msg('pixel', 'I\'m going Spain, they\'ve been the best team in the tournament by a mile', 95, [{ emoji: '✅', userIds: ['sage', 'echo'] }]),
          msg('cipher', 'Argentina won\'t lose. Messi won\'t allow it. This team has decided they\'re winning.', 90, [{ emoji: '🔥', userIds: ['drift', 'nova'] }]),
          msg('nova', 'sage this is your moment, Spain vs your predicted winner', 85),
          msg('sage', '🇪🇸🇪🇸🇪🇸 Spain all the way, let\'s go', 80, [{ emoji: '🔥', userIds: ['arc', 'pixel'] }]),
          msg('arc', '120 minutes. Penalties. I can feel it.', 70, [{ emoji: '😭', userIds: ['nova', 'pixel', 'echo', 'drift', 'cipher', 'sage'] }]),
          msg('drift', 'I will not survive penalties', 65),
          msg('echo', 'KICKOFF IN 2 HOURS, see everyone on the other side 🫡', 60, [{ emoji: '🫡', userIds: ['nova', 'pixel', 'drift', 'cipher', 'sage', 'arc'] }]),
        ],
      },
    ],
  },

  // ── Server 3: Tech Lounge ─────────────────────────────────────────────────

  {
    id: 'tech-lounge',
    name: 'Tech Lounge',
    iconLabel: '⚡',
    iconColor: '#5865F2',
    memberIds: ['nova', 'pixel', 'sage', 'cipher', 'arc', 'drift'],
    categories: [
      { id: 'info', name: 'INFO', channelIds: ['announcements'] },
      { id: 'general', name: 'GENERAL', channelIds: ['general', 'off-topic'] },
      { id: 'coding', name: 'CODING', channelIds: ['help', 'show-and-tell', 'resources'] },
    ],
    channels: [
      {
        id: 'announcements',
        name: 'announcements',
        type: 'announcement',
        topic: 'Server announcements — read only',
        messages: [
          msg('arc', '📢 Welcome to Tech Lounge! Read the rules in #rules before posting.', 1440),
          msg('arc', 'New channel added: #show-and-tell — share what you\'re building!', 800),
          msg('arc', 'Monthly challenge is live: build something with WebGL. Submit by end of month.', 200),
        ],
      },
      {
        id: 'general',
        name: 'general',
        type: 'text',
        topic: 'The main chat — keep it chill',
        messages: [
          msg('nova', 'morning everyone 👋', 120, [{ emoji: '👋', userIds: ['pixel', 'sage'] }]),
          msg('pixel', 'yo, anyone tried the new TS 5.8 beta?', 115),
          msg('sage', 'yeah the inferred const stuff is 🔥', 110, [{ emoji: '🔥', userIds: ['pixel', 'cipher'] }]),
          msg('cipher', 'I still don\'t understand why they didn\'t add this 3 versions ago lol', 108),
          msg('drift', 'because TC39 moves at geological speed', 105, [{ emoji: '💀', userIds: ['nova', 'pixel', 'sage'] }]),
          msg('nova', 'anyone got a good resource for WebGL? starting the monthly challenge', 90),
          msg('pixel', 'threejs docs are actually pretty solid, and this course on YouTube covers fundamentals well', 85),
          msg('sage', 'second threejs, saved me hours', 80, [{ emoji: '✅', userIds: ['nova'] }]),
          msg('cipher', 'what are you building nova?', 70),
          msg('nova', 'thinking some kind of particle system thing, maybe tie it to audio input', 65, [{ emoji: '🔥', userIds: ['pixel', 'drift', 'cipher'] }]),
          msg('drift', 'that\'s sick, screenshot when done', 60),
          msg('pixel', 'brb coffee', 45),
          msg('sage', 'we\'ve been waiting for 45 mins pixel 😭', 10, [{ emoji: '😂', userIds: ['cipher', 'drift'] }]),
        ],
      },
      {
        id: 'off-topic',
        name: 'off-topic',
        type: 'text',
        topic: 'Literally anything else',
        messages: [
          msg('drift', 'okay real talk, tabs or spaces', 300),
          msg('cipher', 'tabs obviously, it\'s 2024', 295, [{ emoji: '✅', userIds: ['drift'] }]),
          msg('nova', 'spaces and I will die on this hill', 290, [{ emoji: '💀', userIds: ['pixel'] }]),
          msg('pixel', 'I use whatever the formatter tells me and I have never been happier', 280, [{ emoji: '🫡', userIds: ['sage', 'cipher', 'drift', 'nova'] }]),
          msg('sage', 'pixel is the most evolved being in this server', 275),
          msg('drift', 'honestly true', 270),
          msg('arc', 'we have a prettier config for a reason people', 200),
          msg('nova', 'arc speaking facts', 195),
          msg('cipher', 'also can we talk about how bad the coffee machine at work is', 120),
          msg('drift', 'bro we do NOT get paid enough to deal with bad coffee', 115, [{ emoji: '💯', userIds: ['cipher', 'nova'] }]),
        ],
      },
      {
        id: 'help',
        name: 'help',
        type: 'text',
        topic: 'Ask questions — no dumb questions here',
        messages: [
          msg('sage', 'anyone know why useEffect is running twice in dev mode?', 180),
          msg('pixel', 'React 18 strict mode mounts twice intentionally to catch side effects', 175),
          msg('sage', 'OHHHH that explains so much, thank you', 170, [{ emoji: '✅', userIds: ['pixel'] }]),
          msg('cipher', 'spent 3 hours debugging that same thing once 💀', 168, [{ emoji: '😂', userIds: ['sage', 'drift'] }]),
          msg('nova', 'anyone had issues with vite HMR dropping websocket connections?', 90),
          msg('drift', 'yeah it happens with certain proxy configs, try vite.config hmr.port explicitly', 85),
          msg('nova', 'omg that was exactly it, you\'re a legend', 80, [{ emoji: '🔥', userIds: ['drift'] }]),
        ],
      },
      {
        id: 'show-and-tell',
        name: 'show-and-tell',
        type: 'text',
        topic: 'Share what you\'re building!',
        messages: [
          msg('pixel', 'shipped my first npm package yesterday! it\'s a tiny utility for debounced localStorage writes', 500, [{ emoji: '🔥', userIds: ['nova', 'sage', 'cipher', 'drift'] }]),
          msg('nova', 'PIXEL let\'s GOOO', 495, [{ emoji: '🎉', userIds: ['sage'] }]),
          msg('cipher', 'link?', 490),
          msg('pixel', 'still writing docs lol, will drop it here when it\'s ready', 485),
          msg('drift', 'built a CLI tool this week that auto-generates OpenAPI specs from express routes', 300, [{ emoji: '👀', userIds: ['nova', 'pixel', 'cipher'] }]),
          msg('sage', 'wait that actually sounds super useful', 295),
          msg('drift', 'it\'s janky but it works, might open source it', 290),
          msg('cipher', 'please do', 285, [{ emoji: '✅', userIds: ['nova', 'pixel', 'sage'] }]),
        ],
      },
      {
        id: 'resources',
        name: 'resources',
        type: 'text',
        topic: 'Links, tools, and learning materials',
        messages: [
          msg('arc', 'Pinning some useful links here:', 720),
          msg('arc', 'https://roadmap.sh — great for figuring out what to learn next', 718),
          msg('arc', 'https://excalidraw.com — best free diagramming tool, use it for planning', 716),
          msg('nova', 'adding: https://devdocs.io — all docs in one place, works offline', 600, [{ emoji: '✅', userIds: ['pixel', 'sage', 'drift'] }]),
          msg('pixel', 'https://bundlephobia.com — check npm package size before installing', 400, [{ emoji: '👏', userIds: ['cipher', 'nova', 'arc'] }]),
          msg('sage', 'https://ray.so — gorgeous code screenshots for sharing', 200, [{ emoji: '🔥', userIds: ['pixel', 'cipher', 'drift'] }]),
        ],
      },
    ],
  },

  // ── Server 4: Chill Vibes ─────────────────────────────────────────────────
  {
    id: 'chill-vibes',
    name: 'Chill Vibes',
    iconLabel: '🌙',
    iconColor: '#57F287',
    memberIds: ['sage', 'echo', 'drift', 'nova'],
    categories: [
      { id: 'main', name: 'MAIN', channelIds: ['chat', 'music', 'random'] },
    ],
    channels: [
      {
        id: 'chat',
        name: 'chat',
        type: 'text',
        topic: 'slow down ☁️',
        messages: [
          msg('sage', 'good morning everyone 🌿', 240, [{ emoji: '🌿', userIds: ['echo', 'drift'] }]),
          msg('echo', 'morning! coffee count: 2 and climbing', 235),
          msg('drift', 'slept 10 hours and still tired, explain', 230, [{ emoji: '💀', userIds: ['sage', 'echo'] }]),
          msg('nova', 'have you tried sleeping 11', 225, [{ emoji: '😂', userIds: ['drift', 'echo', 'sage'] }]),
          msg('drift', 'groundbreaking advice thank you nova', 220),
          msg('sage', 'the weather is so nice today, went on a walk before logging in', 180, [{ emoji: '🌿', userIds: ['echo', 'nova'] }]),
          msg('echo', 'I forget the outside exists sometimes', 175),
          msg('nova', 'currently sitting in a park with a book, this is rare for me', 120, [{ emoji: '✅', userIds: ['sage', 'echo', 'drift'] }]),
          msg('drift', 'that\'s the dream honestly', 115),
          msg('sage', 'you deserve it 🍃', 110),
        ],
      },
      {
        id: 'music',
        name: 'music',
        type: 'text',
        topic: 'what are you listening to?',
        messages: [
          msg('echo', 'on a massive Radiohead kick lately, In Rainbows never misses', 480, [{ emoji: '🔥', userIds: ['sage', 'drift'] }]),
          msg('sage', 'Nude is one of the most beautiful songs ever made, no arguments', 475, [{ emoji: '💯', userIds: ['echo', 'nova'] }]),
          msg('drift', 'been in a lofi hip hop phase for work, it just... turns my brain off in the best way', 400, [{ emoji: '✅', userIds: ['sage', 'echo'] }]),
          msg('nova', 'I cycle between total silence and music so loud my neighbours know my taste', 350, [{ emoji: '😂', userIds: ['sage', 'echo', 'drift'] }]),
          msg('sage', 'currently: Sufjan Stevens Illinois on repeat, it\'s a classic for a reason', 200, [{ emoji: '🔥', userIds: ['echo', 'drift'] }]),
          msg('echo', 'that album destroyed me emotionally the first time I heard Casimir Pulaski Day', 195, [{ emoji: '💀', userIds: ['sage', 'nova', 'drift'] }]),
          msg('drift', 'okay adding this to my list', 190),
          msg('nova', 'what\'s everyone\'s current song of the week?', 60),
          msg('sage', 'Gracie Abrams — I Love You I\'m Sorry, on repeat since Tuesday', 50, [{ emoji: '🎵', userIds: ['echo'] }]),
          msg('echo', 'GRACIE ABRAMS fan here too what', 45, [{ emoji: '😭', userIds: ['sage'] }]),
        ],
      },
      {
        id: 'random',
        name: 'random',
        type: 'text',
        topic: 'send anything',
        messages: [
          msg('drift', 'a seagull stole my lunch today and I\'m still processing it', 300, [{ emoji: '💀', userIds: ['sage', 'echo', 'nova'] }]),
          msg('nova', 'did it at least look cool doing it', 295),
          msg('drift', 'infuriatingly yes, full swoop, perfect execution, it was kind of impressive', 290, [{ emoji: '😂', userIds: ['sage', 'echo', 'nova'] }]),
          msg('echo', 'seagulls are just unhinged pigeons and I respect the hustle', 285, [{ emoji: '💯', userIds: ['drift', 'nova', 'sage'] }]),
          msg('sage', 'I just learned that otters hold hands while sleeping so they don\'t drift apart', 200, [{ emoji: '😭', userIds: ['echo', 'nova', 'drift'] }]),
          msg('nova', '...I needed that', 195, [{ emoji: '🥹', userIds: ['sage', 'echo'] }]),
          msg('drift', 'okay that made up for the seagull', 190),
          msg('echo', 'sending this to everyone I know', 185),
        ],
      },
    ],
  },

  // ── Server 5: Design Hub ──────────────────────────────────────────────────
  {
    id: 'design-hub',
    name: 'Design Hub',
    iconLabel: '✦',
    iconColor: '#EB459E',
    memberIds: ['pixel', 'cipher', 'arc', 'echo', 'sage'],
    categories: [
      { id: 'main', name: 'MAIN', channelIds: ['inspiration', 'critique', 'tools'] },
    ],
    channels: [
      {
        id: 'inspiration',
        name: 'inspiration',
        type: 'text',
        topic: 'Share what\'s inspiring you',
        messages: [
          msg('pixel', 'just found this portfolio site and I want to quit my job and start over', 600, [{ emoji: '😭', userIds: ['cipher', 'echo', 'sage'] }]),
          msg('cipher', 'the typography on some of these sites is just... unfair', 595, [{ emoji: '💯', userIds: ['pixel', 'echo'] }]),
          msg('echo', 'I\'ve been very into brutalist web design lately, there\'s something freeing about it', 500, [{ emoji: '👀', userIds: ['pixel', 'sage'] }]),
          msg('sage', 'brutalist sites hit different because they break all the rules with intention', 495, [{ emoji: '✅', userIds: ['echo', 'cipher'] }]),
          msg('arc', 'the tension between constraint and chaos is where good design lives', 490, [{ emoji: '🔥', userIds: ['pixel', 'cipher', 'echo', 'sage'] }]),
          msg('pixel', 'arc out here being profound at 2pm', 485, [{ emoji: '😂', userIds: ['cipher', 'echo', 'sage'] }]),
        ],
      },
      {
        id: 'critique',
        name: 'critique',
        type: 'text',
        topic: 'Be kind, be honest',
        messages: [
          msg('echo', 'dropping my new landing page concept, be gentle (don\'t be gentle)', 400),
          msg('pixel', 'okay the hero section is strong but the CTA button is fighting the nav colour', 390, [{ emoji: '✅', userIds: ['echo', 'cipher'] }]),
          msg('cipher', 'agree, also the body text is a bit light on mobile, check your contrast ratio', 385),
          msg('echo', 'good catches, I knew something was off with the CTA, couldn\'t pin it', 380, [{ emoji: '✅', userIds: ['pixel'] }]),
          msg('sage', 'the spacing in the feature cards section feels a bit cramped, more breathing room?', 375, [{ emoji: '✅', userIds: ['echo', 'pixel'] }]),
          msg('echo', 'this is so helpful, thank you all 🙏', 370, [{ emoji: '💙', userIds: ['pixel', 'cipher', 'sage'] }]),
          msg('arc', 'the concept is solid, these are all fixable — iteration beats perfection', 365, [{ emoji: '🔥', userIds: ['echo', 'pixel', 'cipher', 'sage'] }]),
        ],
      },
      {
        id: 'tools',
        name: 'tools',
        type: 'text',
        topic: 'Figma, Framer, whatever you use',
        messages: [
          msg('sage', 'Figma Variables finally clicking for me — my design system is so much cleaner', 700, [{ emoji: '✅', userIds: ['pixel', 'cipher', 'arc'] }]),
          msg('pixel', 'the semantic token layer is the key, took me a while to get there too', 695),
          msg('cipher', 'anyone used Framer for production sites? thinking of switching from Webflow', 500),
          msg('arc', 'Framer is great for interaction-heavy marketing sites, less so for content-heavy', 495, [{ emoji: '✅', userIds: ['cipher', 'pixel'] }]),
          msg('echo', 'Webflow is still king for CMS-heavy builds imo', 490, [{ emoji: '✅', userIds: ['arc', 'sage'] }]),
          msg('cipher', 'helpful, my use case is definitely interaction-heavy so maybe Framer', 485),
          msg('pixel', 'Framer\'s preview mode is genuinely delightful to use', 480, [{ emoji: '✅', userIds: ['cipher', 'echo'] }]),
        ],
      },
    ],
  },
]
