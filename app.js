/**
 * Piush Bhandari — Executive Water Treatment & Infrastructure Portfolio
 * Core Interactive System
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme Switcher
  initTheme();

  // 2. Initialize Interactive Fluid Water Canvas
  initFluidCanvas();

  // 3. Initialize Project Detail Modals & Filtering
  initProjects();

  // 4. Initialize Water Scale & Impact Visualizer
  initImpactVisualizer();

  // 5. Initialize Animated Number Counters
  initNumberCounters();

  // 6. Initialize Ambient Water Sound Synthesizer (Web Audio API)
  initAmbientSound();

  // 7. Initialize Interactive Contact Form & Copy Tools
  initContactSystem();

  // 8. Initialize SVG Signature Animation
  initSignatureAnimation();

  // 9. Initialize Custom Water Cursor
  initCustomCursor();

  // 10. Initialize Mobile Navigation & Smooth Scroll
  initNavigation();
});

/* ==========================================================================
   1. Theme Management (Parchment Light / Midnight Ocean Nocturne)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const savedTheme = localStorage.getItem('pb_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    updateThemeIcon(true);
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeIcon(false);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('pb_theme', isDark ? 'dark' : 'light');
      updateThemeIcon(isDark);
      showToast(isDark ? 'Switched to Midnight Ocean mode' : 'Switched to Parchment Light mode');
    });
  }

  function updateThemeIcon(isDark) {
    if (!themeIcon) return;
    if (isDark) {
      themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    } else {
      themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    }
  }
}

/* ==========================================================================
   2. Interactive Fluid Water Canvas & Concentric Ripple System
   ========================================================================== */
