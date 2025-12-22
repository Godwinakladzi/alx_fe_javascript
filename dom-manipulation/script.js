// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    // DOM element references
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

    // Initialize quotes array from localStorage or default
    let quotes = JSON.parse(localStorage.getItem('quotes') || '[]');

    // Display a random quote
    function showRandomQuote() {
        if (quotes.length === 0) {
            quoteDisplay.textContent = 'No quotes available.';
            return;
        }
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
    }

    // Add a new quote
    function addQuote() {
        const text = newQuoteTextInput.value.trim();
        const category = newQuoteCategoryInput.value.trim();
        if (!text || !category) {
            alert('Please enter both quote and category.');
            return;
        }

        const quote = { text, category };
        quotes.push(quote);
        saveQuotes();
        populateCategories();
        newQuoteTextInput.value = '';
        newQuoteCategoryInput.value = '';
        showRandomQuote();
    }

    // Save quotes to localStorage
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    // Load quotes and populate categories dropdown
    function loadQuotes() {
        quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        populateCategories();
        showRandomQuote();
    }

    // Populate categories dropdown dynamically
    function populateCategories() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return; // skip if dropdown not in HTML
        const uniqueCategories = [...new Set(quotes.map(q => q.category))];
        const lastSelected = categoryFilter.value || 'all';

        // Clear existing options
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        uniqueCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });

        // Restore last selected filter
        categoryFilter.value = lastSelected;
    }

    // Filter quotes based on selected category
    function filterQuotes() {
        const categoryFilter = document.getElementById('categoryFilter');
        const selected = categoryFilter.value;
        if (selected === 'all') {
            showRandomQuote();
            return;
        }
        const filtered = quotes.filter(q => q.category === selected);
        if (filtered.length === 0) {
            quoteDisplay.textContent = 'No quotes in this category.';
            return;
        }
        const randomIndex = Math.floor(Math.random() * filtered.length);
        const quote = filtered[randomIndex];
        quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
        // Save last selected filter
        localStorage.setItem('lastCategory', selected);
    }

    // Export quotes as JSON file
    function exportToJson() {
        const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import quotes from JSON file
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
            } catch {
                alert('Invalid JSON file.');
            }
        };
        fileReader.readAsText(event.target.files[0]);
    }

    // Attach event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    document.getElementById('addQuoteBtn')?.addEventListener('click', addQuote);
    document.getElementById('categoryFilter')?.addEventListener('change', filterQuotes);
    document.getElementById('importFile')?.addEventListener('change', importFromJsonFile);
    document.getElementById('exportBtn')?.addEventListener('click', exportToJson);

    // Initialize app
    loadQuotes();
});
