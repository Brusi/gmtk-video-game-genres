# 50 Years of Video Game History (1975–2025)

> An interactive data visualization explorer inspired by Mark Brown's **Game Maker's Toolkit (GMTK)** documentary video essay: [*"The History of Every Video Game Genre"*](https://www.youtube.com/watch?v=Dbgdi7BzMR0).
>
> ⚠️ **Disclaimer:** This is an independent, unofficial fan tribute project. It was **not created by** and is **not affiliated with, endorsed by, or sponsored by** Game Maker's Toolkit or Mark Brown.

🎮 **[Explore the Live Interactive Site](https://brusi.github.io/gmtk-video-game-genres/)** • 🎬 **[Watch the Original Video on YouTube](https://www.youtube.com/watch?v=Dbgdi7BzMR0)**

---

## 🕹️ Overview

In December 2024, game design critic Mark Brown published an extensive retrospective on his YouTube channel, **[Game Maker's Toolkit (GMTK)](https://www.youtube.com/@GMTK)**, titled [*"The History of Every Video Game Genre"*](https://www.youtube.com/watch?v=Dbgdi7BzMR0). The documentary tracks five decades of video game history, illustrating how 36 distinct genres emerged, peaked, evolved, and shifted between 1975 and 2025.

This independent fan project brings those historical curves to life as an open, interactive web application. You can explore individual genre trajectories, compare trends side-by-side, scrub through 50 years of gaming history year by year with dynamic distributions, and search through 9,608 cataloged games.

### At a Glance
- 🕹️ **9,608 Games Cataloged**: Top 200 most popular games for each year from 1975 to 2025.
- 🏷️ **36 Canonical Genres**: Normalized according to the video's genre taxonomy.
- 📅 **50-Year Timeline**: Explore trends, peaks, golden ages, and shifts in player taste.
- 🎬 **Original Video Integration**: Chapter timestamps, quotes, and direct links to the GMTK video essay.

---

## 🚀 Key Features

- **Interactive Genre Gallery**: Browse visual cards for all 36 genres with sparkline trend curves, total game releases, peak historical years, and jump-links to video timestamps. Sort by the original video chronological order, popularity, or peak year.
- **Detailed Genre Deep Dive**: Click into any genre to view full-scale interactive graphs, video commentary excerpts, and key highlights. Click any individual year point on the curve to inspect the top-rated games released for that genre in that year.
- **Genre Comparison Tool**: Overlay up to 8 genres side-by-side on a synchronized comparative timeline (1975–2025) to discover how shifts occurred (e.g., Platformers giving way to FPS, or the rise of Survival and Battle Royale).
- **Year-by-Year Explorer**: Scrub through any year from 1975 to 2025 with an interactive horizontal bar chart sorted from most games to least games, alongside the highest-ranked Backloggd games with box art and ratings.
- **Searchable Game Database**: Instant client-side search across all 9,608 games with instant filtering, genre tags, cover art, and direct links to Backloggd entries.

---

## 📊 Methodology & Data Sources

The data pipeline replicates the methodology demonstrated in Mark Brown's documentary:

1. **Game Selection (1975–2025)**:
   - Sourced the top 200 most popular games per year from [Backloggd](https://backloggd.com/).
   - Applied the native `category:main_game` filter to exclude expansion packs, remakes, remasters, compilations, and ports, matching the video's dataset.
2. **Genre Classification**:
   - Extracted Wikipedia infobox genre tags (`| genre = ...`) via the MediaWiki API for each title.
3. **Taxonomy & Normalization**:
   - Mapped and normalized raw Wikipedia tags into the 36 canonical genre classifications to construct the longitudinal timeline.

---

## 🛠️ Built With

- **Frontend**: Pure HTML5, CSS3, and modern Vanilla JavaScript (no frameworks or heavy runtimes).
- **Visualizations**: [Chart.js](https://www.chartjs.org/) for responsive line charts, sparklines, and horizontal bar charts.
- **Hosting**: Deployed directly via GitHub Pages as a fast, static client-side web application.

---

## 🙏 Credits & Disclaimers

- **[Mark Brown / Game Maker's Toolkit](https://www.youtube.com/@GMTK)** for the original concept, historical research, and documentary video: [*"The History of Every Video Game Genre"*](https://www.youtube.com/watch?v=Dbgdi7BzMR0).
- **Disclaimer**: This website and repository are an independent fan tribute project created for educational and analytical purposes. This project is **not affiliated with, maintained by, or endorsed by** Mark Brown or Game Maker's Toolkit.
- **[Backloggd](https://backloggd.com/)** for community game cataloging, popularity rankings, and game metadata.
- **[Wikipedia](https://www.wikipedia.org/)** and its contributors for open video game infobox genre information.