function initFluidCanvas() {
  const canvas = document.getElementById('hero-fluid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, centerX, centerY;
  let dpr = window.devicePixelRatio || 1;
  let time = 0;
  let mouse = { x: -1000, y: -1000, active: false };
  let ripples = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    centerX = width / 2;
    centerY = height / 2;
  }

  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;

    // Add subtle motion ripple
    if (Math.random() < 0.25) {
      ripples.push({
        x: mouse.x,
        y: mouse.y,
        radius: 2,
        maxRadius: 60 + Math.random() * 40,
        opacity: 0.6,
        speed: 1.5 + Math.random()
      });
    }
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        ripples.push({
          x: clickX,
          y: clickY,
          radius: 4,
          maxRadius: 100 + i * 35,
          opacity: 0.8 - i * 0.2,
          speed: 2.2 + i * 0.5
        });
      }, i * 120);
    }
  });

  // Floating ambient micro-particles
  const particles = [];
  const particleCount = 28;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      angle: Math.random() * Math.PI * 2,
      distance: 50 + Math.random() * 110,
      baseRadius: 1.5 + Math.random() * 2.5,
      speed: (0.002 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1),
      pulseSpeed: 0.02 + Math.random() * 0.03,
      alpha: 0.3 + Math.random() * 0.5
    });
  }

  function render() {
    time += 0.02;
    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.classList.contains('dark');

    // Concentric base rings with fluid breathing
    const ringRadii = [85, 120, 155, 185];
    
    // Draw outer ambient glow
    const radialGlow = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, 190);
    if (isDark) {
      radialGlow.addColorStop(0, 'rgba(45, 212, 191, 0.16)');
      radialGlow.addColorStop(0.6, 'rgba(13, 148, 136, 0.06)');
      radialGlow.addColorStop(1, 'rgba(6, 21, 17, 0)');
    } else {
      radialGlow.addColorStop(0, 'rgba(167, 243, 208, 0.45)');
      radialGlow.addColorStop(0.6, 'rgba(204, 251, 241, 0.25)');
      radialGlow.addColorStop(1, 'rgba(250, 249, 245, 0)');
    }
    ctx.fillStyle = radialGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 190, 0, Math.PI * 2);
    ctx.fill();

    // Render fluid organic wavy rings
    ringRadii.forEach((baseR, idx) => {
      ctx.beginPath();
      const points = 64;
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        // Harmonic wave oscillation
        const wave = Math.sin(theta * 4 + time * (idx % 2 === 0 ? 1 : -1) + idx) * (3.5 + idx * 0.8);
        const wave2 = Math.cos(theta * 2 - time * 0.8) * 2;
        const r = baseR + wave + wave2;

        const x = centerX + Math.cos(theta) * r;
        const y = centerY + Math.sin(theta) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      if (idx === 0) {
        // Inner core circle fill
        ctx.fillStyle = isDark ? 'rgba(15, 42, 35, 0.75)' : 'rgba(232, 245, 238, 0.8)';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isDark ? 'rgba(45, 212, 191, 0.4)' : 'rgba(14, 82, 65, 0.25)';
      } else if (idx === 1) {
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = isDark ? 'rgba(45, 212, 191, 0.25)' : 'rgba(13, 148, 136, 0.35)';
      } else {
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 12]);
        ctx.strokeStyle = isDark ? 'rgba(45, 212, 191, 0.15)' : 'rgba(14, 82, 65, 0.15)';
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Render interactive ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += rip.speed;
      rip.opacity *= 0.96;

      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = isDark 
        ? `rgba(45, 212, 191, ${rip.opacity})` 
        : `rgba(13, 148, 136, ${rip.opacity})`;
      ctx.stroke();
      ctx.restore();

      if (rip.radius > rip.maxRadius || rip.opacity < 0.02) {
        ripples.splice(i, 1);
      }
    }

    // Render orbiting particles
    particles.forEach((p) => {
      p.angle += p.speed;
      const px = centerX + Math.cos(p.angle) * p.distance;
      const py = centerY + Math.sin(p.angle) * p.distance;
      const currentRadius = p.baseRadius + Math.sin(time * 3 + p.angle) * 0.6;

      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.8, currentRadius), 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(94, 234, 212, ${p.alpha * 0.9})`
        : `rgba(13, 148, 136, ${p.alpha * 0.7})`;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   3. Selected Projects System (Filter & Interactive Detail Blueprints)
   ========================================================================== */
const PROJECTS_DATA = [
  {
    id: 'pearl-qatar',
    num: '01',
    category: 'Desalination',
    categoryKey: 'desalination',
    title: 'Pearl Qatar Desalination Plant',
    client: 'UDC (United Development Company) · Qatar',
    capacity: '35 MLD',
    year: '2016 — 2022',
    tech: 'Seawater Reverse Osmosis (SWRO) · DAF Pretreatment · Energy Recovery Devices (ERD)',
    description: 'Flagship municipal seawater reverse osmosis installation supplying 100% of the potable water demands for the man-made Pearl-Qatar island archipelago, serving over 50,000 residents and luxury hospitality assets.',
    leadershipRole: 'Directed turnkey O&M and technical operations under Metito Overseas Qatar WLL. Oversaw high-pressure membrane arrays, energy recovery optimization reducing power consumption by 28%, and managed ISO-compliant environmental brine outfall monitoring.',
    specs: [
      { label: 'Feedwater Salinity', value: '44,000 ppm TDS (Arabian Gulf)' },
      { label: 'Product Water Quality', value: '< 200 ppm TDS (WHO potable standard)' },
      { label: 'Energy Recovery', value: 'PX Pressure Exchangers (97% efficiency)' },
      { label: 'Membrane Arrays', value: 'High-rejection Polyamide RO Elements' }
    ],
    svgDiagram: `
      <svg class="w-full h-44 bg-emerald-950/40 rounded-xl p-4" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="40" width="80" height="40" rx="6" fill="#0D9488" fill-opacity="0.2" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="60" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">Intake / DAF</text>
        <path d="M100 60 H140" stroke="#2DD4BF" stroke-width="2" stroke-dasharray="3 3"/>
        <rect x="140" y="40" width="80" height="40" rx="6" fill="#0D9488" fill-opacity="0.3" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="180" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">Ultrafiltration</text>
        <path d="M220 60 H260" stroke="#2DD4BF" stroke-width="2"/>
        <rect x="260" y="30" width="100" height="60" rx="8" fill="#047857" fill-opacity="0.4" stroke="#34D399" stroke-width="2"/>
        <text x="310" y="58" text-anchor="middle" fill="#34D399" font-size="12" font-weight="700">SWRO + ERD</text>
        <text x="310" y="74" text-anchor="middle" fill="#A7F3D0" font-size="9">35 MLD Arrays</text>
        <path d="M360 60 H400" stroke="#34D399" stroke-width="2"/>
        <rect x="400" y="40" width="80" height="40" rx="6" fill="#0D9488" fill-opacity="0.2" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="440" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">Remineralize</text>
      </svg>
    `
  },
  {
    id: 'qatar-energy',
    num: '02',
    category: 'Water Treatment',
    categoryKey: 'water-treatment',
    title: 'Qatar Energy Water Treatment Plant',
    client: 'Qatar Energy · Ras Laffan & Mesaieed, Qatar',
    capacity: '5 MLD',
    year: '2018 — 2023',
    tech: 'Demineralization (DM) · Mixed Bed Polishing · High-Pressure Boiler Feed',
    description: 'High-purity industrial process water facility delivering ultra-low conductivity feedwater for Qatar Energy refinery boilers and power steam generators under extreme operating reliability requirements.',
    leadershipRole: 'Led technical advisory, asset reliability management, and hazardous petrochemical environment compliance protocols. Spearheaded preventive diagnostics reducing unscheduled shutdowns to absolute zero over 4 consecutive operational years.',
    specs: [
      { label: 'Water Conductivity', value: '< 0.1 µS/cm (Ultra-pure specification)' },
      { label: 'Silica Residual', value: '< 10 ppb (Preventing turbine fouling)' },
      { label: 'Redundancy Factor', value: 'N+1 Critical Duty Standby' },
      { label: 'Safety Compliance', value: 'Zero LTI across 1,200,000+ man-hours' }
    ],
    svgDiagram: `
      <svg class="w-full h-44 bg-emerald-950/40 rounded-xl p-4" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="40" width="75" height="40" rx="6" fill="#0D9488" fill-opacity="0.2" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="62" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">Raw Supply</text>
        <path d="M100 60 H140" stroke="#2DD4BF" stroke-width="2"/>
        <rect x="140" y="40" width="85" height="40" rx="6" fill="#0D9488" fill-opacity="0.3" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="182" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">Two-Pass RO</text>
        <path d="M225 60 H265" stroke="#2DD4BF" stroke-width="2"/>
        <rect x="265" y="32" width="105" height="56" rx="8" fill="#047857" fill-opacity="0.4" stroke="#34D399" stroke-width="2"/>
        <text x="317" y="58" text-anchor="middle" fill="#34D399" font-size="12" font-weight="700">EDI / Mixed Bed</text>
        <text x="317" y="74" text-anchor="middle" fill="#A7F3D0" font-size="9">< 0.1 µS/cm Polish</text>
        <path d="M370 60 H405" stroke="#34D399" stroke-width="2"/>
        <rect x="405" y="40" width="80" height="40" rx="6" fill="#0D9488" fill-opacity="0.2" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="445" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">Boiler Feed</text>
      </svg>
    `
  },
  {
    id: 'velana-airport',
    num: '03',
    category: 'Wastewater',
    categoryKey: 'wastewater',
    title: 'Velana International Airport WWTP',
    client: 'Maldives Government · Male, Maldives',
    capacity: '6,000 m³/day',
    year: '2023 — Present',
    tech: 'Membrane Bioreactor (MBR) · Submerged Hollow Fiber · Biological Nutrient Removal (BNR)',
    description: 'High-performance, low-footprint wastewater reclamation plant located at Maldives principal international gateway island. Engineered to operate under sensitive coastal marine regulations and stringent odor restrictions.',
    leadershipRole: 'Executive oversight as CTO & Head of Water Vertical at Mohan Mutha Infra Pvt Ltd. Directed international engineering design, EPC procurement logistics across maritime channels, and continuous commissioning for full tertiary reuse in airport landscaping and district cooling.',
    specs: [
      { label: 'Effluent BOD / TSS', value: '< 5 mg/L / < 2 mg/L (Crystal clear)' },
      { label: 'Footprint Reduction', value: '62% smaller than conventional ASP' },
      { label: 'Environmental Impact', value: 'Zero untreated ocean discharge' },
      { label: 'Reclamation Rate', value: '100% reused for island utilities' }
    ],
    svgDiagram: `
      <svg class="w-full h-44 bg-emerald-950/40 rounded-xl p-4" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="40" width="80" height="40" rx="6" fill="#0D9488" fill-opacity="0.2" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="60" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">Fine Screening</text>
        <path d="M100 60 H140" stroke="#2DD4BF" stroke-width="2"/>
        <rect x="140" y="40" width="85" height="40" rx="6" fill="#0D9488" fill-opacity="0.3" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="182" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">Anoxic / Aerobic</text>
        <path d="M225 60 H260" stroke="#2DD4BF" stroke-width="2"/>
        <rect x="260" y="30" width="115" height="60" rx="8" fill="#047857" fill-opacity="0.4" stroke="#34D399" stroke-width="2"/>
        <text x="317" y="58" text-anchor="middle" fill="#34D399" font-size="12" font-weight="700">Submerged MBR</text>
        <text x="317" y="74" text-anchor="middle" fill="#A7F3D0" font-size="9">0.04 µm Barrier</text>
        <path d="M375 60 H405" stroke="#34D399" stroke-width="2"/>
        <rect x="405" y="40" width="80" height="40" rx="6" fill="#0D9488" fill-opacity="0.2" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="445" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">UV / Reuse</text>
      </svg>
    `
  },
  {
    id: 'iocl-zld',
    num: '04',
    category: 'Industrial Water',
    categoryKey: 'industrial',
    title: 'IOCL ETP / STP / ZLD Complex',
    client: 'Indian Oil Corporation Limited · Panipat / Gujarat, India',
    capacity: '100,000 m³/day (Cumulative)',
    year: '2012 — 2016',
    tech: 'Zero Liquid Discharge (ZLD) · High-Rate Solids Contact Clarifier · MVR Evaporator & Crystallizer',
    description: 'Mega-scale refinery effluent treatment and Zero Liquid Discharge (ZLD) complex treating heavily contaminated hydrocarbons, phenols, sulfides, and total dissolved solids with total salt recovery and zero waste discharge into local aquifers.',
    leadershipRole: 'Directed turnkey EPC engineering and execution as GM Projects at UEM India Pvt Ltd. Managed inter-disciplinary team of 140+ site engineers, procured specialized exotic titanium heat exchangers, and achieved successful commissioning ahead of contractual schedule.',
    specs: [
      { label: 'Overall Recovery', value: '98.5% recycled condensate to cooling towers' },
      { label: 'Pollutant Removal', value: '99.4% COD / BOD reduction' },
      { label: 'Salt Recovery', value: 'Dry crystallized sodium sulfate cake' },
      { label: 'Capital Scale', value: 'Major industrial infrastructure package' }
    ],
    svgDiagram: `
      <svg class="w-full h-44 bg-emerald-950/40 rounded-xl p-4" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="40" width="80" height="40" rx="6" fill="#0D9488" fill-opacity="0.2" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="60" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">ETP / API Sep</text>
        <path d="M100 60 H135" stroke="#2DD4BF" stroke-width="2"/>
        <rect x="135" y="40" width="85" height="40" rx="6" fill="#0D9488" fill-opacity="0.3" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="177" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">Bio Oxidation</text>
        <path d="M220 60 H255" stroke="#2DD4BF" stroke-width="2"/>
        <rect x="255" y="40" width="85" height="40" rx="6" fill="#0D9488" fill-opacity="0.3" stroke="#2DD4BF" stroke-width="1.5"/>
        <text x="297" y="65" text-anchor="middle" fill="#E6FFF6" font-size="11" font-weight="600">High Recovery RO</text>
        <path d="M340 60 H375" stroke="#34D399" stroke-width="2"/>
        <rect x="375" y="30" width="105" height="60" rx="8" fill="#047857" fill-opacity="0.4" stroke="#34D399" stroke-width="2"/>
        <text x="427" y="56" text-anchor="middle" fill="#34D399" font-size="11" font-weight="700">MVR & Crystallizer</text>
        <text x="427" y="72" text-anchor="middle" fill="#A7F3D0" font-size="9">Dry Solid Salt / ZLD</text>
      </svg>
    `
  }
];

function initProjects() {
  const filterButtons = document.querySelectorAll('.project-filter-btn');
  const projectRows = document.querySelectorAll('.project-row');
  const modal = document.getElementById('project-modal');
  const modalContentContainer = document.getElementById('project-modal-body');
  const closeModalBtn = document.getElementById('close-project-modal');

  // Filter interaction
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active', 'bg-emerald-800', 'text-white'));
      btn.classList.add('active', 'bg-emerald-800', 'text-white');

      const filter = btn.getAttribute('data-filter');
      projectRows.forEach(row => {
        const cat = row.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          row.style.display = 'grid';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // Modal open interaction
  projectRows.forEach(row => {
    row.addEventListener('click', (e) => {
      const projId = row.getAttribute('data-id');
      const data = PROJECTS_DATA.find(p => p.id === projId);
      if (data && modal) {
        openProjectModal(data);
      }
    });
  });

  function openProjectModal(data) {
    if (!modalContentContainer) return;

    modalContentContainer.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ${data.category}
              </span>
              <span class="text-xs font-mono text-emerald-300/70">${data.year}</span>
            </div>
            <h3 class="text-2xl lg:text-3xl font-bold font-syne text-white">${data.title}</h3>
            <p class="text-emerald-200/80 text-sm mt-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              ${data.client}
            </p>
          </div>
          <div class="text-right">
            <div class="text-xs uppercase tracking-wider text-emerald-400/80 font-mono">Installed Capacity</div>
            <div class="text-3xl font-extrabold text-white font-syne">${data.capacity}</div>
          </div>
        </div>

        <!-- Engineering Schematic -->
        <div>
          <h4 class="text-xs uppercase tracking-wider text-emerald-300 font-mono mb-2">Process Architecture Flowchart (PFD)</h4>
          ${data.svgDiagram}
        </div>

        <!-- Overview & Scope -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 class="text-xs uppercase font-mono tracking-wider text-emerald-300 mb-2">Infrastructure Scope</h4>
            <p class="text-sm text-gray-300 leading-relaxed">${data.description}</p>
          </div>
          <div class="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 class="text-xs uppercase font-mono tracking-wider text-emerald-300 mb-2">Executive Leadership</h4>
            <p class="text-sm text-gray-300 leading-relaxed">${data.leadershipRole}</p>
          </div>
        </div>

        <!-- Technical Specifications Table -->
        <div>
          <h4 class="text-xs uppercase tracking-wider text-emerald-300 font-mono mb-3">Key Technical Parameters</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${data.specs.map(s => `
              <div class="bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/20">
                <div class="text-xs text-emerald-300/70 font-mono">${s.label}</div>
                <div class="text-sm font-semibold text-white mt-1">${s.value}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Technology Stack -->
        <div class="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div class="text-xs text-gray-400">
            <span class="font-semibold text-emerald-300">Engineering Technologies:</span> ${data.tech}
          </div>
          <a href="#contact" onclick="closeProjectModalFunc()" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold transition">
            Inquire about this project scope ↗
          </a>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  window.closeProjectModalFunc = function() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', window.closeProjectModalFunc);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeProjectModalFunc();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeProjectModalFunc();
  });
}

