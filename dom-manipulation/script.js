// =====================
// Global Variables
// =====================
let quotes = []; // Array to store quotes
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');

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
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    let filteredQuotes = quotes;

    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" — (${filteredQuotes[randomIndex].category})`;
}

// =====================
// Populate Categories Dropdown
// =====================
function populateCategories() {
    if (!categoryFilter) return;
    const categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category
    const lastSelected = localStorage.getItem('lastCategory') || 'all';
    categoryFilter.value = lastSelected;
}

// =====================
// Filter Quotes by Category
// =====================
function filterQuotes() {
    localStorage.setItem('lastCategory', categoryFilter.value);
    showRandomQuote();
}

// =====================
// Add Quote Form
// =====================
function createAddQuoteForm() {
    const container = document.createElement('div');

    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Quote';

    addBtn.addEventListener('click', () => {
        const text = quoteInput.value.trim();
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

        // POST the new quote to server
        postQuoteToServer(newQuote);

        quoteInput.value = '';
        categoryInput.value = '';
    });

    container.appendChild(quoteInput);
    container.appendChild(categoryInput);
    container.appendChild(addBtn);
    document.body.appendChild(container);
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
// Import Quotes from JSON
// =====================
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            showRandomQuote();
            alert('Quotes imported successfully!');
        } catch (err) {
            alert('Failed to import quotes. Invalid JSON.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// =====================
// Fetch Quotes from Server (GET)
// =====================
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        const serverQuotes = data.map(item => ({ text: item.title, category: 'server' }));
        quotes.push(...serverQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
    } catch (error) {
        console.error('Failed to fetch quotes from server:', error);
    }
}

// =====================
// Post New Quote to Server (POST)
// =====================
async function postQuoteToServer(quote) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quote)
        });
        const data = await response.json();
        console.log('Quote posted to server:', data);
    } catch (error) {
        console.error('Failed to post quote to server:', error);
    }
}

// =====================
// Initialize App
// =====================
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    populateCategories();
    createAddQuoteForm();
    showRandomQuote();
    fetchQuotesFromServer();

    if (newQuoteBtn) newQuoteBtn.addEventListener('click', showRandomQuote);
    if (categoryFilter) categoryFilter.addEventListener('change', filterQuotes);
});
