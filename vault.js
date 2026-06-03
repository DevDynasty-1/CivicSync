// vault.js — Document Vault

const searchBox = document.querySelector('.search-box');
const documentsGrid = document.getElementById('documents-grid');
const emptyState = document.getElementById('vault-empty');
const filterBtns = document.querySelectorAll('.filter-btn');

// If not signed in, show empty state.
// This project stores a minimal user object in sessionStorage on login/register.
const userSession = sessionStorage.getItem('civicsync_user');
if (!userSession) {
  if (emptyState) emptyState.style.display = 'block';
  if (documentsGrid) documentsGrid.innerHTML = '';
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

function getUploadedDocEntries() {
  // Real upload list is maintained in upload.js during an upload flow.
  // We'll persist names to sessionStorage so the vault can show "what has actually been uploading".
  const uploadedJson = sessionStorage.getItem('civicsync_uploaded_files');
  if (!uploadedJson) return [];

  try {
    const arr = JSON.parse(uploadedJson);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function renderDocuments() {
  if (!documentsGrid) return;

  // Clear previous render
  documentsGrid.innerHTML = '';

  const uploaded = getUploadedDocEntries();
  if (!uploaded.length) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  uploaded.forEach((doc) => {
    const name = doc?.name || 'Document';
    const status = doc?.status || 'uploaded';

    const statusLabel = (() => {
      const s = String(status).toLowerCase();
      if (s === 'verified') return { text: 'Verified', cls: 'status-verified' };
      if (s === 'rejected') return { text: 'Rejected', cls: 'status-rejected' };
      if (s === 'pending') return { text: 'Pending Review', cls: 'status-pending' };
      return { text: 'Uploaded', cls: 'status-verified' };
    })();

    const card = document.createElement('div');
    card.className = 'document-card';
    card.innerHTML = `
      <div class="doc-icon">📄</div>
      <div class="doc-name" title="${escapeHtml(name)}">${escapeHtml(name)}</div>
      <div class="doc-date">Uploaded: ${escapeHtml(doc?.uploadedAt || '') || 'Recently'}</div>
      <div class="doc-status ${statusLabel.cls}">${escapeHtml(statusLabel.text)}</div>
      <div class="doc-actions">
        <button class="action-btn">View</button>
        <button class="action-btn">Download</button>
      </div>
    `;

    documentsGrid.appendChild(card);
  });
}

function getRenderedCards() {
  return document.querySelectorAll('.document-card');
}

// Search documents
if (searchBox) {
  searchBox.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = getRenderedCards();

    cards.forEach((card) => {
      const nameEl = card.querySelector('.doc-name');
      const docName = (nameEl?.textContent || '').toLowerCase();
      if (docName.includes(searchTerm)) {
        card.style.display = '';
        card.style.animation = 'fadeIn 0.3s ease';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Filter by status
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filterType = btn.textContent.toLowerCase();
    const cards = getRenderedCards();

    cards.forEach((card) => {
      const statusEl = card.querySelector('.doc-status');
      const status = (statusEl?.textContent || '').toLowerCase();

      if (filterType === 'all') {
        card.style.display = '';
      } else if (status.includes(filterType)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Document card actions (event delegation)
documentsGrid?.addEventListener('click', (e) => {
  const btn = e.target.closest('.action-btn');
  if (!btn) return;

  e.stopPropagation();
  const card = btn.closest('.document-card');
  const docName = card?.querySelector('.doc-name')?.textContent || '';

  const action = btn.textContent.toLowerCase();
  switch (action) {
    case 'view':
      alert(`Viewing: ${docName}`);
      break;
    case 'download':
      alert(`Downloading: ${docName}`);
      break;
    default:
      break;
  }
});

// Fade-in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style);

// Initial render
renderDocuments();

