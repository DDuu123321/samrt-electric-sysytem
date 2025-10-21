import { useState, useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

function Dashboard() {
  const [region, setRegion] = useState('NSW');
  const [subRegion, setSubRegion] = useState('Sydney CBD');
  const [interval, setInterval] = useState('1h');
  const [stats, setStats] = useState({ current: 24.7, avg: 21.5, peak: 35.2, low: 10.8 });
  const [recommendation, setRecommendation] = useState('Hold power for evening peak, consider selling 18:00 - 20:00.');

  const subRegionsByRegion = {
    NSW: [
      'Sydney CBD','Eastern Suburbs','Inner West','Lower North Shore','Upper North Shore','Northern Beaches','Parramatta','Blacktown','Penrith','Hills District','Canterbury-Bankstown','Sutherland Shire','Macarthur (Campbelltown)','Blue Mountains','Central Coast','Newcastle','Lake Macquarie','Maitland','Cessnock','Hunter Valley','Wollongong','Shellharbour','Shoalhaven','Illawarra','Southern Highlands','Goulburn','Bathurst','Orange','Dubbo','Tamworth','Coffs Harbour','Port Macquarie','Byron Bay','Lismore','Albury','Wagga Wagga','Griffith'
    ],
    VIC: [
      'Melbourne CBD','Inner East','Inner South','Northern Suburbs','Western Suburbs','Eastern Suburbs','South East Suburbs','Bayside','St Kilda','Docklands','Port Melbourne','Yarra Valley','Mornington Peninsula','Geelong','Surf Coast','Ballarat','Bendigo','Shepparton','Latrobe Valley','Warrnambool','Mildura'
    ],
    QLD: [
      'Brisbane CBD','North Brisbane','South Brisbane','East Brisbane','West Brisbane','Logan','Ipswich','Moreton Bay','Redlands','Gold Coast','Sunshine Coast','Toowoomba','Cairns','Townsville','Mackay','Rockhampton','Gladstone','Bundaberg','Hervey Bay','Mount Isa'
    ],
    SA: [
      'Adelaide CBD','North Adelaide','South Adelaide','Port Adelaide','Glenelg','Gawler','Salisbury','Tea Tree Gully','Onkaparinga','Mawson Lakes','Mount Barker','Victor Harbor','Whyalla','Port Lincoln','Port Augusta','Mount Gambier'
    ],
    WA: [
      'Perth CBD','North Perth','South Perth','East Perth','West Perth','Fremantle','Cottesloe','Joondalup','Stirling','Morley','Belmont','Canning','Rockingham','Kwinana','Mandurah','Bunbury','Busselton','Geraldton','Albany','Kalgoorlie'
    ],
    TAS: [
      'Hobart CBD','North Hobart','Glenorchy','Clarence','Kingborough','Sorell','Launceston','Devonport','Burnie','Ulverstone','New Norfolk'
    ],
    ACT: [
      'Canberra CBD','Belconnen','Gungahlin','Inner North','Inner South','Tuggeranong','Woden Valley','Weston Creek','Molonglo Valley'
    ],
    NT: [
      'Darwin CBD','Palmerston','Casuarina','Nightcliff','Katherine','Alice Springs','Nhulunbuy'
    ],
  };

  const stepMap = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400, '1w': 604800, '1mo': 2592000 };
  const getStep = (iv) => stepMap[iv] || 3600;

  const generateOHLCWithForecast = (seed = 25, pastBars = 240, futureBars = 48) => {
    const nowSec = Math.floor(Date.now() / 1000);
    const step = getStep(interval);
    const start = nowSec - (pastBars - 1) * step;
    const total = pastBars + futureBars;
    const out = [];
    let price = seed + (region.charCodeAt(0) % 3) + (subRegion.charCodeAt(0) % 2);
    for (let k = 0; k < total; k++) {
      const ts = start + k * step;
      const isFuture = ts > nowSec;
      const drift = (Math.sin(k / 15) + Math.cos(k / 28)) * (isFuture ? 0.06 : 0.1);
      const noise = (Math.random() - 0.5) * (isFuture ? 0.35 : 0.6);
      const open = price;
      const close = Math.max(0.1, open + drift + noise);
      const high = Math.max(open, close) + Math.random() * (isFuture ? 0.35 : 0.5);
      const low = Math.min(open, close) - Math.random() * (isFuture ? 0.35 : 0.5);
      out.push({ time: ts, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
      price = close;
    }
    return out;
  };

  const [ohlc, setOhlc] = useState([]);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const actualSeriesRef = useRef(null);
  const forecastSeriesRef = useRef(null);
  const chartBoxRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverBoxRef = useRef(null);

  useEffect(() => {
    const list = subRegionsByRegion[region] || [];
    if (!list.includes(subRegion)) setSubRegion(list[0]);
  }, [region]);

  useEffect(() => {
    const data = generateOHLCWithForecast(25, 240, 48);
    setOhlc(data);
    const closes = data.filter(d => d.time <= Math.floor(Date.now() / 1000)).map(d => d.close);
    const current = closes[closes.length - 1] || 0;
    const avg = closes.length ? closes.reduce((a, b) => a + b, 0) / closes.length : 0;
    const peak = closes.length ? Math.max(...closes) : 0;
    const low = closes.length ? Math.min(...closes) : 0;
    setStats({ current: current.toFixed(1), avg: avg.toFixed(1), peak: peak.toFixed(1), low: low.toFixed(1) });
    setRecommendation(current > avg ? 'Price above average, consider gradual selling.' : 'Price below average, consider holding.');
  }, [region, subRegion, interval]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
    const chart = createChart(chartContainerRef.current, {
      height: 420,
      layout: { background: { type: 'solid', color: '#131722' }, textColor: '#9598a1' },
      rightPriceScale: { borderColor: '#2a3142' },
      timeScale: { borderColor: '#2a3142' },
      crosshair: { mode: CrosshairMode.Normal },
      grid: { horzLines: { color: '#2a3142' }, vertLines: { color: '#2a3142' } },
    });
    const actual = chart.addLineSeries({
      color: '#26a69a',
      lineWidth: 2,
      priceLineVisible: true,
    });
    const forecast = chart.addLineSeries({
      color: '#fbbf24', // 对齐 demo 的预测线颜色
      lineWidth: 2,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    actualSeriesRef.current = actual;
    forecastSeriesRef.current = forecast;

    const handleResize = () => { chart.applyOptions({ width: chartContainerRef.current.clientWidth }); };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!actualSeriesRef.current || !forecastSeriesRef.current) return;
    const nowSec = Math.floor(Date.now() / 1000);
    const past = ohlc
      .filter(d => d.time <= nowSec)
      .map(d => ({ time: d.time, value: d.close }));
    const future = ohlc
      .filter(d => d.time > nowSec)
      .map(d => ({ time: d.time, value: d.close }));
    actualSeriesRef.current.setData(past);
    forecastSeriesRef.current.setData(future);

    if (past.length > 0) {
      const lastTime = past[past.length - 1].time;
      actualSeriesRef.current.setMarkers([
        { time: lastTime, position: 'aboveBar', color: '#2962ff', shape: 'circle', text: 'Now' },
      ]);
    } else {
      actualSeriesRef.current.setMarkers([]);
    }
  }, [ohlc]);

  useEffect(() => {
    if (!chartRef.current || !tooltipRef.current || !chartBoxRef.current) return;
    const tipEl = tooltipRef.current;
    const hoverEl = hoverBoxRef.current;

    const getValFromSeriesData = (sd) => {
      if (!sd) return undefined;
      if (typeof sd === 'number') return sd;
      if (typeof sd.value === 'number') return sd.value;
      if (typeof sd.close === 'number') return sd.close;
      return undefined;
    };

    const getValFromPricesMap = (map, series) => {
      try {
        const v = map?.get?.(series);
        return typeof v === 'number' ? v : (typeof v?.value === 'number' ? v.value : undefined);
      } catch { return undefined; }
    };

    const pad = (n) => String(n).padStart(2, '0');
    const fmtTime = (t) => {
      if (!t) return '';
      if (typeof t === 'number') {
        const d = new Date(t * 1000);
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      if (typeof t === 'object' && 'year' in t) {
        return `${t.year}-${pad(t.month)}-${pad(t.day)}`;
      }
      return '';
    };

    const handler = (param) => {
      if (!param || !param.point || param.time === undefined) {
        tipEl.style.display = 'none';
        if (hoverEl) hoverEl.innerHTML = '<div class="text-text-muted">Hover to inspect…</div>';
        return;
      }

      const sdA = actualSeriesRef.current ? param.seriesData?.get?.(actualSeriesRef.current) : undefined;
      const sdF = forecastSeriesRef.current ? param.seriesData?.get?.(forecastSeriesRef.current) : undefined;
      let vA = getValFromSeriesData(sdA);
      let vF = getValFromSeriesData(sdF);
      if (vA === undefined || vF === undefined) {
        const mp = param.seriesPrices;
        if (vA === undefined && actualSeriesRef.current) vA = getValFromPricesMap(mp, actualSeriesRef.current);
        if (vF === undefined && forecastSeriesRef.current) vF = getValFromPricesMap(mp, forecastSeriesRef.current);
      }

      if (vA === undefined && vF === undefined) {
        tipEl.style.display = 'none';
        if (hoverEl) hoverEl.innerHTML = '<div class="text-text-muted">Hover to inspect…</div>';
        return;
      }

      const timeStr = fmtTime(param.time);
      let html = `<div class=\"text-text-secondary mb-1\">${timeStr}</div>`;
      if (vA !== undefined) html += `<div class=\"text-trade-up\"><span class=\"font-semibold\">Actual:</span> ${vA.toFixed(2)} c/kWh</div>`;
      if (vF !== undefined) html += `<div class=\"text-trade-up/60\"><span class=\"font-semibold\">Forecast:</span> ${vF.toFixed(2)} c/kWh</div>`;
      tipEl.innerHTML = html;
      if (hoverEl) hoverEl.innerHTML = html;

      const margin = 12;
      const width = tipEl.offsetWidth || 200;
      const height = tipEl.offsetHeight || 60;
      const boxW = chartBoxRef.current.clientWidth;
      const boxH = chartBoxRef.current.clientHeight;
      let left = param.point.x + margin;
      let top = param.point.y + margin;
      if (left + width + 8 > boxW) left = Math.max(8, param.point.x - width - margin);
      if (top + height + 8 > boxH) top = Math.max(8, param.point.y - height - margin);
      tipEl.style.left = `${left}px`;
      tipEl.style.top = `${top}px`;
      tipEl.style.display = 'block';
    };

    chartRef.current.subscribeCrosshairMove(handler);
    return () => {
      try { chartRef.current?.unsubscribeCrosshairMove?.(handler); } catch {}
    };
  }, [region, subRegion, interval, ohlc]);

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
      <section className="relative bg-dark-panel border border-dark-border rounded-lg p-6 sm:px-8 lg:p-10 shadow-card">
        <div className="mb-8 text-center relative">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-2">Price Forecast</h2>
          <p className="text-sm text-text-secondary/90">Real-time price and AI-powered forecasts</p>
        </div>

        {/* 指标卡 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-card border border-dark-border p-5 rounded-lg hover:border-tech-blue/40 transition-all shadow-card">
            <h4 className="text-[11px] text-text-secondary/80 uppercase tracking-wider mb-2">Current (c/kWh)</h4>
            <p className="text-3xl font-bold font-mono text-text-primary tabular-nums">{stats.current}</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5 rounded-lg hover:border-text-secondary/40 transition-all shadow-card">
            <h4 className="text-[11px] text-text-secondary/80 uppercase tracking-wider mb-2">Average Today (c/kWh)</h4>
            <p className="text-3xl font-bold font-mono text-text-primary tabular-nums">{stats.avg}</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5 rounded-lg hover:border-trade-down/40 transition-all shadow-card">
            <h4 className="text-[11px] text-text-secondary/80 uppercase tracking-wider mb-2">Peak Today (c/kWh)</h4>
            <p className="text-3xl font-bold font-mono text-text-primary tabular-nums">{stats.peak}</p>
          </div>
          <div className="bg-dark-card border border-dark-border p-5 rounded-lg hover:border-trade-up/40 transition-all shadow-card">
            <h4 className="text-[11px] text-text-secondary/80 uppercase tracking-wider mb-2">Low Today (c/kWh)</h4>
            <p className="text-3xl font-bold font-mono text-text-primary tabular-nums">{stats.low}</p>
          </div>
        </div>

        {/* 过滤器 */}
        <div className="flex flex-wrap gap-3 items-center mb-6 p-4 bg-dark-card border border-dark-border rounded-lg">
          <h4 className="font-medium text-text-secondary text-sm uppercase tracking-wider">Filters:</h4>

          <label className="sr-only" htmlFor="region">Region</label>
          <select id="region" value={region} onChange={(e) => setRegion(e.target.value)} className="bg-dark-inner border border-dark-border text-text-primary px-3 py-1.5 text-sm rounded focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue">
            <option>NSW</option>
            <option>VIC</option>
            <option>QLD</option>
            <option>SA</option>
            <option>WA</option>
            <option>ACT</option>
            <option>TAS</option>
            <option>NT</option>
          </select>

          <label className="sr-only" htmlFor="sub">Sub-region</label>
          <select id="sub" value={subRegion} onChange={(e) => setSubRegion(e.target.value)} className="bg-dark-inner border border-dark-border text-text-primary px-3 py-1.5 text-sm rounded focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue">
            {(subRegionsByRegion[region] || []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="interval">Interval</label>
          <select id="interval" value={interval} onChange={(e) => setInterval(e.target.value)} className="bg-dark-inner border border-dark-border text-text-primary px-3 py-1.5 text-sm rounded focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue">
            {['1m','5m','15m','1h','4h','1d','1w','1mo'].map(iv => (
              <option key={iv} value={iv}>{iv}</option>
            ))}
          </select>

          {/* 图例 */}
          <div className="ml-auto flex items-center gap-3 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-trade-up"></span> Actual</span>
            <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#fbbf24]"></span> Forecast</span>
          </div>
        </div>

        {/* 图表 */}
        <div ref={chartBoxRef} className="relative w-full h-[420px] rounded-lg bg-dark-panel border border-dark-border shadow-card overflow-hidden">
          <div ref={chartContainerRef} className="w-full h-full" />
          <div ref={tooltipRef} className="pointer-events-none absolute z-10 min-w-[180px] rounded-md bg-dark-card/95 border border-dark-border shadow-lg px-3 py-2 text-xs" style={{ display: 'none' }} />
          <div ref={hoverBoxRef} className="absolute top-2 left-2 z-10 rounded-md bg-dark-card/90 backdrop-blur px-3 py-2 text-xs border border-dark-border shadow-lg">
            <div className="text-text-muted">Hover to inspect…</div>
          </div>
        </div>

        {/* 推荐 */}
        <div className="mt-6 p-5 surface-info rounded-lg shadow-card">
          <h4 className="font-bold text-info text-base mb-2">💡 Recommendation</h4>
          <p className="text-text-secondary leading-relaxed">{recommendation}</p>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
