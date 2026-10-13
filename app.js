const ITEMS_KEY = "expenseItems";
const BUDGET_KEY = "monthlyBudgetLimit";

let items = [];
let budget = 0;

try {
    items = JSON.parse(localStorage.getItem(ITEMS_KEY) || "[]");
    if (!Array.isArray(items)) items = [];
} catch {
    items = [];
}

budget = Number(localStorage.getItem(BUDGET_KEY)) || 0;

const monthlyBudgetInput = document.getElementById("monthlyBudget");
const itemNameInput = document.getElementById("itemName");
const categoryInput = document.getElementById("category");
const itemAmountInput = document.getElementById("itemAmount");
const filterCategoryInput = document.getElementById("filterCategory");
const tableBody = document.getElementById("tableBody");
const totalAmount = document.getElementById("totalAmount");
const totalBox = document.getElementById("totalBox");
const budgetAlert = document.getElementById("budgetAlert");

monthlyBudgetInput.value = budget > 0 ? String(budget) : "";

monthlyBudgetInput.addEventListener("input", () => {
    budget = Math.max(0, Number(monthlyBudgetInput.value) || 0);
    localStorage.setItem(BUDGET_KEY, String(budget));
    renderItems();
});

document.getElementById("addBtn").addEventListener("click", addItem);
document.getElementById("downloadBtn").addEventListener("click", downloadCSV);
document.getElementById("clearAllBtn").addEventListener("click", clearAllData);
filterCategoryInput.addEventListener("change", renderItems);

function renderItems() {
    tableBody.replaceChildren();
    const selectedFilter = filterCategoryInput.value;
    const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    items.forEach((item, index) => {
        if (selectedFilter !== "All" && item.category !== selectedFilter) return;

        const row = document.createElement("tr");
        const nameCell = row.insertCell();
        const categoryCell = row.insertCell();
        const amountCell = row.insertCell();
        const actionCell = row.insertCell();

        nameCell.textContent = item.name;
        categoryCell.textContent = item.category;
        amountCell.textContent = "₹" + (Number(item.amount) || 0).toFixed(2);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.addEventListener("click", () => deleteItem(index));
        actionCell.appendChild(deleteButton);
        tableBody.appendChild(row);
    });

    totalAmount.textContent = total.toFixed(2);

    if (budget > 0 && total > budget) {
        totalBox.style.backgroundColor = "#e74c3c";
        budgetAlert.style.display = "block";
        budgetAlert.style.backgroundColor = "#fadbd8";
        budgetAlert.style.color = "#c0392b";
        budgetAlert.style.border = "1px solid #e74c3c";
        budgetAlert.textContent = "⚠️ Warning: You have exceeded your monthly budget!";
    } else {
        totalBox.style.backgroundColor = "#2c3e50";
        budgetAlert.style.display = "none";
        budgetAlert.textContent = "";
    }

    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

function addItem() {
    const name = itemNameInput.value.trim();
    const category = categoryInput.value;
    const amountText = itemAmountInput.value.trim();
    const amount = Number(amountText);

    if (!name || amountText === "" || !Number.isFinite(amount) || amount < 0) {
        alert("Please enter an item name and a valid non-negative amount.");
        return;
    }

    items.push({ name, category, amount });
    renderItems();
    itemNameInput.value = "";
    itemAmountInput.value = "";
    itemNameInput.focus();
}

function deleteItem(index) {
    items.splice(index, 1);
    renderItems();
}

function clearAllData() {
    if (!items.length) {
        alert("There are no expenses to clear.");
        return;
    }
    if (confirm("Are you sure you want to delete all expenses?")) {
        items = [];
        localStorage.removeItem(ITEMS_KEY);
        renderItems();
    }
}

function csvEscape(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
}

function downloadCSV() {
    if (items.length === 0) {
        alert("No data available to download!");
        return;
    }

    const rows = [
        ["Item Name", "Category", "Amount (INR)"],
        ...items.map(item => [item.name, item.category, Number(item.amount) || 0])
    ];
    const csv = rows.map(row => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Expense_Report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

renderItems();
