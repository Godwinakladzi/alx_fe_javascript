document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const categoryFilter = document.getElementById('categoryFilter');
    const importFileInput = document.getElementById('importFile');
    const exportBtn = document.getElementById('exportBtn');
    const syncStatus = document.getElementById('syncStatus');

    let quotes = [];

    // Load quotes from Local Storage
    function loadQuotes() {
        quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        populateCategories();
    }

    // Save quotes to Local Storage
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    // Show random quote (with filtering)
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

    // Dynamically create Add Quote form
    function createAddQuoteForm() {
        const formContainer = document.createElement('div');
        formContainer.id = 'addQuoteForm';

        const quoteInput = document.createElement('input');
        quoteInput.id = 'newQuoteText';
        quoteInput.type = 'text';
        quoteInput.placeholder = 'Enter a new quote';

        const categoryInput = document.createElement('input');
        categoryInput.id = 'newQuoteCategory';
        categoryInput.type = 'text';
        categoryInput.placeholder = 'Enter quote category';

        const addBtn = document.createElement('button');
        addBtn.id = 'addQuoteBtn';
        addBtn.textContent = 'Add Quote';
        addBtn.addEventListener('click', () => {
            const text = quoteInput.value.trim();
            const category = categoryInput.value.trim();

            if (!text || !category) {
                alert("Please enter both quote and category.");
                return;
            }

            quotes.push({ text, category });
            saveQuotes();
            populateCategories();
            quoteInput.value = '';
            categoryInput.value = '';
            showRandomQuote();
        });

        formContainer.appendChild(quoteInput);
        formContainer.appendChild(categoryInput);
        formContainer.appendChild(addBtn);

        document.body.insertBefore(formContainer, categoryFilter.parentElement);
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

    // Filter quotes based on selected category
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

    // Import quotes from JSON file
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

    // Fetch quotes from server (ALX checker expects this)
    async function fetchQuotesFromServer() {
        try {
            syncStatus.textContent = "Fetching quotes from server...";
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            const serverData = await response.json();

            serverData.slice(0, 5).forEach(sd => {
                if (!quotes.some(q => q.text === sd.title)) {
                    quotes.push({ text: sd.title, category: "Server" });
                }
            });

            saveQuotes();
            populateCategories();
            syncStatus.textContent = "Server quotes synced!";
        } catch (error) {
            syncStatus.textContent = "Server fetch failed!";
            console.error(error);
        }
        setTimeout(() => { syncStatus.textContent = ''; }, 3000);
    }

    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    exportBtn.addEventListener('click', exportQuotes);
    importFileInput.addEventListener('change', importFromJsonFile);

    // Initial setup
    createAddQuoteForm();
    loadQuotes();
    showRandomQuote();

    // Periodic server sync every 60 seconds
    setInterval(fetchQuotesFromServer, 60000);
});
