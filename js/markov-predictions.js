/**
 * =================================================================
 * MARKOV PREDICTIONS - TOPC DASHBOARD
 * =================================================================
 * Adapted for dark theme and trading context
 * =================================================================
 */

// --- 1. STATE AND CONSTANTS ---
const LOG_STORAGE_KEY = "topc_markov_predictions_v1";
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_RANGES = [
  { name: "Morning", start: 5, end: 11 },
  { name: "Afternoon", start: 12, end: 16 },
  { name: "Evening", start: 17, end: 20 },
  { name: "Night", start: 21, end: 4 },
];

// Centralized state management for chart instances
const chartState = {
  daily: null,
  hourly: null,
  giftDay: null,
  tributeDay: null,
  timeRange: null,
  predGiftDay: null,
  predGiftTime: null,
  predTributeDay: null,
  predTributeTime: null,
};

// --- 2. DOM ELEMENT REFERENCES ---
const UIElements = {
  logEntries: document.getElementById("logEntries"),
  emptyState: document.getElementById("emptyState"),
  editingId: document.getElementById("editing-id"),
  description: document.getElementById("logDescription"),
  dateTime: document.getElementById("logDateTime"),
  submitButton: document.getElementById("submit-button"),
  cancelButton: document.getElementById("cancel-edit-button"),
  tabs: document.querySelectorAll(".stats-tab"),
  modal: document.getElementById("modal"),
  modalBody: document.getElementById("modal-body"),
  modalClose: document.getElementById("modal-close-button"),
  csvImportInput: document.getElementById("csv-import-input"),
  csvExportBtn: document.getElementById("csv-export-btn"),
  prob: {
    generalGrid: document.getElementById("general-prob-grid"),
    dayGrid: document.getElementById("day-prob-grid"),
    giftTimeGrid: document.getElementById("gift-timerange-grid"),
    tributeTimeGrid: document.getElementById("tribute-timerange-grid"),
  },
  markov: {
    info: document.getElementById("markov-info"),
    typeContainer: document.getElementById("markov-type-container"),
    giftSection: document.getElementById("markov-gift-prediction-section"),
    tributeSection: document.getElementById("markov-tribute-prediction-section"),
  },
};

// --- 3. EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", initialize);
UIElements.submitButton.addEventListener("click", handleSubmit);
UIElements.cancelButton.addEventListener("click", cancelEdit);
UIElements.modalClose.addEventListener("click", closeModal);
UIElements.csvImportInput.addEventListener("change", handleCsvImport);
if (UIElements.csvExportBtn) {
  UIElements.csvExportBtn.addEventListener("click", exportEntriesToCSV);
}
const deleteAllBtn = document.getElementById('delete-all-btn');
if (deleteAllBtn) {
  deleteAllBtn.addEventListener("click", () => {
    showConfirmation(
      'Delete All Entries?',
      'This action cannot be undone. All your trade history will be permanently deleted.',
      () => {
        saveEntriesToStorage([]);
        render();
      }
    );
  });
}
UIElements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.id.replace("tab-", "");
    updateAndDrawCharts(filter);
  });
});

// --- 4. DATE & TIME UTILITY FUNCTIONS ---
function formatDateTime(dateInput) {
  if (!dateInput) return "";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const pad = (num) => String(num).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function parseDisplayDateTime(dateTimeString) {
  if (!dateTimeString) return null;
  const match = dateTimeString.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/
  );
  if (!match) return null;

  const [, day, month, year, hours, minutes, seconds] = match.map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, seconds);

  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * Parse various date formats for CSV import
 */
function parseDateString(dateStr) {
  if (!dateStr) return null;
  
  // Try DD/MM/YYYY HH:MM:SS format first
  let parsed = parseDisplayDateTime(dateStr);
  if (parsed) return parsed;
  
  // Try DD/MM/YYYY HH:MM format (without seconds)
  const ddmmyyyyHHMMMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2})$/);
  if (ddmmyyyyHHMMMatch) {
    const [, day, month, year, hours, minutes] = ddmmyyyyHHMMMatch.map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, 0); // Seconds default to 0
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try ISO format
  parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  
  // Try DD/MM/YYYY format (without time)
  const ddmmyyyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch.map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0); // Default to noon
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
}

// --- 5. INITIALIZATION ---
function initialize() {
  setDefaultDateTime();
  render();
}

