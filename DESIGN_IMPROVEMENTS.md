# Design Improvements Tracker — Gameshop Enter

**Status**: In Progress
**Last Updated**: 2026-02-15
**Analysis Scope**: Homepage sections, mobile responsiveness, design consistency

---

## 🎯 Overview

After comprehensive code review of ProcessTimeline, Hero, TrustStrip, and FeaturedProducts components, the following design quality improvements have been identified.

---

## 🟡 HIGH PRIORITY DESIGN ISSUES

### #D1: Mobile Typography Scaling Inconsistency

**Status**: Identified
**Severity**: HIGH
**Component**: Hero section (heading, subtitle), TrustStrip
**Issue**: Text sizes don't scale smoothly from mobile to desktop

**Current State**:

- Hero h1: `text-6xl sm:text-7xl lg:text-[112px]` — large jump between sm/lg
- Subtitle: `text-base sm:text-lg` — could be more granular
- TrustStrip: Fixed icon sizes don't account for different screen densities

**Fix Required**:

- Add md: breakpoint sizing for better transitions
- Reduce size jump between sm and lg breakpoints
- Ensure readability on all viewport sizes

**Files to Update**:

- `src/components/home/Hero.tsx` (lines 125-149)
- `src/components/home/TrustStrip.tsx` (lines 55-115)
- `src/components/home/FeaturedProducts.tsx` (lines 315-344)

**Test Plan**:

1. View on iPhone SE (375px), iPhone 12 (390px), iPad (768px)
2. Verify text hierarchy is maintained
3. Check no text wrapping issues on smaller phones
4. Verify icons maintain proper proportions

**Estimated Hours**: 2

---

### #D2: Padding & Spacing Standardization

**Status**: Identified
**Severity**: HIGH
**Components**: All homepage sections
**Issue**: Inconsistent vertical/horizontal padding across sections

**Current State**:

- FeaturedProducts: `py-28 lg:py-40`
- ProcessTimeline: `py-16 sm:py-24 md:py-32 lg:py-40`
- TrustStrip: `py-8 lg:py-10` (too tight)
- Hero: `py-36 lg:py-52`

**Fix Required**:

- Define spacing scale: xs, sm, md, lg, xl
- Apply consistently across all sections
- Ensure 8px grid alignment for better alignment

**Files to Update**:

- `src/components/home/*.tsx` (multiple)
- Consider creating design system tokens

**Test Plan**:

1. Measure spacing on desktop at 1440px
2. Measure spacing on tablet at 768px
3. Measure spacing on mobile at 375px
4. Verify 8px grid alignment

**Estimated Hours**: 3

---

### #D3: Color System Documentation & Implementation

**Status**: Identified
**Severity**: MEDIUM
**Components**: All sections
**Issue**: Colors are hardcoded throughout codebase, no centralized system

**Current State**:

```
- Emerald: #10b981 (accent color)
- Teal: #14b8a6, #0ea5e9 (cyan-ish variations)
- Purple: #8b5cf6, #a855f7
- Orange: #f59e0b
```

But colors are scattered and inconsistent. Need centralized theme.

**Fix Required**:

1. Create `src/lib/colors.ts` with brand palette
2. Define color roles: primary, secondary, accent, danger, success, etc.
3. Replace all hardcoded hex values with semantic names
4. Ensure WCAG AA contrast compliance

**Files to Create**:

- `src/lib/colors.ts`

**Files to Update**:

- All `src/components/home/*.tsx`
- `src/lib/utils.ts`

**Test Plan**:

1. Audit color contrast (WCAG AA minimum)
2. Verify color consistency across sections
3. Test dark mode compatibility (if applicable)

**Estimated Hours**: 3-4

---

### #D4: Button & CTA Styling Standardization

**Status**: Identified
**Severity**: MEDIUM
**Components**: Hero, FeaturedProducts, various pages
**Issue**: Button styles vary inconsistently across components

**Current State**:

- Hero primary button: `h-14 px-8 rounded-2xl bg-white` (tall, wide radius)
- FeaturedProducts mobile CTA: `h-12 px-6 rounded-xl` (shorter, different radius)
- Inconsistent hover states, no consistent shadow treatment

**Fix Required**:

1. Create button component variants: primary, secondary, ghost
2. Define size options: sm, md, lg, xl
3. Standardize hover, active, disabled states
4. Add consistent focus states for accessibility

**Files to Create**:

- `src/components/ui/Button.tsx`

**Files to Update**:

- Hero, FeaturedProducts, and all CTA elements

**Test Plan**:

1. Test all button states (hover, active, focus, disabled)
2. Verify 44px minimum touch target on mobile
3. Test with keyboard navigation
4. Verify color contrast on all buttons

**Estimated Hours**: 3

---

### #D5: Section Spacing & Container Widths

**Status**: Identified
**Severity**: MEDIUM
**Components**: All sections
**Issue**: Container widths and gutter spacing not consistent

**Current State**:

- Most use `max-w-6xl` or `max-w-7xl`
- TrustStrip uses `max-w-5xl`
- Padding varies: `px-4 sm:px-6 lg:px-8` vs `px-4 sm:px-6 lg:px-8`

**Fix Required**:

1. Define standard container: `max-w-6xl` (960px)
2. Define wide container: `max-w-7xl` (1280px)
3. Standardize padding: `px-4 sm:px-6 md:px-8 lg:px-8`
4. Document in design system

