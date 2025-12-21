// DOM Elements
const balance = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const form = document.getElementById("transaction-form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const list = document.getElementById("transaction-list");
const monthFilter = document.getElementById("monthFilter");
const alertBox = document.getElementById("alertBox");
const toggleBalanceBtn = document.getElementById("toggleBalance");
const themeToggle = document.getElementById("themeToggle");

const chartCanvas = document.getElementById("expenseChart");
const barChartCanvas = document.getElementById("barChart");

let expenseChart, barChart;

// Load transactions
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Hide category for income
category.style.display = type.value === "income" ? "none" : "block";
type.addEventListener("change", () => { category.style.display = type.value === "income" ? "none" : "block"; });

// Add transaction
form.addEventListener("submit", e => {
  e.preventDefault();
  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: type.value === "expense" ? -Math.abs(+amount.value) : +amount.value,
    category: category.value,
    date: new Date().toISOString()
  };
  transactions.push(transaction);
  saveAndInit();
  form.reset();
});

// Remove transaction
function removeTransaction(id) { transactions = transactions.filter(t => t.id !== id); saveAndInit(); }

// Filtered transactions by month
function getFilteredTransactions() {
  if (!monthFilter.value) return transactions;
  return transactions.filter(t => t.date.slice(0,7) === monthFilter.value);
}

// Init app
function init() {
  list.innerHTML = "";
  const data = getFilteredTransactions();

  data.forEach(t => {
    const li = document.createElement("li");
    li.className = t.amount < 0 ? "minus" : "plus";
    li.innerHTML = `
      ${t.text} <small>(${t.category})</small>
      <span>₦${Math.abs(t.amount)}</span>
      <button class="delete-btn" onclick="removeTransaction(${t.id})">x</button>
    `;
    list.appendChild(li);
  });

  updateValues(data);
  updateCharts(data);
  checkOverspending(data);
  applyBalanceVisibility();
}

// Update balance, income, expense
function updateValues(data) {
  const amounts = data.map(t => t.amount);
  const income = amounts.filter(a=>a>0).reduce((a,b)=>a+b,0);
  const expense = amounts.filter(a=>a<0).reduce((a,b)=>a+Math.abs(b),0);
  balance.innerText = `₦${(income-expense).toFixed(2)}`;
  incomeEl.innerText = `₦${income.toFixed(2)}`;
  expenseEl.innerText = `₦${expense.toFixed(2)}`;
}

// Update charts
function updateCharts(data) {
  const catData = {};
  data.forEach(t=>{ if(t.amount<0){ catData[t.category]=(catData[t.category]||0)+Math.abs(t.amount); } });
  if(expenseChart) expenseChart.destroy();
  expenseChart = new Chart(chartCanvas,{
    type:"pie",
    data:{labels:Object.keys(catData),datasets:[{data:Object.values(catData),backgroundColor:["#e74c3c","#3498db","#2ecc71","#f1c40f","#9b59b6","#95a5a6"]}]}
  });

  const income = data.filter(t=>t.amount>0).reduce((a,b)=>a+b.amount,0);
  const expense = data.filter(t=>t.amount<0).reduce((a,b)=>a+Math.abs(b.amount),0);
  if(barChart) barChart.destroy();
  barChart = new Chart(barChartCanvas,{
    type:"bar",
    data:{labels:["Income","Expense"],datasets:[{data:[income,expense],backgroundColor:["#2ecc71","#e74c3c"]}]}
  });
}

// Overspending alert
function checkOverspending(data){
  const income = data.filter(t=>t.amount>0).reduce((a,b)=>a+b.amount,0);
  const expense = data.filter(t=>t.amount<0).reduce((a,b)=>a+Math.abs(b.amount),0);
  if(expense > income && income > 0) { alertBox.classList.add("show"); }
  else { alertBox.classList.remove("show"); }
}

// Save to localStorage
function saveAndInit(){ localStorage.setItem("transactions",JSON.stringify(transactions)); init(); }

// Hide/show balance
toggleBalanceBtn.onclick=()=>{
  const hidden = localStorage.getItem("hideBalance")==="true";
  localStorage.setItem("hideBalance",!hidden);
  init();
};
function applyBalanceVisibility(){
  const label = toggleBalanceBtn.querySelector(".label");
  if(localStorage.getItem("hideBalance")==="true"){
    balance.innerText="****"; incomeEl.innerText="****"; expenseEl.innerText="****"; label.innerText="Show Balance";
  } else { label.innerText="Hide Balance"; }
}

// Dark mode
themeToggle.onclick=()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark")?"dark":"light");
};
if(localStorage.getItem("theme")==="dark") document.body.classList.add("dark");

// Month filter
monthFilter.addEventListener("change",init);

// Initialize
init();
