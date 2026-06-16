// Renders the furniture sidebar and wires up drag-to-canvas behaviour.
// Reads FURNITURE_CATALOGUE (furniture-data.js) and groups items by category.
// Exposes onDragStart(item, mouseEvent) — the designer sets this callback to
// initiate the ghost-div drag + canvas preview flow when a card is pressed.
class FurnitureCatalogue {
  constructor(sidebarEl) {
    // DOM host for all sidebar content
    this.sidebar = sidebarEl;
    // Set by designer.js; called with (catalogueItem, mouseEvent) on card mousedown
    this.onDragStart = null;
    this._render();
  }

  // Builds the full sidebar DOM: one section per category, one card per item
  _render() {
    // Group flat catalogue array into { category: [items] } map
    const groups = {};
    for (const item of FURNITURE_CATALOGUE) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }

    this.sidebar.innerHTML = '';

    for (const [category, items] of Object.entries(groups)) {
      const section = document.createElement('div');
      section.className = 'designer__sidebar__section';

      const title = document.createElement('div');
      title.className = 'designer__sidebar__cat-title';
      title.textContent = category;
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'designer__sidebar__grid';

      for (const item of items) {
        const card = document.createElement('div');
        card.className = 'designer__sidebar__item';
        // data-furniture-id lets the designer resolve the catalogue entry from a DOM event
        card.dataset.furnitureId = item.id;
        card.title = `${item.name} — ${this._dimsLabel(item)}`;

        // Inject the raw SVG string directly so CSS `color` controls icon tint
        const iconWrap = document.createElement('div');
        iconWrap.className = 'designer__sidebar__item-icon';
        iconWrap.innerHTML = item.icon;

        const name = document.createElement('span');
        name.className = 'designer__sidebar__item-name';
        name.textContent = item.name;

        // Dimension label in metres, e.g. "2.2m × 0.9m"
        const dims = document.createElement('span');
        dims.className = 'designer__sidebar__item-dims';
        dims.textContent = this._dimsLabel(item);

        card.appendChild(iconWrap);
        card.appendChild(name);
        card.appendChild(dims);

        // mousedown (not click) so drag can begin before mouseup
        card.addEventListener('mousedown', (e) => {
          e.preventDefault(); // prevent text selection during drag
          if (this.onDragStart) this.onDragStart(item, e);
        });

        grid.appendChild(card);
      }

      section.appendChild(grid);
      this.sidebar.appendChild(section);
    }
  }

  // Formats defaultWidth × defaultHeight (cm) as a human-readable metre string
  _dimsLabel(item) {
    const fmt = v => {
      const m = v / 100;
      // Omit decimal for whole-metre values to keep labels compact
      return m % 1 === 0 ? `${m}m` : `${parseFloat(m.toFixed(1))}m`;
    };
    return `${fmt(item.defaultWidth)} × ${fmt(item.defaultHeight)}`;
  }
}