**Files to Update**:

- All `src/components/home/*.tsx`
- All `src/app/*/page.tsx`

**Test Plan**:

1. Verify alignment across viewports
2. Check no horizontal scroll on mobile
3. Verify sidebar/main content proportions
4. Test at 320px, 375px, 768px, 1024px, 1440px

**Estimated Hours**: 2

---

## 🟠 MEDIUM PRIORITY DESIGN ISSUES

### #D6: Accessibility Audit & WCAG Compliance

**Status**: Identified
**Severity**: MEDIUM
**Components**: All sections, forms, modals
**Issue**: No formal accessibility testing has been done

**Checklist**:

- [ ] Color contrast (WCAG AA minimum 4.5:1 for text)
- [ ] Touch targets (44px minimum for interactive elements)
- [ ] Focus indicators (all interactive elements)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] ARIA labels (forms, buttons, regions)
- [ ] Semantic HTML (headers, landmarks, lists)
- [ ] Alt text on all images
- [ ] Screen reader testing

**Files to Audit**:

- All components, especially: Hero, FeaturedProducts, checkout form

**Tools**:

- Axe DevTools (Chrome extension)
- Wave (WebAIM)
- Lighthouse (Chrome DevTools)

**Estimated Hours**: 4-6

---

### #D7: Animation Performance Optimization

**Status**: Identified
**Severity**: MEDIUM
**Components**: ProcessTimeline, FeaturedProducts, Hero
**Issue**: Complex animations may impact performance on lower-end devices

**Current State**:

- ProcessTimeline: 4 illustrations with multiple motion elements
- FeaturedProducts: 3D tilt effects on every card
- Hero: Mouse tracking with spring physics
- Heavy use of `useTransform`, `useSpring`, `useMotionValue`

**Fix Required**:

1. Profile animations with Chrome DevTools
2. Consider `will-change` CSS hints
3. Reduce animation complexity on mobile
4. Use `reduceMotion` media query
5. Benchmark FCP, LCP, CLS metrics

**Test Plan**:

1. Run Lighthouse performance audit
2. Check DevTools Performance tab
3. Test on low-end Android device
4. Verify 60fps on desktop, 30fps on mobile

**Estimated Hours**: 3-4

---

### #D8: Form Styling & Input States

**Status**: Identified
**Severity**: MEDIUM
**Components**: Checkout form (`src/app/afrekenen/page.tsx`)
**Issue**: Form inputs may not be mobile-optimized

**Current State**:

- Form inputs might have small touch targets
- No clear error state visualization
- Unclear focus states on inputs
- No loading states on submit button

**Fix Required**:

1. Ensure all inputs have 44px minimum height
2. Add clear focus ring (8px outline)
3. Improve error message styling
4. Add loading spinner to submit button
5. Add helper text styling

**Files to Update**:

- `src/app/afrekenen/page.tsx`
- Create `src/components/ui/FormField.tsx` for consistency

**Test Plan**:

1. Test input focus on all form fields
2. Test error state visibility
3. Test on mobile with on-screen keyboard
4. Test with screen reader

**Estimated Hours**: 2-3

---

## 🔵 LOW PRIORITY DESIGN ISSUES

### #D9: Image Optimization & Lazy Loading

**Status**: Identified
**Severity**: LOW
**Components**: FeaturedProducts, product pages
**Issue**: Images not optimized for different screen sizes

**Current State**:

- Using Next.js Image component (good)
- But not using AVIF format fallback
- No responsive `sizes` attribute optimization

**Fix Required**:

1. Add AVIF format support
2. Optimize `sizes` attributes for all images
3. Add placeholder shimmer effects
4. Consider blur-up technique

**Files to Update**:

- `src/components/home/FeaturedProducts.tsx` (lines 99-122)
- All product image components

**Estimated Hours**: 2-3

---

### #D10: Dark Mode / Light Mode Toggle

**Status**: Identified (future enhancement)
**Severity**: LOW
**Components**: Potential feature
**Issue**: No dark mode support

**Note**: Current design uses dark hero + light content sections. Could enhance with true dark mode.

**Estimated Hours**: 6-8 (future sprint)

---

## 📋 IMPLEMENTATION ROADMAP

### Sprint 1 (This session):

1. ✅ #ProcessTimeline: Improve illustrations & mobile responsiveness
2. 🔄 #D1: Mobile typography scaling
3. 🔄 #D2: Padding & spacing standardization (partial)
4. 🔄 #D3: Color system documentation

### Sprint 2:

5. #D4: Button & CTA styling
6. #D5: Section spacing & container widths
7. #D6: Accessibility audit

### Sprint 3:

8. #D7: Animation performance
9. #D8: Form styling
10. #D9: Image optimization

---

## 📊 Design System Checklist

- [ ] Color palette defined & documented
- [ ] Typography scale (font sizes, weights, line heights)
- [ ] Spacing scale (margins, padding, gaps)
- [ ] Button components & variants
- [ ] Form components & states
- [ ] Shadow & elevation system
- [ ] Border radius standardization
- [ ] Accessible focus indicators
- [ ] Responsive breakpoints documented
- [ ] Animation/transition timing standards

---

**Next Steps**:

1. Implement #D1 (mobile typography) — 2 hours
2. Implement #D2 (spacing) — 3 hours
3. Implement #D3 (color system) — 4 hours
4. Re-test build and deploy
