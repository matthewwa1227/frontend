# StudyQuest UI Component Library

Pixel-art RPG themed UI components based on Google Stitch design system.

## Overview

This component library implements the complete Google Stitch UI design system for StudyQuest, featuring:
- **Pixel-art aesthetic** with 8-bit styling
- **RPG-themed components** (Hero, Quests, Guild, etc.)
- **Dark mode only** (consistent with design specs)
- **Responsive design** (mobile bottom nav, desktop side nav)
- **Accessibility support** (reduced motion, focus states)

## Components

### PixelButton

Retro pixel-art styled button with multiple variants.

```jsx
import { PixelButton } from './components/ui';

// Primary variant (pink)
<PixelButton variant="primary">
  START QUEST
</PixelButton>

// Secondary variant (cyan)
<PixelButton variant="secondary" size="lg">
  CAST FOCUS
</PixelButton>

// Tertiary variant (gold)
<PixelButton variant="tertiary" icon={<span className="material-symbols-outlined">sword</span>}>
  BATTLE
</PixelButton>

// Ghost variant
<PixelButton variant="ghost" fullWidth>
  VIEW DETAILS
</PixelButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `fullWidth`: boolean
- `icon`: ReactNode
- `iconPosition`: 'left' | 'right'
- `disabled`: boolean

### PixelCard

Container component with pixel borders and shadow effects.

```jsx
import { PixelCard, PixelCardHeader, PixelCardTitle } from './components/ui';

<PixelCard variant="primary" shadow>
  <PixelCardHeader icon={<span className="material-symbols-outlined">trophy</span>}>
    ACHIEVEMENTS
  </PixelCardHeader>
  <PixelCardTitle color="secondary">Level 42</PixelCardTitle>
  <p>Card content here</p>
</PixelCard>
```

**Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'tertiary' | 'glass' | 'elevated' | 'dark'
- `borderPosition`: 'all' | 'left' | 'right' | 'top' | 'bottom'
- `shadow`: boolean
- `header`: ReactNode
- `footer`: ReactNode

### ProgressBar

Segmented progress bars for XP, Shadow, and other stats.

```jsx
import { ProgressBar, MultiSegmentProgressBar } from './components/ui';

// XP Bar
<ProgressBar
  value={9000}
  max={11250}
  variant="xp"
  size="lg"
  segmented
  showLabel
  label="EXPERIENCE POINTS"
  glow
/>

// Shadow Bar
<ProgressBar
  value={15}
  max={100}
  variant="shadow"
  showLabel
  label="SHADOW OF DOOM"
/>

// Multi-segment bar
<MultiSegmentProgressBar
  segments={[
    { value: 72, color: 'secondary', label: 'Hero' },
    { value: 28, color: 'error', label: 'Shadow' },
  ]}
  showLegend
/>
```

**Props:**
- `value`: number
- `max`: number (default: 100)
- `variant`: 'xp' | 'shadow' | 'health' | 'mana' | 'default'
- `size`: 'sm' | 'md' | 'lg'
- `segmented`: boolean
- `showLabel`: boolean
- `glow`: boolean

### Avatar

Pixel-art avatar with RPG class icons and level badges.

```jsx
import { Avatar, AvatarGroup, RPGClassIcon } from './components/ui';

// Basic avatar
<Avatar rpgClass="mage" size="lg" variant="primary" />

// With image
<Avatar 
  src="/avatar.png" 
  alt="Hero" 
  size="xl" 
  variant="primary"
  level={42}
/>

// RPG class icon
<RPGClassIcon rpgClass="warrior" size="lg" variant="tertiary" />

// Avatar group
<AvatarGroup max={4}>
  <Avatar rpgClass="mage" />
  <Avatar rpgClass="warrior" />
  <Avatar rpgClass="archer" />
  <Avatar rpgClass="scholar" />
</AvatarGroup>
```

**Props:**
- `src`: string (image URL)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `variant`: 'default' | 'primary' | 'secondary' | 'tertiary' | 'gold'
- `rpgClass`: 'warrior' | 'mage' | 'archer' | 'scholar' | 'healer' | 'rogue' | 'paladin' | 'archmage' | 'boss' | 'default'
- `level`: number
- `border`: boolean
- `glow`: boolean

## Layout Components

### TopAppBar

Fixed header with navigation, notifications, and user avatar.

```jsx
import { TopAppBar } from './components/layout';

<TopAppBar
  title="HERO'S HUB"
  user={currentUser}
  onMenuClick={() => setSidebarOpen(true)}
/>
```

### SideNavBar

Fixed sidebar navigation with mobile overlay support.

```jsx
import { SideNavBar, BottomNavBar } from './components/layout';

<SideNavBar
  items={navItems}
  user={currentUser}
  isOpen={isSidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>

// Mobile bottom navigation
<BottomNavBar
  items={navItems}
  activeItem={activeItem}
  onItemClick={setActiveItem}
/>
```

## Theme Context

The app uses a ThemeContext for managing preferences:

```jsx
import { useTheme, ThemeProvider } from './context/ThemeContext';

// Wrap your app
<ThemeProvider>
  <App />
</ThemeProvider>

// Use in components
const { animationsEnabled, reducedMotion } = useTheme();
```

## Color Palette

The design uses the following color scheme:

| Token | Hex | Usage |
|-------|-----|-------|
| surface | #1a063b | Main background |
| surface-container | #271448 | Card backgrounds |
| primary | #ffb1c4 | Pink accent |
| primary-container | #ff4a8d | Pink buttons |
| secondary | #ddfcff | Cyan accent |
| secondary-container | #00f1fe | Cyan buttons |
| tertiary | #e9c400 | Gold accent |
| tertiary-container | #c9a900 | Gold buttons |
| error | #ffb4ab | Warning/Shadow |
| on-surface | #ebddff | Primary text |
| outline | #ac878f | Borders |

## Typography

- **Headlines**: Space Grotesk (font-headline)
- **Body**: Inter (font-body)
- **Labels**: Space Grotesk (font-label)
- **Pixel text**: Press Start 2P (font-pixel)

## Icons

Using Material Symbols Outlined:

```jsx
<span className="material-symbols-outlined">icon_name</span>
<span className="material-symbols-outlined fill">icon_name</span>
```

## Responsive Breakpoints

- Mobile: < 768px (bottom navigation)
- Desktop: >= 768px (side navigation)

## Example: Complete Page

```jsx
import { Dashboard } from './pages';

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
```

See `Dashboard.jsx` for a complete implementation example.
