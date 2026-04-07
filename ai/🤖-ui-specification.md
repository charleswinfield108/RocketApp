# 🤖 UI_SPECIFICATION_Rocket Food Delivery Mobile App

> Comprehensive user interface specification for the Rocket Food Delivery customer mobile app.
> Covers visual design, interactions, states, and styling guidelines across all screens.

---

## Document Overview

This UI specification document defines the visual design, layout, interactions, and styling for the Rocket Food Delivery mobile application. It complements the feature specifications by focusing on user interface patterns, visual hierarchy, accessibility, and responsive design.

**Related Documents:**
- `🤖-ai-spec.md` — Global project specification
- `🤖-features/` — Individual feature specifications

---

## General UI Requirements

### Header & Footer Navigation

**Visibility Rule:**
- Header and footer **always visible** on all screens EXCEPT login page
- Login page should display full-screen form without navigation chrome
- Upon successful login, navigation chrome appears on all subsequent screens

**Header Components:**
- **Logo:** Rocket Food Delivery logo (left-aligned, ~40px height)
- **Title/App Name:** "RocketFood" or "Rocket Delivery" (center, optional)
- **Logout Button:** "Logout" text or user icon with dropdown (right-aligned)
- **Background Color:** Primary brand color (from wireframe)
- **Height:** ~56-64px (standard iOS/Android header)

**Footer Components:**
- **Tab Navigation:** 3 tabs at bottom
  - Tab 1: "Restaurants" (home icon)
  - Tab 2: "History" (history/clock icon)
  - Tab 3: "Profile" (user icon) — basic tab only
- **Active Tab Indicator:** Highlight or underline current tab
- **Background Color:** Neutral or primary color (match header)
- **Height:** ~48-56px (standard tab bar)
- **Icons:** FontAwesome solid icons (18-20px size)

**Navigation Behavior:**
- Tapping tab navigates to corresponding screen
- Active tab visually distinguished
- Smooth transitions between screens
- On logout: Return to login screen (header/footer hidden)

### Typography

**Font Stack:**

| Element | Font | Size | Weight | Usage |
|---------|------|------|--------|-------|
| **Body Text** | Arial | 14-16px | 400 | Paragraphs, labels, descriptions |
| **Headings** | Oswald | 18-24px | 600-700 | Screen titles, section headers |
| **Buttons** | Arial | 14-16px | 600 | Interactive elements |
| **Small Text** | Arial | 12px | 400 | Captions, hints, metadata |
| **Card Titles** | Oswald | 16-18px | 600 | Restaurant names, item names |

**Color Usage:**
- **Primary Text:** #1F2937 (dark gray/charcoal)
- **Secondary Text:** #6B7280 (medium gray)
- **Hint Text:** #9CA3AF (light gray)
- **Links:** #3B82F6 (blue)
- **Error Text:** #DC2626 (red)
- **Success Text:** #16A34A (green)

### Content Scrolling

**Scrolling Rules:**
- All screen content that exceeds viewport height must scroll vertically
- Header and footer remain fixed (not scroll with content)
- Use native React Native ScrollView or FlatList
- Smooth scroll momentum enabled
- No horizontal scrolling required

**Scroll Indicators:**
- Show scroll indicator on iOS (right edge)
- Show scroll indicator on Android (right edge)
- Fade scroll indicator when inactive

### Styling Philosophy

**Design Principles:**
1. **Follow Wireframe:** Layout and positioning should closely match provided wireframe
2. **Consistency:** Use same colors, spacing, typography across screens
3. **Clarity:** Clear visual hierarchy (headings > body > captions)
4. **Accessibility:** Sufficient contrast ratios, readable text sizes
5. **Touch-Friendly:** Buttons and interactive elements ≥44x44px (iOS standard)
6. **Responsive:** Adapt to different screen sizes (mobile-first design)

---

## Screen-Specific UI Requirements

### Login Screen

**Layout:**
- Full-screen form (no header/footer)
- Centered content on screen
- Background color: Light (white or light gray)
- Optional: App logo at top

**Form Elements:**

| Element | Type | Placeholder | Validation |
|---------|------|-------------|-----------|
| Email/Username | TextInput | "Email address" | Required, email format |
| Password | TextInput (password) | "Password" | Required, min 6 chars |
| Login Button | Button | "Login" | Enabled when both fields filled |

