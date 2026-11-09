# 50 Years of Video Game History (1975–2025)

> An interactive data visualization explorer recreating and expanding upon the historical charts from Mark Brown's **Game Maker's Toolkit (GMTK)** video essay: [*"The History of Every Video Game Genre"*](https://www.youtube.com/watch?v=Dbgdi7BzMR0).

🎮 **[Explore the Live Site](https://brusi.github.io/gmtk-video-game-genres/)**

---

## 🕹️ Overview

In December 2024, Mark Brown (Game Maker's Toolkit) published a deep dive into five decades of video game history, tracking how genres emerged, peaked, evolved, and faded between 1975 and 2025. 

This project brings those charts to life as an open, fully interactive web application. You can explore individual genre trajectories, compare trends across genres, scrub through 50 years of gaming history year by year, and search through the top 200 games of each year.

### At a Glance
- 🕹️ **9,120 Games Cataloged**: Top 200 most popular games for each year from 1975 to 2025.
- 🏷️ **36 Major Genres & Subgenres**: Normalized according to GMTK's taxonomy.
- 📅 **50-Year Timeline**: Explore trends, peaks, golden ages, and shifts in player taste.
- 🎬 **GMTK Video Integration**: Embedded commentary, timestamps, and quotes from the video essay.

---

## 🚀 Key Features

- **Interactive Genre Gallery**: Browse visual cards for all 36 genres with sparkline trend curves, total game releases, peak historical years, and jump-links to video timestamps.
- **Detailed Genre Deep Dive**: Click into any genre to view full-scale interactive graphs, GMTK script excerpts, and key highlights. Click any individual year point on the curve to inspect the top-rated games released for that genre in that year.
- **Genre Comparison Tool**: Overlay up to 8 genres side-by-side on a synchronized comparative timeline (1975–2025) to discover how shifts occurred (e.g., Platformers giving way to FPS, or the rise of Survival and Battle Royale).
- **Year-by-Year Explorer**: Scrub through any year from 1975 to 2025 to see genre market share represented on donut charts alongside the highest-ranked Backloggd games with box art and ratings.
- **Searchable Game Database**: Instant client-side search across all 9,120 games with instant filtering, genre tags, cover art, and direct links to Backloggd entries.

---

## 📊 Methodology & Data Sources

The data pipeline directly replicates the methodology described by Mark Brown in the GMTK documentary:

1. **Game Selection (1975–2025)**:
   - Scraped the top 200 most popular games per year from [Backloggd](https://backloggd.com/).
   - Applied the native `category:main_game` filter to exclude expansion packs, remakes, remasters, compilations, and ports, matching the video's dataset.
2. **Genre Classification**:
   - Extracted Wikipedia infobox genre tags (`| genre = ...`) via the MediaWiki API for each title.
3. **Taxonomy & Normalization**:
   - Mapped and normalized raw Wikipedia tags into GMTK's 36 canonical genre classifications to construct the longitudinal timeline.

---

## 🛠️ Built With

- **Frontend**: Pure HTML5, CSS3, and modern Vanilla JavaScript (no frameworks or heavy runtimes).
- **Visualizations**: [Chart.js](https://www.chartjs.org/) for responsive line charts, sparklines, and genre distribution donut charts.
- **Hosting**: Deployed directly via GitHub Pages as a fast, static client-side web application.

---

## 🙏 Credits & Acknowledgments

- **[Mark Brown / Game Maker's Toolkit](https://www.youtube.com/@GMTK)** for the original concept, historical research, and documentary video: [*"The History of Every Video Game Genre"*](https://www.youtube.com/watch?v=Dbgdi7BzMR0).
- **[Backloggd](https://backloggd.com/)** for community game cataloging, popularity rankings, and game metadata.
- **[Wikipedia](https://www.wikipedia.org/)** and its contributors for open video game infobox genre information.