/* ==========================================================================
   4. Water Scale & Impact Interactive Visualizer
   ========================================================================== */
function initImpactVisualizer() {
  const tabs = document.querySelectorAll('.impact-tab-btn');
  const metricNum = document.getElementById('impact-metric-num');
  const metricUnit = document.getElementById('impact-metric-unit');
  const metricDesc = document.getElementById('impact-metric-desc');
  const metricPeople = document.getElementById('impact-people-count');
  const metricEquiv = document.getElementById('impact-equiv-text');
  const tankFill = document.getElementById('visualizer-water-fill');

  const IMPACT_DATA = {
    mld: {
      num: '200',
      unit: 'MLD (Million Liters/Day)',
      desc: 'Single largest municipal water treatment facility overseen, engineering complete intake, coagulation, filtration, and potable delivery networks.',
      people: '1,420,000+ Citizens',
      equiv: 'Equal to 80 Olympic-sized swimming pools of pure potable water every single day.',
      height: '92%'
    },
    investment: {
      num: '$600M+',
      unit: 'USD Capital Managed',
      desc: 'Cumulative infrastructure portfolio directed across the Arabian Gulf, Maldives, and Indian industrial corridors under rigorous EPC & PPP delivery models.',
      people: 'Multi-Regional Impact',
      equiv: 'Ensuring zero downtime for strategic state-owned assets including Qatar Energy & international hubs.',
      height: '84%'
    },
    zld: {
      num: '100,000',
      unit: 'm³ / day Industrial Reuse',
      desc: 'Comprehensive Zero Liquid Discharge (ZLD) recovering 98%+ industrial wastewater at Indian Oil Corporation complexes, eliminating toxic aquifer seepage.',
      people: 'Environmental Protection',
      equiv: 'Conserving over 36 Billion liters of freshwater annually in critical industrial belts.',
      height: '75%'
    },
    island: {
      num: '35',
      unit: 'MLD Seawater RO',
      desc: 'Full municipal desalination supplying the man-made Pearl-Qatar island archipelago, incorporating state-of-the-art Isobaric Energy Recovery Devices.',
      people: '50,000+ Island Population',
      equiv: 'Power-optimized desalination generating WHO-compliant drinking water directly from the sea.',
      height: '62%'
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active', 'border-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-950/50', 'text-emerald-700', 'dark:text-emerald-300'));
      tab.classList.add('active', 'border-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-950/50', 'text-emerald-700', 'dark:text-emerald-300');

      const key = tab.getAttribute('data-impact');
      const item = IMPACT_DATA[key];
      if (!item) return;

      if (metricNum) metricNum.textContent = item.num;
      if (metricUnit) metricUnit.textContent = item.unit;
      if (metricDesc) metricDesc.textContent = item.desc;
      if (metricPeople) metricPeople.textContent = item.people;
      if (metricEquiv) metricEquiv.textContent = item.equiv;
      if (tankFill) tankFill.style.height = item.height;
    });
  });
}

