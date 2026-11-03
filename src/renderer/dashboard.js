// Usage dashboard: tiles, per-day stacked chart and tables.
const DAY = 86400000;
const MAX_SERIES = 8;

const dash = { days: 30, currency: 'USD', records: [], config: null };

const $ = (id) => document.getElementById(id);

// The user's own custom/dashboard.png wins over the bundled picture.
{
  const img = $('mascot').querySelector('img');
  const sources = ['../../custom/dashboard.png', '../../assets/dashboard.png'];
  img.addEventListener('load', () => { $('mascot').hidden = false; });
  img.addEventListener('error', () => { if (sources.length) img.src = sources.shift(); });
  img.src = sources.shift();
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const dayStart = (ms) => new Date(ms).setHours(0, 0, 0, 0);
const dayKey = (ms) => {
  const d = new Date(ms);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

function money(usd) {
  if (dash.currency === 'KRW') {
    const krw = usd * dash.config.krwRate;
    return `₩${krw < 10 && krw > 0 ? krw.toFixed(2) : Math.round(krw).toLocaleString()}`;
  }
  if (usd === 0) return '$0';
  return usd < 0.01 ? `$${usd.toFixed(4)}` : `$${usd.toFixed(2)}`;
}

const tokens = (r) => (r.cacheHit ?? 0) + (r.cacheMiss ?? 0) + (r.output ?? 0);
const sum = (list, f) => list.reduce((a, r) => a + f(r), 0);
const cost = (r) => r.cost ?? 0;

function renderTiles() {
  const now = Date.now();
  const today = dash.records.filter((r) => r.ts >= dayStart(now));
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const month = dash.records.filter((r) => r.ts >= monthStart);
  const budget = dash.config.budgetUsd;
  const monthCost = sum(month, cost);
  const used = budget ? monthCost / budget : 0;
  const meter = budget
    ? `<div class="meter"><div style="width:${Math.min(used * 100, 100)}%"></div></div>`
    : '';
  const tile = (label, value, sub, extra = '') =>
    `<div class="tile"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div>${extra}</div>`;
  $('tiles').innerHTML =
    tile('오늘', money(sum(today, cost)), `${today.filter((r) => r.kind === 'chat').length}회 요청`) +
    tile('이번 달', money(monthCost), budget ? `예산 ${money(budget)}의 ${Math.round(used * 100)}%` : '예산 미설정', meter) +
    tile('전체 누적', money(sum(dash.records, cost)), `${dash.records.filter((r) => r.kind === 'chat').length}회 요청`) +
    tile('이번 달 토큰', sum(month, tokens).toLocaleString(), `입력 ${sum(month, (r) => (r.cacheHit ?? 0) + (r.cacheMiss ?? 0)).toLocaleString()} · 출력 ${sum(month, (r) => r.output ?? 0).toLocaleString()}`);
}

// Series color follows first appearance over all history, so a filter never
// repaints an API.
function seriesList() {
  const order = [];
  for (const r of dash.records) if (!order.some((s) => s.id === r.profileId)) order.push({ id: r.profileId, name: r.profileName });
  const main = order.slice(0, MAX_SERIES - 1);
  if (order.length >= MAX_SERIES) main.push({ id: '__other', name: '기타' });
  return main.map((s, i) => ({ ...s, color: `var(--s${i + 1})` }));
}

function niceMax(value) {
  if (value <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 2, 4, 8, 10]) if (m * step >= value) return m * step;
  return value;
}

function renderChart() {
  const chart = $('chart');
  const tooltip = $('tooltip');
  chart.querySelector('svg')?.remove();
  const series = seriesList();
  const ids = new Set(series.map((s) => s.id));
  const start = dayStart(Date.now()) - (dash.days - 1) * DAY;
  const days = Array.from({ length: dash.days }, (_, i) => ({ ts: dayStart(start + i * DAY + DAY / 2), parts: {}, total: 0 }));
  for (const r of dash.records) {
    const index = Math.round((dayStart(r.ts) - start) / DAY);
    if (index < 0 || index >= days.length) continue;
    const id = ids.has(r.profileId) ? r.profileId : '__other';
    days[index].parts[id] = (days[index].parts[id] ?? 0) + cost(r);
    days[index].total += cost(r);
  }

  $('legend').innerHTML = series.length > 1
    ? series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')
    : '';

  const width = chart.clientWidth;
  const height = chart.clientHeight;
  const pad = { l: 56, r: 8, t: 8, b: 22 };
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  const top = niceMax(Math.max(...days.map((d) => d.total)));
  const y = (v) => pad.t + plotH - (v / top) * plotH;
  const slot = plotW / days.length;
  const barW = Math.max(Math.min(slot - 2, 24), 2);

  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="일별 추산 비용 차트">`;
  for (let i = 0; i <= 4; i++) {
    const v = (top * i) / 4;
    svg += `<line x1="${pad.l}" x2="${width - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--grid)"/>`;
    svg += `<text x="${pad.l - 6}" y="${y(v) + 4}" text-anchor="end">${money(v)}</text>`;
  }
  const labelEvery = Math.ceil(days.length / 8);
  days.forEach((d, i) => {
    const x = pad.l + i * slot + (slot - barW) / 2;
    let base = 0;
    const present = series.filter((s) => d.parts[s.id] > 0);
    present.forEach((s, k) => {
      const v = d.parts[s.id];
      // The 2px gap comes off the top of a lower segment, so bars stay on the baseline.
      const y1 = y(base + v) + (k < present.length - 1 ? 2 : 0);
      const h = Math.max(y(base) - y1, 1);
      const radius = Math.min(k === present.length - 1 ? 4 : 0, barW / 2, h);
      svg += `<path fill="${s.color}" d="M${x},${y1 + h} V${y1 + radius} Q${x},${y1} ${x + radius},${y1} H${x + barW - radius} Q${x + barW},${y1} ${x + barW},${y1 + radius} V${y1 + h} Z"/>`;
      base += v;
    });
    if ((days.length - 1 - i) % labelEvery === 0) {
      svg += `<text x="${x + barW / 2}" y="${height - 6}" text-anchor="middle">${dayKey(d.ts)}</text>`;
    }
    svg += `<rect data-i="${i}" x="${pad.l + i * slot}" y="${pad.t}" width="${slot}" height="${plotH}" fill="transparent"/>`;
  });
  chart.insertAdjacentHTML('afterbegin', `${svg}</svg>`);

  chart.querySelector('svg').addEventListener('mousemove', (e) => {
    const i = e.target.dataset?.i;
    if (i === undefined) { tooltip.hidden = true; return; }
    const d = days[i];
    const rows = series.filter((s) => d.parts[s.id] > 0)
      .map((s) => `<div><span><i style="background:${s.color}"></i>${esc(s.name)}</span><span>${money(d.parts[s.id])}</span></div>`);
    tooltip.innerHTML = `<div><b>${dayKey(d.ts)}</b><b>${money(d.total)}</b></div>${rows.join('')}`;
    tooltip.hidden = false;
    const box = chart.getBoundingClientRect();
    const left = e.clientX - box.left + 12;
    tooltip.style.left = `${Math.min(left, box.width - tooltip.offsetWidth - 4)}px`;
    tooltip.style.top = `${Math.max(e.clientY - box.top - tooltip.offsetHeight - 8, 0)}px`;
  });
  chart.querySelector('svg').addEventListener('mouseleave', () => { tooltip.hidden = true; });
}

function renderTables() {
  const since = dayStart(Date.now()) - (dash.days - 1) * DAY;
  const inRange = dash.records.filter((r) => r.ts >= since);
  const groups = new Map();
  for (const r of inRange) {
    const key = `${r.profileId}|${r.model}`;
    if (!groups.has(key)) groups.set(key, { name: r.profileName, model: r.model, list: [] });
    groups.get(key).list.push(r);
  }
  const rows = [...groups.values()].sort((a, b) => sum(b.list, cost) - sum(a.list, cost)).map((g) => `
    <tr><td>${esc(g.name)}</td><td>${esc(g.model)}</td>
    <td class="num">${g.list.length.toLocaleString()}</td>
    <td class="num">${sum(g.list, (r) => r.cacheMiss ?? 0).toLocaleString()}</td>
    <td class="num">${sum(g.list, (r) => r.cacheHit ?? 0).toLocaleString()}</td>
    <td class="num">${sum(g.list, (r) => r.output ?? 0).toLocaleString()}</td>
    <td class="num">${money(sum(g.list, cost))}</td></tr>`);
  $('by-api').innerHTML = rows.length
    ? `<tr><th>API</th><th>모델</th><th class="num">요청</th><th class="num">입력</th><th class="num">캐시 입력</th><th class="num">출력</th><th class="num">비용</th></tr>${rows.join('')}`
    : '<tr><td class="empty">이 기간의 기록이 없습니다.</td></tr>';

  const recent = dash.records.filter((r) => r.kind === 'chat').slice(-10).reverse().map((r) => `
    <tr><td>${new Date(r.ts).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
    <td>${esc(r.profileName)}${r.estimated ? '<span class="tag">추정</span>' : ''}</td>
    <td class="num">${((r.cacheHit ?? 0) + (r.cacheMiss ?? 0)).toLocaleString()}</td>
    <td class="num">${(r.output ?? 0).toLocaleString()}</td>
    <td class="num">${money(cost(r))}</td></tr>`);
  $('recent').innerHTML = recent.length
    ? `<tr><th>시각</th><th>API</th><th class="num">입력</th><th class="num">출력</th><th class="num">비용</th></tr>${recent.join('')}`
    : '<tr><td class="empty">아직 요청이 없습니다.</td></tr>';
}

function renderDashboard() {
  if ($('dashboard').hidden || !dash.config) return;
  document.querySelectorAll('#range button').forEach((b) => b.classList.toggle('active', +b.dataset.days === dash.days));
  document.querySelectorAll('#currency button').forEach((b) => b.classList.toggle('active', b.dataset.cur === dash.currency));
  renderTiles();
  renderChart();
  renderTables();
}

async function refreshDashboard() {
  [dash.records, dash.config] = await Promise.all([window.api.usage(), window.api.getConfig()]);
  dash.currency = dash.config.currency;
  dash.records.sort((a, b) => a.ts - b.ts);
  renderDashboard();
}

$('range').addEventListener('click', (e) => {
  if (!e.target.dataset.days) return;
  dash.days = +e.target.dataset.days;
  renderDashboard();
});
$('currency').addEventListener('click', (e) => {
  if (!e.target.dataset.cur) return;
  dash.currency = e.target.dataset.cur;
  window.api.setConfig({ currency: dash.currency });
  renderDashboard();
});
$('clear-usage').addEventListener('click', async () => {
  if (!confirm('사용 기록을 모두 삭제할까요? 되돌릴 수 없습니다.')) return;
  await window.api.clearUsage();
});

window.api.onUsageChanged(refreshDashboard);
new ResizeObserver(() => renderDashboard()).observe($('chart'));
