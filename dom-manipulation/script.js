document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const quoteTextInput = document.getElementById('newQuoteText');
    const quoteCategoryInput = document.getElementById('newQuoteCategory');
    const categoryFilter = document.getElementById('categoryFilter');
    const importFileInput = document.getElementById('importFile');
    const exportBtn = document.getElementById('exportBtn');

    let quotes = [];

    // Load from Local Storage
    if (localStorage.getItem('quotes')) {
        quotes = JSON.parse(localStorage.getItem('quotes'));
    } else {
        quotes = [
            { text: "The only limit is your mind.", category: "Motivation" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" }
        ];
        saveQuotes();
    }

    populateCategories();

    // Show a random quote
    function showRandomQuote() {
        const selectedCategory = categoryFilter.value;
        let filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);

        if (filteredQuotes.length === 0) {
            quoteDisplay.textContent = "No quotes available for this category.";
            return;
        }

        const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
        quoteDisplay.textContent = randomQuote.text + " — [" + randomQuote.category + "]";
    }

    // Add a new quote
    function addQuote() {
        const text = quoteTextInput.value.trim();
        const category = quoteCategoryInput.value.trim();

        if (!text || !category) {
            alert("Please enter both quote and category.");
            return;
        }

        const newQuote = { text, category };
        quotes.push(newQuote);
        saveQuotes();
        populateCategories();
        quoteTextInput.value = '';
        quoteCategoryInput.value = '';
        showRandomQuote();
    }

    // Populate categories in the filter dropdown
    function populateCategories() {
        const categories = Array.from(new Set(quotes.map(q => q.category)));
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });

        // Restore last selected category
        const lastCategory = localStorage.getItem('lastCategory') || 'all';
        categoryFilter.value = lastCategory;
    }

    // Filter quotes by category
    function filterQuotes() {
        localStorage.setItem('lastCategory', categoryFilter.value);
        showRandomQuote();
    }

    // Save quotes to Local Storage
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    // Export quotes as JSON
    function exportQuotes() {
        const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'quotes.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    // Import quotes from JSON
    function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            const importedQuotes = JSON.parse(e.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            alert('Quotes imported successfully!');
            showRandomQuote();
        };
        fileReader.readAsText(event.target.files[0]);
    }

    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    exportBtn.addEventListener('click', exportQuotes);
    importFileInput.addEventListener('change', importFromJsonFile);

    // Initial display
    showRandomQuote();
});
