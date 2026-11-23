# 🎓 Support Desk • Query Tracker & Live Analytics
### Live Production Web Application: [https://support-student-data.vercel.app](https://support-student-data.vercel.app)

A clean, modern, and mobile-friendly web application designed for tracking student support queries, analyzing team workloads, and syncing every submission directly with a live Google Sheet.

- **🌐 Live Production URL**: [https://support-student-data.vercel.app](https://support-student-data.vercel.app)
- **📄 Connected Google Sheet**: [Student Support Tracker](https://docs.google.com/spreadsheets/d/1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0/edit?usp=sharing)
- **📁 GitHub Repository**: `https://github.com/Bandebuche/support-student-data.git`

---

## 🌟 Key Features

### 1. Data Entry Form (डेटा प्रविष्टि)
- **Bilingual & Intuitive UI**: Soft emerald (`#10b981`) and sky blue (`#0ea5e9`) light theme with English & Hindi labels.
- **Fields Included**:
  - **Student Name (नाम)**: Required text input with real-time validation.
  - **Category / Membership Type (सदस्यता प्रकार)**: Interactive pill chips & synchronized dropdown with exact options:
    - `Diamond Member`
    - `Silver Member`
    - `Gold`
    - `Diamond`
    - `Silver`
    - `PMP`
    - `Cyclic`
  - **Query (क्वेरी विवरण)**: Auto-sizing textarea with 1-click topic suggestions (Portal Login Issue, Mentorship Slot, Certificate Request, Study Notes Access) and character counter.
  - **Typing Time (टाइपिंग समय)**: Time picker with a 1-click **"Set Current Time"** button.
  - **Assigned By (सौंपा गया)**: Custom radio pill cards with avatars for **Sachin** & **Pragati**.
  - **Actions**: "जमा करें / Submit Query" button with loading spinner & confetti animation; "रीसेट / Reset" button.

### 2. Live Google Sheets Integration (गूगल शीट्स इंटीग्रेशन)
- **Google Apps Script Web App**: Zero external hosting or database required!
- **`doPost` Webhook**: Automatically appends submitted entries with server timestamp.
- **`doGet` API**: Provides real-time synchronization to fetch all live sheet records.
- **Automatic Column Headers**: If your spreadsheet is blank, the backend automatically generates styled headers:
  `[Timestamp, Name, Category, Query, Typing Time, Assigned By]`
- **Local Fallback Cache**: Runs seamlessly offline or in demo mode even before connecting Google Sheets.

### 3. Interactive Analytics Dashboard (एनालिटिक्स डैशबोर्ड)
- **4 Summary KPI Cards**:
  1. **Total Queries** (All-time recorded count)
  2. **Today's Entries** (Live count of queries received today)
  3. **Assigned to Sachin** (Count & percentage share)
  4. **Assigned to Pragati** (Count & percentage share)
- **Two Interactive Charts (Chart.js)**:
  1. **Category Distribution Bar Chart**: Exact breakdown across all 7 membership categories.
  2. **Workload Donut Chart**: Workload comparison between Sachin and Pragati.

### 4. Searchable & Filterable Live Data Table (डेटा तालिका)
- **Multi-Filter Toolbar**:
  - Real-time instant search by **Student Name** or **Query keywords**.
  - Category filter dropdown.
  - Assignee filter dropdown (Sachin / Pragati).
  - Column sorting by Timestamp & Student Name.
- **Pagination**: Configurable page size with numbered page pills.
- **Detail Modal**: View full queries without table clutter.
- **Export to CSV**: 1-click download with UTF-8 BOM encoding for perfect Excel/Google Sheets compatibility.

---

## 🚀 Setup Instructions: Connecting Your Google Sheet

Your Google Sheet is already linked to this application:
- **Linked Sheet URL**: [https://docs.google.com/spreadsheets/d/1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0/edit?usp=sharing)
- **Spreadsheet ID**: `1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0`

Connecting the Web App takes less than **2 minutes**:

### Step 1: Open Your Linked Google Sheet
1. Open [your Google Sheet](https://docs.google.com/spreadsheets/d/1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0/edit?usp=sharing) in your browser.

### Step 2: Open Google Apps Script
1. In the Google Sheets menu, click **Extensions (एक्सटेंशन)** &rarr; **Apps Script (ऐप्स स्क्रिप्ट)**.
2. A new script editor tab will open.

### Step 3: Paste the Backend Code
1. Erase any existing boilerplate code in `Code.gs`.
2. Open the included [`google-apps-script.js`](./google-apps-script.js) file from this repository, copy its entire contents, and paste it into `Code.gs`.
3. Click the **Save** icon (diskette icon) or press `Ctrl + S`.

### Step 4: Deploy as a Web App
1. At the top-right corner of the Apps Script editor, click the blue **Deploy** button &rarr; **New deployment**.
2. Click the gear icon (**Select type**) &rarr; choose **Web app**.
3. Configure the settings:
   - **Description**: `Student Support Desk Web App`
   - **Execute as**: `Me (<your-email>@gmail.com)`
   - **Who has access**: `Anyone` *(⚠️ Crucial: This allows form submissions without requiring Google login)*
4. Click **Deploy**.
5. When prompted with "Authorization required", click **Authorize access**, select your Google account, click **Advanced** &rarr; **Go to Untitled project (unsafe)** &rarr; **Allow**.
6. Copy the generated **Web app URL** (the URL ends with `/exec`).

### Step 5: Connect in the Web Application
1. Open `index.html` in your web browser.
2. Click the **"Sheets Setup"** button in the top navigation bar (or open the **Setup Guide** tab).
3. Paste your Web App URL into the **"Google Apps Script Web App Endpoint URL"** field.
4. Click **"Save & Connect"** followed by **"Test Connection"**.
5. You will see a green **"Google Sheets Live"** indicator. Every submission will now write straight to your Google Sheet!

---

## 📁 Project File Structure

```text
├── index.html              # Main Single-Page Web Application UI
├── styles.css              # Custom styling, animations, category badges
├── app.js                  # Frontend state, form validation, charts, filtering, & sync
├── google-apps-script.js   # Production-ready Google Apps Script backend (Code.gs)
└── README.md               # Setup and architecture documentation
```

---

## 💻 Running the App Locally

You can run this application by simply double-clicking `index.html` in any modern web browser.

Alternatively, to serve it via a local HTTP server:

```powershell
# Using Python
python -m http.server 8000

# Or using Node.js / npx
npx serve .
```

Then visit [http://localhost:8000](http://localhost:8000) in your browser.
