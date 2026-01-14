# UI Changes Summary

## Overview
Complete redesign of mobile and desktop layouts to address usability issues with card visibility, scrolling, transparency, and swipe feedback.

## Mobile Changes (< md breakpoint)

### 1. Fixed Positioning & Viewport Fill
- **What**: Card uses `fixed inset-0` positioning with centered flexbox
- **Why**: Prevents accidental scrolling and ensures card always fills viewport
- **Code**: `className="md:hidden fixed inset-0 flex items-center justify-center p-4"`
- **Edge Case**: Card resets to front when new movie loads via `AnimatePresence mode="wait"`

### 2. Solid Black Background
- **What**: Changed from `bg-gray-800` to `bg-black` throughout card
- **Why**: Eliminates transparency - buttons/text behind card no longer visible
- **Code**: All card containers now use `bg-black` instead of gradient/gray
- **Edge Case**: Works in both light and dark mode (app is dark-only currently)

### 3. Increased Padding
- **What**: Changed from `p-4/p-5` to `p-6` on all text areas
- **Why**: Prevents text from touching screen edges on all device sizes
- **Code**: `className="p-6 bg-black"` and `className="p-6 overflow-y-auto flex-1"`
- **Edge Case**: Maintains padding even on smallest mobile screens (320px)

### 4. Drag Visual Feedback
- **What**: Colored overlay appears when dragging in any direction
- **Why**: Clear visual feedback showing which action will trigger
- **Implementation**:
  - Left (red, ✕): Skip
  - Right (green, ❤️): Want to Watch
  - Up (blue, 👍): Seen & Yes
  - Down (gray, 👎): Seen & No
- **Code**: Uses `useTransform` to map drag distance to overlay opacity
- **Edge Case**: Overlays only appear on front of card (not when flipped)

### 5. Scrolling Behavior
- **Front of Card**: No scrolling - card is fixed, content fits viewport (65vh image + info)
- **Back of Card**: Internal scrolling only via `overflow-y-auto` on content div
- **Code**: `onClick={(e) => e.stopPropagation()}` on scrollable area prevents accidental flip
- **Edge Case**: Tap on "Tap to flip back" footer always flips card

### 6. Swipe Sensitivity
- **What**: Increased threshold from 50px to 100px, velocity from 500 to 800
- **Why**: Prevents accidental swipes during normal browsing
- **Code**: `const threshold = 100; const velocity = 800;`
- **Edge Case**: Still responsive enough for intentional swipes

## Desktop Changes (md+ breakpoint)

### 1. Viewport-Based Height Scaling
- **What**: Poster image height set to `h-[calc(100vh-100px)]`
- **Why**: Image height matches browser viewport height, width scales automatically
- **Result**: Tall, thin poster on left side (like a real movie poster)
- **Code**: `className="h-[calc(100vh-100px)] w-auto object-cover"`
- **Edge Case**: Max-width 40vw prevents ultra-wide posters on large screens

### 2. Side-by-Side Layout
- **What**: Flexbox with poster (left) and details panel (right, 500px fixed width)
- **Why**: All information visible at once, no modal needed
- **Code**: `<div className="bg-black rounded-2xl shadow-2xl overflow-hidden flex">`
- **Edge Case**: Details panel scrolls if content exceeds viewport height

### 3. Fixed Positioning
- **What**: Desktop card uses `fixed inset-0` with centered flex
- **Why**: Prevents layout shifts, keeps card centered at all times
- **Code**: `className="hidden md:flex md:items-center md:justify-center md:h-screen md:fixed md:inset-0"`
- **Edge Case**: Pointer events disabled on container, enabled on card only

### 4. No Drag on Desktop
- **What**: Cursor set to default (not grab) on desktop
- **Why**: Desktop users use buttons, dragging not intuitive with mouse
- **Code**: `className="...md:cursor-default md:active:cursor-default"`
- **Edge Case**: Drag still technically works, but buttons are primary interaction

## Layout Changes (Both Platforms)

### 1. Fixed Header
- **What**: Header with title and "Undo" button fixed to top
- **Code**: `className="fixed top-0 left-0 right-0 z-10 bg-secondary"`
- **Why**: Always accessible, doesn't scroll away
- **Edge Case**: Z-index 10 ensures it stays above card

### 2. Fixed Buttons
- **What**: Action buttons fixed at bottom with proper spacing
- **Code**: `className="fixed bottom-24 left-0 right-0 z-10"` (mobile has bottom nav)
- **Why**: Always accessible, doesn't interfere with card
- **Edge Case**: On desktop, buttons are at `bottom-8` (no bottom nav)

### 3. Overflow Hidden
- **What**: Main container has `overflow-hidden`
- **Why**: Prevents page scrolling entirely - all interaction is on card
- **Code**: `className="min-h-screen bg-secondary overflow-hidden"`
- **Edge Case**: Solo mode message may need adjustment in future

## Edge Cases Handled

1. **Empty/Missing Data**:
   - Trailer button only renders if `movie.trailer_url` exists
   - Rating icons only render if `movie.imdb_rating` or `movie.rt_score` exist
   - Genres safely sliced with `.slice(0, 3)` on front, full list on back

2. **Card Flip State**:
   - State resets when new movie loads (key={currentMovie.id})
   - Flip toggle only on specific areas (not draggable content)
   - Internal scrolling doesn't trigger flip

3. **Drag vs Click**:
   - `e.stopPropagation()` on trailer button prevents flip
   - Drag indicators only show during drag (not on static card)
   - Click on "Tap to see details" area triggers flip

4. **Responsive Breakpoints**:
   - Mobile: < 768px (md breakpoint)
   - Desktop: >= 768px
   - Card completely different layout, not just scaled

5. **Animation States**:
   - `AnimatePresence mode="wait"` ensures old card exits before new enters
   - Prevents card stacking or overlap issues
   - Smooth transitions between movies

6. **Fixed Positioning Conflicts**:
   - Mobile card uses `pointer-events-none` on container, `pointer-events-auto` on card
   - Desktop uses same pattern
   - Prevents clicks "falling through" to background

## Testing Checklist

### Mobile
- [ ] Card fills viewport without scrolling (front side)
- [ ] No transparency - can't see buttons/text behind card
- [ ] Text has adequate padding from edges
- [ ] Drag shows colored overlay feedback
- [ ] Back of card scrolls internally
- [ ] Swipe requires deliberate gesture (not accidental)
- [ ] Tap to flip works on front
- [ ] Tap to flip back works on footer

### Desktop
- [ ] Poster height matches browser height
- [ ] Poster width scales automatically (thin, not wide)
- [ ] Details panel visible without scrolling (or scrollable if needed)
- [ ] Side-by-side layout centered
- [ ] Buttons work (no drag on desktop)
- [ ] No layout shift when movie changes

### Both
- [ ] Header always visible at top
- [ ] Buttons always visible at bottom
- [ ] No page scrolling
- [ ] AnimatePresence transitions smooth
- [ ] All movie data displays correctly

## Known Limitations

1. **Solo Mode Message**: Currently below buttons, may need repositioning in fixed layout
2. **Portrait Posters on Desktop**: Very tall posters may exceed viewport height (handled with max-height calc)
3. **Very Long Synopsis**: On mobile back, long synopsis is scrollable (expected behavior)
4. **Touch vs Mouse**: Desktop drag technically works but not recommended UX

## Files Modified

1. `src/components/swipe/MovieCard.tsx` - Complete card redesign
2. `src/pages/Swipe.tsx` - Layout container and positioning
