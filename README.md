# 💌 Valentine Strands Game

A romantic, interactive word puzzle game inspired by the NYT Strands puzzle. Built with React and Vite, featuring animated intros, drag-to-select gameplay, and a personalized victory sequence.

## Tech Stack

- **React 19.2** - Component-based UI library
- **Vite 7.3** - Fast build tool and dev server
- **ESLint** - Code linting with React hooks and refresh plugins

## Development

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## Deployment

### GitHub Pages Configuration

The project is configured to automatically deploy to GitHub Pages using GitHub Actions.

**Vite Configuration** (`vite.config.js`):
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/strands/',  // Base path for GitHub Pages
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
})
```

The `base: '/strands/'` setting ensures assets are loaded correctly when deployed to a subdirectory on GitHub Pages.

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`):

The workflow automatically deploys on every push to the `main` branch:

1. Checks out the repository
2. Sets up Node.js with npm caching
3. Installs dependencies (`npm ci`)
4. Builds the project (`npm run build`)
5. Configures GitHub Pages
6. Uploads the `dist/` folder as an artifact
7. Deploys to GitHub Pages

The site is accessible at: `https://[username].github.io/strands/`

### Manual Deployment

You can also trigger deployment manually from the Actions tab in your GitHub repository.

## Open Graph / Social Preview

The game includes Open Graph meta tags for link previews:

```html
<meta property="og:title" content="💌" />
<meta property="og:image" content="/src/assets/preview.png" />
```

When sharing the link on social media or messaging apps, it will display:
- **Title**: 💌 (envelope emoji)
- **Image**: Preview screenshot from `/src/assets/preview.png`

To update the preview image, replace `src/assets/preview.png` with a new screenshot (recommended size: 1200x630px).

## How the Game Works

### Gameplay Overview

Valentine Strands is a word-finding puzzle game with a romantic twist. Players must find hidden words by connecting adjacent letters on a grid.

**The Grid**:
- 8 rows × 6 columns of letters
- Words can be formed by dragging to select adjacent letters (including diagonally)
- Each letter can only be used once per word

**Words to Find**:
- **Theme Words** (6 words): SAMEER, SIDDHI, TULIP, CUPID, PUNTACANA, LOVE
- **Spangram** (1 word): BEMYVALENTINE

**Victory Condition**: Find all 7 words to reveal the Valentine's message!

### Visual Feedback

- **Dragging**: Selected letters turn gray with connecting lines
- **Valid Word**: Turns blue (#87CEEB) for theme words, gold (#FFD700) for the spangram
- **Invalid Word**: Shakes and turns gray temporarily
- **Found Words**: Displayed in a word bank below the grid

### Controls

- **Desktop**: Click and drag with mouse
- **Mobile**: Touch and drag across letters

## App Flow

### 1. Intro Animation (3 seconds)

The experience begins with an animated envelope emoji:

1. **Spin and Grow**: The 💌 emoji spins 720° while scaling from 30% to 250% over 3 seconds
2. **Hovering State**: Envelope settles in center with slow pulsing animation
3. **Radial Rings**: Three expanding pink rings pulse outward to draw attention

### 2. Transition to Game (0.8 seconds)

- Clicking the envelope triggers a radial pulse effect
- Envelope flies upward and fades out
- Game UI fades in from below

### 3. Game Phase

**Header**:
- 💌 emoji pulses gently at the top
- Rotating motivational phrases appear below:
  - Word count: "X of 7 words found"
  - Encouraging messages like "You got this!", "Love is in the letters", "P.S. I love you"
  - Phrases rotate every 5-8 seconds with fade transitions

**Grid Interaction**:
- Players drag to select letters
- Real-time word preview appears below grid
- Valid words are locked in with color coding
- Found words populate the word bank

### 4. Victory Animation Sequence

When all 7 words are found, an elaborate victory sequence begins:

**Phase 1: Confetti (Continuous)**
- 150 confetti pieces in pastel colors (pink, light blue, gold, white, rose)
- Pieces fall continuously, regenerating every 8 seconds

**Phase 2: Emoji Movement (5 seconds)**
- After 2-second pause, the 💌 emoji moves from header to screen center
- Scales up 8x while moving
- Fades out at the end

**Phase 3: Envelope Swap (3 seconds)**
- ✉️ envelope fades in at center (scaled 8x)
- Holds for 3 seconds

**Phase 4: Letter Open (2 seconds)**
- White letter slides up from envelope
- Box shadow creates depth effect
- Word bank fades out

**Phase 5: Words Fly In (Staggered)**
- Found words animate into the letter with staggered delays:
  - SIDDHI (0s) - blue highlight
  - CUPID (0.8s) - blue highlight
  - TULIP (1.6s) - blue highlight
  - PUNTACANA (2.4s) - blue highlight
  - BEMYVALENTINE (3.2s) - gold highlight (spangram)
  - LOVE (4s) - blue highlight
  - SAMEER (4.8s) - blue highlight

**Phase 6: Interactive Buttons (6 seconds delay)**
Three buttons appear at the bottom:
- **YES** (pink) - Triggers additional confetti burst
- **NO** (rose) - Cycles through funny phrases: "IDK", "MAYBE?", "NOPE", etc.
  - After 3 clicks, YES button gets a radial pulse highlight
- **REPLAY** (dark red) - Reloads the page to start over

### Letter Content

The victory letter reads:

```
Dear SIDDHI,

CUPID said I'd be a fool
TULIP you go to PUNTACANA
without asking...

           Will you BEMYVALENTINE?

                                    LOVE,
                                    SAMEER
```

## Development Notes

- **Font**: Roboto from Google Fonts (weights 100-900)
- **Color Palette**:
  - Pastel pink: #FFDEE3
  - Pink: #FFBBC1
  - Theme word blue: #87CEEB
  - Spangram gold: #FFD700
  - Dark red: #C00000
  
- **Grid Cell Size**: 44px with 12px gap
- **Responsive**: Mobile-optimized with safe area insets

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## License

Private project - Created for Valentine's Day 2026
