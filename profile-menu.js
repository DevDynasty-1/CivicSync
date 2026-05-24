const ProfileMenu = (() => {
  const userKey = 'civicsync_user';

  function getCurrentUser() {
    try {
      return JSON.parse(sessionStorage.getItem(userKey));
    } catch (error) {
      return null;
    }
  }

  function getInitials(name) {
    if (!name) return 'CS';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'CS';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function createMenu() {
    const headerAction = document.querySelector('.header-action');
    if (!headerAction || document.querySelector('.profile-menu')) return;

    const user = getCurrentUser();
    const initials = user ? getInitials(user.name || user.email) : 'A';

    const wrapper = document.createElement('div');
    wrapper.className = 'profile-menu';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'profile-avatar-button';
    button.title = user ? `${user.name || 'Account'} • Menu` : 'Account menu';
    button.innerHTML = `<span class="profile-avatar-text">${initials}</span>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';

    const menuItems = document.createElement('div');
    menuItems.className = 'profile-dropdown-items';

    if (user) {
      const title = document.createElement('div');
      title.className = 'profile-dropdown-title';
      title.textContent = user.name || user.email || 'CivicSync User';
      menuItems.appendChild(title);
      menuItems.appendChild(createSeparator());
      menuItems.appendChild(createLink('Dashboard', 'dashboard.html'));
      menuItems.appendChild(createLink('Settings', 'settings.html'));
      menuItems.appendChild(createLink('My uploads', 'upload.html'));
      menuItems.appendChild(createLink('Bookings', 'booking.html'));
      menuItems.appendChild(createSeparator());
      menuItems.appendChild(createAction('Sign out', handleSignOut));
    } else {
      menuItems.appendChild(createLink('Sign in', 'login.html'));
      menuItems.appendChild(createLink('Register', 'register.html'));
    }

    dropdown.appendChild(menuItems);
    wrapper.appendChild(button);
    wrapper.appendChild(dropdown);
    headerAction.appendChild(wrapper);

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => dropdown.classList.remove('show'));
    dropdown.addEventListener('click', (event) => event.stopPropagation());
  }

  function createLink(label, href) {
    const link = document.createElement('a');
    link.className = 'dropdown-item';
    link.href = href;
    link.textContent = label;
    return link;
  }

  function createAction(label, handler) {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'dropdown-item dropdown-action';
    action.textContent = label;
    action.addEventListener('click', handler);
    return action;
  }

  function createSeparator() {
    const sep = document.createElement('div');
    sep.className = 'dropdown-separator';
    return sep;
  }

  function handleSignOut() {
    sessionStorage.removeItem(userKey);
    sessionStorage.removeItem('civicsync_redirect');
    window.location.href = 'index.html';
  }

  function injectStyles() {
    if (document.getElementById('profile-menu-styles')) return;
    const style = document.createElement('style');
    style.id = 'profile-menu-styles';
    style.textContent = `
      .profile-menu {
        position: relative;
        display: inline-flex;
        align-items: center;
        margin-left: 1rem;
      }
      .profile-avatar-button {
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.08);
        color: #ffffff;
        width: 42px;
        height: 42px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.2s ease;
        padding: 0;
      }
      .profile-avatar-button:hover {
        background: rgba(255,255,255,0.16);
        transform: translateY(-1px);
      }
      .profile-avatar-text {
        font-size: 0.95rem;
        font-weight: 700;
      }
      .profile-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        min-width: 180px;
        background: rgba(15, 23, 42, 0.96);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 18px;
        box-shadow: 0 24px 60px rgba(0,0,0,0.28);
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
        z-index: 9999;
      }
      .profile-dropdown.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      .profile-dropdown-items {
        display: flex;
        flex-direction: column;
      }
      .dropdown-item {
        display: block;
        padding: 12px 16px;
        color: #e2e8f0;
        text-decoration: none;
        font-size: 0.95rem;
        text-align: left;
        background: transparent;
        border: none;
        cursor: pointer;
        width: 100%;
      }
      .dropdown-item:hover,
      .dropdown-action:hover {
        background: rgba(255,255,255,0.08);
      }
      .dropdown-action {
        background: transparent;
      }
      .dropdown-separator {
        height: 1px;
        background: rgba(255,255,255,0.08);
        margin: 4px 0;
      }
      .profile-dropdown-title {
        padding: 14px 16px 10px;
        font-size: 0.92rem;
        color: #ffffff;
        font-weight: 700;
        line-height: 1.3;
      }
      .profile-menu .btn-outline,
      .profile-menu .btn-primary,
      .profile-menu .btn-secondary {
        margin-left: 0;
      }
      @media (max-width: 720px) {
        .profile-menu {
          margin-left: 0.5rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();
    createMenu();
  }

  return { init };
})();

ProfileMenu.init();
