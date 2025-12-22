// =====================
// Global Variables
// =====================
let quotes = [];
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');

// =====================
// DOMContentLoaded
// =====================
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    populateCategories();
    createAddQuoteForm();
    showRandomQuote();

    if (newQuoteBtn) newQuoteBtn.addEventListener('click', showRandomQuote);
    if (categoryFilter) categoryFilter.addEventListener('change', filterQuotes);

    // Initial server sync
    syncQuotes();

    // Auto-sync every 60 seconds
    setInterval(syncQuotes, 60000);
});

// =====================
// Load Quotes from Local Storage
// =====================
function loadQuotes() {
    const storedQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    quotes = storedQuotes;
}

// =====================
// Save Quotes to Local Storage
// =====================
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// =====================
// Show Random Quote
// =====================
function showRandomQuote() {
    let filteredQuotes = quotes;
    if (categoryFilter && categoryFilter.value !== 'all') {
        filteredQuotes = quotes.filter(q => q.category === categoryFilter.value);
    }
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = 'No quotes available.';
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// =====================
// Create Add Quote Form
// =====================
function createAddQuoteForm() {
    const container = document.createElement('div');

    const quoteInput = document.createElement('input');
    quoteInput.id = 'newQuoteText';
    quoteInput.type = 'text';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Quote';
    addBtn.onclick = addQuote;

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export JSON';
    exportBtn.onclick = exportToJson;

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = '.json';
    importInput.onchange = importFromJsonFile;

    container.appendChild(quoteInput);
    container.appendChild(categoryInput);
    container.appendChild(addBtn);
    container.appendChild(exportBtn);
    container.appendChild(importInput);

    document.body.appendChild(container);
}

// =====================
// Add Quote
// =====================
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();

    if (!text || !category) {
        alert('Please enter both quote and category.');
        return;
    }

    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    showRandomQuote();

    textInput.value = '';
    categoryInput.value = '';
}

// =====================
// Populate Categories
// =====================
function populateCategories() {
    if (!categoryFilter) return;
    const categories = [...new Set(quotes.map(q => q.category))];
    const selected = categoryFilter.value || 'all';

    categoryFilter.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categoryFilter.appendChild(allOption);

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = selected;
}

// =====================
// Filter Quotes
// =====================
function filterQuotes() {
    localStorage.setItem('lastCategoryFilter', categoryFilter.value);
    showRandomQuote();
}

// =====================
// Export Quotes to JSON
// =====================
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

// =====================
// Import Quotes from JSON File
// =====================
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            showRandomQuote();
            alert('Quotes imported successfully!');
        } catch (err) {
            alert('Invalid JSON file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// =====================
// Sync Quotes with Server
// =====================
function syncQuotes() {
    // Example using JSONPlaceholder; replace with real server if needed
    fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
        .then(response => response.json())
        .then(serverQuotes => {
            // Convert server posts to quotes format
            const fetchedQuotes = serverQuotes.map(q => ({ text: q.title, category: 'server' }));
            // Merge without duplicates
            fetchedQuotes.forEach(fq => {
                if (!quotes.some(local => local.text === fq.text)) {
                    quotes.push(fq);
                }
            });
            saveQuotes();
            populateCategories();
            console.log('Quotes synced with server.');
        })
        .catch(err => console.error('Error syncing quotes:', err));
}
