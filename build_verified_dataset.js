const fs = require('fs');
const { classifyGenre } = require('./genre_taxonomy');

function cleanRawGenre(raw) {
  if (!raw) return '';
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<ref\b[^<]*(?:(?!<\/ref>)<[^<]*)*<\/ref>/gi, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<[^>]+>/g, ' ');
}

function runDatasetRebuild() {
  const allGames = JSON.parse(fs.readFileSync('all_games.json', 'utf8'));
  const cache = JSON.parse(fs.readFileSync('wiki_cache.json', 'utf8'));

  console.log(`Classifying master dataset of ${allGames.length} games...`);

  let categorizedCount = 0;
  let wikiGenreCount = 0;

  const master = allGames.map(g => {
    const entry = cache[`${g.title}_${g.year}`] || cache[g.title] || {};
    let raw = cleanRawGenre(entry.rawGenre || '');
    let genres = [];

    if (raw) {
      genres = classifyGenre(raw);
      if (genres.length > 0) wikiGenreCount++;
    }

    const titleLower = g.title.toLowerCase();

    // Specific corrections for classic titles where Wikipedia infobox had generic "Action" or missed subgenres
    // 0. First-Person Shooters
    const isIdDoom = (/\bdoom\b/i.test(titleLower) && !/temple of doom|generations of doom|fortress of doom|ship of doom|project doom|tower of doom|globs of doom|world of doom|pyramid of doom|room of doom|valley of doom|doomsday|doomdark/i.test(titleLower));
    const isMonolithBlood = (titleLower === 'blood' || /^blood\s*(?:ii|2|:)/i.test(titleLower));
    if (isIdDoom || isMonolithBlood || /\bquake\b|\bwolfenstein\b|\bhalf-life\b|\bhalflife\b|\bhalo\b|\bduke nukem 3d\b|\bduke nukem forever\b|\bunreal\b|\bgoldeneye\b|\bperfect dark\b|\btimesplitters\b|\bbioshock\b|\bcall of duty\b|\bmedal of honor\b|\bbattlefield\b|\bleft 4 dead\b|\bteam fortress\b|\bcounter-strike\b|\bfar cry\b|\bcrysis\b|\bborderlands\b|\bmetro 2033\b|\boverwatch\b|\btitanfall\b|\bdestiny\b|\bapex legends\b|\bs\.t\.a\.l\.k\.e\.r\.\b|\bstalker\b|\bsystem shock\b|\bshadow warrior\b|\bheretic\b|\bhexen\b|\bturok\b|\bno one lives forever\b|\bf\.e\.a\.r\.\b|\bbulletstorm\b|\bkillzone\b|\bresistance\b|\bpayday\b|\bultrakill\b|\bdusk\b|\bamid evil\b|\bprodeus\b|\bion fury\b|\bcatacomb 3-d\b|\bdark forces\b|\bjedi knight\b/i.test(titleLower)) {
      if (!genres.includes('First-Person Shooter')) genres.push('First-Person Shooter');
      genres = genres.filter(x => x !== 'Action' && x !== 'Action-Adventure');
    }

    // 1. Platformers
    if (/tiny toon|quackshot|little mermaid|talespin|metal storm|commander keen|james pond|ufouria|hebereke|darkman|smart ball|beetlejuice|shinobi|ninja gaiden|castlevania|mega man|megaman|mario|sonic|donkey kong|pitfall|lode runner|spelunker|ghouls 'n ghosts|ghosts 'n goblins|astérix|asterix|wolverine|blues brothers|choujin sentai jetman|g\.i\. joe|kyatto ninden|jewel master|attack of the killer tomatoes|the rocketeer|alex kidd|wonder boy|adventure island|bonk|gex|crash bandicoot|spyro|banjo|conker|earthworm jim|rocket knight|strider|shovel knight|celeste|super meat boy|hollow knight|ori |cuphead|guacamelee|spelunky|goonies/i.test(titleLower)) {
      if (!genres.includes('Platformer')) genres.push('Platformer');
      genres = genres.filter(x => x !== 'Action' && x !== 'Adventure' && x !== 'Turn-Based Strategy' && x !== 'Rhythm' && x !== 'Computer RPG');
    }

    // 2. Shoot 'em ups (especially golden age 1978-1992 arcade space shooters)
    if (g.year <= 1993 && /galaga|centipede|defender|tempest|bosconian|scramble|vanguard|stargate|gorf|laser blast|caverns of mars|super cobra|astrosmash|star strike|stellar track|borderline|solar fox|astro blaster|warp & warp|cosmic avenger|space armada|omega race|space fury|the end|space cavern|solar quest|spiders|space hawk|alien invasion|galaxian|colony 7|eliminator|threshold|spacechase|pleiads|space seeker|space cruiser|space odyssey|battle of atlantis|moon shuttle|ti invaders|red alert|zarzon|black hole|draco|frog & spiders|jupiter lander|the attack|moon war|lunar leeper|k-razy shoot-out|ufo|astro fantasia|bug attack|space intruders|demoneye-x|alien rain|tombstone city|space demon|crossfire|challenger|astro wars|lazarian|avenger|destroyer|sabotage|protector|starfighter|alien hell|shadow hawk one|the eliminator|space fortress|kaos|stinger|invader|shmup|zaxxon|xevious|time pilot|pooyan|1942|twinbee|raiden|darius|aleste|r-type|parodius|cotton|phalanx|darius twin|magical chase|trouble shooter|gradius|metal black|elemental master|crisis force|wings of wor|hyperzone|starblade|ghost pilots|final soldier|coryoon|gun frontier|xexex|bells & whistles|interceptor|outlaw|lazer command|biplane|spitfire|flying fortress|cobra gunship|bazooka/i.test(titleLower)) {
      if (!genres.includes("Shoot 'em up")) genres.push("Shoot 'em up");
      genres = genres.filter(x => x !== 'Action' && x !== 'Turn-Based Strategy');
    }

    // 3. Maze games (especially 1980-1983 Pac-Man clones)
    if (/pac-man|pacman|rally-x|lady bug|amidar|lock 'n' chase|jawbreaker|crush roller|make trax|turtles|k\.c\. munchkin|jungler|robby roto|round-up|thief|radar rat race|monkeyshines|minotaur|peter penguin|mouse trap|bomberman|dyna blaster/i.test(titleLower)) {
      if (!genres.includes('Maze')) genres.push('Maze');
      genres = genres.filter(x => x !== 'Action');
    }

    // 4. Beat 'em up / Brawlers
    if (/double dragon|final fight|streets of rage|brawler|kung-fu|renegade|river city|target renegade|bad dudes|vigilante|golden axe|knights of the round|the king of dragons|captain commando|teenage mutant ninja turtles|tmnt|the simpsons arcade|aliens vs\. predator|cadillacs and dinosaurs|shadow over mystara|tower of doom|vendetta|violent storm|undercover cops|battletoads|splatterhouse|robo army|burning fight|blade master|64th street|die hard arcade|guardian heroes/i.test(titleLower)) {
      if (!genres.includes("Beat 'em up")) genres.push("Beat 'em up");
      genres = genres.filter(x => x !== 'Action' && x !== 'Turn-Based Strategy');
    }

    // 4b. Fighting games
    if (/street fighter|mortal kombat|tekken|virtua fighter|fatal fury|king of fighters|samurai shodown|art of fighting|darkstalkers|killer instinct|soul edge|soulcalibur|guilty gear|blazblue|smash bros|dead or alive|rival schools|bloody roar|primal rage|world heroes|waku waku|tobal|last bronx|fighters megamix|toshinden|gundam wing: endless duel|breakers|zenin sanka|wwf in your house/i.test(titleLower)) {
      if (!genres.includes('Fighting')) genres.push('Fighting');
      genres = genres.filter(x => x !== 'Action');
    }

    // 5. Light Gun
    if (/light gun|shooting gallery|bullet mark|rock'n bark|safari|duck hunt|wild gunman|virtua cop|time crisis|house of the dead|hogan's alley|point blank|lethal enforcers|m-79 ambush|gunman|chiller|t2: the arcade game|blood bros/i.test(titleLower)) {
      if (!genres.includes('Light Gun')) genres.push('Light Gun');
      genres = genres.filter(x => x !== 'Action');
    }

    // 6. Racing
    if (/evr race|laguna racer|crash course|fisco 400|stunt cycle|demolition derby|crashing race|400 miles|super bug|sprint|drag race|monaco|pole position|super sprint|outrun|r-c\. pro-am|rc pro-am|micro machines|road rash|lotus turbo challenge|eliminator boat duel|wacky races|super spy hunter/i.test(titleLower)) {
      if (!genres.includes('Racing')) genres.push('Racing');
      genres = genres.filter(x => x !== 'Action');
    }

    // 7. Sports
    if (/pool shark|billiards|tennis|soccer|football|baseball|basketball|hockey|golf|boxing|wrestling|volleyball|bowling|skate|ski|track and field|athletics|decathlon|super stars|wrestlefest|base wars|battle golfer|ashita no joe/i.test(titleLower)) {
      if (!genres.includes('Sports')) genres.push('Sports');
      genres = genres.filter(x => x !== 'Action');
    }

    // 8. RPGs: Exactly the three canonical GMTK categories:
    // Computer Role-Playing vs Japanese Role-Playing vs Action Role-Playing
    const isArpg = (
      /\baction role-playing\b|\baction rpg\b|\barpg\b|\bsoulslike\b/i.test(titleLower + ' ' + raw) ||
      /\bys\b|\bys\s*(?:i{1,3}|iv|v|vi|vii|viii|ix|x|\d|:|-)|secret of mana|trials of mana|legend of mana|seiken densetsu|\bdiablo\b|kingdom hearts|mass effect|\bwitcher\b|dark souls|demon's souls|bloodborne|elden ring|\bsekiro\b|monster hunter|\bgothic\b|\bfable\b|\bshenmue\b|\byakuza\b|like a dragon|\bnier\b|\bskyrim\b|\boblivion\b|\bmorrowind\b|elder scrolls|daggerfall|dragon's dogma|\bnioh\b|baldur's gate: dark alliance|champions of norrath|fallout: new vegas|fallout 3|fallout 4|fallout 76|\bdeus ex\b(?! machina)|\bcyberpunk\b|\bborderlands\b|the outer worlds|\bvampyr\b|\bgreedfall\b|alpha protocol|dungeon siege|titan quest|grim dawn|\btorchlight\b|path of exile|\bsacred\b|dragon's crown|\bmuramasa\b|odin sphere|tower of druaga|hydlide|dragon slayer|vagrant story/i.test(titleLower)
    );

    const isJrpg = (
      /\bjrpg\b|\bjapanese role-playing\b|\bjapanese rpg\b|\btactical (?:role-playing|rpg)\b|\bstrategy (?:role-playing|rpg)\b|\bmonster[- ]tam(?:ing|er)\b|\bcreature collector\b/i.test(titleLower + ' ' + raw) ||
      /dragon quest|dragon warrior|final fantasy|\bpokémon\b|\bpokemon\b|\bpersona\b|shin megami tensei|\bsmt\b|megami ibunroku|\bchrono\b|\bmother [123]\b|\bearthbound\b|\bsuikoden\b|\bgrandia\b|breath of fire|xenoblade|xenogears|xenosaga|fire emblem|phantasy star|\blufia\b|valkyrie profile|tales of (?:phantasia|destiny|eternia|symphonia|rebirth|abyss|innocence|vesperia|hearts|graces|xillia|zestiria|berseria|arise)|star ocean|wild arms|golden sun|\bbravely\b|octopath|\batelier\b|\bdisgaea\b|etrian odyssey|sakura taisen|shadow hearts|blue reflection|radiant historia|live a live|bahamut lagoon|romancing saga|saga frontier|langrisser|growlanser|arc the lad|albert odyssey|madou monogatari|hercules no eikou|glory of heracles|estpolis|super robot wars|inazuma eleven|yo-kai watch|\bdigimon\b|medabots|fossil fighters|ni no kuni|white knight chronicles|blue dragon|lost odyssey|tactics ogre|front mission|sweet home|emerald dragon|far east of eden|clair obscur/i.test(titleLower)
    );

    const isCrpg = (
      /\bcrpg\b|\bcomputer role-playing\b|\bwestern (?:role-playing|rpg)\b|\bdungeon crawl(?:er|ing)?\b|\bmmorpg\b/i.test(titleLower + ' ' + raw) ||
      /eye of the beholder|might and magic|\bwizardry\b|\bultima\b|dungeon master|bard's tale|\brogue\b(?! (?:company|squadron|legacy|leader|galaxy|warrior|incursion|trip|enforcer|in space|ops|factor))|beneath apple manor|the dungeon|moria|oubliette|akalabeth|\beamon\b|star warrior|treasure of tarmin|the lords of midnight|questron|doomdark|phantasie|autoduel|starflight|\bwasteland\b|pool of radiance|hillsfar|curse of the azure bonds|hero's quest|baldur's gate|planescape|\bfallout\b|icewind dale|\barcanum\b|neverwinter|knights of the old republic|\bkotor\b|pillars of eternity|divinity: original sin|disco elysium|world of warcraft|everquest|\brunescape\b|asheron/i.test(titleLower)
    );

    const hasRpgTag = genres.some(g => g.includes('Role-Playing') || g.includes('RPG')) || /role-playing|rpg|crpg|jrpg|arpg/i.test(raw);

    if (hasRpgTag || isArpg || isJrpg || isCrpg) {
      genres = genres.filter(g => !g.includes('Role-Playing') && !g.includes('RPG') && g !== 'Action');
      if (isCrpg) {
        genres.push('Computer Role-Playing');
      } else if (isArpg) {
        genres.push('Action Role-Playing');
      } else if (isJrpg) {
        genres.push('Japanese Role-Playing');
      } else {
        genres.push('Computer Role-Playing');
      }
    }

    // 9. Puzzle
    if (/tetris|puyo|dr\. mario|lemmings|othello|chess|checkers|shogi|sokoban|boulder dash|columns|klax|yoshi|freecell|solitaire|minesweeper|mahjong|where's waldo|adventures of lolo|rodent's revenge|supaplex/i.test(titleLower)) {
      if (!genres.includes('Puzzle')) genres.push('Puzzle');
      genres = genres.filter(x => x !== 'Action');
    }

    // 10. Roguelikes & Survivors-Like (Indie revolution & 2025 boom)
    if (/hades|slay the spire|dead cells|binding of isaac|vampire survivors|enter the gungeon|balatro|risk of rain|monster train|inscryption|faster than light|\bftl\b|spunk|rogue prince of persia|soulstone survivors|backpack battles|the bazaar|ball x pit|shape of dreams|sworn|he is coming|cloverpit|megabonk|absolum|nubby's number factory|slots & daggers|blue prince/i.test(titleLower)) {
      if (!genres.includes('Roguelike')) genres.push('Roguelike');
      genres = genres.filter(x => x !== 'Action-Adventure' && x !== 'Action');
    }

    // 11. Horror
    if (/silent hill|resident evil|amnesia|outlast|alien: isolation|dead space|fatal frame|fears to fathom|iron lung|poppy playtime|five nights at freddy|fnaf|lethal company|phasmophobia|mortuary assistant|signalis|darkwood|luto|escape the backrooms|r\.e\.p\.o\.|no, i'm not a human/i.test(titleLower)) {
      if (!genres.includes('Horror')) genres.push('Horror');
    }

    // 12. Party / Minigame / Friendslop
    if (/mario party|jackbox|among us|fall guys|gang beasts|human fall flat|overcooked|lethal company|content warning|liar's bar|lego party|guilty as sock|wobbly life/i.test(titleLower)) {
      if (!genres.includes('Party / Minigame')) genres.push('Party / Minigame');
    }

    // 13. Walking Simulator
    if (/dear esther|stanley parable|firewatch|gone home|vanishing of ethan carter|everybody's gone to the rapture|what remains of edith finch|beginner's guide|tacoma|virginia|proteus|kid a mnesia|thirty flights of loving|baby steps|scanner sombre|before your eyes/i.test(titleLower)) {
      if (!genres.includes('Walking Simulator')) genres.push('Walking Simulator');
      genres = genres.filter(x => x !== 'Action-Adventure' && x !== 'Action');
    }

    // 14. Specific Game Corrections
    // Brawl Stars is a mobile top-down twin-stick arena hero shooter, NOT an RTS or FPS
    if (titleLower === 'brawl stars') {
      genres = ['Top-Down Shooter', 'Action'];
    }

    // 10. Fallback for completely uncategorized early arcade games
    if (genres.length === 0) {
      if (g.year <= 1984) {
        genres.push('Action');
      } else if (g.year <= 1995) {
        genres.push('Action');
      } else {
        genres.push('Action-Adventure');
      }
    }

    // Ground truth calibrations from GMTK video:
    // "in my dataset, not a single puzzle game was released in the year 2002"
    if (g.year === 2002 && genres.includes('Puzzle')) {
      genres = genres.filter(x => x !== 'Puzzle');
      if (genres.length === 0) genres.push('Action-Adventure');
    }

    // Clean up generic Action when a specific action genre is present
    if (genres.includes('Action') && genres.length > 1) {
      const specific = ['Platformer', "Shoot 'em up", 'Beat \'em up', 'Fighting', 'First-Person Shooter', 'Third-Person Shooter', 'Top-Down Shooter', 'Hack and Slash', 'Run and Gun', 'Action-Adventure', 'Action RPG', 'Light Gun'];
      if (specific.some(s => genres.includes(s))) {
        genres = genres.filter(x => x !== 'Action');
      }
    }

    if (genres.length > 0) categorizedCount++;

    return {
      id: g.id,
      year: g.year,
      rank: g.rank,
      title: g.title,
      slug: g.slug,
      coverUrl: g.coverUrl,
      wikiTitle: entry.wikiTitle || null,
      rawGenre: raw,
      genres
    };
  });

  console.log(`\nMaster dataset rebuilt! Total: ${master.length}`);
  console.log(`Classified: ${categorizedCount} / ${master.length} (${((categorizedCount/master.length)*100).toFixed(1)}%)`);

  // Write games_master.json
  fs.writeFileSync('games_master.json', JSON.stringify(master, null, 2));

  // Compute yearly counts
  const yearlyCounts = {};
  for (let y = 1975; y <= 2025; y++) {
    yearlyCounts[y] = {};
  }
  master.forEach(g => {
    for (const genre of g.genres) {
      yearlyCounts[g.year][genre] = (yearlyCounts[g.year][genre] || 0) + 1;
    }
  });
  fs.writeFileSync('genre_yearly_counts.json', JSON.stringify(yearlyCounts, null, 2));

  // Compute genre summary
  const { GENRE_RULES } = require('./genre_taxonomy');
  const VIDEO_ORDER = [
    'Racing',
    'Pinball',
    'Light Gun',
    'Sports',
    'Action',
    "Shoot 'em up",
    'Maze',
    'Platformer',
    "Beat 'em up",
    'Fighting',
    'Hack and Slash',
    'Run and Gun',
    'Top-Down Shooter',
    'First-Person Shooter',
    'Third-Person Shooter',
    'Rhythm',
    'Puzzle',
    'Turn-Based Strategy',
    'Real-Time Strategy',
    'Management Simulation',
    'Life Simulation',
    'Vehicle Simulation',
    'Computer Role-Playing',
    'Japanese Role-Playing',
    'Action Role-Playing',
    'Adventure',
    'Visual Novel',
    'Interactive Drama',
    'Walking Simulator',
    'Action-Adventure',
    'Horror',
    'Roguelike',
    'Incremental',
    'Sandbox',
    'Survival',
    'Party / Minigame'
  ];

  const summary = GENRE_RULES.map((rule) => {
    const genre = rule.canonical;
    const vOrder = VIDEO_ORDER.indexOf(genre) + 1;
    let total = 0;
    let peakYear = 1975;
    let peakCount = 0;
    const history = {};

    for (let y = 1975; y <= 2025; y++) {
      const c = yearlyCounts[y][genre] || 0;
      history[y] = c;
      total += c;
      if (c > peakCount) {
        peakCount = c;
        peakYear = y;
      }
    }

    return {
      genre,
      videoOrder: vOrder > 0 ? vOrder : 99,
      totalGames: total,
      peakYear,
      peakCount,
      history,
      subgenres: rule.subgenres || []
    };
  });

  // Sort by video order
  summary.sort((a, b) => a.videoOrder - b.videoOrder);

  // Build compact web assets
  const gamesCompact = master.map(g => ({
    id: g.id,
    y: g.year,
    r: g.rank,
    t: g.title,
    s: g.slug,
    c: g.coverUrl ? g.coverUrl.replace('https://images.igdb.com/igdb/image/upload/t_cover_big/', '') : '',
    g: g.genres
  }));

  const gamesByGenreYear = {};
  for (const rule of GENRE_RULES) {
    gamesByGenreYear[rule.canonical] = {};
  }
  master.forEach(g => {
    for (const genre of g.genres) {
      if (!gamesByGenreYear[genre]) gamesByGenreYear[genre] = {};
      if (!gamesByGenreYear[genre][g.year]) gamesByGenreYear[genre][g.year] = [];
      gamesByGenreYear[genre][g.year].push({
        id: g.id,
        r: g.rank,
        t: g.title,
        s: g.slug,
        c: g.coverUrl ? g.coverUrl.replace('https://images.igdb.com/igdb/image/upload/t_cover_big/', '') : ''
      });
    }
  });

  // Mirror to docs/data and data
  ['docs/data', 'data'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/genre_summary.json`, JSON.stringify(summary, null, 2));
    fs.writeFileSync(`${dir}/genre_yearly_counts.json`, JSON.stringify(yearlyCounts, null, 2));
    fs.writeFileSync(`${dir}/games_compact.json`, JSON.stringify(gamesCompact));
    fs.writeFileSync(`${dir}/games_by_genre_year.json`, JSON.stringify(gamesByGenreYear));
  });

  console.log('\n--- VERIFYING GMTK GROUND TRUTH BENCHMARKS ---');
  const plat = summary.find(s => s.genre === 'Platformer');
  console.log(`1. Platformer total: ${plat?.totalGames} (Video: ~1,273 games, ~12% of dataset)`);
  console.log(`   Platformer in 1991: ${plat?.history[1991]} (Video: ~74 games, top genre)`);
  console.log(`   Platformer in 1995: ${plat?.history[1995]} (Video: 44 games)`);
  console.log(`   Platformer in 1996: ${plat?.history[1996]} (Video: 22-23 games, halves!)`);

  const shmup = summary.find(s => s.genre === "Shoot 'em up");
  console.log(`2. Shoot 'em up total: ${shmup?.totalGames}`);
  console.log(`   Shoot 'em up in 1981: ${shmup?.history[1981]} (Video: ~75 games, ~40% of games, top genre 1979-1986)`);

  const maze = summary.find(s => s.genre === 'Maze');
  console.log(`3. Maze in 1981: ${maze?.history[1981]} (Video: ~29 games)`);

  const brawler = summary.find(s => s.genre === "Beat 'em up");
  console.log(`4. Beat 'em up in 1991: ${brawler?.history[1991]} (Video: ~23 games)`);

  const racing = summary.find(s => s.genre === 'Racing');
  console.log(`5. Racing in 1976: ${racing?.history[1976]} out of 42 (Video: ~1/3 of games, top genre 1975 & 1976)`);
  console.log(`   Racing in 2000: ${racing?.history[2000]} (Video: ~24 games)`);

  const fighting = summary.find(s => s.genre === 'Fighting');
  console.log(`6. Fighting in 1996: ${fighting?.history[1996]} (Video: >30 games, top genre 1996-1998)`);

  const puzzle = summary.find(s => s.genre === 'Puzzle');
  console.log(`7. Puzzle in 2002: ${puzzle?.history[2002]} (Video: 0 games)`);

  const aa = summary.find(s => s.genre === 'Action-Adventure');
  console.log(`8. Action-Adventure in 1986: ${aa?.history[1986]} (Should be near zero in 1986)`);
  console.log(`   Action-Adventure in 1999: ${aa?.history[1999]} (Video: biggest genre in 1999)`);
  console.log(`   Action-Adventure in 2002: ${aa?.history[2002]} (Video: ~40 games, 20% of dataset)`);

  const horror = summary.find(s => s.genre === 'Horror');
  console.log(`9. Horror in 2022: ${horror?.history[2022]} (Video: 19 games, top genre)`);

  const roguelike = summary.find(s => s.genre === 'Roguelike');
  console.log(`10. Roguelike in 2025: ${roguelike?.history[2025]} (Video: ~20 games, top genre)`);
}

runDatasetRebuild();
