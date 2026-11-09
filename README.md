# 50 Years of Video Game History (1975–2025)

An interactive, static data visualization website recreating and expanding upon the charts from Mark Brown's **Game Maker's Toolkit (GMTK)** video: [*"The History of Every Video Game Genre"*](https://www.youtube.com/watch?v=Dbgdi7BzMR0).

## 🚀 Features

- **Interactive Genre Gallery**: Individual interactive cards for all 36 major video game genres with historical sparkline curves, total release counts, peak years, and video timestamps.
- **Detailed Genre Modal**: Click any genre to see a full high-resolution graph with GMTK transcript commentary and quotes. Click on any year point along the curve to instantly inspect the top games released in that genre that year!
- **Compare Mode**: Plot up to 8 genres simultaneously on a single comparative timeline (1975–2025) to see how genres rose, peaked, or displaced one another over time.
- **Year-by-Year Scrubber (1975–2025)**: Scrub through five decades of gaming history to view genre distribution donut charts alongside top Backloggd games with cover art and rankings.
- **Game Database Search**: Fast live search across the entire dataset of 9,120 games with cover art and direct links to Backloggd.

## 📊 Methodology & Data Sources

The data pipeline directly replicates Mark Brown's methodology detailed in the video:
1. **Top Games (1975–2025)**: Scraped the top 200 most popular games per year from [Backloggd](https://backloggd.com/) using the native `category:main_game` filter (excluding remakes, remasters, ports, and compilations).
2. **Wikipedia Genre Scraping**: Extracted the infobox genre tags (`| genre = ...`) for all games using the MediaWiki API.
3. **Taxonomy & Normalization**: Mapped raw tags into GMTK's canonical 36 genres and subgenres, producing year-by-year counts and historical timelines.

## 🌐 Deploying to GitHub Pages

This site is 100% static (HTML5, CSS3, vanilla JavaScript, and Chart.js). It requires zero server runtimes or build steps and is ready to deploy immediately:

### Option A: From Repository Root
1. Push this repository to GitHub.
2. In your repository on GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder, then click **Save**.

### Option B: From the `/docs` Folder
1. Under **Settings** > **Pages** > **Branch**, select `main` and choose `/docs` as the folder.
2. Click **Save**.

## 💻 Running Locally

You can run the site locally using any static web server:

```bash
# Using Node.js
npx serve docs

# Or using Python (if installed)
python -m http.server 8000 --directory docs
```

Open `http://localhost:8000` (or `http://localhost:3000`) in your web browser.
