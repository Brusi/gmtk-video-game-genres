/**
 * GMTK Video Game Genre Taxonomy Mapping
 * Based on Mark Brown's "The History of Every Video Game Genre"
 */

const GENRE_RULES = [
  // 1. Platformer
  {
    canonical: 'Platformer',
    subgenres: ['2D Platformer', '3D Platformer', 'Cinematic Platformer', 'Precision Platformer', 'Metroidvania'],
    patterns: [
      /\bplatform(?:er|ing|s)?\b/i,
      /\bmetroidvania\b/i,
      /\bcinematic platformer\b/i,
      /\bprecision platformer\b/i
    ]
  },
  
  // 2. Racing
  {
    canonical: 'Racing',
    subgenres: ['Kart Racer', 'Racing Simulation', 'Vehicular Combat', 'Arcade Racing'],
    patterns: [
      /\bracing\b/i,
      /\bkart rac(?:ing|er)\b/i,
      /\bvehicular combat\b/i,
      /\bdemolition derby\b/i,
      /\bsim racing\b/i
    ]
  },

  // 3. Sports
  {
    canonical: 'Sports',
    subgenres: [
      'Basketball', 'Football / Soccer', 'Golf', 'American Football', 'Baseball',
      'Boxing', 'Tennis', 'Ice Hockey', 'Skateboarding', 'Snowboarding', 'Wrestling',
      'Fishing', 'Bowling', 'Volleyball', 'Athletics / Track & Field', 'Skiing'
    ],
    patterns: [
      /\bsports?\b/i,
      /\bbasketball\b/i,
      /\b(?:association )?football\b/i,
      /\bsoccer\b/i,
      /\bgolf\b/i,
      /\bbaseball\b/i,
      /\bboxing\b/i,
      /\btennis\b/i,
      /\bhockey\b/i,
      /\bskateboard(?:ing)?\b/i,
      /\bsnowboard(?:ing)?\b/i,
      /\bwrestling\b/i,
      /\bfishing\b/i,
      /\bbowling\b/i,
      /\bvolleyball\b/i,
      /\btrack and field\b/i,
      /\bathletics\b/i,
      /\bskiing\b/i
    ]
  },

  // 4. Shoot 'em up
  {
    canonical: "Shoot 'em up",
    subgenres: ['Space Shooter', 'Vertical Scrolling Shooter', 'Horizontal Scrolling Shooter', 'Rail Shooter', 'Bullet Hell', 'Tube Shooter'],
    patterns: [
      /shoot\s*[-'’]?\s*(?:th)?em\s*[-'’]?\s*up/i,
      /\bshmup\b/i,
      /\bfixed shooter\b/i,
      /\bscrolling shooter\b/i,
      /\bvertical(?:-|\s+)scrolling\b/i,
      /\bhorizontal(?:-|\s+)scrolling\b/i,
      /\brail shooter\b/i,
      /\bbullet hell\b/i,
      /\bdanmaku\b/i,
      /\btube shooter\b/i,
      /\bspace combat\b/i
    ]
  },

  // 5. Maze
  {
    canonical: 'Maze',
    subgenres: ['Dot Eater', 'Pac-Man Clone'],
    patterns: [
      /\bmaze(?:\s+game)?\b/i,
      /\bdot[- ]eater\b/i
    ]
  },

  // 6. Beat 'em up
  {
    canonical: "Beat 'em up",
    subgenres: ['Brawler', 'Belt Scroller'],
    patterns: [
      /beat\s*[-'’]?\s*(?:th)?em\s*[-'’]?\s*up/i,
      /\bbrawler\b/i,
      /\bbelt[- ]scroller\b/i,
      /\bteam brawler\b/i
    ]
  },

  // 7. Fighting
  {
    canonical: 'Fighting',
    subgenres: ['2D Fighter', '3D Fighter', 'Arena Fighter', 'Platform Fighter'],
    patterns: [
      /\bfighting(?:\s+game)?\b/i,
      /\b2d fighting\b/i,
      /\b3d fighting\b/i,
      /\barena fighter\b/i,
      /\bplatform fighter\b/i,
      /\bversus fighting\b/i
    ]
  },

  // 8. Hack and Slash
  {
    canonical: 'Hack and Slash',
    subgenres: ['Character Action', 'Stylish Action', 'Musou'],
    patterns: [
      /hack\s*(?:and|&|-)\s*slash/i,
      /\bcharacter action\b/i,
      /\bstylish action\b/i,
      /\bmusou\b/i
    ]
  },

  // 9. Run and Gun
  {
    canonical: 'Run and Gun',
    subgenres: [],
    patterns: [
      /run\s*(?:and|&|-)\s*gun/i
    ]
  },

  // 10. Top-Down Shooter
  {
    canonical: 'Top-Down Shooter',
    subgenres: ['Twin-Stick Shooter', 'Multidirectional Shooter', 'Isometric Shooter'],
    patterns: [
      /\btop-down shooter\b/i,
      /\btwin-stick shooter\b/i,
      /\bmultidirectional shooter\b/i,
      /\bisometric shooter\b/i
    ]
  },

  // 11. First-Person Shooter
  {
    canonical: 'First-Person Shooter',
    subgenres: ['Tactical Shooter', 'Boomer Shooter', 'Hero Shooter', 'Extraction Shooter', 'Looter Shooter', 'Battle Royale'],
    patterns: [
      /\bfirst-person shooter\b/i,
      /\bfps\b/i,
      /\btactical shooter\b/i,
      /\bboomer shooter\b/i,
      /\bhero shooter\b/i,
      /\bextraction shooter\b/i,
      /\blooter shooter\b/i,
      /\bbattle royale\b/i
    ]
  },

  // 12. Third-Person Shooter
  {
    canonical: 'Third-Person Shooter',
    subgenres: ['Cover Shooter'],
    patterns: [
      /\bthird-person shooter\b/i,
      /\btps\b/i,
      /\bcover shooter\b/i
    ]
  },

  // 13. Rhythm
  {
    canonical: 'Rhythm',
    subgenres: ['Music Game', 'Dancing Game'],
    patterns: [
      /\brhythm(?:\s+game)?\b/i,
      /\bmusic(?:\s+game|\s+video game)?\b/i,
      /\bdancing(?:\s+game)?\b/i
    ]
  },

  // 14. Puzzle
  {
    canonical: 'Puzzle',
    subgenres: ['Tile-Matching / Falling Block', 'Action Puzzle', 'Logic / Physics Puzzle', 'Hidden Object', 'Sokoban'],
    patterns: [
      /\bpuzzle(?:\s+game)?\b/i,
      /\btile-matching\b/i,
      /\bfalling block\b/i,
      /\baction puzzle\b/i,
      /\blogic puzzle\b/i,
      /\bphysics puzzle\b/i,
      /\bhidden object\b/i,
      /\bsokoban\b/i,
      /\bmatch-3\b/i
    ]
  },

  // 15. Turn-Based Strategy
  {
    canonical: 'Turn-Based Strategy',
    subgenres: ['4X', 'Tactical RPG', 'Turn-Based Tactics', 'Artillery Game', 'Auto-Battler'],
    patterns: [
      /\bturn-based strategy\b/i,
      /\btbs\b/i,
      /\b4x\b/i,
      /\bturn-based tactics\b/i,
      /\btactical (?:role-playing|rpg)\b/i,
      /\bstrategy (?:role-playing|rpg)\b/i,
      /\bartillery(?:\s+game)?\b/i,
      /\bauto[- ]battler\b/i
    ]
  },

  // 16. Real-Time Strategy
  {
    canonical: 'Real-Time Strategy',
    subgenres: ['Tower Defense', 'MOBA', 'Real-Time Tactics'],
    patterns: [
      /\breal-time strategy\b/i,
      /\brts\b/i,
      /\breal-time tactics\b/i,
      /\btower defense\b/i,
      /\bmoba\b/i,
      /\bmultiplayer online battle arena\b/i
    ]
  },

  // 17. Management Simulation
  {
    canonical: 'Management Simulation',
    subgenres: ['City Builder', 'Tycoon / Business Sim', 'God Game'],
    patterns: [
      /\bmanagement(?: simulation)?\b/i,
      /\bconstruction and management\b/i,
      /\bcity[- ]builder\b/i,
      /\bcity[- ]building\b/i,
      /\bbusiness simulation\b/i,
      /\btycoon\b/i,
      /\bgod game\b/i,
      /\bgovernment simulation\b/i
    ]
  },

  // 18. Life Simulation
  {
    canonical: 'Life Simulation',
    subgenres: ['Job Simulator', 'Pet Simulation', 'Social Simulation', 'Farming Simulation'],
    patterns: [
      /\blife simulation\b/i,
      /\bsocial simulation\b/i,
      /\bpet simulation\b/i,
      /\bvirtual pet\b/i,
      /\bfarming simulation\b/i,
      /\bfarm sim\b/i,
      /\bjob sim(?:ulator)?\b/i
    ]
  },

  // 19. Vehicle Simulation
  {
    canonical: 'Vehicle Simulation',
    subgenres: ['Flight Simulator', 'Space Flight Simulator', 'Train Simulator', 'Submarine Simulator'],
    patterns: [
      /\bvehicle simulation\b/i,
      /\bflight sim(?:ulator)?\b/i,
      /\bspace flight sim(?:ulator)?\b/i,
      /\btrain sim(?:ulator)?\b/i,
      /\bsubmarine sim(?:ulator)?\b/i,
      /\bcombat flight sim(?:ulator)?\b/i,
      /\bdriving sim(?:ulator)?\b/i
    ]
  },

  // 20. Computer RPG (CRPG)
  {
    canonical: 'Computer RPG',
    subgenres: ['Western RPG', 'Dungeon Crawler'],
    patterns: [
      /\bcrpg\b/i,
      /\bcomputer role-playing\b/i,
      /\bwestern role-playing\b/i,
      /\bdungeon crawl(?:er|ing)?\b/i
    ]
  },

  // 21. Japanese RPG (JRPG)
  {
    canonical: 'Japanese RPG',
    subgenres: ['Turn-Based JRPG'],
    patterns: [
      /\bjrpg\b/i,
      /\bjapanese role-playing\b/i
    ]
  },

  // 22. Action RPG
  {
    canonical: 'Action RPG',
    subgenres: ['Soulslike', 'Looter RPG', 'Monster Tamer'],
    patterns: [
      /\baction role-playing\b/i,
      /\baction rpg\b/i,
      /\barpg\b/i,
      /\bsoulslike\b/i,
      /\blooter rpg\b/i,
      /\bmonster tamer\b/i,
      /\bmonster tam(?:ing|er)\b/i,
      /\bcreature collector\b/i
    ]
  },

  // 23. Role-Playing (General/Other RPG)
  {
    canonical: 'Role-Playing (General)',
    subgenres: ['MMORPG'],
    patterns: [
      /\brole-playing(?: game| video game)?\b/i,
      /\brpg\b/i,
      /\bmmorpg\b/i
    ]
  },

  // 24. Adventure
  {
    canonical: 'Adventure',
    subgenres: ['Graphic Adventure', 'Point-and-Click', 'Text Adventure / Interactive Fiction', 'Escape Room'],
    patterns: [
      /\bpoint-and-click\b/i,
      /\bgraphic adventure\b/i,
      /\btext adventure\b/i,
      /\binteractive fiction\b/i,
      /\bescape (?:the )?room\b/i,
      /\badventure game\b/i
    ]
  },

  // 25. Visual Novel
  {
    canonical: 'Visual Novel',
    subgenres: ['Dating Sim', 'Eroge', 'Otome'],
    patterns: [
      /\bvisual novel\b/i,
      /\bdating sim(?:ulator)?\b/i,
      /\beroge\b/i,
      /\botome\b/i
    ]
  },

  // 26. Interactive Drama
  {
    canonical: 'Interactive Drama',
    subgenres: ['FMV', 'Cinematic Adventure'],
    patterns: [
      /\binteractive (?:drama|movie|film)\b/i,
      /\bfmv\b/i,
      /\bfull motion video\b/i,
      /\bcinematic adventure\b/i
    ]
  },

  // 27. Walking Simulator
  {
    canonical: 'Walking Simulator',
    subgenres: ['First-Person Narrative'],
    patterns: [
      /\bwalking simulator\b/i,
      /\bfirst-person narrative\b/i,
      /\bexploration game\b/i
    ]
  },

  // 28. Action-Adventure
  {
    canonical: 'Action-Adventure',
    subgenres: ['Stealth', 'Open World', 'GTA Clone'],
    patterns: [
      /\baction-adventure\b/i,
      /\bstealth(?:\s+game)?\b/i,
      /\bopen world\b/i
    ]
  },

  // 29. Horror
  {
    canonical: 'Horror',
    subgenres: ['Survival Horror', 'Psychological Horror', 'Mascot Horror'],
    patterns: [
      /\bhorror\b/i,
      /\bsurvival horror\b/i,
      /\bpsychological horror\b/i
    ]
  },

  // 30. Roguelike
  {
    canonical: 'Roguelike',
    subgenres: ['Classic Roguelike', 'Roguelite', 'Deckbuilder', 'Survivors-Like / Bullet Heaven'],
    patterns: [
      /\broguelike\b/i,
      /\broguelite\b/i,
      /\brogue-like\b/i,
      /\brogue-lite\b/i,
      /\bdeckbuilder\b/i,
      /\bdeck-building\b/i,
      /\bsurvivors-like\b/i,
      /\bbullet heaven\b/i
    ]
  },

  // 31. Incremental
  {
    canonical: 'Incremental',
    subgenres: ['Idle Game', 'Clicker Game'],
    patterns: [
      /\bincremental(?:\s+game)?\b/i,
      /\bidle(?:\s+game)?\b/i,
      /\bclicker(?:\s+game)?\b/i
    ]
  },

  // 32. Sandbox
  {
    canonical: 'Sandbox',
    subgenres: ['Physics Sandbox', 'Game Creation System'],
    patterns: [
      /\bsandbox(?:\s+game)?\b/i,
      /\bgame creation system\b/i,
      /\bphysics sandbox\b/i
    ]
  },

  // 33. Survival
  {
    canonical: 'Survival',
    subgenres: ['Survival Crafting'],
    patterns: [
      /\bsurvival(?:\s+game)?\b/i,
      /\bsurvival crafting\b/i
    ]
  },

  // 34. Pinball
  {
    canonical: 'Pinball',
    subgenres: [],
    patterns: [
      /\bpinball\b/i
    ]
  },

  // 35. Light Gun
  {
    canonical: 'Light Gun',
    subgenres: ['Shooting Gallery'],
    patterns: [
      /\blight gun\b/i,
      /\blight-gun\b/i,
      /\bshooting gallery\b/i
    ]
  },

  // 36. Action (Early Arcade / General)
  {
    canonical: 'Action',
    subgenres: ['Arcade Action', 'Block Breaker', 'Snake'],
    patterns: [
      /\baction(?:\s+game)?\b/i,
      /\barcade(?:\s+game)?\b/i,
      /\bblock[- ]breaker\b/i,
      /\bbreakout clone\b/i,
      /\bsnake(?:\s+game)?\b/i
    ]
  },

  // 37. Party / Friendslop
  {
    canonical: 'Party / Minigame',
    subgenres: ['Party Game', 'Minigame Collection', 'Social Deduction'],
    patterns: [
      /\bparty game\b/i,
      /\bminigame collection\b/i,
      /\bsocial deduction\b/i,
      /\bfriendslop\b/i
    ]
  }
];