function setDefaultDateTime() {
  UIElements.dateTime.value = formatDateTime(new Date());
}

// --- 6. CORE LOGIC & DATA HANDLING ---
function handleSubmit() {
  const id = UIElements.editingId.value;
  const description = UIElements.description.value.trim();
  const dateTimeString = UIElements.dateTime.value.trim();

  if (!description || !dateTimeString) {
    showAlert("Please fill in all fields.");
    return;
  }

  const dateObject = parseDisplayDateTime(dateTimeString);
  if (!dateObject) {
    showAlert(
      "Invalid date/time format. Please use DD/MM/YYYY HH:MM:SS (e.g., 09/11/2025 14:30:00)."
    );
    return;
  }

  const type = document.querySelector('input[name="logType"]:checked').value;
  let entries = getEntriesFromStorage();
  const entryData = {
    type,
    description,
    datetime: dateObject.toISOString(),
    id: id || Date.now().toString(),
  };

  if (id) {
    const index = entries.findIndex((e) => e.id === id);
    if (index !== -1) entries[index] = entryData;
  } else {
    entries.push(entryData);
  }

  saveEntriesToStorage(entries);
  render();
  exitEditMode();
  showSubmitSuccess();
}

function deleteEntry(id) {
  showConfirmation(
    "Delete Entry?",
    "Are you sure you want to permanently delete this log entry? This action cannot be undone.",
    () => {
      let entries = getEntriesFromStorage();
      entries = entries.filter((e) => e.id !== id);
      saveEntriesToStorage(entries);
      render();
      closeModal();
    }
  );
}

function enterEditMode(id) {
  console.log('enterEditMode called with id:', id);
  const entry = getEntriesFromStorage().find((e) => e.id === id);
  console.log('Found entry:', entry);
  if (entry) {
    UIElements.editingId.value = entry.id;
    UIElements.description.value = entry.description;
    UIElements.dateTime.value = formatDateTime(entry.datetime);
    document.querySelector(
      `input[name="logType"][value="${entry.type}"]`
    ).checked = true;
    UIElements.submitButton.querySelector("span").textContent = "Update Entry";
    UIElements.submitButton
      .querySelector("i")
      .className = "fas fa-save";
    UIElements.cancelButton.classList.remove("hidden");
    
    // Scroll to top of page to show the form
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Highlight the description field
    UIElements.description.focus();
  } else {
    console.error('Entry not found for id:', id);
  }
}

function cancelEdit() {
  exitEditMode();
}

function exitEditMode() {
  UIElements.editingId.value = "";
  UIElements.description.value = "";
  setDefaultDateTime();
  document.querySelector('input[name="logType"][value="received"]').checked =
    true;
  UIElements.submitButton.querySelector("span").textContent = "Add to Log";
  UIElements.submitButton
    .querySelector("i")
    .className = "fas fa-plus-circle";
  UIElements.cancelButton.classList.add("hidden");
}

function showSubmitSuccess() {
  UIElements.submitButton.classList.add("is-success");
  UIElements.submitButton.querySelector("span").textContent = "Saved!";
  UIElements.submitButton
    .querySelector("i")
    .className = "fas fa-check-circle";

  setTimeout(() => {
    UIElements.submitButton.classList.remove("is-success");
    UIElements.submitButton.querySelector("span").textContent = "Add to Log";
    UIElements.submitButton
      .querySelector("i")
      .className = "fas fa-plus-circle";
  }, 2000);
}

// --- 7. STORAGE FUNCTIONS ---
function getEntriesFromStorage() {
  return JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || "[]");
}

function saveEntriesToStorage(entries) {
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries));
}

