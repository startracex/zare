class ActiveLink extends HTMLElement {
  static get observedAttributes() {
    return ['href'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(`
      :host {
          display: inline-block;
        }
      a {
        color: currentColor;
        text-decoration: none;
      }
      a.active {
        text-decoration: underline;
      }
`);
    this.shadowRoot.adoptedStyleSheets.push(styleSheet);
    const a = document.createElement('a');
    const slot = document.createElement('slot');
    a.appendChild(slot);
    this.shadowRoot.appendChild(a);
    this.linkElement = a;
  }

  connectedCallback() {
    this.href = this.getAttribute('href') || '';
    this.checkActiveState();
    window.addEventListener('popstate', this.checkActiveState);
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', this.checkActiveState);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'href' && oldVal !== newVal) {
      this.href = newVal || '';
      this.checkActiveState();
    }
  }

  set href(v) {
    this.setAttribute('href', v);
    this.linkElement.href = v;
  }

  get href() {
    return this.linkElement.href;
  }

  checkActiveState() {
    if (!this.href || this.href.trim() === '' || this.href === '#') {
      this.linkElement.classList.remove('active');
      return;
    }

    try {
      const currentUrl = location;
      const targetUrl = new URL(this.linkElement.href, currentUrl.origin);
      const isActive =
        currentUrl.pathname + currentUrl.search ===
        targetUrl.pathname + targetUrl.search;
      this.linkElement.classList.toggle('active', isActive);
    } catch {
      this.linkElement.classList.remove('active');
    }
  }
}

if (!customElements.get('active-link')) {
  customElements.define('active-link', ActiveLink);
}
