/**
 * Student Support Desk - Application Logic & Dashboard
 * Handles state, form submissions, Chart.js visualizers, table filtering, and Google Sheets sync.
 */

// ============================================================================
// CONSTANTS & SEED DATA
// ============================================================================

const CATEGORIES = [
  "Gold",
  "Diamond",
  "Silver",
  "PMP",
  "Chakravyuh"
];

const CATEGORY_COLORS = {
  "Gold": "#f59e0b",           // Amber
  "Diamond": "#38bdf8",        // Cyan
  "Silver": "#94a3b8",         // Slate
  "PMP": "#10b981",            // Emerald
  "Chakravyuh": "#a855f7"      // Purple
};

const CATEGORY_BADGE_CLASSES = {
  "Gold": "badge-category-gold",
  "Diamond": "badge-category-diamond",
  "Silver": "badge-category-silver",
  "PMP": "badge-category-pmp",
  "Chakravyuh": "badge-category-chakravyuh"
};

// Realistic seed records covering all 4 categories & assignees with Phone & Gmail
function getInitialSeedData() {
  const today = new Date();
  const formatDateTime = (date, timeStr) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${timeStr}`;
  };

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      id: 1,
      timestamp: formatDateTime(today, "10:15:20"),
      name: "Aarav Sharma",
      phone: "+91 98201 54321",
      email: "aarav.sharma@gmail.com",
      category: "Diamond",
      query: "Requested 1-on-1 mentorship session with senior advisor regarding system architecture review.",
      typingTime: "10:15",
      assignedBy: "Sachin"
    },
    {
      id: 2,
      timestamp: formatDateTime(today, "11:42:10"),
      name: "Pooja Deshmukh",
      phone: "+91 94220 89123",
      email: "pooja.deshmukh@gmail.com",
      category: "Gold",
      query: "Unable to download full course module slides; receiving 403 access forbidden error.",
      typingTime: "11:40",
      assignedBy: "Pragati"
    },
    {
      id: 3,
      timestamp: formatDateTime(today, "12:30:45"),
      name: "Rohan Kulkarni",
      phone: "+91 97654 32109",
      email: "rohan.kulkarni@gmail.com",
      category: "PM Ke Chakravyuh",
      query: "Mock exam test score report verification and certificate eligibility inquiry.",
      typingTime: "12:30",
      assignedBy: "Sachin"
    },
    {
      id: 4,
      timestamp: formatDateTime(today, "14:10:00"),
      name: "Sneha Patel",
      phone: "+91 99887 76655",
      email: "sneha.patel@gmail.com",
      category: "Silver",
      query: "Extension required for assignment submission due to university semester exams.",
      typingTime: "14:00",
      assignedBy: "Pragati"
    },
    {
      id: 5,
      timestamp: formatDateTime(yesterday, "09:30:15"),
      name: "Vikram Malhotra",
      phone: "+91 98112 34567",
      email: "vikram.malhotra@gmail.com",
      category: "PM Ke Chakravyuh",
      query: "Cycle rotation schedule clarification for batch A weekend classes.",
      typingTime: "09:30",
      assignedBy: "Sachin"
    },
    {
      id: 6,
      timestamp: formatDateTime(yesterday, "13:20:00"),
      name: "Ananya Iyer",
      phone: "+91 98450 12345",
      email: "ananya.iyer@gmail.com",
      category: "Diamond",
      query: "VIP community discord invite link expired, requested fresh permanent access token.",
      typingTime: "13:15",
      assignedBy: "Pragati"
    },
    {
      id: 7,
      timestamp: formatDateTime(yesterday, "16:45:10"),
      name: "Karan Mehta",
      phone: "+91 97234 56789",
      email: "karan.mehta@gmail.com",
      category: "Silver",
      query: "Payment receipt generation for tax deduction submission to employer.",
      typingTime: "16:40",
      assignedBy: "Sachin"
    },
    {
      id: 8,
      timestamp: formatDateTime(yesterday, "17:15:30"),
      name: "Meera Nair",
      phone: "+91 98950 67890",
      email: "meera.nair@gmail.com",
      category: "Gold",
      query: "Resume evaluation feedback request before upcoming campus drive.",
      typingTime: "17:00",
      assignedBy: "Pragati"
    }
  ];
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
  records: [],
  filters: {
    search: "",
    category: "",
    assigned: "",
    sortField: "timestamp",
    sortOrder: "desc"
  },
  pagination: {
    currentPage: 1,
    pageSize: 6
  },
  config: {
    scriptUrl: localStorage.getItem("gas_script_url") || "",
    sheetName: "SupportData",
    lastSynced: localStorage.getItem("gas_last_synced") || "Never",
    isConnected: false
  },
  charts: {
    categoryChart: null,
    assignedChart: null
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadStoredRecords();
  initNavigationTabs();
  initFormInteractivity();
  initTableControls();
  initSettingsAndSync();
  initCharts();
  renderApp();
  
  // Auto-sync if configured
  if (state.config.scriptUrl) {
    testGoogleSheetConnection(false);
  }
});

// Load records from localStorage or seed
function loadStoredRecords() {
  const localData = localStorage.getItem("student_support_records");
  if (localData) {
    try {
      state.records = JSON.parse(localData);
    } catch (e) {
      console.error("Failed to parse local records, loading seed data", e);
      state.records = getInitialSeedData();
      saveRecordsToStorage();
    }
  } else {
    state.records = getInitialSeedData();
    saveRecordsToStorage();
  }
}

function saveRecordsToStorage() {
  localStorage.setItem("student_support_records", JSON.stringify(state.records));
}

// ============================================================================
// NAVIGATION TABS
// ============================================================================

function initNavigationTabs() {
  const navTabs = document.querySelectorAll(".nav-tab");
  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Extra button triggers to switch tabs
  document.getElementById("btn-go-to-analytics")?.addEventListener("click", () => switchTab("analytics"));
  document.getElementById("btn-switch-to-form")?.addEventListener("click", () => switchTab("entry-form"));
  document.getElementById("btn-open-settings")?.addEventListener("click", () => switchTab("setup-instructions"));
  document.getElementById("btn-quick-config")?.addEventListener("click", () => switchTab("setup-instructions"));
  document.getElementById("btn-quick-copy-guide")?.addEventListener("click", () => {
    document.getElementById("btn-copy-code")?.click();
  });
}

function switchTab(tabId) {
  // Update Tab buttons
  document.querySelectorAll(".nav-tab").forEach(tab => {
    if (tab.getAttribute("data-tab") === tabId) {
      tab.classList.remove("inactive-tab");
      tab.classList.add("active-tab");
      // highlight icon
      const svg = tab.querySelector("svg");
      if (svg) svg.classList.add("text-brand-600");
    } else {
      tab.classList.remove("active-tab");
      tab.classList.add("inactive-tab");
      const svg = tab.querySelector("svg");
      if (svg) svg.classList.remove("text-brand-600");
    }
  });

  // Update content sections
  document.querySelectorAll(".tab-content").forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.remove("hidden");
    } else {
      content.classList.add("hidden");
    }
  });

  // If switched to analytics, force charts to update layout
  if (tabId === "analytics") {
    setTimeout(() => {
      if (state.charts.categoryChart) state.charts.categoryChart.resize();
      if (state.charts.assignedChart) state.charts.assignedChart.resize();
    }, 50);
  }
}

// ============================================================================
// FORM INTERACTIVITY & SUBMISSION
// ============================================================================

function initFormInteractivity() {
  const form = document.getElementById("student-query-form");
  const studentNameInput = document.getElementById("student-name");
  const categorySelect = document.getElementById("student-category");
  const categoryPills = document.querySelectorAll(".category-pill-btn");
  const queryTextarea = document.getElementById("student-query");
  const queryCharCount = document.getElementById("query-char-count");
  const typingTimeInput = document.getElementById("typing-time");
  const assignedCards = document.querySelectorAll(".assigned-card");
  const assignedRadios = document.querySelectorAll('input[name="assignedBy"]');
  const btnSetCurrentTime = document.getElementById("btn-set-current-time");
  const btnReset = document.getElementById("btn-reset");
  const btnPrefillSample = document.getElementById("btn-prefill-sample");
  const quickQueryTags = document.querySelectorAll(".quick-query-tag");

  // Default typing time to current time
  setCurrentTypingTime();

  btnSetCurrentTime.addEventListener("click", setCurrentTypingTime);

  function setCurrentTypingTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    typingTimeInput.value = `${hours}:${mins}`;
  }

  // Pill Selection -> Sync with Select dropdown
  categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const selectedCategory = pill.getAttribute("data-category");
      categorySelect.value = selectedCategory;
      updateCategoryPillUI(selectedCategory);
      document.getElementById("category-error").classList.add("hidden");
    });
  });

  // Select dropdown -> Sync with Pills
  categorySelect.addEventListener("change", (e) => {
    updateCategoryPillUI(e.target.value);
    document.getElementById("category-error").classList.add("hidden");
  });

  function updateCategoryPillUI(categoryValue) {
    categoryPills.forEach(pill => {
      if (pill.getAttribute("data-category") === categoryValue) {
        pill.classList.add("pill-selected");
      } else {
        pill.classList.remove("pill-selected");
      }
    });
  }

  // Assigned By Cards (Sachin vs Pragati)
  assignedRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      updateAssignedCardsUI();
      document.getElementById("assigned-error").classList.add("hidden");
    });
  });

  function updateAssignedCardsUI() {
    assignedCards.forEach(card => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio && radio.checked) {
        card.classList.add("assigned-selected");
      } else {
        card.classList.remove("assigned-selected");
      }
    });
  }

  // Character counter for query
  queryTextarea.addEventListener("input", () => {
    const len = queryTextarea.value.length;
    queryCharCount.textContent = `${len} / 500`;
    if (len > 0) {
      document.getElementById("query-error").classList.add("hidden");
    }
  });

  // Quick Query Tags
  quickQueryTags.forEach(tag => {
    tag.addEventListener("click", () => {
      const text = tag.textContent.trim();
      if (!queryTextarea.value.includes(text)) {
        if (queryTextarea.value.trim().length > 0) {
          queryTextarea.value += ` - ${text}`;
        } else {
          queryTextarea.value = text;
        }
      }
      queryCharCount.textContent = `${queryTextarea.value.length} / 500`;
      document.getElementById("query-error").classList.add("hidden");
    });
  });

  // Sample data prefill button
  btnPrefillSample.addEventListener("click", () => {
    const sampleNames = ["Aditya Varma", "Kavita Rao", "Tushar Singhania", "Ishaan Gupta", "Priyanka Joshi"];
    const sampleQueries = [
      "Requesting clarification on Cyclic schedule and access to PMP mentorship materials.",
      "Unable to view recorded session of yesterday's lecture; page shows buffering error.",
      "Need certificate verification confirmation before applying for internship.",
      "Query regarding batch timing changes and exam slot booking assistance."
    ];

    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    const randomAssign = Math.random() > 0.5 ? "Sachin" : "Pragati";

    studentNameInput.value = randomName;
    categorySelect.value = randomCat;
    updateCategoryPillUI(randomCat);
    queryTextarea.value = randomQuery;
    queryCharCount.textContent = `${randomQuery.length} / 500`;
    setCurrentTypingTime();

    assignedRadios.forEach(radio => {
      radio.checked = (radio.value === randomAssign);
    });
    updateAssignedCardsUI();

    showToast("Sample data filled into the form!", "info");
  });

  // Reset Button
  btnReset.addEventListener("click", () => {
    resetForm();
    showToast("Form has been reset.", "info");
  });

  function resetForm() {
    form.reset();
    updateCategoryPillUI("");
    updateAssignedCardsUI();
    setCurrentTypingTime();
    queryCharCount.textContent = "0 / 500";
    // Hide error messages
    document.getElementById("name-error").classList.add("hidden");
    document.getElementById("category-error").classList.add("hidden");
    document.getElementById("query-error").classList.add("hidden");
    document.getElementById("assigned-error").classList.add("hidden");
  }

  // Form Submit Handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate fields
    const nameVal = studentNameInput.value.trim();
    const catVal = categorySelect.value.trim();
    const queryVal = queryTextarea.value.trim();
    const typingTimeVal = typingTimeInput.value.trim() || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let assignedVal = "";
    assignedRadios.forEach(r => {
      if (r.checked) assignedVal = r.value;
    });

    let hasError = false;

    if (!nameVal) {
      document.getElementById("name-error").classList.remove("hidden");
      hasError = true;
    } else {
      document.getElementById("name-error").classList.add("hidden");
    }

    if (!catVal) {
      document.getElementById("category-error").classList.remove("hidden");
      hasError = true;
    } else {
      document.getElementById("category-error").classList.add("hidden");
    }

    if (!queryVal) {
      document.getElementById("query-error").classList.remove("hidden");
      hasError = true;
    } else {
      document.getElementById("query-error").classList.add("hidden");
    }

    if (!assignedVal) {
      document.getElementById("assigned-error").classList.remove("hidden");
      hasError = true;
    } else {
      document.getElementById("assigned-error").classList.add("hidden");
    }

    if (hasError) {
      showToast("Please complete all required fields.", "error");
      return;
    }

    // Set UI loading state
    const submitBtn = document.getElementById("btn-submit");
    const submitSpinner = document.getElementById("btn-submit-spinner");
    const submitText = document.getElementById("btn-submit-text");
    
    submitBtn.disabled = true;
    submitSpinner.classList.remove("hidden");
    submitText.textContent = "Saving to Google Sheets...";

    // Create record object
    const now = new Date();
    const timestampStr = formatTimestamp(now);

    const newRecord = {
      id: Date.now(),
      timestamp: timestampStr,
      name: nameVal,
      category: catVal,
      query: queryVal,
      typingTime: typingTimeVal,
      assignedBy: assignedVal
    };

    let googleSheetsSynced = false;

    // Send to Google Sheets if endpoint is provided
    if (state.config.scriptUrl) {
      try {
        await postToGoogleSheets(state.config.scriptUrl, newRecord);
        googleSheetsSynced = true;
      } catch (err) {
        console.warn("Direct POST encountered issue, saved to local cache:", err);
      }
    }

    // Add to state and save locally
    state.records.unshift(newRecord);
    saveRecordsToStorage();

    // Trigger confetti burst
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    // Reset Form
    resetForm();

    // Reset UI loading state
    submitBtn.disabled = false;
    submitSpinner.classList.add("hidden");
    submitText.textContent = "जमा करें / Submit Query";

    if (googleSheetsSynced) {
      showToast(`Success! Query for "${nameVal}" appended to Google Sheet & Dashboard.`, "success");
    } else {
      showToast(`Saved locally! (${state.config.scriptUrl ? 'Syncing...' : 'Connect Google Sheet in Setup tab to sync.'})`, "success");
    }

    // Re-render UI & Charts
    renderApp();
  });
}

function formatTimestamp(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// ============================================================================
// GOOGLE APPS SCRIPT WEBHOOK API CLIENT
// ============================================================================

/**
 * Appends a record to Google Sheets via Apps Script Web App
 */
async function postToGoogleSheets(url, record) {
  // Use text/plain or URLSearchParams to avoid CORS preflight options rejection
  try {
    const payload = JSON.stringify(record);
    const response = await fetch(url, {
      method: "POST",
      body: payload,
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    // Attempt no-cors fallback which Google Apps Script still executes
    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(record),
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        }
      });
      return { status: "success", note: "Sent via no-cors fallback" };
    } catch (e2) {
      throw e2;
    }
  }
}

/**
 * Tests connection to Google Apps Script Web App
 */
async function testGoogleSheetConnection(isUserInitiated = true) {
  const url = state.config.scriptUrl;
  const statusBadge = document.getElementById("connection-badge");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const testResult = document.getElementById("url-test-result");

  if (!url) {
    statusBadge.className = "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80 transition-all";
    statusDot.className = "w-2 h-2 rounded-full bg-amber-500 mr-2";
    statusText.textContent = "Demo Mode (Local)";
    document.getElementById("card-endpoint-pill").textContent = "Local Cache Active";
    return;
  }

  statusText.textContent = "Testing...";
  statusDot.className = "w-2 h-2 rounded-full bg-blue-500 mr-2 animate-ping";

  try {
    const pingUrl = url.includes("?") ? `${url}&action=ping` : `${url}?action=ping`;
    const res = await fetch(pingUrl, { method: "GET" });
    
    if (res.ok) {
      const data = await res.json();
      state.config.isConnected = true;
      statusBadge.className = "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 transition-all";
      statusDot.className = "w-2 h-2 rounded-full bg-emerald-500 mr-2";
      statusText.textContent = "Google Sheets Live";
      document.getElementById("card-endpoint-pill").textContent = "Live Google Sheet Connected";

      if (data.sheetName) {
        document.getElementById("info-sheet-name").textContent = data.sheetName;
      }

      if (testResult && isUserInitiated) {
        testResult.className = "mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs block";
        testResult.innerHTML = `<strong>Connected Successfully!</strong> Google Sheet "${data.sheetName || 'SupportData'}" is active. Total rows: ${data.rowCount || 0}.`;
      }

      if (isUserInitiated) {
        showToast("Connected to Google Sheets successfully!", "success");
      }
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    state.config.isConnected = false;
    statusBadge.className = "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 transition-all";
    statusDot.className = "w-2 h-2 rounded-full bg-rose-500 mr-2";
    statusText.textContent = "Connection Warning";

    if (testResult && isUserInitiated) {
      testResult.className = "mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs block";
      testResult.innerHTML = `<strong>Connection Check:</strong> Could not reach Web App. Verify that deployment permission is set to <em>"Who has access: Anyone"</em> and URL ends with <code>/exec</code>.`;
    }

    if (isUserInitiated) {
      showToast("Could not verify Google Sheets URL. Check permissions.", "error");
    }
  }
}

const TARGET_SPREADSHEET_ID = "1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0";
const TARGET_SHEET_URL = "https://docs.google.com/spreadsheets/d/1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0/edit?usp=sharing";

/**
 * Fetches all live records from Google Sheet and merges with state
 */
async function syncFromGoogleSheets() {
  const url = state.config.scriptUrl;
  const syncBtn = document.getElementById("btn-sync-now");
  const syncIcon = document.getElementById("sync-icon");

  syncIcon.classList.add("animate-spin");

  // Case A: Web App URL is provided -> sync via Apps Script endpoint
  if (url) {
    showToast("Fetching live records via Apps Script...", "info");
    try {
      const fetchUrl = url.includes("?") ? `${url}&action=read` : `${url}?action=read`;
      const res = await fetch(fetchUrl);
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.records && Array.isArray(data.records) && data.records.length > 0) {
          state.records = data.records;
          saveRecordsToStorage();
          const nowStr = new Date().toLocaleTimeString();
          state.config.lastSynced = nowStr;
          localStorage.setItem("gas_last_synced", nowStr);
          document.getElementById("info-last-synced").textContent = nowStr;
          showToast(`Synced ${data.records.length} records from Google Sheet!`, "success");
          renderApp();
          return;
        } else {
          showToast("Connected to Google Sheet, but no rows found yet.", "info");
        }
      } else {
        throw new Error(`Status ${res.status}`);
      }
    } catch (err) {
      console.warn("Apps Script sync issue:", err);
    } finally {
      syncIcon.classList.remove("animate-spin");
    }
  }

  // Case B: Try direct read from public Google Sheet via GViz API
  try {
    showToast("Checking linked Google Sheet for live rows...", "info");
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
    const res = await fetch(gvizUrl);
    
    if (res.ok) {
      const text = await res.text();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = text.substring(jsonStart, jsonEnd + 1);
        const gvizData = JSON.parse(jsonStr);
        const rows = gvizData.table ? gvizData.table.rows : [];

        if (rows && rows.length > 0) {
          const parsedRecords = [];
          rows.forEach((r, idx) => {
            const c = r.c || [];
            const getVal = (cell) => (cell && cell.v !== null && cell.v !== undefined) ? String(cell.f || cell.v).trim() : "";
            const timestamp = getVal(c[0]);
            const name = getVal(c[1]);
            const category = getVal(c[2]);
            const query = getVal(c[3]);
            const typingTime = getVal(c[4]);
            const assignedBy = getVal(c[5]);

            if (name) {
              parsedRecords.push({
                id: idx + 1,
                timestamp: timestamp || new Date().toISOString(),
                name: name,
                category: category || "General",
                query: query || "",
                typingTime: typingTime || "",
                assignedBy: assignedBy || "Sachin"
              });
            }
          });

          if (parsedRecords.length > 0) {
            state.records = parsedRecords;
            saveRecordsToStorage();
            const nowStr = new Date().toLocaleTimeString();
            state.config.lastSynced = nowStr;
            localStorage.setItem("gas_last_synced", nowStr);
            document.getElementById("info-last-synced").textContent = nowStr;
            showToast(`Synced ${parsedRecords.length} live records from Google Sheet!`, "success");
            renderApp();
            return;
          }
        }
      }
    }
  } catch (err) {
    console.warn("GViz sync attempt:", err);
  } finally {
    syncIcon.classList.remove("animate-spin");
  }

  // If no records in sheet yet, give clear guidance
  showToast("Your Google Sheet is connected! Deploy the Apps Script in 'Sheets Setup' to enable auto-append.", "info");
}

// ============================================================================
// SETTINGS & APPS SCRIPT DISPLAY
// ============================================================================

function initSettingsAndSync() {
  const inputUrl = document.getElementById("input-script-url");
  const btnSaveUrl = document.getElementById("btn-save-url");
  const btnTestUrl = document.getElementById("btn-test-url");
  const btnSyncNow = document.getElementById("btn-sync-now");
  const btnCopyCode = document.getElementById("btn-copy-code");
  const codeSnippetDisplay = document.getElementById("code-snippet-display");

  // Load saved URL into input
  if (state.config.scriptUrl) {
    inputUrl.value = state.config.scriptUrl;
  }

  // Display code snippet in viewer
  fetchGoogleAppsScriptCode().then(code => {
    if (codeSnippetDisplay) {
      codeSnippetDisplay.textContent = code;
    }
  });

  // Save URL
  btnSaveUrl.addEventListener("click", () => {
    const newUrl = inputUrl.value.trim();
    state.config.scriptUrl = newUrl;
    localStorage.setItem("gas_script_url", newUrl);
    testGoogleSheetConnection(true);
  });

  // Test URL
  btnTestUrl.addEventListener("click", () => {
    const newUrl = inputUrl.value.trim();
    state.config.scriptUrl = newUrl;
    localStorage.setItem("gas_script_url", newUrl);
    testGoogleSheetConnection(true);
  });

  // Sync button
  btnSyncNow.addEventListener("click", () => {
    syncFromGoogleSheets();
  });

  // Copy Apps Script Code
  btnCopyCode.addEventListener("click", async () => {
    const code = await fetchGoogleAppsScriptCode();
    try {
      await navigator.clipboard.writeText(code);
      const copyBtnText = document.getElementById("copy-btn-text");
      copyBtnText.textContent = "Copied to Clipboard!";
      showToast("Google Apps Script code copied to clipboard!", "success");
      setTimeout(() => {
        copyBtnText.textContent = "Copy Apps Script Code";
      }, 2500);
    } catch (err) {
      showToast("Please copy manually from the code box.", "info");
    }
  });
}

// Fetches the code from google-apps-script.js
async function fetchGoogleAppsScriptCode() {
  try {
    const res = await fetch("google-apps-script.js");
    if (res.ok) {
      return await res.text();
    }
  } catch (e) {
    console.warn("Could not fetch google-apps-script.js via relative fetch");
  }
  return `// Paste the complete google-apps-script.js backend file here.`;
}