// --- 8. MODAL & UI FEEDBACK ---
function showConfirmation(title, message, onConfirm) {
  UIElements.modalBody.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
    <div class="modal-actions">
      <button class="modal-button modal-button-cancel">Cancel</button>
      <button class="modal-button modal-button-confirm">Confirm</button>
    </div>
  `;
  const confirmBtn = UIElements.modalBody.querySelector(
    ".modal-button-confirm"
  );
  const cancelBtn = UIElements.modalBody.querySelector(
    ".modal-button-cancel"
  );
  confirmBtn.onclick = () => {
    onConfirm();
    closeModal();
  };
  cancelBtn.onclick = closeModal;
  UIElements.modal.classList.remove("hidden");
}

function showAlert(message) {
  UIElements.modalBody.innerHTML = `
    <h3>Alert</h3>
    <p>${message}</p>
    <div class="modal-actions">
      <button class="modal-button modal-button-ok">OK</button>
    </div>
  `;
  UIElements.modalBody.querySelector(".modal-button-ok").onclick = closeModal;
  UIElements.modal.classList.remove("hidden");
}

function showDetailsModal(id) {
  const entry = getEntriesFromStorage().find((e) => e.id === id);
  if (entry) {
    const formattedDateTime = formatDateTime(entry.datetime);
    const typeLabel = entry.type === "received" ? "Win Event" : "Loss Event";
    UIElements.modalBody.innerHTML = `
      <h3>Event Details</h3>
      <p class="modal-description"><strong>${typeLabel}</strong></p>
      <p><strong>Description:</strong><br>${entry.description}</p>
      <p><strong>Date & Time:</strong><br>${formattedDateTime}</p>
      <div class="modal-actions">
        <button class="modal-button modal-button-ok">Close</button>
      </div>
    `;
    UIElements.modalBody.querySelector(".modal-button-ok").onclick =
      closeModal;
    UIElements.modal.classList.remove("hidden");
  }
}

function showConfirmModal(title, message, onConfirm) {
  const confirmModal = document.getElementById('confirm-modal');
  const confirmTitle = document.getElementById('confirm-title');
  const confirmMessage = document.getElementById('confirm-message');
  const confirmOk = document.getElementById('confirm-ok');
  const confirmCancel = document.getElementById('confirm-cancel');
  
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  
  const handleConfirm = () => {
    confirmModal.classList.add('hidden');
    onConfirm();
    cleanup();
  };
  
  const handleCancel = () => {
    confirmModal.classList.add('hidden');
    cleanup();
  };
  
  const cleanup = () => {
    confirmOk.removeEventListener('click', handleConfirm);
    confirmCancel.removeEventListener('click', handleCancel);
  };
  
  confirmOk.addEventListener('click', handleConfirm);
  confirmCancel.addEventListener('click', handleCancel);
  
  confirmModal.classList.remove('hidden');
}

function showNotification(message, type = 'info') {
  // You can implement a toast notification here if needed
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function closeModal() {
  UIElements.modal.classList.add("hidden");
  UIElements.modalBody.innerHTML = "";
}

// --- 9. RENDERING ---
function render() {
  const entries = getEntriesFromStorage();
  const activeFilter =
    document.querySelector(".stats-tab.active")?.id.replace("tab-", "") ||
    "all";

  renderLogEntries(entries);
  updateAndDrawCharts(activeFilter);
  updateProbabilities(entries);
  updateMarkovPredictions(entries);
}

function renderLogEntries(entries) {
  UIElements.logEntries.innerHTML = "";
  if (entries.length === 0) {
    UIElements.logEntries.appendChild(UIElements.emptyState);
  } else {
    UIElements.emptyState.remove();
    entries
      .slice()
      .reverse()
      .forEach((entry) => {
        UIElements.logEntries.appendChild(createEntryElement(entry));
      });
  }
}

function createEntryElement(entry) {
  const formattedDateTime = formatDateTime(entry.datetime);
  const isGift = entry.type === "received";
  const div = document.createElement("div");
  div.className = "log-entry";
  const iconContainer = document.createElement("div");
  iconContainer.className = `log-entry-icon ${
    isGift ? "bg-green-500" : "bg-red-500"
  }`;
  iconContainer.innerHTML = `<i class="fas ${
    isGift ? "fa-gift" : "fa-receipt"
  }"></i>`;
  const contentDiv = document.createElement("div");
  contentDiv.className = "flex-grow";
  contentDiv.innerHTML = `<p class="description">${entry.description}</p><p class="date-time">${formattedDateTime}</p>`;
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "log-entry-actions";
  const viewButton = document.createElement("button");
  viewButton.className = "action-button view-button";
  viewButton.title = "View Details";
  viewButton.innerHTML = '<i class="fas fa-eye"></i>';
  viewButton.onclick = () => showDetailsModal(entry.id);
  const editButton = document.createElement("button");
  editButton.className = "action-button edit-button";
  editButton.title = "Edit Entry";
  editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
  editButton.onclick = () => enterEditMode(entry.id);
  const deleteButton = document.createElement("button");
  deleteButton.className = "action-button delete-button";
  deleteButton.title = "Delete Entry";
  deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
  deleteButton.onclick = () => deleteEntry(entry.id);
  actionsDiv.append(viewButton, editButton, deleteButton);
  div.append(iconContainer, contentDiv, actionsDiv);
  return div;
}

