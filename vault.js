// vault.js — Document Vault

// Search functionality
const searchBox = document.querySelector('.search-box');
const documentCards = document.querySelectorAll('.document-card');
const filterBtns = document.querySelectorAll('.filter-btn');

// Search documents
if (searchBox) {
  searchBox.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    documentCards.forEach(card => {
      const docName = card.querySelector('.doc-name').textContent.toLowerCase();
      
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
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filterType = btn.textContent.toLowerCase();
    
    documentCards.forEach(card => {
      const status = card.querySelector('.doc-status').textContent.toLowerCase();
      
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

// Document card actions
const actionBtns = document.querySelectorAll('.action-btn');

actionBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const action = btn.textContent.toLowerCase();
    const docName = btn.closest('.document-card').querySelector('.doc-name').textContent;
    
    switch(action) {
      case 'view':
        alert(`Viewing: ${docName}`);
        break;
      case 'download':
        alert(`Downloading: ${docName}`);
        break;
      case 'reupload':
        alert(`Reuploading: ${docName}`);
        window.location.href = 'upload.html';
        break;
      case 'edit':
        alert(`Editing: ${docName}`);
        break;
      case 'upload':
        alert(`Uploading new document: ${docName}`);
        window.location.href = 'upload.html';
        break;
      default:
        break;
    }
  });
});

// Add fade in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style);
