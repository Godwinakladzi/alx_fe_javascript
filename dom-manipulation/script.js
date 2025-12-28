// =====================
// Global State & Elements
// =====================
let quotes = [];
let conflicts = [];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");
const importFileInput = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");
const syncStatus = document.getElementById("syncStatus");
const resolveConflictsBtn = document.getElementById("resolveConflictsBtn");

// =====================
// Local Storage Utilities
// =====================
function loadQuotes() {
    quotes = JSON.parse(localStorage.getItem("quotes")) || [];
}

function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// =====================
// Quote Display Logic
// =====================
function getFilteredQuotes() {
    const selectedCategory = categoryFilter?.value || "all";
    return selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);
}

function showRandomQuote() {
    const filtered = getFilteredQuotes();
    if (!filtered.length) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.textContent = `"${random.text}" — (${random.category})`;
}

// =====================
// Category Handling
// =====================
function populateCategories() {
    if (!categoryFilter) return;

    const unique = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    unique.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = localStorage.getItem("lastCategory") || "all";
}

function filterQuotes() {
    localStorage.setItem("lastCategory", categoryFilter.value);
    showRandomQuote();
}

// =====================
// Add Quote Handling
// =====================
function addQuote(text, category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    showRandomQuote();
    postQuoteToServer(newQuote);
}

// =====================
// Import / Export
// =====================
function exportToJson() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "quotes.json";
    link.click();
    URL.revokeObjectURL(link.href);
}

function importFromJsonFile(event) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const imported = JSON.parse(e.target.result);
            quotes.push(...imported);
            saveQuotes();
            populateCategories();
            showRandomQuote();
            alert("Quotes imported successfully!");
        } catch {
            alert("Invalid JSON file.");
        }
    };
    reader.readAsText(event.target.files[0]);
}

// =====================
// Server Communication
// =====================
async function fetchQuotesFromServer() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await res.json();
        return data.map(post => ({ text: post.title, category: "server" }));
    } catch (error) {
        console.error("Error fetching quotes:", error);
        return [];
    }
}

async function postQuoteToServer(quote) {
    try {
        await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(quote)
        });
    } catch (error) {
        console.error("Error posting quote:", error);
    }
}

// =====================
// Sync and Conflict Resolution
// =====================
async function syncQuotesWithServer() {
    syncStatus.textContent = "Syncing with server...";
    const serverQuotes = await fetchQuotesFromServer();

    // Detect conflicts
    conflicts = quotes.filter(local =>
        serverQuotes.some(server => server.text === local.text && server.category !== local.category)
    );

    if (conflicts.length) {
        syncStatus.textContent = `${conflicts.length} conflict(s) detected. Server version applied.`;
        resolveConflictsBtn.hidden = false;
    } else {
        syncStatus.textContent = "Sync complete. Local quotes updated.";
        resolveConflictsBtn.hidden = true;
    }

    // Merge server quotes not already in local
    serverQuotes.forEach(serverQuote => {
        if (!quotes.some(q => q.text === serverQuote.text && q.category === serverQuote.category)) {
            quotes.push(serverQuote);
        }
    });

    // Resolve conflicts automatically (server takes precedence)
    conflicts.forEach(conflict => {
        const serverVersion = serverQuotes.find(s => s.text === conflict.text);
        const index = quotes.findIndex(q => q.text === conflict.text);
        if (index !== -1) quotes[index] = serverVersion;
    });

    saveQuotes();
    populateCategories();
    showRandomQuote();
}

// Manual conflict resolution (keep local version)
resolveConflictsBtn.addEventListener("click", () => {
    if (!conflicts.length) return;
    conflicts.forEach(conflict => {
        const index = quotes.findIndex(q => q.text === conflict.text);
        if (index !== -1) quotes[index] = conflict;
    });
    saveQuotes();
    populateCategories();
    showRandomQuote();
    conflicts = [];
    resolveConflictsBtn.hidden = true;
    syncStatus.textContent = "Conflicts manually resolved.";
});

// =====================
// Periodic Sync
// =====================
function startPeriodicSync(interval = 60000) {
    syncQuotesWithServer();
    setInterval(syncQuotesWithServer, interval);
}

// =====================
// Initialize App
// =====================
document.addEventListener("DOMContentLoaded", () => {
    loadQuotes();
    populateCategories();
    showRandomQuote();
    startPeriodicSync();

    newQuoteBtn?.addEventListener("click", showRandomQuote);
    addQuoteBtn?.addEventListener("click", () => {
        const text = document.getElementById("newQuoteText").value.trim();
        const category = document.getElementById("newQuoteCategory").value.trim();
        if (!text || !category) { alert("Please enter both quote and category."); return; }
        addQuote(text, category);
        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";
    });

    categoryFilter?.addEventListener("change", filterQuotes);
    importFileInput?.addEventListener("change", importFromJsonFile);
    exportBtn?.addEventListener("click", exportToJson);
});