// --- 10. MARKOV CHAIN PREDICTION LOGIC ---
function updateMarkovPredictions(entries) {
  const { info, typeContainer, giftSection, tributeSection } =
    UIElements.markov;

  const clearUI = () => {
    if (typeContainer) typeContainer.innerHTML = "";
    if (giftSection) giftSection.innerHTML = "";
    if (tributeSection) tributeSection.innerHTML = "";
    if (info)
      info.textContent =
        "Add at least 2 entries to see Markov chain predictions.";
  };

  if (!typeContainer || !giftSection || !tributeSection || !info) return;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.datetime) - new Date(b.datetime)
  );

  if (sortedEntries.length < 2) {
    clearUI();
    return;
  }

  const lastState = sortedEntries[sortedEntries.length - 1].type;
  const lastStateText = lastState === "received" ? "Win" : "Loss";
  info.textContent = `Based on the last entry (a ${lastStateText}), here are the predicted probabilities for the next event:`;

  const typeMatrix = { [lastState]: { received: 0, paid: 0, total: 0 } };
  const timelineMatrix = {
    received: {
      day: Array(7).fill(0),
      time: Array(TIME_RANGES.length).fill(0),
      total: 0,
    },
    paid: {
      day: Array(7).fill(0),
      time: Array(TIME_RANGES.length).fill(0),
      total: 0,
    },
  };

  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const current = sortedEntries[i];
    const next = sortedEntries[i + 1];
    const currentType = current.type;
    const nextType = next.type;

    if (!typeMatrix[currentType]) {
      typeMatrix[currentType] = { received: 0, paid: 0, total: 0 };
    }
    typeMatrix[currentType][nextType]++;
    typeMatrix[currentType].total++;

    const nextDate = new Date(next.datetime);
    const dayIndex = nextDate.getDay();
    const hour = nextDate.getHours();
    let timeRangeIndex = 0;
    for (let t = 0; t < TIME_RANGES.length; t++) {
      const range = TIME_RANGES[t];
      if (range.start <= range.end) {
        if (hour >= range.start && hour <= range.end) {
          timeRangeIndex = t;
          break;
        }
      } else {
        if (hour >= range.start || hour <= range.end) {
          timeRangeIndex = t;
          break;
        }
      }
    }

    timelineMatrix[nextType].day[dayIndex]++;
    timelineMatrix[nextType].time[timeRangeIndex]++;
    timelineMatrix[nextType].total++;
  }

  renderTypePrediction(typeMatrix[lastState], typeContainer);
  renderTimelinePrediction(
    "received",
    timelineMatrix.received,
    giftSection
  );
  renderTimelinePrediction("paid", timelineMatrix.paid, tributeSection);
}

function renderTypePrediction(data, container) {
  if (!data || data.total === 0) {
    container.innerHTML = '<p class="text-slate-400">No data available.</p>';
    return;
  }
  const probGift = (data.received / data.total) * 100;
  container.innerHTML = `
      <div class="markov-card gift"><div class="value">${probGift.toFixed(
        0
      )}%</div><div class="label">Next is a Win</div></div>
      <div class="markov-card tribute"><div class="value">${(
        100 - probGift
      ).toFixed(
        0
      )}%</div><div class="label">Next is a Loss</div></div>`;
}

