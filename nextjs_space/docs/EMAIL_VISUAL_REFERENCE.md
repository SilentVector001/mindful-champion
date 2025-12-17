# Quick Visual Reference Guide

## Emoji Legend

### Performance Indicators
| Emoji | Meaning | Used In |
|-------|---------|---------|
| ✅ | Excellent (80-100%) | Metrics, Quality badges |
| ⚡ | Good (60-79%) | Metrics |
| 🎯 | Needs improvement (<60%) | Metrics, Focus areas |
| 🌟 | Outstanding performance | Overall score message |
| 💪 | Very good / Strength | Score message, Strengths list |
| 📈 | Good progress | Score message |

### Court Coverage
| Emoji | Meaning | Coverage % |
|-------|---------|------------|
| 🟢 | Excellent coverage | 70%+, Quality 75%+ |
| 🟡 | Decent coverage | 50-69% |
| 🔴 | Needs work | 30-49% |
| ⚪ | Low coverage | <30% |

### Shot Types
| Emoji | Shot Type |
|-------|-----------|
| 🎯 | Serve |
| ↩️ | Return |
| ⚡ | Volley |
| 🎵 | Dink |
| 💨 | Drive |
| ☁️ | Lob |
| 💧 | Drop shot |
| 💥 | Smash |
| 👉 | Forehand |
| 👈 | Backhand |
| ⬆️ | Overhead |
| 3️⃣ | Third shot |
| 🏓 | Generic shot |

### Technical Metrics
| Emoji | Metric |
|-------|--------|
| 🏓 | Paddle Angle |
| 🌊 | Follow Through |
| 🔄 | Body Rotation |
| 👟 | Footwork |
| 📍 | Positioning |

### Sections
| Emoji | Section |
|-------|---------|
| 📊 | Performance Dashboard |
| 🗺️ | Court Coverage Heat Map |
| 🎾 | Court Layout |
| ⭐ | Key Moments |
| 💡 | Recommendations |
| 📈 | Progress Tracking |
| 🏆 | Coach Kai Message |
| 🎥 | Video |
| 🎬 | Play/Watch |
| 💬 | Message/Tip |
| 🚫 | Kitchen/No-Volley Zone |

## Color Scheme

### Performance Colors
- **Excellent (80-100%)**: `#10B981` (Green)
- **Good (60-79%)**: `#F59E0B` (Yellow/Amber)
- **Needs Work (<60%)**: `#EF4444` (Red)
- **Neutral**: `#E5E7EB` (Gray)

### Brand Colors
- **Primary**: `#14B8A6` (Teal)
- **Secondary**: `#06B6D4` (Cyan)
- **Accent**: `#3B82F6` (Blue)

### Background Colors
- **Strengths**: `#D1FAE5` to `#A7F3D0` (Light green gradient)
- **Improvements**: `#FEF3C7` to `#FDE68A` (Light yellow gradient)
- **Tips**: `#DBEAFE` to `#BFDBFE` (Light blue gradient)
- **Coach Message**: `#ECFDF5` to `#D1FAE5` to `#A7F3D0` (Teal gradient)

## Key Moments Quality Badges

### Excellent Shot
- **Icon**: ✅
- **Emoji**: ⭐
- **Color**: `#10B981` (Green)
- **Background**: `#D1FAE5` (Light green)
- **Label**: "Excellent Shot"

### Good Execution
- **Icon**: 👍
- **Emoji**: 💪
- **Color**: `#3B82F6` (Blue)
- **Background**: `#DBEAFE` (Light blue)
- **Label**: "Good Execution"

### Needs Work
- **Icon**: ⚠️
- **Emoji**: 🎯
- **Color**: `#F59E0B` (Yellow)
- **Background**: `#FEF3C7` (Light yellow)
- **Label**: "Needs Work"

## Visual Elements

### 1. Overall Score Circle
- Size: 140px × 140px
- Stroke width: 12px
- Background: `#E5E7EB` (Gray)
- Progress: Gradient (`#14B8A6` to `#06B6D4`)
- Shows: Score number + "Overall" label

### 2. Metric Circles
- Size: 100px × 100px
- Stroke width: 8px
- Background: White card with shadow
- Shows: Metric emoji, score %, status emoji, label

### 3. Heat Map Grid
- Layout: 3×3 table
- Cell size: 70px height
- Border: 3px white between cells, 4px outer
- Shows: Zone emoji, position name, coverage %

### 4. Court Diagram (SVG)
- Size: 300px × 450px
- Features: Court outline, net, kitchen zones, service lines
- Colors: Blue background, gray lines, red kitchen zones
- Labels: With emojis (🚫 Kitchen)