**Error Display:**
- **Position:** Above Login button or below password field
- **Style:** Red text (#DC2626), 12-14px
- **Message Example:** "Invalid email or password"
- **Timing:** Display immediately on failed login attempt
- **Clearing:** Clear when user edits either field

**Button States:**

| State | Style | Behavior |
|-------|-------|----------|
| Disabled (empty fields) | Gray, opacity 0.5 | Not tappable |
| Enabled | Primary color #3B82F6 | Tappable |
| Loading (optional) | Gray with spinner | Not tappable |

**On Successful Login:**
- Store JWT token in AsyncStorage
- Navigate to restaurant list screen
- Show header/footer navigation

---

### Restaurant List Screen

**Layout:**
- Header: "Restaurants" title + filter section
- Content: Grid of restaurant cards
- Footer: Tab navigation (3 tabs)

**Filter Bar:**

| Component | Type | Default | Behavior |
|-----------|------|---------|----------|
| Rating Filter | Dropdown/Picker | "Select" | Shows: "Select", "1★", "2★", "3★", "4★", "5★" |
| Price Filter | Dropdown/Picker | "Select" | Shows: "Select", "$", "$$", "$$$", "$$$$" |
| Apply Button | Button | — | Optional; auto-filter on selection |

**Restaurant Cards:**
```
┌─────────────────────────┐
│                         │
│   [Random Restaurant    │
│    Image from folder]   │ ← Image height: ~120px
│                         │
├─────────────────────────┤
│ Restaurant Name         │ ← Oswald, 16px, bold
├─────────────────────────┤
│ ⭐ 4.5 (120 reviews)    │ ← Rating + review count
│ $ • Cuisine Type        │ ← Price level + category
│ 20-30 mins • 2.5 km     │ ← Est. time + distance
└─────────────────────────┘
```

**Card Grid:**
- Layout: 2 columns on mobile (or 1 column for small screens)
- Spacing: 8-12px between cards
- Card width: ~(screenWidth / 2) - margins
- Card height: Auto based on content
- Tappable: Entire card navigates to menu page

**Restaurant Images:**
- Source: `support_materials_13/Images/Restaurants/` folder
- Selection: Random from available restaurant images
- Aspect Ratio: 3:2 or 4:3 (consistent)
- Fallback: Placeholder image if not found

**Empty State:**
- Message: "No restaurants match your filters"
- Offer: "Clear filters to see all restaurants"

---

### Restaurant Menu Screen

**Layout:**
- Header: Restaurant name + back button
- Content: Menu items list
- Footer: "Create Order" button (sticky at bottom)
- Tab navigation: Footer

**Menu Items:**
```
┌────────────────────────────────┐
│ [RestaurantMenu.jpg - Static]  │ ← Use for ALL restaurants
├────────────────────────────────┤
│ Item Name · $12.99             │
│ Description (optional)         │
│ [-] 0 [+]        Create Order  │ ← Stepper buttons
├────────────────────────────────┤
│ Item Name 2 · $11.99           │
│ Description                    │
│ [-] 0 [+]        Create Order  │
└────────────────────────────────┘
```

**Image Display:**
- **Filename:** `RestaurantMenu.jpg` from assets
- **Location:** `./client/assets/images/RestaurantMenu.jpg`
- **Usage:** Same image for ALL restaurants
- **Size:** Full width of content area
- **Aspect Ratio:** Consistent

**Menu Item Layout:**

| Component | Details |
|-----------|---------|
| Item Name | Oswald font, 16px, bold |
| Price | Arial, 14px, currency format ($XX.XX) |
| Description | Arial, 12px, secondary color (optional) |
| Quantity Stepper | [-] [0] [+] inline |
| Height per item | ~60-80px |

**Quantity Stepper:**
- **Minus Button (-):** Decrease quantity (disable if qty=0)
- **Display:** Current quantity (0 by default)
- **Plus Button (+):** Increase quantity
- **Style:** Buttons 32x32px, centered alignment
- **Tappable Area:** Entire button (not just icon)
- **No Text Input:** User cannot type quantity directly

**Stepper Behavior:**
- Default quantity: 0
- Min quantity: 0 (cannot go negative)
- Max quantity: No limit (or reasonable limit like 99)
- On tap: Increment or decrement by 1
- Disable minus when qty=0

**Create Order Button:**

| State | Style | Behavior |
|-------|-------|----------|
| All qty=0 | Gray, disabled | Not tappable |
| Any qty>0 | Primary blue, enabled | Tappable → Opens confirmation modal |
| Position | Sticky at bottom | Always visible |
| Height | 48-56px | Standard button |

**Reset Behavior:**
- When user navigates TO this restaurant: Reset all quantities to 0
- When user navigates AWAY: Clear quantities for next visit

---

### Order Confirmation Modal

**Layout:**
- Modal overlay (semi-transparent background)
- Centered modal card
- Title: "Order Summary" or "Confirm Order"
- Content: Scrollable item list + total
- Actions: Button(s) at bottom

**Modal Header:**
```
╔════════════════════════════════╗
║  Order Summary              ✕  │  ← Title + close button
╠════════════════════════════════╣
```

**Order Summary Content:**
```
Item 1: 2x Pepperoni Pizza
        @ $12.99 each = $25.98

Item 2: 1x Margherita Pizza
        @ $11.99 each = $11.99

────────────────────────────────
Total:                    $37.97
```

**Price Formatting:**
- Format: `$XX.XX` (USD currency)
- All prices use this format consistently
- Calculation: `quantity × unit_price = line_total`
- Total: `sum of all line_totals`

**Button States:**

| State | Button Text | Icon | Style | Behavior |
|-------|-------------|------|-------|----------|
| **Default** | "Confirm Order" | None | Primary blue | Tappable |
| **Processing** | "Processing Order…" | Spinner | Gray disabled | Not tappable |
| **Error** | "Confirm Order" | ❌ (red X) | Primary blue | Tappable (retry) |
| **Success** | (hidden) | ✓ (green ✔) | N/A | Non-interactive |

**Processing State:**
- Show loading spinner (circular progress)
- Disable button (cannot tap)
- Change text to "Processing Order…"
- Optional: Dim modal background (reduce opacity)
- Duration: Entire API request (~5-30 seconds typically)

**Error State:**
- Show red X icon (#DC2626)
- Display error message from API (e.g., "One or more items unavailable")
- Re-enable button for retry
- Allow user to click button again immediately

**Success State:**
- Hide button completely
- Show green checkmark icon (#16A34A)
- Display message: "Order created successfully!" or "Order confirmed!"
- Show optional: Order ID or confirmation number
- Auto-dismiss after 2-3 seconds (navigate to order history)
- Visual: Celebratory (use green color, optional animation)

**Modal Behavior:**
- Non-dismissible during processing
- Tap X to close on default/error state
- Close behavior: Dismiss modal, return to menu
- On success: Auto-navigate to order history (don't show close)

---

### Order History Page

**Layout:**
- Header: "Order History" title
- Content: Table of orders
- Footer: Tab navigation
- No header/footer chrome (same as other screens)

**Table Structure:**
```
┌──────────────────────────────────────────┐
│ Order    │ Status       │ View           │  ← Headers (bold)
├──────────────────────────────────────────┤
│ORD-001   │ Delivered 🟢 │ [View Button] │  ← Row 1
│2 Apr     │              │                │
├──────────────────────────────────────────┤
│ORD-002   │ Preparing 🔵 │ [View Button] │  ← Row 2
│1 Apr     │              │                │
└──────────────────────────────────────────┘
```

**Column Details:**

| Column | Content | Width | Alignment |
|--------|---------|-------|-----------|
| **Order** | Order ID (line 1) + Date (line 2) | Flexible | Left |
| **Status** | Status badge with color | Flexible | Center |
| **View** | Button or icon | Fixed | Right |

**Status Badges:**

| Status | Background Color | Text Color | Icon |
|--------|------------------|-----------|------|
| Confirmed | #9CA3AF (gray) | White | — |
| Preparing | #3B82F6 (blue) | White | — |
| Out for Delivery | #F97316 (orange) | White | — |
| Delivered | #16A34A (green) | White | ✓ |
| Cancelled | #DC2626 (red) | White | ✗ |

**View Button:**
- Style: Icon button (eye icon 📋 or "View" text)
- Size: 40x40px (tappable area)
- Behavior: Tappable on entire row or just button
- Action: Opens Order History Detail modal

**Sorting:**
- Default: Newest orders first (descending by date)
- Order IDs like: ORD-12345, ORD-67890, etc.

**Empty State:**
- Message: "No orders yet"
- Subtext: "Start by ordering from a restaurant!"
- Optional: Button to navigate to restaurants tab

---

### Order History Detail Modal

**Layout:**
- Modal overlay
- Scrollable content
- Header: Order ID + status badge + close button
- Sections: Order details, items, pricing, courier, delivery

**Modal Structure:**
```
╔════════════════════════════════╗
║ Order #ORD-12345     [🟢]   ✕  │  ← ID + status + close
╠════════════════════════════════╣
║ Order Details                  │
║ Restaurant: Pizza Palace       │
║ Date: Apr 7, 2026              │
├────────────────────────────────┤
║ Items                          │
║ 2x Pepperoni Pizza @ $12.99    │
║ 1x Margherita Pizza @ $11.99   │
├────────────────────────────────┤
║ Pricing                        │
║ Subtotal:          $37.97      │
║ Total:             $37.97      │
├────────────────────────────────┤
║ Courier (if assigned)          │
║ Driver: John Smith             │
║ Status: Out for delivery       │
├────────────────────────────────┤
║ Delivery                       │
║ Address: 123 Main St...        │
║ Delivered: Apr 7, 2026 5:15 PM │
╠════════════════════════════════╣
║ [Back]                         │  ← Footer button
╚════════════════════════════════╝
```

**Data Accuracy:**
- **All details must be accurate** from API response
- No modifications to data
- Display exactly as returned
- Handle null fields gracefully ("Not yet assigned", "Pending")

**Sections:**

| Section | Shows | Optional? |
|---------|-------|-----------|
| Order Details | Restaurant name, date | No |
| Items | All items with qty and price | No |
| Pricing | Subtotal, total in currency format | No |
| Courier | Courier name, status, phone | If assigned |
| Delivery | Address, delivery timestamp | No |

---

## Color Palette

### Primary Colors

```
Primary Blue:      #3B82F6
Primary Green:     #10B981
Primary Orange:    #F97316
Primary Red:       #DC2626
```

### Text Colors

```
Dark (primary):    #1F2937
Medium (secondary):#6B7280
Light (hint):      #9CA3AF
Disabled:          #D1D5DB
```

### Status Colors

```
Success (green):   #16A34A
Error (red):       #DC2626
Warning (orange):  #F97316
Info (blue):       #3B82F6
Neutral (gray):    #9CA3AF
```

### Badge Colors

```
Confirmed:   #9CA3AF (gray)
Preparing:   #3B82F6 (blue)
Delivering:  #F97316 (orange)
Delivered:   #16A34A (green)
Cancelled:   #DC2626 (red)
```

---

## Spacing & Layout

### Padding & Margins

| Element | Value | Usage |
|---------|-------|-------|
| Screen edges | 16px | Content margin from screen edge |
| Card spacing | 8-12px | Between cards in grid |
| Section spacing | 16-20px | Between sections |
| Item spacing | 12px | Between list items |
| Button height | 48px | Standard button |
| Header height | 56-64px | Top navigation |
| Footer height | 48-56px | Bottom navigation |

### Grid Layout

- **Restaurant cards:** 2 columns on mobile (or 1 column for phones)
- **Card aspect ratio:** 3:2 or 4:3
- **Item list:** Single column, full width
- **Modal width:** 90% of screen or max 400px
- **Modal positioning:** Centered vertically and horizontally

---

## Interactive Elements

### Buttons

**Standard Button:**
- Height: 48px
- Padding: Horizontal 16px, vertical 12px
- Border radius: 6px
- Font: Arial, 14-16px, bold
- Text transform: None (use proper casing)
- Touch target: Minimum 44x44px

**Button States:**

| State | Background | Text | Cursor |
|-------|-----------|------|--------|
| Enabled | Primary blue | White | Pointer |
| Disabled | Light gray | Gray text | Not allowed |
| Pressed | Darker blue | White | — |
| Hover (web) | Darker blue | White | Pointer |

### TextInput Fields

- Height: 44px
- Padding: 12px horizontal
- Border: 1px solid #E5E7EB
- Border radius: 6px
- Font: Arial, 14px
- Placeholder color: #9CA3AF
- Focus: Border color → primary blue

### Steppers (Quantity)

- Button size: 32x32px each
- Display area: 32×32px (shows number)
- Spacing: 4px between buttons
- Font size: 14px (for number)
- Icons: - (minus), + (plus) from FontAwesome

---

## Accessibility

### Color Contrast

- Text on background: Minimum 4.5:1 ratio (WCAG AA)
- Button text on button: Minimum 4.5:1 ratio
- Status badges: Ensure text readable

### Touch Targets

- Minimum tappable area: 44×44px (iOS standard)
- Padding around touch targets: 4-8px
- Buttons, icons, form fields: All meet minimum

### Text Sizing

- Body text: Minimum 14px
- Headings: 16px or larger
- Caption/hint text: 12px (acceptable for secondary)
- Font weight: Bold for headers (600-700)

### Icons

- Icons should be labeled/clear
- Use FontAwesome solid icons for consistency
- Icon size: 16-24px (context-dependent)
- Sufficient contrast with background

---

## Responsive Behavior

### Screen Size Adaptation

**Small Screens (< 360px):**
- Single column layouts
- Slightly reduced spacing (12px instead of 16px)
- Smaller fonts if necessary (12px minimum)

**Medium Screens (360-600px):**
- 2-column grids for restaurant cards
- Standard spacing (16px)
- Standard font sizes

**Large Screens (> 600px):**
- Optional: 2-3 columns for restaurant cards
- Standard spacing
- Standard font sizes

### Safe Areas

- Respect device safe areas (notches, rounded corners)
- React Native handles most of this automatically
- Test on both iOS and Android

---

## Asset Requirements

### Images

| Asset | Location | Format | Size | Usage |
|-------|----------|--------|------|-------|
| App Logo | `./assets/images/logo.png` | PNG | ~200×100px | Header |
| RestaurantMenu | `./assets/images/RestaurantMenu.jpg` | JPG | ~800×600px | Menu pages (all restaurants) |
| Restaurant Images | `./assets/Restaurants/` | JPG/PNG | Various | Random selection on list |
| Icons | FontAwesome | SVG | 16-24px | UI icons |

### Image Optimization

- Compress images (80-90 quality for JPG)
- Use appropriate dimensions (don't over-scale)
- Provide @2x/@3x variants for high-DPI devices
- Lazy load images when possible

---

## State Transitions

### Login Flow
```
Login Screen
  ↓ (enter credentials)
  ↓ (tap Login)
  ↓ (processing...)
  ├─ Success → Restaurant List Screen
  └─ Error → Show inline error, stay on Login
```

### Restaurant → Menu Flow
```
Restaurant List
  ↓ (tap restaurant card)
  → Menu Screen (quantities reset to 0)
```

### Menu → Confirmation Flow
```
Menu Screen
  ↓ (set quantities > 0)
  ↓ (tap Create Order)
  → Confirmation Modal (order summary displayed)
  ↓ (processing...)
  ├─ Success → Order created ✓ → Auto-navigate to History
  └─ Error → Show error, retry button enabled
```

### History → Detail Flow
```
Order History
  ↓ (tap View button)
  → Order Detail Modal (full details displayed)
  ↓ (tap Back or X)
  → Order History Page
```

---

## Error Handling & Messages

### Error Display

| Error Type | Display Location | Message | Duration |
|-----------|------------------|---------|----------|
| Login failed | Above Login button | "Invalid email or password" | Until user edits |
| API error | Modal or inline | Error from API (or fallback) | Until user taps retry |
| Network error | Modal or toast | "Network error. Please try again." | 3-5 seconds or tap |

### Success Messages

| Action | Message | Duration |
|--------|---------|----------|
| Order created | "Order created successfully!" | 2-3 seconds (auto-navigate) |
| Login successful | (None, auto-navigate) | Immediate |

---

## Typography Examples

### Login Screen Title
- Font: Oswald
- Size: 24px
- Weight: 700
- Color: #1F2937

### Restaurant Card Name
- Font: Oswald
- Size: 16px
- Weight: 600
- Color: #1F2937

### Body Text (Description)
- Font: Arial
- Size: 14px
- Weight: 400
- Color: #6B7280

### Button Text
- Font: Arial
- Size: 16px
- Weight: 600
- Color: White (on blue background)

---

## References

- **Global Specification:** `🤖-ai-spec.md`
- **Feature Specifications:** `🤖-features/` directory
- **Wireframe Template:** `support_materials_13/Design/`
- **Restaurant Images:** `support_materials_13/Images/Restaurants/`
- **Design Assets:** RestaurantMenu.jpg in project resources
- **React Native Docs:** https://reactnative.dev/docs
- **Expo Docs:** https://docs.expo.dev/

---

**This UI specification provides comprehensive guidance for implementing the visual design and interactions of the Rocket Food Delivery mobile app.**