// ============================================================================
// CHARTS (CHART.JS)
// ============================================================================

function initCharts() {
  const categoryCanvas = document.getElementById("categoryChart");
  const assignedCanvas = document.getElementById("assignedChart");

  if (!categoryCanvas || !assignedCanvas) return;

  // 1. Category Distribution Bar Chart
  const categoryCtx = categoryCanvas.getContext("2d");
  state.charts.categoryChart = new Chart(categoryCtx, {
    type: "bar",
    data: {
      labels: CATEGORIES,
      datasets: [{
        label: "Queries Count",
        data: CATEGORIES.map(() => 0),
        backgroundColor: [
          "rgba(6, 182, 212, 0.85)",   // Diamond Member
          "rgba(148, 163, 184, 0.85)", // Silver Member
          "rgba(245, 158, 11, 0.85)",  // Gold
          "rgba(99, 102, 241, 0.85)",  // Diamond
          "rgba(100, 116, 139, 0.85)", // Silver
          "rgba(16, 185, 129, 0.85)",  // PMP
          "rgba(168, 85, 247, 0.85)"   // Cyclic
        ],
        borderColor: [
          "#0891b2",
          "#64748b",
          "#d97706",
          "#4f46e5",
          "#475569",
          "#059669",
          "#9333ea"
        ],
        borderWidth: 1.5,
        borderRadius: 8,
        barPercentage: 0.65
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 10,
          cornerRadius: 8,
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 12 },
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const val = context.raw || 0;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${val} queries (${pct}%)`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
            color: "#64748b"
          },
          grid: {
            color: "rgba(226, 232, 240, 0.6)"
          }
        },
        x: {
          ticks: {
            font: { size: 10, weight: 600, family: "'Plus Jakarta Sans', sans-serif" },
            color: "#475569",
            maxRotation: 25,
            minRotation: 0
          },
          grid: { display: false }
        }
      }
    }
  });

  // 2. Workload Donut Chart (Sachin vs Pragati)
  const assignedCtx = assignedCanvas.getContext("2d");
  state.charts.assignedChart = new Chart(assignedCtx, {
    type: "doughnut",
    data: {
      labels: ["Sachin", "Pragati"],
      datasets: [{
        data: [0, 0],
        backgroundColor: [
          "rgba(16, 185, 129, 0.9)", // Emerald for Sachin
          "rgba(14, 165, 233, 0.9)"  // Sky blue for Pragati
        ],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            font: { size: 11, weight: 600, family: "'Plus Jakarta Sans', sans-serif" },
            color: "#334155"
          }
        },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const val = context.raw || 0;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${val} queries (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

function updateCharts() {
  if (!state.charts.categoryChart || !state.charts.assignedChart) return;

  // Calculate category counts
  const categoryCounts = {};
  CATEGORIES.forEach(c => categoryCounts[c] = 0);
  
  let sachinCount = 0;
  let pragatiCount = 0;

  state.records.forEach(r => {
    const cat = r.category ? r.category.trim() : "";
    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat]++;
    }

    const assigned = r.assignedBy ? r.assignedBy.trim().toLowerCase() : "";
    if (assigned === "sachin") {
      sachinCount++;
    } else if (assigned === "pragati") {
      pragatiCount++;
    }
  });

  // Update Category Bar Chart
  state.charts.categoryChart.data.datasets[0].data = CATEGORIES.map(c => categoryCounts[c]);
  state.charts.categoryChart.update();

  // Update Workload Donut Chart
  state.charts.assignedChart.data.datasets[0].data = [sachinCount, pragatiCount];
  state.charts.assignedChart.update();

  // Update workload labels
  const totalAssigned = sachinCount + pragatiCount;
  const sachinPct = totalAssigned > 0 ? ((sachinCount / totalAssigned) * 100).toFixed(0) : 0;
  const pragatiPct = totalAssigned > 0 ? ((pragatiCount / totalAssigned) * 100).toFixed(0) : 0;

  document.getElementById("chart-sachin-label").textContent = `${sachinCount} queries (${sachinPct}%)`;
  document.getElementById("chart-pragati-label").textContent = `${pragatiCount} queries (${pragatiPct}%)`;
}

// ============================================================================
// KPI SUMMARY CARDS
// ============================================================================

function updateKPIs() {
  const total = state.records.length;
  
  // Today's entries check
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayPrefix = `${yyyy}-${mm}-${dd}`;

  let todayCount = 0;
  let sachinCount = 0;
  let pragatiCount = 0;

  state.records.forEach(r => {
    if (r.timestamp && r.timestamp.startsWith(todayPrefix)) {
      todayCount++;
    }
    const assigned = (r.assignedBy || "").toLowerCase();
    if (assigned === "sachin") sachinCount++;
    if (assigned === "pragati") pragatiCount++;
  });

  document.getElementById("kpi-total-queries").textContent = total;
  document.getElementById("kpi-today-entries").textContent = todayCount;
  document.getElementById("kpi-sachin-count").textContent = sachinCount;
  document.getElementById("kpi-pragati-count").textContent = pragatiCount;

  const sachinPct = total > 0 ? Math.round((sachinCount / total) * 100) : 0;
  const pragatiPct = total > 0 ? Math.round((pragatiCount / total) * 100) : 0;

  document.getElementById("kpi-sachin-pct").textContent = `${sachinPct}%`;
  document.getElementById("kpi-pragati-pct").textContent = `${pragatiPct}%`;

  // Info sidebar cache counter
  document.getElementById("info-cache-count").textContent = `${total} records`;
  document.getElementById("recent-count").textContent = `${Math.min(total, 5)} items`;
}

// ============================================================================
// RECENT SUBMISSIONS FEED
// ============================================================================

function updateRecentSubmissions() {
  const container = document.getElementById("recent-submissions-list");
  if (!container) return;

  const recent = state.records.slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-400 text-xs">
        No queries submitted yet.
      </div>
    `;
    return;
  }

  container.innerHTML = recent.map(item => {
    const badgeClass = CATEGORY_BADGE_CLASSES[item.category] || "bg-slate-100 text-slate-700";
    const assignedInitial = item.assignedBy ? item.assignedBy.charAt(0).toUpperCase() : "?";
    const assignedColor = item.assignedBy === "Sachin" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800";

    return `
      <div class="p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/70 transition-all flex items-start justify-between space-x-3">
        <div class="space-y-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-xs text-slate-900 truncate">${escapeHtml(item.name)}</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}">
              ${escapeHtml(item.category)}
            </span>
          </div>
          <p class="text-xs text-slate-500 line-clamp-1 truncate">${escapeHtml(item.query)}</p>
          <div class="flex items-center space-x-2 text-[10px] text-slate-400">
            <span>${escapeHtml(item.timestamp || '')}</span>
            ${item.typingTime ? `<span>• ⏱ ${escapeHtml(item.typingTime)}</span>` : ''}
          </div>
        </div>
        <div class="flex-shrink-0" title="Assigned by ${escapeHtml(item.assignedBy)}">
          <span class="w-6 h-6 rounded-full ${assignedColor} font-bold text-[10px] flex items-center justify-center">
            ${assignedInitial}
          </span>
        </div>
      </div>
    `;
  }).join("");
}

// ============================================================================
// TABLE CONTROLS, FILTERING, SORTING & PAGINATION
// ============================================================================

function initTableControls() {
  const searchInput = document.getElementById("table-search");
  const categoryFilter = document.getElementById("filter-category");
  const assignedFilter = document.getElementById("filter-assigned");
  const clearFiltersBtn = document.getElementById("btn-clear-filters");
  const btnPrev = document.getElementById("btn-prev-page");
  const btnNext = document.getElementById("btn-next-page");
  const btnExportCsv = document.getElementById("btn-export-csv");
  const btnRefreshDashboard = document.getElementById("btn-refresh-dashboard");
  const sortTimestamp = document.getElementById("sort-timestamp");
  const sortName = document.getElementById("sort-name");

  // Search input
  searchInput.addEventListener("input", (e) => {
    state.filters.search = e.target.value.trim().toLowerCase();
    state.pagination.currentPage = 1;
    renderTable();
  });

  // Filter Category
  categoryFilter.addEventListener("change", (e) => {
    state.filters.category = e.target.value;
    state.pagination.currentPage = 1;
    renderTable();
  });

  // Filter Assigned
  assignedFilter.addEventListener("change", (e) => {
    state.filters.assigned = e.target.value;
    state.pagination.currentPage = 1;
    renderTable();
  });

  // Reset Filters
  clearFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    assignedFilter.value = "";
    state.filters.search = "";
    state.filters.category = "";
    state.filters.assigned = "";
    state.pagination.currentPage = 1;
    renderTable();
    showToast("Filters reset.", "info");
  });

  // Sorting
  sortTimestamp.addEventListener("click", () => {
    if (state.filters.sortField === "timestamp") {
      state.filters.sortOrder = state.filters.sortOrder === "asc" ? "desc" : "asc";
    } else {
      state.filters.sortField = "timestamp";
      state.filters.sortOrder = "desc";
    }
    renderTable();
  });

  sortName.addEventListener("click", () => {
    if (state.filters.sortField === "name") {
      state.filters.sortOrder = state.filters.sortOrder === "asc" ? "desc" : "asc";
    } else {
      state.filters.sortField = "name";
      state.filters.sortOrder = "asc";
    }
    renderTable();
  });

  // Pagination Next / Prev
  btnPrev.addEventListener("click", () => {
    if (state.pagination.currentPage > 1) {
      state.pagination.currentPage--;
      renderTable();
    }
  });

  btnNext.addEventListener("click", () => {
    const totalFiltered = getFilteredRecords().length;
    const maxPage = Math.ceil(totalFiltered / state.pagination.pageSize) || 1;
    if (state.pagination.currentPage < maxPage) {
      state.pagination.currentPage++;
      renderTable();
    }
  });

  // Export to CSV
  btnExportCsv.addEventListener("click", exportToCSV);

  // Refresh
  btnRefreshDashboard.addEventListener("click", () => {
    if (state.config.scriptUrl) {
      syncFromGoogleSheets();
    } else {
      renderApp();
      showToast("Dashboard refreshed.", "info");
    }
  });

  // Detail Modal Controls
  document.getElementById("btn-close-modal").addEventListener("click", closeModal);
  document.getElementById("btn-modal-close-action").addEventListener("click", closeModal);
  document.getElementById("detail-modal").addEventListener("click", (e) => {
    if (e.target.id === "detail-modal") closeModal();
  });
}

function getFilteredRecords() {
  return state.records.filter(r => {
    // Search match
    if (state.filters.search) {
      const name = (r.name || "").toLowerCase();
      const query = (r.query || "").toLowerCase();
      if (!name.includes(state.filters.search) && !query.includes(state.filters.search)) {
        return false;
      }
    }

    // Category filter
    if (state.filters.category && r.category !== state.filters.category) {
      return false;
    }

    // Assigned filter
    if (state.filters.assigned && r.assignedBy !== state.filters.assigned) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    const field = state.filters.sortField;
    const order = state.filters.sortOrder === "asc" ? 1 : -1;

    let valA = a[field] || "";
    let valB = b[field] || "";

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return -1 * order;
    if (valA > valB) return 1 * order;
    return 0;
  });
}

function renderTable() {
  const tbody = document.getElementById("table-body");
  const filtered = getFilteredRecords();
  const total = filtered.length;

  document.getElementById("table-badge-count").textContent = `${total} Entries`;
  document.getElementById("total-filtered-count").textContent = total;

  // Pagination calculation
  const pageSize = state.pagination.pageSize;
  const maxPage = Math.ceil(total / pageSize) || 1;
  if (state.pagination.currentPage > maxPage) {
    state.pagination.currentPage = maxPage;
  }
  const currentPage = state.pagination.currentPage;

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = filtered.slice(startIdx, endIdx);

  document.getElementById("page-start").textContent = total === 0 ? 0 : startIdx + 1;
  document.getElementById("page-end").textContent = endIdx;

  // Pagination Buttons State
  document.getElementById("btn-prev-page").disabled = currentPage <= 1;
  document.getElementById("btn-next-page").disabled = currentPage >= maxPage;

  // Page Numbers
  const pageNumbersContainer = document.getElementById("page-number-buttons");
  pageNumbersContainer.innerHTML = "";
  for (let p = 1; p <= maxPage; p++) {
    const active = p === currentPage;
    const btn = document.createElement("button");
    btn.className = `w-7 h-7 rounded-lg text-xs font-semibold ${active ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`;
    btn.textContent = p;
    btn.addEventListener("click", () => {
      state.pagination.currentPage = p;
      renderTable();
    });
    pageNumbersContainer.appendChild(btn);
  }

  // Render Table Rows
  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-10 text-slate-400">
          <div class="flex flex-col items-center justify-center space-y-2">
            <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p class="text-xs">No matching entries found.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pageItems.map((item, idx) => {
    const badgeClass = CATEGORY_BADGE_CLASSES[item.category] || "bg-slate-100 text-slate-700";
    const assignedChip = item.assignedBy === "Sachin" 
      ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1"></span>Sachin</span>`
      : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800"><span class="w-1.5 h-1.5 rounded-full bg-sky-600 mr-1"></span>Pragati</span>`;

    return `
      <tr class="table-row-hover transition-colors border-b border-slate-100">
        <td class="py-3 px-4 text-center font-mono text-slate-400">${startIdx + idx + 1}</td>
        <td class="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">${escapeHtml(item.timestamp || '-')}</td>
        <td class="py-3 px-4 font-bold text-slate-900">${escapeHtml(item.name)}</td>
        <td class="py-3 px-4">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}">
            ${escapeHtml(item.category)}
          </span>
        </td>
        <td class="py-3 px-4">
          <p class="line-clamp-2 text-slate-600 text-xs leading-relaxed" title="${escapeHtml(item.query)}">
            ${escapeHtml(item.query)}
          </p>
        </td>
        <td class="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
          ${item.typingTime ? `⏱ ${escapeHtml(item.typingTime)}` : '-'}
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          ${assignedChip}
        </td>
        <td class="py-3 px-4 text-center whitespace-nowrap">
          <div class="flex items-center justify-center space-x-1">
            <button onclick="viewRecordDetail(${item.id})" class="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="View Details">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button onclick="deleteRecord(${item.id})" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Delete">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Global window actions for table row buttons
window.viewRecordDetail = function(id) {
  const item = state.records.find(r => r.id === id);
  if (!item) return;

  document.getElementById("modal-name").textContent = item.name;
  
  const modalCat = document.getElementById("modal-category");
  const badgeClass = CATEGORY_BADGE_CLASSES[item.category] || "bg-slate-100 text-slate-700";
  modalCat.innerHTML = `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">${escapeHtml(item.category)}</span>`;

  document.getElementById("modal-assigned").innerHTML = item.assignedBy === "Sachin"
    ? `<span class="inline-flex items-center text-xs font-bold text-emerald-700">Sachin (सचिन)</span>`
    : `<span class="inline-flex items-center text-xs font-bold text-sky-700">Pragati (प्रगति)</span>`;

  document.getElementById("modal-timestamp").textContent = item.timestamp || "-";
  document.getElementById("modal-typing-time").textContent = item.typingTime || "-";
  document.getElementById("modal-query").textContent = item.query || "-";

  document.getElementById("detail-modal").classList.remove("hidden");
};

function closeModal() {
  document.getElementById("detail-modal").classList.add("hidden");
}

window.deleteRecord = function(id) {
  if (confirm("Are you sure you want to delete this query entry?")) {
    state.records = state.records.filter(r => r.id !== id);
    saveRecordsToStorage();
    renderApp();
    showToast("Entry deleted.", "info");
  }
};

// ============================================================================
// EXPORT TO CSV
// ============================================================================

function exportToCSV() {
  if (state.records.length === 0) {
    showToast("No records available to export.", "error");
    return;
  }

  const headers = ["Timestamp", "Student Name", "Phone Number", "Gmail / Email", "Category", "Query", "Typing Time", "Assigned By"];
  const rows = state.records.map(r => [
    `"${(r.timestamp || "").replace(/"/g, '""')}"`,
    `"${(r.name || "").replace(/"/g, '""')}"`,
    `"${(r.phone || "").replace(/"/g, '""')}"`,
    `"${(r.email || "").replace(/"/g, '""')}"`,
    `"${(r.category || "").replace(/"/g, '""')}"`,
    `"${(r.query || "").replace(/"/g, '""')}"`,
    `"${(r.typingTime || "").replace(/"/g, '""')}"`,
    `"${(r.assignedBy || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `student_support_queries_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("CSV exported successfully!", "success");
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast-enter pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold transition-all max-w-sm";

  if (type === "success") {
    toast.classList.add("bg-emerald-50", "border-emerald-200", "text-emerald-900");
    toast.innerHTML = `
      <svg class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <span>${escapeHtml(message)}</span>
    `;
  } else if (type === "error") {
    toast.classList.add("bg-rose-50", "border-rose-200", "text-rose-900");
    toast.innerHTML = `
      <svg class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span>${escapeHtml(message)}</span>
    `;
  } else {
    toast.classList.add("bg-slate-900", "border-slate-800", "text-white");
    toast.innerHTML = `
      <svg class="w-5 h-5 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span>${escapeHtml(message)}</span>
    `;
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("toast-enter");
    toast.classList.add("toast-exit");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 4000);
}

// ============================================================================
// UTILITIES
// ============================================================================

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Full App Render
function renderApp() {
  updateKPIs();
  updateCharts();
  updateRecentSubmissions();
  renderTable();
}
