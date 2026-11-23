/* ==========================================================================
   AIRIS Project Page — Interactive Visualizations & Explorer Logic
   ========================================================================== */

(function () {
  'use strict';

  const LEADERBOARD = window.AIRIS_LEADERBOARD || [];
  const ONTOLOGY = window.AIRIS_ONTOLOGY || [];
  const CONTEXTS = window.AIRIS_CONTEXTS || [];
  const BENCHMARKS = window.AIRIS_BENCHMARKS || [];
  const CASES = window.AIRIS_CASES || [];

  /* ------------------------------------------------------------------------
     1. Causal Timeline Prefix Simulator (T0 -> T1 -> T2 -> T3)
     ------------------------------------------------------------------------ */
  const ANCHOR_STATES = [
    {
      key: 't0',
      badge: 'Causal Prefix O_{≤ 2.0s} · 21% Observed · Future [2.0s–9.5s] Masked',
      pct: 21,
      attQ: 'Q: What is the partner’s attentional target now?',
      attA: '✓ Receipt in Ego’s hand (cue onset detected)',
      intQ: 'Q: Can the partner’s intention be determined now?',
      intA: '✓ Insufficient evidence to determine intention (τ < T₁)',
      reaQ: 'Q: What should Ego do at this moment?',
      reaA: '✓ Refrain from intervention · Keep observing',
      interQ: 'Q: What is the current interaction state?',
      interA: '✓ Pre-engagement · No social violation'
    },
    {
      key: 't1',
      badge: 'Causal Prefix O_{≤ 4.5s} · 47% Observed · Future [4.5s–9.5s] Masked',
      pct: 47,
      attQ: 'Q: Jointly identify & localize the active interactant.',
      attA: '✓ Counter staff facing Ego · BBox [310, 48, 492, 458]',
      intQ: 'Q: Can the partner’s intention be determined now?',
      intA: '✓ Earliest decidable moment (τ = T₁): Object request',
      reaQ: 'Q: Should Ego actively engage or wait?',
      reaA: '✓ Prepare active response (anticipation window [T₁, T₂])',
      interQ: 'Q: What is the current interaction state?',
      interA: '✓ Transitioning into Active engagement'
    },
    {
      key: 't2',
      badge: 'Causal Prefix O_{≤ 6.0s} · 63% Observed · Future [6.0s–9.5s] Masked',
      pct: 63,
      attQ: 'Q: Which modalities anchor the partner’s focus?',
      attA: '✓ Gaze + Reaching hand gesture + Torso orientation',
      intQ: 'Q: What is the partner’s goal & supporting evidence?',
      intA: '✓ Object request (grounded in gaze & hand extension)',
      reaQ: 'Q: Specify Ego’s full reaction chain (Joint-EM).',
      reaA: '✓ Engage + Manipulation & Comm. + Hand receipt & Confirm',
      interQ: 'Q: Is any online social violation occurring?',
      interA: '✓ Active engagement · No violation present'
    },
    {
      key: 't3',
      badge: 'Resolved Episode O_{≤ 9.5s} · 100% Episode Observed (τ = T₃)',
      pct: 100,
      attQ: 'Q: Which direction is the partner facing at closure?',
      attA: '✓ Turning away after completing receipt handoff',
      intQ: 'Q: Was the partner’s latent goal consistently satisfied?',
      intA: '✓ Object request fulfilled without premature guessing',
      reaQ: 'Q: What should Ego do after handoff completion?',
      reaA: '✓ Yield space / Refrain from intrusive follow-up',
      interQ: 'Q: Evaluate completion, understanding & etiquette.',
      interA: '✓ Completed · Mutual understanding · Fully compliant'
    }
  ];

  function initCausalSim() {
    const buttons = document.querySelectorAll('.anchor-btn');
    const badge = document.getElementById('sim-badge');
    const fill = document.getElementById('sim-bar-fill');
    const attQ = document.getElementById('sim-att-q');
    const attA = document.getElementById('sim-att-a');
    const intQ = document.getElementById('sim-int-q');
    const intA = document.getElementById('sim-int-a');
    const reaQ = document.getElementById('sim-rea-q');
    const reaA = document.getElementById('sim-rea-a');
    const interQ = document.getElementById('sim-inter-q');
    const interA = document.getElementById('sim-inter-a');

    if (!buttons.length || !fill) return;

    function renderStep(idx) {
      const st = ANCHOR_STATES[idx];
      buttons.forEach((b, i) => b.classList.toggle('active', i === idx));
      badge.textContent = st.badge;
      fill.style.width = st.pct + '%';
      attQ.textContent = st.attQ;
      attA.textContent = st.attA;
      intQ.textContent = st.intQ;
      intA.textContent = st.intA;
      reaQ.textContent = st.reaQ;
      reaA.textContent = st.reaA;
      interQ.textContent = st.interQ;
      interA.textContent = st.interA;
    }

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => renderStep(idx));
    });
    renderStep(0);
  }

  /* ------------------------------------------------------------------------
     2. 36-Capability Ontology Explorer
     ------------------------------------------------------------------------ */
  function initOntology() {
    const grid = document.getElementById('ontology-grid');
    const pills = document.querySelectorAll('#ontology-tabs .tab-pill');
    if (!grid) return;

    function render(stage) {
      const items = stage === 'all'
        ? ONTOLOGY
        : ONTOLOGY.filter(d => d.stage === stage);

      grid.innerHTML = items.map(item => `
        <div class="cap-item st-${item.stage}">
          <div class="cap-top">
            <span class="cap-id">${item.id}</span>
            <span class="cap-meta">${item.prefix} · ${item.format}</span>
          </div>
          <div class="cap-name">${item.name}</div>
          <div class="cap-desc">${item.desc}</div>
        </div>
      `).join('');
    }

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        render(pill.dataset.stage);
      });
    });

    render('all');
  }

  /* ------------------------------------------------------------------------
     3. Context Distribution Bars & Prior Benchmark Matrix (Table 1)
     ------------------------------------------------------------------------ */
  function initContextsAndComparison() {
    const ctxContainer = document.getElementById('context-bars');
    if (ctxContainer && CONTEXTS.length) {
      const maxPct = Math.max(...CONTEXTS.map(c => c.pct));
      ctxContainer.innerHTML = CONTEXTS.map(c => `
        <div class="ctx-row">
          <div class="ctx-name" title="${c.name}">${c.name}</div>
          <div class="ctx-bar-wrap">
            <div class="ctx-bar-fill" style="width:${(c.pct / maxPct * 100).toFixed(1)}%"></div>
          </div>
          <div class="ctx-val">${c.count.toLocaleString()} (${c.pct.toFixed(1)}%)</div>
        </div>
      `).join('');
    }

    const tbody = document.getElementById('comp-table-body');
    if (tbody && BENCHMARKS.length) {
      const icon = v => v
        ? '<span class="ck-yes" aria-label="Yes">✓</span>'
        : '<span class="ck-no" aria-label="No">✗</span>';
      const humanIcon = h => {
        if (h === 'yes') return '<span class="ck-yes">✓</span>';
        if (h === 'partial') return '<span class="ck-part" title="Partial human review">✓*</span>';
        return '<span class="ck-no">–</span>';
      };

      tbody.innerHTML = BENCHMARKS.map(b => `
        <tr class="${b.ours ? 'ours-row' : ''}">
          <td>${b.name}</td>
          <td>${icon(b.ego)}</td>
          <td style="font-family:var(--font-mono)">${b.qa}</td>
          <td style="font-family:var(--font-mono)">${b.dim}</td>
          <td>${humanIcon(b.human)}</td>
          ${b.flags.map(f => `<td>${icon(f)}</td>`).join('')}
        </tr>
      `).join('');
    }
  }

  /* ------------------------------------------------------------------------
     4. Interactive 45-Model Leaderboard
     ------------------------------------------------------------------------ */
  const VIEW_DEFS = {
    overview: [
      { key: 'overall', label: 'Overall ↑', get: m => m.overall, bar: true },
      { key: 'att_all', label: 'A-All ↑', get: m => m.att.all },
      { key: 'att_target', label: 'A-Target ↑', get: m => m.att.target },
      { key: 'att_ground', label: 'A-Ground ↑', get: m => m.att.ground },
      { key: 'int_all', label: 'I-All ↑', get: m => m.int.all },
      { key: 'int_online', label: 'I-Online ↑', get: m => m.int.online },
      { key: 'int_ias', label: 'IAS ↑', get: m => m.int.ias },
      { key: 'rea_all', label: 'R-All ↑', get: m => m.rea.all },
      { key: 'rea_engage', label: 'R-Engage ↑', get: m => m.rea.engage },
      { key: 'rea_joint', label: 'R-Joint ↑', get: m => m.rea.joint },
      { key: 'inter_all', label: 'Inter-All ↑', get: m => m.inter.all },
      { key: 'inter_comp', label: 'Comp. ↑', get: m => m.inter.comp },
      { key: 'inter_viol', label: 'Viol. ↑', get: m => m.inter.viol }
    ],
    attention: [
      { key: 'overall', label: 'Global Overall ↑', get: m => m.overall, bar: true },
      { key: 'att_all', label: 'Attention All ↑', get: m => m.att.all },
      { key: 'att_nonverbal', label: 'Nonverbal State ↑', get: m => m.att.nonverbal },
      { key: 'att_target', label: 'Semantic Target ↑', get: m => m.att.target },
      { key: 'att_spatial', label: 'Spatial Localiz. ↑', get: m => m.att.spatial },
      { key: 'att_joint', label: 'Joint ID-Loc ↑', get: m => m.att.joint },
      { key: 'att_multi', label: 'Multimodal Attr. ↑', get: m => m.att.multimodal }
    ],
    intention: [
      { key: 'overall', label: 'Global Overall ↑', get: m => m.overall, bar: true },
      { key: 'int_all', label: 'Intention All ↑', get: m => m.int.all },
      { key: 'int_key', label: 'Key Moment ↑', get: m => m.int.key },
      { key: 'int_online', label: 'Online Prefix ↑', get: m => m.int.online },
      { key: 'int_ev', label: 'Evidence Ground. ↑', get: m => m.int.evidence },
      { key: 'int_fcr', label: 'Pre-T₁ FCR ↓', get: m => m.int.fcr, asc: true },
      { key: 'int_ias', label: 'IAS ↑', get: m => m.int.ias }
    ],
    reaction: [
      { key: 'overall', label: 'Global Overall ↑', get: m => m.overall, bar: true },
      { key: 'rea_all', label: 'Reaction All ↑', get: m => m.rea.all },
      { key: 'rea_engage', label: 'Engage F1 ↑', get: m => m.rea.engage },
      { key: 'rea_dom', label: 'Action Domain ↑', get: m => m.rea.domain },
      { key: 'rea_sub', label: 'Subaction+Speak ↑', get: m => m.rea.subspeak },
      { key: 'rea_joint', label: 'Joint-EM ↑', get: m => m.rea.joint },
      { key: 'rea_comm', label: 'Comm. ↑', get: m => m.rea.comm },
      { key: 'rea_nav', label: 'Nav. ↑', get: m => m.rea.nav },
      { key: 'rea_manip', label: 'Manip. ↑', get: m => m.rea.manip },
      { key: 'rea_idle', label: 'Refrain/Idle ↑', get: m => m.rea.idle }
    ],
    interaction: [
      { key: 'overall', label: 'Global Overall ↑', get: m => m.overall, bar: true },
      { key: 'inter_all', label: 'Interaction All ↑', get: m => m.inter.all },
      { key: 'inter_state', label: 'Online State ↑', get: m => m.inter.state },
      { key: 'inter_out', label: 'Task Outcome ↑', get: m => m.inter.outcome },
      { key: 'inter_comp', label: 'Norm Compliance ↑', get: m => m.inter.comp },
      { key: 'inter_viol', label: 'Violation Det. ↑', get: m => m.inter.viol }
    ]
  };

  const CAT_SHORT = {
    closed: 'Closed',
    general: 'General',
    embodied: 'Embodied',
    streaming: 'Streaming',
    omni: 'Omni'
  };

  function initLeaderboard() {
    const thead = document.getElementById('lb-thead');
    const tbody = document.getElementById('lb-tbody');
    const countSpan = document.getElementById('lb-count-summary');
    const searchInput = document.getElementById('lb-search');
    const catChips = document.querySelectorAll('#lb-cat-filters .filter-chip');
    const poolBtns = document.querySelectorAll('.pool-btn');
    const viewTabs = document.querySelectorAll('.view-tab');

    if (!thead || !tbody) return;

    let state = {
      pool: 'all', // 'all' (45) or 'main' (37)
      category: 'all',
      query: '',
      view: 'overview',
      sortKey: 'overall',
      sortDir: 'desc'
    };

    function renderTable() {
      const cols = VIEW_DEFS[state.view];
      let activeCol = cols.find(c => c.key === state.sortKey);
      if (!activeCol) {
        activeCol = cols[0];
        state.sortKey = activeCol.key;
        state.sortDir = activeCol.asc ? 'asc' : 'desc';
      }

      let rows = LEADERBOARD.filter(m => {
        if (state.pool === 'main' && !m.inMain) return false;
        if (state.category !== 'all' && m.category !== state.category) return false;
        if (state.query && !m.name.toLowerCase().includes(state.query)) return false;
        return true;
      });

      // Compute best & second-best per column across current filtered set
      const colRanks = {};
      cols.forEach(col => {
        const vals = Array.from(new Set(rows.map(r => col.get(r).toFixed(3))))
          .map(Number)
          .sort((a, b) => col.asc ? a - b : b - a);
        colRanks[col.key] = {
          best: vals[0],
          second: vals.length > 1 ? vals[1] : null
        };
      });

      rows.sort((a, b) => {
        const va = activeCol.get(a);
        const vb = activeCol.get(b);
        if (va !== vb) {
          return state.sortDir === 'asc' ? va - vb : vb - va;
        }
        return b.overall - a.overall;
      });

      if (countSpan) {
        countSpan.textContent = `Showing ${rows.length} of ${state.pool === 'main' ? 37 : 45} models`;
      }

      // Render Header
      thead.innerHTML = `
        <tr>
          <th>#</th>
          <th>Model</th>
          ${cols.map(col => {
            const isSorted = col.key === state.sortKey;
            const arrow = isSorted ? (state.sortDir === 'asc' ? ' ▲' : ' ▼') : '';
            return `<th class="${isSorted ? 'sorted' : ''}" data-key="${col.key}">${col.label}${arrow}</th>`;
          }).join('')}
        </tr>
      `;

      thead.querySelectorAll('th[data-key]').forEach(th => {
        th.addEventListener('click', () => {
          const key = th.dataset.key;
          const col = cols.find(c => c.key === key);
          if (state.sortKey === key) {
            state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            state.sortKey = key;
            state.sortDir = col && col.asc ? 'asc' : 'desc';
          }
          renderTable();
        });
      });

      // Render Rows
      if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="${cols.length + 2}" style="text-align:center;padding:28px;color:var(--ink-muted)">No models match your search criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = rows.map((m, idx) => {
        const nameHtml = m.url
          ? `<a class="model-name-link" href="${m.url}" target="_blank" rel="noopener noreferrer">${m.name}</a>`
          : `<span class="model-name-link">${m.name}</span>`;

        const cellsHtml = cols.map(col => {
          const val = col.get(m);
          const formatted = val.toFixed(3);
          const rk = colRanks[col.key];
          let cls = '';
          if (rows.length > 1 && Math.abs(val - rk.best) < 1e-6) cls = 'val-best';
          else if (rows.length > 2 && rk.second !== null && Math.abs(val - rk.second) < 1e-6) cls = 'val-second';

          if (col.bar) {
            const w = Math.max(6, Math.min(100, (val / 0.8) * 100));
            return `<td class="val-cell">
              <div class="overall-bar-cell">
                <div class="mini-bar"><div class="mini-bar-fill" style="width:${w.toFixed(0)}%"></div></div>
                <span class="${cls}">${formatted}</span>
              </div>
            </td>`;
          }
          return `<td class="val-cell"><span class="${cls}">${formatted}</span></td>`;
        }).join('');

        return `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <div class="model-cell">
                <span class="cat-badge-mini cb-${m.category}">${CAT_SHORT[m.category]}</span>
                ${nameHtml}
              </div>
            </td>
            ${cellsHtml}
          </tr>
        `;
      }).join('');
    }

    catChips.forEach(chip => {
      chip.addEventListener('click', () => {
        catChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.category = chip.dataset.cat;
        renderTable();
      });
    });

    poolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        poolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.pool = btn.dataset.pool;
        renderTable();
      });
    });

    viewTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        viewTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.view = tab.dataset.view;
        const firstMain = VIEW_DEFS[state.view][state.view === 'overview' ? 0 : 1] || VIEW_DEFS[state.view][0];
        state.sortKey = firstMain.key;
        state.sortDir = firstMain.asc ? 'asc' : 'desc';
        renderTable();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.query = e.target.value.trim().toLowerCase();
        renderTable();
      });
    }

    renderTable();
  }

  /* ------------------------------------------------------------------------
     5. Interactive Multi-Model A-I-R-I Crossover Chart (Dynamic N Models)
     ------------------------------------------------------------------------ */
  const SERIES_COLORS = [
    '#0072b2', '#009e73', '#d55e00', '#7c3aed', '#cc79a7',
    '#d98a00', '#0f766e', '#be123c', '#4338ca', '#4d7c0f',
    '#b45309', '#334155'
  ];

  const PRESETS = {
    family5: [
      'Gemini-3.7-Flash',
      'Qwen3.6-35B-A3B',
      'HY-Embodied-VLM-1.0',
      'JoyAI-VL-Interaction-Preview',
      'Qwen2.5-Omni-7B'
    ],
    crossover3: [
      'Gemini-3.7-Flash',
      'Qwen3.6-35B-A3B',
      'HY-Embodied-VLM-1.0'
    ],
    embodied6: [
      'Gemini-3.7-Flash',
      'HY-Embodied-VLM-1.0',
      'RynnBrain1.1-9B',
      'RynnBrain-30B-A3B',
      'MiMo-Embodied-7B',
      'RoboBrain2.0-7B'
    ],
    clear: [
      'Gemini-3.7-Flash',
      'HY-Embodied-VLM-1.0'
    ]
  };

  function initModelComparator() {
    const addSelect = document.getElementById('comp-add-select');
    const chipsBox = document.getElementById('comp-chips');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const svgBox = document.getElementById('comp-svg-container');
    const statsBox = document.getElementById('comp-takeaway-list');
    if (!addSelect || !svgBox) return;

    let selectedNames = [...PRESETS.family5];

    function refreshDropdown() {
      const groups = [
        { key: 'closed', label: 'Closed-Source Models' },
        { key: 'general', label: 'Open-Source General-Purpose' },
        { key: 'embodied', label: 'Open-Source Embodied' },
        { key: 'streaming', label: 'Open-Source Streaming Video' },
        { key: 'omni', label: 'Open-Source Omni-Modal' }
      ];

      let html = `<option value="">+ Add model to compare (${selectedNames.length} selected)…</option>`;
      groups.forEach(g => {
        const avail = LEADERBOARD.filter(m => m.category === g.key && !selectedNames.includes(m.name));
        if (avail.length) {
          html += `<optgroup label="${g.label}">`;
          html += avail.map(m => `<option value="${m.name}">${m.name} (${m.overall.toFixed(3)})</option>`).join('');
          html += `</optgroup>`;
        }
      });
      addSelect.innerHTML = html;
      addSelect.value = '';
    }

    function renderComparison() {
      refreshDropdown();

      const chosen = selectedNames
        .map((name, i) => ({
          model: LEADERBOARD.find(m => m.name === name),
          color: SERIES_COLORS[i % SERIES_COLORS.length]
        }))
        .filter(x => x.model);

      if (chipsBox) {
        const disableRemove = chosen.length <= 1;
        chipsBox.innerHTML = chosen.map(({ model, color }) => `
          <span class="comp-model-chip" style="border-color:${color}55">
            <span class="comp-chip-dot" style="background:${color}"></span>
            <span>${model.name}</span>
            <button type="button" class="comp-chip-remove" data-name="${model.name}" ${disableRemove ? 'disabled title="Keep at least 1 model"' : 'title="Remove model"'} aria-label="Remove ${model.name}">×</button>
          </span>
        `).join('');

        chipsBox.querySelectorAll('.comp-chip-remove').forEach(btn => {
          btn.addEventListener('click', () => {
            if (selectedNames.length <= 1) return;
            selectedNames = selectedNames.filter(n => n !== btn.dataset.name);
            renderComparison();
          });
        });
      }

      const W = 540, H = 280;
      const padL = 48, padR = 26, padT = 28, padB = 42;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const yMin = 0.25, yMax = 1.0;
      const xPos = i => padL + (i / 3) * plotW;
      const yPos = v => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

      const stages = ['Attention', 'Intention', 'Reaction', 'Interaction'];
      const gridVals = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

      let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="auto" role="img" aria-label="A-I-R-I capability profile comparison">`;
      svg += `<rect x="${padL}" y="${padT}" width="${plotW * 0.5}" height="${plotH}" fill="#eff6ff" opacity="0.55" rx="4"/>`;
      svg += `<rect x="${padL + plotW * 0.5}" y="${padT}" width="${plotW * 0.5}" height="${plotH}" fill="#fff7ed" opacity="0.6" rx="4"/>`;
      svg += `<text x="${padL + plotW * 0.25}" y="${padT + 15}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1e40af">PASSIVE PERCEPTION</text>`;
      svg += `<text x="${padL + plotW * 0.75}" y="${padT + 15}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#9a3412">EMBODIED EXECUTION &amp; NORMS</text>`;

      gridVals.forEach(gv => {
        const y = yPos(gv);
        svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3"/>`;
        svg += `<text x="${padL - 8}" y="${y + 3.5}" text-anchor="end" font-size="10" fill="#64748b" font-family="monospace">${gv.toFixed(1)}</text>`;
      });

      stages.forEach((st, i) => {
        const x = xPos(i);
        svg += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + plotH}" stroke="#cbd5e1" stroke-width="0.8"/>`;
        svg += `<text x="${x}" y="${H - 14}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f172a">${st}</text>`;
      });

      chosen.forEach(({ model, color }) => {
        const pts = [model.att.all, model.int.all, model.rea.all, model.inter.all];
        const poly = pts.map((v, i) => `${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`).join(' ');
        svg += `<polyline fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" points="${poly}"/>`;
        pts.forEach((v, i) => {
          svg += `<circle cx="${xPos(i).toFixed(1)}" cy="${yPos(v).toFixed(1)}" r="4.4" fill="#ffffff" stroke="${color}" stroke-width="2.4">
            <title>${model.name} · ${stages[i]}: ${v.toFixed(3)}</title>
          </circle>`;
        });
      });

      svg += `</svg>`;
      svgBox.innerHTML = svg;

      if (statsBox) {
        statsBox.innerHTML = chosen.map(({ model, color }) => `
          <div class="comp-stat-row" style="border-left: 4px solid ${color}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
              <strong style="color:var(--ink-strong)">${model.name}</strong>
              <span style="font-family:var(--font-mono);font-weight:700;font-size:0.8rem">Overall ${model.overall.toFixed(3)}</span>
            </div>
            <div style="font-family:var(--font-mono);font-size:0.74rem;color:var(--ink-muted)">
              IAS: <b>${model.int.ias.toFixed(3)}</b> · Pre-T₁ FCR: <b>${(model.int.fcr * 100).toFixed(0)}%</b> · R-Joint: <b>${(model.rea.joint * 100).toFixed(1)}%</b> · Comp: <b>${model.inter.comp.toFixed(3)}</b>
            </div>
          </div>
        `).join('');
      }
    }

    addSelect.addEventListener('change', () => {
      const val = addSelect.value;
      if (val && !selectedNames.includes(val)) {
        selectedNames.push(val);
        renderComparison();
      }
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset;
        if (PRESETS[key]) {
          selectedNames = [...PRESETS[key]];
          renderComparison();
        }
      });
    });

    renderComparison();
  }

  /* ------------------------------------------------------------------------
     6. Qualitative Case Explorer + Lightbox + BibTeX Copy
     ------------------------------------------------------------------------ */
  function initCasesAndLightbox() {
    const grid = document.getElementById('cases-grid');
    const tabs = document.querySelectorAll('#case-tabs .tab-pill');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCap = document.getElementById('lightbox-cap');
    const lbClose = document.getElementById('lightbox-close');

    function openLightbox(src, caption) {
      if (!lightbox) return;
      lbImg.src = src;
      lbCap.textContent = caption || '';
      lightbox.classList.add('open');
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('open');
      lbImg.src = '';
    }

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lightbox) {
      lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
      });
    }
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });

    document.querySelectorAll('img.zoomable').forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    if (grid) {
      const stageNames = {
        attention: 'Attention',
        intention: 'Intention',
        reaction: 'Reaction',
        interaction: 'Interaction'
      };

      function renderCases(stage) {
        const list = stage === 'all' ? CASES : CASES.filter(c => c.stage === stage);
        grid.innerHTML = list.map((c, idx) => `
          <article class="case-card">
            <div class="case-thumb-wrap" data-idx="${idx}">
              <img src="${c.img}" alt="${c.title} (${c.cap})" loading="lazy"/>
            </div>
            <div class="case-body">
              <div class="case-tags">
                <span class="case-stage-pill cs-${c.stage}">${stageNames[c.stage]}</span>
                <span class="case-scope">${c.scope}</span>
              </div>
              <h3 class="case-title">${c.title}</h3>
              <div class="case-cap">${c.cap}</div>
              <p class="case-desc">${c.summary}</p>
            </div>
          </article>
        `).join('');

        grid.querySelectorAll('.case-thumb-wrap').forEach(el => {
          const item = list[Number(el.dataset.idx)];
          el.addEventListener('click', () => openLightbox(item.img, `${item.cap} — ${item.title}: ${item.summary}`));
        });
      }

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          renderCases(tab.dataset.stage);
        });
      });

      renderCases('all');
    }

    // BibTeX Copy
    const copyBtn = document.getElementById('copy-bibtex-btn');
    const bibPre = document.getElementById('bibtex-code');
    if (copyBtn && bibPre) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(bibPre.textContent.trim()).then(() => {
          const prev = copyBtn.textContent;
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = prev; }, 1800);
        });
      });
    }

    // Scroll-spy for top navigation
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (sections.length && navLinks.length) {
      window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
          const top = sec.offsetTop - 130;
          if (window.scrollY >= top) current = sec.getAttribute('id');
        });
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
      }, { passive: true });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCausalSim();
    initOntology();
    initContextsAndComparison();
    initLeaderboard();
    initModelComparator();
    initCasesAndLightbox();
  });
})();