function renderTimelinePrediction(type, data, container) {
  const title = type === "received" ? "Win" : "Loss";
  const icon = type === "received" ? "fa-gift" : "fa-receipt";
  const iconClass = type === "received" ? "icon-gift" : "icon-tribute";
  if (data.total === 0) {
    container.innerHTML = `<p class="text-slate-400">No ${title.toLowerCase()} events recorded yet.</p>`;
    return;
  }
  const busiestDayIndex = data.day.indexOf(Math.max(...data.day));
  const busiestDayProb = (data.day[busiestDayIndex] / data.total) * 100;
  const busiestTimeIndex = data.time.indexOf(Math.max(...data.time));
  const busiestTimeProb =
    (data.time[busiestTimeIndex] / data.total) * 100;

  container.innerHTML = `
      <h3 class="prediction-title"><i class="fas ${icon} ${iconClass}"></i>Predictions for next ${title}</h3>
      <div class="prediction-grid">
          <div class="prediction-card">
              <div>
                  <h4 class="prediction-card-title">Most Likely Day</h4>
                  <p class="prediction-card-result">${
                    DAY_NAMES[busiestDayIndex]
                  }</p>
                  <p class="prediction-card-prob">${busiestDayProb.toFixed(
                    0
                  )}% probability</p>
              </div>
              <div class="prediction-chart-container"><canvas id="pred-${type}-day-chart"></canvas></div>
          </div>
          <div class="prediction-card">
              <div>
                  <h4 class="prediction-card-title">Most Likely Time of Day</h4>
                  <p class="prediction-card-result">${
                    TIME_RANGES[busiestTimeIndex].name
                  }</p>
                  <p class="prediction-card-prob">${busiestTimeProb.toFixed(
                    0
                  )}% probability</p>
              </div>
              <div class="prediction-chart-container"><canvas id="pred-${type}-time-chart"></canvas></div>
          </div>
      </div>`;
  drawPredictionDayChart(type, data.day);
  drawPredictionTimeRangeChart(type, data.time);
}

// --- 11. CHARTING FUNCTIONS ---
function createOrUpdateChart(chartName, elementId, config) {
  if (chartState[chartName]) {
    chartState[chartName].destroy();
  }
  const ctx = document.getElementById(elementId)?.getContext("2d");
  if (ctx) {
    chartState[chartName] = new Chart(ctx, config);
  }
}

function drawPredictionDayChart(type, dayData) {
  createOrUpdateChart(
    `pred${type.charAt(0).toUpperCase() + type.slice(1)}Day`,
    `pred-${type}-day-chart`,
    {
      type: "bar",
      data: {
        labels: ["S", "M", "T", "W", "T", "F", "S"],
        datasets: [
          {
            label: `Daily Prob.`,
            data: dayData,
            backgroundColor:
              type === "received"
                ? "rgba(34, 197, 94, 0.6)"
                : "rgba(239, 68, 68, 0.6)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
        },
        scales: { 
          y: { 
            beginAtZero: true, 
            ticks: { 
              precision: 0,
              color: '#94a3b8'
            },
            grid: {
              color: '#334155'
            }
          },
          x: {
            ticks: {
              color: '#94a3b8'
            },
            grid: {
              color: '#334155'
            }
          }
        },
      },
    }
  );
}

function drawPredictionTimeRangeChart(type, timeData) {
  createOrUpdateChart(
    `pred${type.charAt(0).toUpperCase() + type.slice(1)}Time`,
    `pred-${type}-time-chart`,
    {
      type: "doughnut",
      data: {
        labels: TIME_RANGES.map((r) => r.name),
        datasets: [
          {
            data: timeData,
            backgroundColor:
              type === "received"
                ? ["#4ade80", "#22c55e", "#16a34a", "#15803d"]
                : ["#fca5a5", "#f87171", "#ef4444", "#dc2626"],
            borderColor: "#1e293b",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: "bottom", 
            labels: { 
              boxWidth: 12,
              color: '#94a3b8'
            } 
          },
        },
      },
    }
  );
}

function updateAndDrawCharts(filter = "all") {
  UIElements.tabs.forEach((tab) => tab.classList.remove("active"));
  document.getElementById(`tab-${filter}`).classList.add("active");

  const allEntries = getEntriesFromStorage();
  const entries =
    filter === "all"
      ? allEntries
      : allEntries.filter((e) => e.type === filter);

  const dailyCounts = Array(7).fill(0);
  const hourlyCounts = Array(24).fill(0);

  for (const entry of entries) {
    const d = new Date(entry.datetime);
    if (!isNaN(d.getTime())) {
      dailyCounts[d.getDay()]++;
      hourlyCounts[d.getHours()]++;
    }
  }
  drawDailyChart(dailyCounts);
  drawHourlyChart(hourlyCounts);
}

function drawDailyChart(data) {
  createOrUpdateChart("daily", "daily-chart", {
    type: "bar",
    data: {
      labels: DAY_NAMES.map((d) => d.slice(0, 3)),
      datasets: [
        {
          label: "Events",
          data: data,
          backgroundColor: "rgba(99, 102, 241, 0.6)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Events by Day of Week",
          color: '#e2e8f0',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#94a3b8' },
          grid: { color: '#334155' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: '#334155' }
        }
      },
    },
  });
}

function drawHourlyChart(data) {
  createOrUpdateChart("hourly", "hourly-chart", {
    type: "line",
    data: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: "Events",
          data: data,
          backgroundColor: "rgba(245, 158, 11, 0.2)",
          borderColor: "rgba(245, 158, 11, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Events by Hour of Day",
          color: '#e2e8f0',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#94a3b8' },
          grid: { color: '#334155' }
        },
        x: {
          ticks: { 
            maxTicksLimit: 12,
            color: '#94a3b8'
          },
          grid: { color: '#334155' }
        }
      },
    },
  });
}

