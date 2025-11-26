# Technical Assumptions

* **Repository Structure:** Monorepo (even for a simple project, this sets a good pattern).
* **Service Architecture:** Monolith (it is a single frontend application).
* **Testing Requirements:** Unit Testing only for MVP. We must test the date logic.
* **Additional Technical Assumptions:**
    * The application will be hosted on a static site platform (e.g., Vercel, Netlify).
    * No external API calls are permitted for MVP.

## Browser Compatibility

**Minimum Supported Versions:**
* Chrome 92+ (July 2021)
* Firefox 95+ (December 2021)
* Safari 15.4+ (March 2022)
* Edge 92+ (July 2021)

**Rationale:**
* `crypto.randomUUID()` availability (with polyfill fallback for older browsers)
* Modern JavaScript features (ES2021)
* CSS Grid and Flexbox support
* localStorage API availability

**Testing Strategy:**
* Playwright cross-browser testing (Chromium, Firefox, WebKit)
* Manual QA on Safari (Mac/iOS) and Chrome (Android)
* Mobile testing on iOS Safari and Android Chrome

**Browser Feature Requirements:**
* localStorage API (enabled, not private browsing mode)
* JavaScript ES2021 features
* CSS Grid and Flexbox
* Native Date object support
