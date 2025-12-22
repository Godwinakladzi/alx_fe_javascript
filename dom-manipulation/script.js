document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const quoteTextInput = document.getElementById('newQuoteText');
    const quoteCategoryInput = document.getElementById('newQuoteCategory');
    const categoryFilter = document.getElementById('categoryFilter');
    const importFileInput = document.getElementById('importFile');
    const exportBtn = document.getElementById('exportBtn');
    const syncStatus = document.getElementById('syncStatus');

    let quotes = [];

    // Initialize quotes from Local Storage
    function loadQuotes() {
        quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        populateCategories();
    }

    // Save quotes to Local Storage
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    // Show a random quote
    function showRandomQuote() {
        const selectedCategory = categoryFilter.value;
        const filteredQuotes = selectedCategory === 'all'
            ? quotes
            : quotes.filter(q => q.category === selectedCategory);

        if (filteredQuotes.length === 0) {
            quoteDisplay.textContent = "No quotes available for this category.";
            return;
        }

        const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
        quoteDisplay.textContent = `${randomQuote.text} — [${randomQuote.category}]`;
        sessionStorage.setItem('lastQuote', randomQuote.text);
    }

    // Add a new quote
    function addQuote() {
        const text = quoteTextInput.value.trim();
        const category = quoteCategoryInput.value.trim();

        if (!text || !category) {
            alert("Please enter both quote and category.");
            return;
        }

        quotes.push({ text, category });
        saveQuotes();
        populateCategories();
        quoteTextInput.value = '';
        quoteCategoryInput.value = '';
        showRandomQuote();
    }

    // Populate category dropdown
    function populateCategories() {
        const categories = Array.from(new Set(quotes.map(q => q.category)));
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
        const lastCategory = localStorage.getItem('lastCategory') || 'all';
        categoryFilter.value = lastCategory;
    }

    // Filter quotes
    function filterQuotes() {
        localStorage.setItem('lastCategory', categoryFilter.value);
        showRandomQuote();
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

    // Simulate server sync (JSONPlaceholder)
    async function syncWithServer() {
        try {
            syncStatus.textContent = "Syncing with server...";
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            const serverData = await response.json();

            // Conflict resolution: server data takes precedence for duplicates
            serverData.slice(0, 5).forEach(sd => {
                if (!quotes.some(q => q.text === sd.title)) {
                    quotes.push({ text: sd.title, category: "Server" });
                }
            });

            saveQuotes();
            populateCategories();
            syncStatus.textContent = "Data synced with server!";
        } catch (error) {
            syncStatus.textContent = "Server sync failed!";
            console.error(error);
        }
        setTimeout(() => { syncStatus.textContent = ''; }, 3000);
    }

    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    exportBtn.addEventListener('click', exportQuotes);
    importFileInput.addEventListener('change', importFromJsonFile);

    // Initial load
    loadQuotes();
    showRandomQuote();

    // Periodic server sync every 60 seconds
    setInterval(syncWithServer, 60000);
});