function updateProbabilities(entries) {
  const gifts = entries.filter((e) => e.type === "received");
  const tributes = entries.filter((e) => e.type === "paid");
  populateTextProbabilities(entries, gifts, tributes);
  drawGiftDayChart(entries);
  drawTributeDayChart(entries);
  drawTimeRangeChart(entries);
}

function populateTextProbabilities(entries, gifts, tributes) {
  const total = entries.length;
  UIElements.prob.generalGrid.innerHTML = `
    <div class="prob-card"><div class="value">${total}</div><div class="label">Total Events</div></div>
    <div class="prob-card"><div class="value">${gifts.length}</div><div class="label">Wins</div></div>
    <div class="prob-card"><div class="value">${tributes.length}</div><div class="label">Losses</div></div>
  `;

  if (total === 0) {
    UIElements.prob.dayGrid.innerHTML =
      '<p class="text-slate-400">No data yet.</p>';
    UIElements.prob.giftTimeGrid.innerHTML =
      '<p class="text-slate-400">No data yet.</p>';
    UIElements.prob.tributeTimeGrid.innerHTML =
      '<p class="text-slate-400">No data yet.</p>';
    return;
  }

  const giftDayCounts = Array(7).fill(0);
  const tributeDayCounts = Array(7).fill(0);
  gifts.forEach((e) => {
    const d = new Date(e.datetime);
    if (!isNaN(d.getTime())) giftDayCounts[d.getDay()]++;
  });
  tributes.forEach((e) => {
    const d = new Date(e.datetime);
    if (!isNaN(d.getTime())) tributeDayCounts[d.getDay()]++;
  });
  const maxGiftDayIndex = giftDayCounts.indexOf(Math.max(...giftDayCounts));
  const maxTributeDayIndex = tributeDayCounts.indexOf(
    Math.max(...tributeDayCounts)
  );
  UIElements.prob.dayGrid.innerHTML = `
    <div class="prob-card"><div class="value">${DAY_NAMES[maxGiftDayIndex]}</div><div class="label">Wins</div></div>
    <div class="prob-card"><div class="value">${DAY_NAMES[maxTributeDayIndex]}</div><div class="label">Losses</div></div>
  `;

  const giftTimeCounts = Array(TIME_RANGES.length).fill(0);
  const tributeTimeCounts = Array(TIME_RANGES.length).fill(0);
  gifts.forEach((e) => {
    const d = new Date(e.datetime);
    if (!isNaN(d.getTime())) {
      const hour = d.getHours();
      for (let i = 0; i < TIME_RANGES.length; i++) {
        const range = TIME_RANGES[i];
        if (range.start <= range.end) {
          if (hour >= range.start && hour <= range.end) {
            giftTimeCounts[i]++;
            break;
          }
        } else {
          if (hour >= range.start || hour <= range.end) {
            giftTimeCounts[i]++;
            break;
          }
        }
      }
    }
  });
  tributes.forEach((e) => {
    const d = new Date(e.datetime);
    if (!isNaN(d.getTime())) {
      const hour = d.getHours();
      for (let i = 0; i < TIME_RANGES.length; i++) {
        const range = TIME_RANGES[i];
        if (range.start <= range.end) {
          if (hour >= range.start && hour <= range.end) {
            tributeTimeCounts[i]++;
            break;
          }
        } else {
          if (hour >= range.start || hour <= range.end) {
            tributeTimeCounts[i]++;
            break;
          }
        }
      }
    }
  });

  UIElements.prob.giftTimeGrid.innerHTML = TIME_RANGES.map(
    (r, i) =>
      `<div class="prob-card"><div class="value">${giftTimeCounts[i]}</div><div class="label">${r.name}</div></div>`
  ).join("");
  UIElements.prob.tributeTimeGrid.innerHTML = TIME_RANGES.map(
    (r, i) =>
      `<div class="prob-card"><div class="value">${tributeTimeCounts[i]}</div><div class="label">${r.name}</div></div>`
  ).join("");
}

