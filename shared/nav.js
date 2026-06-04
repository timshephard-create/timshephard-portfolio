(function () {
  'use strict';

  var NAV_LINKS = [
    { label: 'Work',          href: '/work/',          key: 'Work' },
    { label: 'About',         href: '/about/',         key: 'About' },
    { label: 'Nonprofit',     href: '/nonprofit/',     key: 'Nonprofit' },
    { label: 'Film &amp; TV', href: '/entertainment/', key: 'Film & TV' },
    { label: 'Tech',          href: '/tech/',          key: 'Tech' },
    { label: 'Gov',           href: '/gov/',           key: 'Gov' },
    { label: 'Branding',      href: '/branding/',      key: 'Branding' },
    { label: 'Gaming',        href: '/gaming/',        key: 'Gaming' },
    { label: 'Hire',          href: '/hire/',          key: 'Hire' },
  ];

  function buildLinkList(currentPage) {
    var html = '';
    for (var i = 0; i < NAV_LINKS.length; i++) {
      var link = NAV_LINKS[i];
      var active = link.key === currentPage;
      html += '<a href="' + link.href + '" class="nav-link' +
              (active ? ' nav-link--active' : '') + '">' + link.label + '</a>';
    }
    return html;
  }

  function injectNav() {
    var el = document.getElementById('site-nav');
    if (!el) return;

    var theme      = el.dataset.theme || 'light';
    var navMode    = el.dataset.nav   || '';
    var currentPage = el.dataset.page || '';

    el.classList.add('site-nav');
    if (theme === 'dark') el.classList.add('site-nav--dark');

    if (navMode === 'full') {
      var linksHtml = buildLinkList(currentPage);

      el.innerHTML =
        '<div class="nav-inner">' +
          '<a href="/" class="nav-logo">TIM SHEPHARD</a>' +
          '<nav class="nav-links">' + linksHtml + '</nav>' +
          '<button class="nav-hamburger" aria-label="Open menu" aria-expanded="false">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
        '<div class="nav-drawer">' +
          '<div class="nav-drawer-inner">' + linksHtml + '</div>' +
        '</div>';

      var btn    = el.querySelector('.nav-hamburger');
      var drawer = el.querySelector('.nav-drawer');

      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isOpen));
        btn.classList.toggle('is-open', !isOpen);
        drawer.classList.toggle('is-open', !isOpen);
      });

      var drawerLinks = drawer.querySelectorAll('.nav-link');
      for (var j = 0; j < drawerLinks.length; j++) {
        drawerLinks[j].addEventListener('click', function () {
          btn.setAttribute('aria-expanded', 'false');
          btn.classList.remove('is-open');
          drawer.classList.remove('is-open');
        });
      }

    } else {
      el.innerHTML =
        '<div class="nav-inner">' +
          '<a href="/" class="nav-logo">TIM SHEPHARD</a>' +
        '</div>';
    }

    window.addEventListener('scroll', function () {
      el.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  function injectFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;

    el.classList.add('site-footer');
    el.innerHTML =
      '<div class="footer-inner">' +
        '<a href="/" class="footer-logo">TIM SHEPHARD</a>' +
        '<nav class="footer-nav">' +
          '<a href="/work/">Work</a>' +
          '<a href="/about/">About</a>' +
          '<a href="/nonprofit/">Nonprofit</a>' +
          '<a href="/entertainment/">Film &amp; TV</a>' +
          '<a href="/tech/">Tech</a>' +
          '<a href="/gov/">Gov</a>' +
          '<a href="/branding/">Branding</a>' +
          '<a href="/gaming/">Gaming</a>' +
          '<a href="/hire/">Hire</a>' +
        '</nav>' +
        '<span class="footer-copy">&copy; 2026 Creative Mind Ventures LLC</span>' +
      '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectNav();
      injectFooter();
    });
  } else {
    injectNav();
    injectFooter();
  }
})();