/* ==========================================================================
   5. Animated Number Counters
   ========================================================================== */
function initNumberCounters() {
  const counterElements = document.querySelectorAll('[data-counter-target]');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counterElements.forEach(el => {
          const target = parseFloat(el.getAttribute('data-counter-target'));
          const prefix = el.getAttribute('data-counter-prefix') || '';
          const suffix = el.getAttribute('data-counter-suffix') || '';
          const duration = 2000;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * target);

            el.textContent = `${prefix}${currentVal}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = `${prefix}${target}${suffix}`;
            }
          }

          requestAnimationFrame(updateCounter);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsSection = document.getElementById('metrics-strip');
  if (metricsSection) observer.observe(metricsSection);
}

/* ==========================================================================
   6. Ambient Water Sound Synthesizer (Pure Web Audio API)
   ========================================================================== */
function initAmbientSound() {
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (!audioBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let noiseNode = null;
  let gainNode = null;
  let filterNode = null;

  function createWaterSound() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Pink noise generator for gentle water stream
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    // Filter to sound like flowing liquid stream
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 450;
    filterNode.Q.value = 2.5;

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 1.5);

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();

    // Subtle droplet generator on interval
    scheduleDroplets();
  }

  function scheduleDroplets() {
    if (!isPlaying || !audioCtx) return;
    const interval = 1200 + Math.random() * 2400;
    setTimeout(() => {
      if (!isPlaying || !audioCtx) return;
      playDroplet();
      scheduleDroplets();
    }, interval);
  }

  function playDroplet() {
    try {
      const osc = audioCtx.createOscillator();
      const dropGain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      const baseFreq = 700 + Math.random() * 600;

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.08);

      dropGain.gain.setValueAtTime(0.02, now);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(dropGain);
      dropGain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  audioBtn.addEventListener('click', () => {
    if (!isPlaying) {
      if (!audioCtx) createWaterSound();
      else if (audioCtx.state === 'suspended') audioCtx.resume();
      
      if (gainNode) {
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 1);
      }
      
      isPlaying = true;
      audioBtn.classList.remove('sound-inactive');
      showToast('Ambient water hydro-soundscape activated');
    } else {
      if (gainNode && audioCtx) {
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      }
      setTimeout(() => {
        if (audioCtx && !isPlaying) audioCtx.suspend();
      }, 500);

      isPlaying = false;
      audioBtn.classList.add('sound-inactive');
      showToast('Ambient audio muted');
    }
  });
}

/* ==========================================================================
   7. Contact System & Quick Clipboard Copy
   ========================================================================= */
function initContactSystem() {
  // Apps Script Webhook endpoint for direct row appending to the Google Sheet
  const GOOGLE_SHEET_WEBHOOK = window.GOOGLE_SHEET_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbztgKG7SVbrF_WF7iEZ4ZzNtFHJ4eRFLeUS5D1dPX5iu2F8ZLTRWPed6ugr5XXMhmNukA/exec";

  const copyButtons = document.querySelectorAll('[data-copy-text]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.getAttribute('data-copy-text');
      const label = btn.getAttribute('data-copy-label') || 'Text';

      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${label} to clipboard: ${text}`);
      }).catch(() => {
        showToast(`Selected: ${text}`);
      });
    });
  });

  const contactForm = document.getElementById('mandate-inquiry-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '<span>Initiate Mandate Discussion</span><span class="font-mono">↗</span>';

      const name = document.getElementById('form-name')?.value.trim() || 'Anonymous';
      const email = document.getElementById('form-email')?.value.trim() || '';
      const subject = document.getElementById('form-subject')?.value || 'Executive Consultation';
      const message = document.getElementById('form-message')?.value.trim() || '';
      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Submitting Inquiry...</span>`;
      }

      showToast(`Submitting your executive inquiry, ${name}...`);

      const inquiryData = {
        timestamp,
        name,
        email,
        subject,
        message,
        source: 'Executive Web Portfolio',
        status: 'New Inquiry'
      };

      // 1. Cache inquiry locally in browser storage
      try {
        const saved = JSON.parse(localStorage.getItem('pb_inquiries') || '[]');
        saved.push(inquiryData);
        localStorage.setItem('pb_inquiries', JSON.stringify(saved));
      } catch (err) {}

      // 2. Transmit directly to Google Apps Script Webhook
      try {
        if (GOOGLE_SHEET_WEBHOOK) {
          fetch(GOOGLE_SHEET_WEBHOOK, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(inquiryData),
            keepalive: true
          }).catch(netErr => console.log('Apps Script transmission sent:', netErr));
        }
      } catch (postErr) {
        console.log('Submission note:', postErr);
      }

      // 3. User feedback and form reset
      setTimeout(() => {
        showToast(`✓ Thank you, ${name}! Your executive inquiry has been sent successfully.`);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>✓ Inquiry Received</span>`;
          setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
          }, 3500);
        }
        contactForm.reset();
      }, 700);
    });
  }
}

/* ==========================================================================
   8. Signature Animation on Scroll
   ========================================================================== */
function initSignatureAnimation() {
  const signatureSvg = document.getElementById('signature-svg');
  if (!signatureSvg) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const path = signatureSvg.querySelector('.signature-path');
        if (path) path.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(signatureSvg);
}

/* ==========================================================================
   9. Custom Water Drop Cursor
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const follower = document.getElementById('cursor-follower');
  if (!dot || !follower) return;

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function animateCursor() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .project-row, .glass-panel, .orbit-badge');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ==========================================================================
   10. Navigation & Mobile Menu
   ========================================================================== */
function initNavigation() {
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-anchor');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });
}

/* ==========================================================================
   Toast Notification Utility
   ========================================================================== */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
