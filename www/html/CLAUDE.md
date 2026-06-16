# Project: Biuro Senatora — WordPress Theme "Just"

## SCSS Style Guide

### Folder Structure
```
_dev/src/scss/
├── main.scss              ← entry point, @import everything here
├── utilities/
│   ├── _variables.scss
│   └── _mixins.scss
├── base/
│   ├── _normalize.scss
│   ├── _layout.scss
│   └── _universal.scss
├── partials/
│   └── _[section].scss    ← one file per page section
└── plugs/
    └── _[plugin].scss     ← third-party plugin overrides
```

### Naming: strict BEM
- Block: `.header`
- Element: `.header__container`, `.header__container__logo`
- Modifier: `.header__container__logo--active`
- Deep nesting with `&__child` chains is fine

### Variables (`_variables.scss`)
```scss
/** COLORS **/
$white: #fff;
$black: #000;
$primary-bg: #fff;
$primary-text: #587289;
$primary-color: #587289;
$primary-border: #2C2C2C;
$primary-font: 'Proxima Nova', sans-serif;

/** RESPONSIVE BREAKPOINTS **/
$breakpoints: (
  xs: 576px,
  sm: 768px,
  md: 992px,
  lg: 1200px,
  xl: 1600px,
  xxl: 1920px,
);
```

### Mixins (`_mixins.scss`)
```scss
/** BREAKPOINTS MEDIA **/
@mixin media($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}
```

### Responsive approach
- **Mobile-first** — base styles target mobile, use `@include media('lg')` to scale up
- Use `@include media('xs'|'sm'|'md'|'lg'|'xl'|'xxl')` for named breakpoints
- Raw `@media (min-width: Xpx)` is acceptable for one-off values (e.g. 1025px)
- Nest `@media` blocks **inside** selectors, not outside

### Formatting rules
- Nest `@media` and child selectors inside parent — never separated
- Leave commented-out code in place with `//`
- No trailing blank lines inside rule blocks
- One blank line between top-level selectors

### main.scss import order
1. `utilities/variables`
2. `utilities/mixins`
3. `base/*` (if needed)
4. `partials/*`
5. `plugs/*`