function drawGiftDayChart(entries) {
  const gifts = entries.filter((e) => e.type === "received");
  const counts = Array(7).fill(0);
  gifts.forEach((e) => {
    const d = new Date(e.datetime);
    if (!isNaN(d.getTime())) counts[d.getDay()]++;
  });
  createOrUpdateChart("giftDay", "gift-day-chart", {
    type: "bar",
    data: {
      labels: DAY_NAMES.map((d) => d.slice(0, 3)),
      datasets: [
        {
          label: "Wins",
          data: counts,
          backgroundColor: "rgba(34, 197, 94, 0.6)",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Wins by Day", color: '#e2e8f0' },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0, color: '#94a3b8' }, grid: { color: '#334155' } },
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
      },
    },
  });
}

function drawTributeDayChart(entries) {
  const tributes = entries.filter((e) => e.type === "paid");
  const counts = Array(7).fill(0);
  tributes.forEach((e) => {
    const d = new Date(e.datetime);
    if (!isNaN(d.getTime())) counts[d.getDay()]++;
  });
  createOrUpdateChart("tributeDay", "tribute-day-chart", {
    type: "bar",
    data: {
      labels: DAY_NAMES.map((d) => d.slice(0, 3)),
      datasets: [
        {
          label: "Losses",
          data: counts,
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Losses by Day", color: '#e2e8f0' },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0, color: '#94a3b8' }, grid: { color: '#334155' } },
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
      },
    },
  });
}

function drawTimeRangeChart(entries) {
  const timeCounts = Array(TIME_RANGES.length).fill(0);
  entries.forEach((e) => {
    const d = new Date(e.datetime);
    if (!isNaN(d.getTime())) {
      const hour = d.getHours();
      for (let i = 0; i < TIME_RANGES.length; i++) {
        const range = TIME_RANGES[i];
        if (range.start <= range.end) {
          if (hour >= range.start && hour <= range.end) {
            timeCounts[i]++;
            break;
          }
        } else {
          if (hour >= range.start || hour <= range.end) {
            timeCounts[i]++;
            break;
          }
        }
      }
    }
  });
  createOrUpdateChart("timeRange", "timerange-chart", {
    type: "doughnut",
    data: {
      labels: TIME_RANGES.map((r) => r.name),
      datasets: [
        {
          data: timeCounts,
          backgroundColor: [
            "#4ade80",
            "#fbbf24",
            "#f97316",
            "#6366f1",
          ],
          borderColor: "#1e293b",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: "bottom", 
          labels: { 
            boxWidth: 12,
            color: '#94a3b8'
          } 
        },
        title: { display: true, text: "Events by Time of Day", color: '#e2e8f0' },
      },
    },
  });
}

// --- 12. CSV IMPORT ---
function handleCsvImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const csvString = event.target.result;
    processCsvData(csvString);
  };
  reader.readAsText(file);
}