### 5. Key Moment Cards
- Icon size: 32px emoji
- Border: 5px left border (color-coded)
- Background: Color-coded light background
- Shadow: Subtle box shadow
- Shows: Quality badge, timestamp, shot type, description

### 6. Strengths/Improvements Lists
- Icon: 💪 (strengths) or 🎯 (improvements)
- Icon size: 24px
- Border: 3px left border (color-coded)
- Background: White cards
- Shows: Emoji + text content

## Layout Structure

```
┌─────────────────────────────────┐
│  Hero Header (Gradient)         │
│  🎾 Title + Greeting            │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Video Thumbnail + Play ▶️       │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  📊 Performance Dashboard       │
│  ┌───────┐                      │
│  │Overall│                      │
│  │ Score │                      │
│  └───────┘                      │
│  ┌───┐ ┌───┐                    │
│  │🏓 │ │🌊 │                    │
│  └───┘ └───┘                    │
│  ┌───┐ ┌───┐                    │
│  │🔄 │ │👟 │                    │
│  └───┘ └───┘                    │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  🗺️ Heat Map                    │
│  ┌───┬───┬───┐                  │
│  │🟢│🟡│🔴│                  │
│  ├───┼───┼───┤                  │
│  │🟡│🟢│🟡│                  │
│  ├───┼───┼───┤                  │
│  │🟢│🟢│🟢│                  │
│  └───┴───┴───┘                  │
│  📐 Court Diagram (SVG)         │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  ⭐ Key Moments                  │
│  ┌─────────────────────────┐    │
│  │ ✅ Excellent Shot       │    │
│  │ Description...          │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  💪 Strengths                    │
│  • Item 1                        │
│  • Item 2                        │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  🎯 Focus Areas                  │
│  • Item 1                        │
│  • Item 2                        │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  💡 Recommendations              │
│  1. Recommendation 1             │
│  2. Recommendation 2             │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  📈 Progress                     │
│  Previous: 65  →  Current: 78   │
│  🎉 Improvement: +13 points!    │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  🏆 Coach Kai Message            │
│  "Personal message..."           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  CTA Buttons                     │
│  🎯 View Full Analysis →        │
│  💬 Ask Coach | 🏋️ Drills      │
└─────────────────────────────────┘
```

## Responsive Behavior

### Desktop (>600px)
- Full width layout (600px max)
- 2 metrics per row (2×2 grid)
- Side-by-side buttons
- Full court diagram

### Mobile (<600px)
- Stacked layout
- 1 metric per row (vertical stack)
- Full-width buttons (stacked)
- Scaled court diagram

## Email Client Support

| Feature | Gmail | Outlook | Apple Mail | Yahoo |
|---------|-------|---------|------------|-------|
| Emojis | ✅ | ✅ | ✅ | ✅ |
| SVG | ✅ | ⚠️ | ✅ | ✅ |
| Gradients | ✅ | ⚠️ | ✅ | ✅ |
| Box Shadow | ✅ | ❌ | ✅ | ✅ |
| Border Radius | ✅ | ⚠️ | ✅ | ✅ |

Legend: ✅ Full support | ⚠️ Partial support | ❌ No support

## Testing Checklist

### Visual Elements
- [ ] All emojis display correctly
- [ ] SVG graphics render
- [ ] Colors are accurate
- [ ] Text is readable
- [ ] Spacing is correct
- [ ] Borders show properly
- [ ] Shadows visible (where supported)

### Layout
- [ ] Sections properly spaced
- [ ] Cards aligned correctly
- [ ] Buttons centered
- [ ] Mobile responsive
- [ ] No horizontal scroll

### Interactive
- [ ] All links work
- [ ] Buttons clickable
- [ ] Video thumbnail clickable
- [ ] Play button overlay works

### Content
- [ ] Score displays correctly
- [ ] Metrics show proper values
- [ ] Heat map data accurate
- [ ] Key moments formatted
- [ ] Lists properly bulleted
- [ ] Dates formatted correctly

## Quick Tips

### Adding New Emojis
1. Use standard Unicode emojis
2. Test in multiple email clients
3. Provide fallback text if critical
4. Check size (typically 20-32px)

### Modifying Colors
1. Keep sufficient contrast (4.5:1 minimum)
2. Test in dark mode
3. Use hex codes for consistency
4. Consider colorblind accessibility

### Adding New Sections
1. Follow table-based layout
2. Use inline styles
3. Include padding for spacing
4. Add border/shadow for depth
5. Test in Gmail first

### Troubleshooting
1. Check inline styles present
2. Verify table structure
3. Test emoji rendering
4. Check image paths (if any)
5. Validate HTML structure