function classifyGenre(rawGenreStr) {
  if (!rawGenreStr) return [];
  const matched = new Set();
  
  for (const rule of GENRE_RULES) {
    for (const pat of rule.patterns) {
      if (pat.test(rawGenreStr)) {
        matched.add(rule.canonical);
        break;
      }
    }
  }
  
  // Specific disambiguation:
  // If classified as 'Role-Playing (General)', and has 'JRPG' or 'Action RPG' or 'Computer RPG', remove General
  if (matched.has('Role-Playing (General)') && (matched.has('Japanese RPG') || matched.has('Action RPG') || matched.has('Computer RPG'))) {
    matched.delete('Role-Playing (General)');
  }
  
  // If classified as 'Action' and also has a more specific action genre (like Platformer, Beat 'em up, Fighting, FPS, etc.), keep the specific genre
  if (matched.has('Action') && matched.size > 1) {
    const specificActions = ["Platformer", "Beat 'em up", "Fighting", "Hack and Slash", "First-Person Shooter", "Third-Person Shooter", "Shoot 'em up", "Top-Down Shooter", "Run and Gun", "Action-Adventure", "Action RPG"];
    if (specificActions.some(sa => matched.has(sa))) {
      matched.delete('Action');
    }
  }

  // If classified as 'Adventure' and also 'Action-Adventure', keep Action-Adventure unless graphic adventure explicitly stated
  if (matched.has('Adventure') && matched.has('Action-Adventure') && !/graphic adventure|point-and-click|text adventure/i.test(rawGenreStr)) {
    matched.delete('Adventure');
  }

  return Array.from(matched);
}

module.exports = {
  GENRE_RULES,
  classifyGenre
};