function processCsvData(csvString) {
  const newEntries = [];
  let errors = 0;
  const lines = csvString.split(/\r?\n/);
  
  if (lines.length < 2) {
    showAlert("CSV file is empty or invalid.");
    UIElements.csvImportInput.value = "";
    return;
  }

  // Expected format: Date, Asset, P&L, Risk(1R), Outcome, Tags
  console.log('Importing trades from CSV...');

  // Skip header row (line 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(",").map((c) => c.trim().replace(/"/g, ""));

    // Trading CSV format: Date, Asset, P&L, Risk(1R), Outcome, Tags
    if (columns.length < 3) {
      errors++;
      console.warn(`Skipping row ${i + 1}: Not enough columns.`);
      continue;
    }

    const dateStr = columns[0].trim();
    const asset = columns[1].trim();
    const pnLStr = columns[2].trim();
    const riskStr = columns.length > 3 ? columns[3].trim() : "";
    const outcome = columns.length > 4 ? columns[4].trim() : "";
    const tags = columns.length > 5 ? columns[5].trim() : "";

    // Parse date
    const dateObject = parseDateString(dateStr);
    if (!dateObject) {
      errors++;
      console.warn(`Skipping row ${i + 1}: Invalid date format '${dateStr}'.`);
      continue;
    }

    // Parse P&L
    const pnL = parseFloat(pnLStr);
    if (isNaN(pnL)) {
      errors++;
      console.warn(`Skipping row ${i + 1}: Invalid P&L value '${pnLStr}'.`);
      continue;
    }

    // Skip breakeven trades (P&L = 0)
    if (pnL === 0) {
      errors++;
      console.warn(`Skipping row ${i + 1}: Breakeven trade (P&L = 0).`);
      continue;
    }

    // Determine type based on P&L or Outcome
    let type;
    if (outcome.toLowerCase() === "win" || pnL > 0) {
      type = "received"; // Win = received
    } else if (outcome.toLowerCase() === "loss" || pnL < 0) {
      type = "paid"; // Loss = paid
    } else {
      errors++;
      console.warn(`Skipping row ${i + 1}: Cannot determine win/loss.`);
      continue;
    }

    // Create description with trade details
    const riskInfo = riskStr ? ` | Risk: ${riskStr}R` : '';
    const tagInfo = tags ? ` | Tags: ${tags}` : '';
    const description = `${asset} - £${pnL.toFixed(2)}${riskInfo}${tagInfo}`;

    newEntries.push({
      type,
      description,
      datetime: dateObject.toISOString(),
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      tradeData: {
        asset: asset,
        pnL: pnL,
        risk: riskStr,
        outcome: outcome || (pnL > 0 ? "Win" : "Loss"),
        tags: tags
      }
    });
  }

  // Save imported entries
  if (newEntries.length > 0) {
    const entries = getEntriesFromStorage();
    entries.push(...newEntries);
    saveEntriesToStorage(entries);
    render();
    
    showAlert(
      `Import complete! Added ${newEntries.length} ${newEntries.length === 1 ? 'trade' : 'trades'}. Skipped ${errors} ${errors === 1 ? 'row' : 'rows'}.`
    );
  } else {
    showAlert(
      `Import failed. Added 0 trades. Skipped ${errors} ${errors === 1 ? 'row' : 'rows'}.\n\nExpected CSV format:\nDate, Asset, P&L, Risk(1R), Outcome, Tags\n\nExample:\n09/11/2025 14:30:00,GBPUSD,150.00,1.5,Win,London Session`
    );
  }
  
  // Reset file input
  UIElements.csvImportInput.value = "";
}

// --- 13. CSV EXPORT ---
function exportEntriesToCSV() {
  const entries = getEntriesFromStorage();
  
  if (entries.length === 0) {
    showAlert("No entries to export. Add some entries first.");
    return;
  }

  // Create CSV header matching trading format
  const header = "Date,Asset,P&L,Risk(1R),Outcome,Tags\n";

  // Create CSV rows - convert events back to trading format
  const rows = entries
    .map((entry) => {
      const dateTime = formatDateTime(entry.datetime);
      const outcome = entry.type === "received" ? "Win" : "Loss";
      
      let asset = "Trade";
      let pnL = "0.00";
      let risk = "";
      let tags = "";
      
      // Use stored tradeData if available (new format)
      if (entry.tradeData) {
        asset = entry.tradeData.asset || asset;
        pnL = entry.tradeData.pnL !== undefined ? entry.tradeData.pnL.toString() : pnL;
        risk = entry.tradeData.risk || risk;
        tags = entry.tradeData.tags || tags;
      } else {
        // Fallback to regex extraction for old entries without tradeData
        const desc = entry.description;
        
        const assetMatch = desc.match(/^([^-]+)\s*-/);
        if (assetMatch) asset = assetMatch[1].trim();
        
        const pnlMatch = desc.match(/£([-\d.]+)/);
        if (pnlMatch) pnL = pnlMatch[1];
        
        const riskMatch = desc.match(/Risk:\s*([\d.]+)R/);
        if (riskMatch) risk = riskMatch[1];
        
        const tagsMatch = desc.match(/Tags:\s*(.+)$/);
        if (tagsMatch) tags = tagsMatch[1].trim();
      }
      
      return `${dateTime},${asset},${pnL},${risk},${outcome},${tags}`;
    })
    .join("\n");

  const csvContent = header + rows;

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `trades_export_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showAlert(`Exported ${entries.length} ${entries.length === 1 ? 'trade' : 'trades'} to CSV!`);
}
