import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Trading() {
  const [currentStorage, setCurrentStorage] = useState(8.5);
  const [sellAmount, setSellAmount] = useState('');
  const [tradingPrice, setTradingPrice] = useState(0.24);
  const [estimatedRevenue, setEstimatedRevenue] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState([
    { day: 'Mon', earnings: 1.2 },
    { day: 'Tue', earnings: 2.5 },
    { day: 'Wed', earnings: 1.8 },
    { day: 'Thu', earnings: 3.0 },
    { day: 'Fri', earnings: 2.2 },
    { day: 'Sat', earnings: 4.1 },
    { day: 'Sun', earnings: 1.5 }
  ]);
  const [tradeHistory, setTradeHistory] = useState([
    // Seed with timestamps for proper filtering
    { ts: (() => { const d = new Date(); d.setHours(18,5,0,0); return d.getTime(); })(), amount: 2.0, price: 0.23, revenue: 0.46 },
    { ts: (() => { const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(19,10,0,0); return d.getTime(); })(), amount: 3.5, price: 0.28, revenue: 0.98 }
  ]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Trade successful!');
  const [lastPrice, setLastPrice] = useState(0.24);
  const [priceDelta, setPriceDelta] = useState(0);

  // Mode: manual | auto
  const [mode, setMode] = useState('manual');

  // Auto-managed (grid-like) config
  const [autoConfig, setAutoConfig] = useState({
    baseline: 0.24,
    stepPct: 5, // % between sell levels
    chunkKwh: 0.5,
    upper: 0.6,
    lower: 0.12,
    cooldownSec: 15,
    simulatePrice: true,
  });
  const [autoRunning, setAutoRunning] = useState(false);
  const [gridIndex, setGridIndex] = useState(0);
  const [lastSellAt, setLastSellAt] = useState(0);

  const gridLevels = useMemo(() => {
    const { baseline, stepPct, upper } = autoConfig;
    if (!baseline || !stepPct || !upper) return [];
    const levels = [];
    let lvl = baseline;
    const step = 1 + stepPct / 100; // geometric
    while (lvl <= upper + 1e-6) {
      levels.push(+lvl.toFixed(3));
      lvl *= step;
    }
    return levels;
  }, [autoConfig]);

  const nextSellPrice = gridLevels.length ? gridLevels[Math.min(gridIndex, gridLevels.length - 1)] : null;

  useEffect(() => {
    // Keep baseline in sync with current price for convenience when entering Auto tab
    if (mode === 'auto' && typeof tradingPrice === 'number') {
      setAutoConfig((c) => ({ ...c, baseline: c.baseline ?? tradingPrice }));
    }
  }, [mode]);

  const startAuto = () => {
    if (!gridLevels.length) return;
    if (typeof tradingPrice === 'number') {
      // initialize gridIndex to the first level >= current price
      const idx = gridLevels.findIndex((p) => p >= tradingPrice);
      setGridIndex(idx === -1 ? gridLevels.length - 1 : idx);
    } else {
      setGridIndex(0);
    }
    setAutoRunning(true);
    setToastMessage('Auto mode started');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1800);
  };

  const stopAuto = () => {
    setAutoRunning(false);
    setToastMessage('Auto mode stopped');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1800);
  };

  // Auto engine tick: simulate price (optional) and execute sells on grid crossings
  useEffect(() => {
    if (!autoRunning) return;
    const { simulatePrice, lower, upper } = autoConfig;

    const id = setInterval(() => {
      setTradingPrice((prev) => {
        let prevNum = typeof prev === 'number' ? prev : (typeof tradingPrice === 'number' ? tradingPrice : autoConfig.baseline || 0.24);
        let next = prevNum;
        if (simulatePrice) {
          // random walk within [lower, upper]
          const step = (Math.random() - 0.5) * 0.01; // +/- 0.01
          next = Math.max(lower, Math.min(upper, +(prevNum + step).toFixed(3)));
        }
        // update delta
        setPriceDelta(+(next - prevNum).toFixed(3));
        setLastPrice(prevNum);
        return next;
      });

      // After price update, check grid trigger using latest value from state closure
      // Use a microtask to ensure tradingPrice state applied
      queueMicrotask(() => {
        if (!gridLevels.length) return;
        const price = typeof tradingPrice === 'number' ? tradingPrice : autoConfig.baseline || 0.24;
        const nextPrice = gridLevels[Math.min(gridIndex, gridLevels.length - 1)];
        const nowTs = Date.now();
        const cooldownOk = nowTs - lastSellAt >= (autoConfig.cooldownSec || 0) * 1000;
        if (price >= nextPrice - 1e-6 && currentStorage > 0 && cooldownOk) {
          const amount = Math.min(autoConfig.chunkKwh, currentStorage);
          const px = price;
          const revenue = +(amount * px).toFixed(2);
          // apply sell
          setCurrentStorage((s) => +(Math.max(0, s - amount)).toFixed(2));
          setWeeklyEarnings((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
              const lastIdx = updated.length - 1;
              updated[lastIdx] = { ...updated[lastIdx], earnings: (updated[lastIdx].earnings || 0) + revenue };
            }
            return updated;
          });
          setTradeHistory((prev) => [{ ts: nowTs, amount, price: px, revenue }, ...prev].slice(0, 100));
          setLastSellAt(nowTs);
          setToastMessage(`Auto sold ${amount.toFixed(1)} kWh @ $${px.toFixed(2)}`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 1800);
          // move to next grid level
          setGridIndex((i) => Math.min(i + 1, gridLevels.length - 1));
        }
      });
    }, 1200);

    return () => clearInterval(id);
  }, [autoRunning, autoConfig, gridLevels, gridIndex, currentStorage, tradingPrice]);

  const maxStorage = 10;

  const [earningsRange, setEarningsRange] = useState('7d'); // '7d' | '30d' | '1y' | 'custom'
  const [customStart, setCustomStart] = useState(''); // YYYY-MM-DD
  const [customEnd, setCustomEnd] = useState('');

  // Trade History filters
  const [historyRange, setHistoryRange] = useState('7d'); // '7d' | '30d' | 'all' | 'custom'
  const [historyStart, setHistoryStart] = useState('');
  const [historyEnd, setHistoryEnd] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const resetHistoryFilters = () => {
    setHistoryRange('7d');
    setHistoryStart('');
    setHistoryEnd('');
    setAmountMin('');
    setAmountMax('');
    setPriceMin('');
    setPriceMax('');
  };

  const formatTradeTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const pad = (n) => n.toString().padStart(2, '0');

    if (isSameDay(d, now)) return `Today ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    if (isSameDay(d, yest)) return `Yesterday ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const filteredHistory = useMemo(() => {
    let list = [...tradeHistory];

    // Date range filter
    const now = Date.now();
    let startTs = null, endTs = null;
    if (historyRange === '7d') {
      startTs = now - 7 * 24 * 60 * 60 * 1000;
      endTs = now;
    } else if (historyRange === '30d') {
      startTs = now - 30 * 24 * 60 * 60 * 1000;
      endTs = now;
    } else if (historyRange === 'custom' && historyStart && historyEnd) {
      const s = new Date(historyStart);
      const e = new Date(historyEnd);
      if (!isNaN(s) && !isNaN(e)) {
        startTs = Math.min(s.getTime(), e.getTime());
        endTs = Math.max(s.getTime(), e.getTime()) + (24 * 60 * 60 * 1000 - 1); // inclusive end day
      }
    }
    if (startTs !== null && endTs !== null) {
      list = list.filter(t => t.ts >= startTs && t.ts <= endTs);
    }

    // Amount filter
    const aMin = parseFloat(amountMin);
    const aMax = parseFloat(amountMax);
    if (!isNaN(aMin)) list = list.filter(t => t.amount >= aMin);
    if (!isNaN(aMax)) list = list.filter(t => t.amount <= aMax);

    // Price filter
    const pMin = parseFloat(priceMin);
    const pMax = parseFloat(priceMax);
    if (!isNaN(pMin)) list = list.filter(t => t.price >= pMin);
    if (!isNaN(pMax)) list = list.filter(t => t.price <= pMax);

    // Keep newest first (original order already newest-first)
    return list;
  }, [tradeHistory, historyRange, historyStart, historyEnd, amountMin, amountMax, priceMin, priceMax]);

  useEffect(() => {
    const amount = parseFloat(sellAmount) || 0;
    setEstimatedRevenue((amount * (typeof tradingPrice === 'number' ? tradingPrice : 0)).toFixed(2));
  }, [sellAmount, tradingPrice]);

  const refreshPrice = () => {
    if (mode === 'auto') return; // disabled in auto mode
    setLastPrice((prev) => (typeof tradingPrice === 'number' ? tradingPrice : prev));
    setTradingPrice('...');
    setTimeout(() => {
      const newPrice = parseFloat((Math.random() * 0.1 + 0.2).toFixed(2));
      setPriceDelta((typeof lastPrice === 'number' ? newPrice - lastPrice : 0));
      setTradingPrice(newPrice);
    }, 600);
  };

  const handleSellElectricity = () => {
    const amount = parseFloat(sellAmount);

    if (!amount || amount <= 0 || amount > currentStorage) {
      alert('Please enter a valid amount!');
      return;
    }

    const revenue = amount * (typeof tradingPrice === 'number' ? tradingPrice : 0);

    setCurrentStorage(prev => prev - amount);
    setWeeklyEarnings(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        const lastIdx = updated.length - 1;
        updated[lastIdx] = { ...updated[lastIdx], earnings: (updated[lastIdx].earnings || 0) + revenue };
      }
      return updated;
    });

    const now = new Date();
    const newTrade = {
      ts: now.getTime(),
      amount: amount,
      price: typeof tradingPrice === 'number' ? tradingPrice : 0,
      revenue: parseFloat((amount * (typeof tradingPrice === 'number' ? tradingPrice : 0)).toFixed(2))
    };

    setTradeHistory(prev => [newTrade, ...prev.slice(0, 99)]); // cap to 100
    setSellAmount('');

    setToastMessage('Trade successful!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2600);
  };

  const storagePercentage = (currentStorage / maxStorage) * 100;

  const setQuickAmount = (ratio) => {
    const amount = Math.max(0, Math.min(currentStorage * ratio, currentStorage));
    setSellAmount(amount.toFixed(1));
  };

  const pad = (n) => n.toString().padStart(2, '0');
  const fmtLabel = (d) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // MM-DD
  const monthShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const generateEarnings = (range, startStr, endStr) => {
    const out = [];
    const today = new Date();
    const rng = (min, max) => +(min + Math.random() * (max - min)).toFixed(2);

    if (range === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        out.push({ label: fmtLabel(d), earnings: rng(0.8, 4.5) });
      }
      return out;
    }

    if (range === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        out.push({ label: fmtLabel(d), earnings: rng(0.6, 5.5) });
      }
      return out;
    }

    if (range === '1y') {
      const nowYear = today.getFullYear();
      for (let m = 0; m < 12; m++) {
        const label = monthShort[m];
        out.push({ label, earnings: rng(30, 140) });
      }
      return out;
    }

    if (range === 'custom' && startStr && endStr) {
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (isNaN(start) || isNaN(end)) return out;
      const s = start <= end ? start : end;
      const e = start <= end ? end : start;
      const msPerDay = 24 * 60 * 60 * 1000;
      const days = Math.min(365, Math.max(1, Math.round((e - s) / msPerDay) + 1));
      for (let i = 0; i < days; i++) {
        const d = new Date(s);
        d.setDate(s.getDate() + i);
        out.push({ label: fmtLabel(d), earnings: rng(0.5, 6.0) });
      }
      return out;
    }

    return out;
  };

  useEffect(() => {
    const next = generateEarnings(earningsRange, customStart, customEnd);
    if (next.length > 0 || earningsRange !== 'custom') {
      setWeeklyEarnings(next);
    }
  }, [earningsRange, customStart, customEnd]);

  const earningsTitle = (() => {
    if (earningsRange === '7d') return 'Earnings (AUD) — 7D';
    if (earningsRange === '30d') return 'Earnings (AUD) — 30D';
    if (earningsRange === '1y') return 'Earnings (AUD) — 1Y';
    if (earningsRange === 'custom') {
      return customStart && customEnd ? `Earnings (AUD) — ${customStart} to ${customEnd}` : 'Earnings (AUD) — Custom';
    }
    return 'Earnings (AUD)';
  })();

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
      <section className="relative bg-dark-panel border border-dark-border rounded-lg p-6 sm:p-8 lg:p-10 shadow-card">
        <div className="mb-8 text-center relative">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
            Energy Trading Center
          </h2>
          <p className="text-sm text-text-secondary">Professional trading and revenue management</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-dark-card border border-dark-border p-6 rounded-lg text-center hover:border-trade-up/40 transition-all shadow-card">
              <h4 className="text-[11px] text-text-secondary/80 uppercase tracking-wider mb-3">Grid buy price (AUD/kWh)</h4>
              <div className="flex items-center justify-center gap-3">
                <p className="text-5xl font-bold font-mono text-text-primary mb-1 tabular-nums">
                  {typeof tradingPrice === 'number' ? tradingPrice.toFixed(2) : '...'}
                </p>
                {typeof tradingPrice === 'number' && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold ${priceDelta >= 0 ? 'bg-trade-up/20 text-trade-up border-trade-up/40' : 'bg-trade-down/20 text-trade-down border-trade-down/40'} border rounded`}>
                    {priceDelta >= 0 ? '▲' : '▼'} {Math.abs(priceDelta).toFixed(2)}
                  </span>
                )}
              </div>
              <button
                onClick={refreshPrice}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm text-tech-blue hover:text-tech-blue/80 font-medium bg-dark-inner border border-dark-border rounded hover:border-tech-blue/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Refresh price"
                disabled={mode==='auto'}
              >
                <span>🔄</span> Refresh Price
              </button>
            </div>

            <div className="bg-dark-card border border-dark-border p-6 rounded-lg hover:border-tech-blue/40 transition-all shadow-card">
              <h4 className="text-[11px] text-text-secondary/80 uppercase tracking-wider mb-3">Current storage</h4>
              <div className="relative w-full bg-dark-inner rounded-full h-3 shadow-inner border border-dark-border overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 progress-fill rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, storagePercentage || 0))}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-2 font-semibold font-mono text-text-primary">
                {currentStorage.toFixed(1)} / {maxStorage} kWh
              </p>
            </div>

            <div className="p-5 surface-success rounded-lg shadow-card">
              <h4 className="font-bold text-success text-base mb-2">✅ Smart Recommendation</h4>
              <p className="text-text-secondary leading-relaxed text-sm">
                Current price is high — consider selling to maximize revenue.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-dark-card border border-dark-border p-8 rounded-lg shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-text-primary">Trading</h3>
              <div className="bg-dark-inner/70 border border-dark-border rounded p-1 flex">
                <button onClick={() => setMode('manual')} className={`px-3 py-1.5 text-sm font-medium rounded ${mode==='manual'?'bg-tech-blue text-white':'text-text-secondary hover:text-text-primary'}`}>Manual</button>
                <button onClick={() => setMode('auto')} className={`px-3 py-1.5 text-sm font-medium rounded ${mode==='auto'?'bg-tech-blue text-white':'text-text-secondary hover:text-text-primary'}`}>Auto</button>
              </div>
            </div>

            {mode === 'manual' ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="sell-amount" className="block text-sm font-medium text-text-secondary mb-2">
                    Sell amount (kWh)
                  </label>
                  <input
                    type="number"
                    id="sell-amount"
                    min="0"
                    step="0.1"
                    max={currentStorage}
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="block w-full rounded-lg bg-dark-inner border border-dark-border text-text-primary focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue text-lg p-3"
                    placeholder="e.g. 2.5"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                    <span>Max available: <strong className="tabular-nums text-text-secondary">{currentStorage.toFixed(1)} kWh</strong></span>
                    <div className="flex gap-2">
                      <button onClick={() => setQuickAmount(0.25)} className="px-2.5 py-1 rounded bg-dark-inner border border-dark-border hover:border-tech-blue/50 text-text-secondary text-xs">25%</button>
                      <button onClick={() => setQuickAmount(0.5)} className="px-2.5 py-1 rounded bg-dark-inner border border-dark-border hover:border-tech-blue/50 text-text-secondary text-xs">50%</button>
                      <button onClick={() => setQuickAmount(0.75)} className="px-2.5 py-1 rounded bg-dark-inner border border-dark-border hover:border-tech-blue/50 text-text-secondary text-xs">75%</button>
                      <button onClick={() => setQuickAmount(1)} className="px-2.5 py-1 rounded bg-dark-inner border border-dark-border hover:border-tech-blue/50 text-text-secondary text-xs">Max</button>
                    </div>
                  </div>
                </div>
                <div className="text-right bg-dark-inner border border-dark-border p-4 rounded-lg shadow-inner">
                  <p className="text-sm text-text-secondary/90 mb-1">Estimated revenue</p>
                  <p className="text-3xl font-bold font-mono text-tech-blue tabular-nums">${estimatedRevenue}</p>
                </div>
                <button
                  onClick={handleSellElectricity}
                  disabled={!sellAmount || tradingPrice === '...' || autoRunning}
                  className="w-full bg-tech-blue text-white font-bold py-4 px-6 rounded hover:bg-tech-blue/90 transition-all duration-300 shadow-glow-blue disabled:bg-dark-hover disabled:cursor-not-allowed disabled:shadow-none text-lg tracking-wide"
                >
                  Confirm Sell
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Baseline price (AUD/kWh)</label>
                    <input type="number" step="0.001" value={autoConfig.baseline}
                      onChange={(e)=>setAutoConfig(c=>({...c, baseline: parseFloat(e.target.value)||0}))}
                      className="w-full rounded-lg bg-dark-inner border border-dark-border text-text-primary focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Grid step (%)</label>
                    <input type="number" step="0.1" value={autoConfig.stepPct}
                      onChange={(e)=>setAutoConfig(c=>({...c, stepPct: Math.max(0.1, parseFloat(e.target.value)||0)}))}
                      className="w-full rounded-lg bg-dark-inner border border-dark-border text-text-primary focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Chunk per sell (kWh)</label>
                    <input type="number" step="0.1" value={autoConfig.chunkKwh}
                      onChange={(e)=>setAutoConfig(c=>({...c, chunkKwh: Math.max(0.1, parseFloat(e.target.value)||0)}))}
                      className="w-full rounded-lg bg-dark-inner border border-dark-border text-text-primary focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Upper bound (AUD)</label>
                    <input type="number" step="0.001" value={autoConfig.upper}
                      onChange={(e)=>setAutoConfig(c=>({...c, upper: Math.max(c.lower||0, parseFloat(e.target.value)||0)}))}
                      className="w-full rounded-lg bg-dark-inner border border-dark-border text-text-primary focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Lower bound (AUD)</label>
                    <input type="number" step="0.001" value={autoConfig.lower}
                      onChange={(e)=>setAutoConfig(c=>({...c, lower: Math.min(c.upper||Infinity, parseFloat(e.target.value)||0)}))}
                      className="w-full rounded-lg bg-dark-inner border border-dark-border text-text-primary focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Cooldown (sec)</label>
                    <input type="number" step="1" value={autoConfig.cooldownSec}
                      onChange={(e)=>setAutoConfig(c=>({...c, cooldownSec: Math.max(1, parseInt(e.target.value)||1)}))}
                      className="w-full rounded-lg bg-dark-inner border border-dark-border text-text-primary focus:border-tech-blue focus:outline-none focus:ring-1 focus:ring-tech-blue p-2.5" />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input id="sim-price" type="checkbox" checked={autoConfig.simulatePrice}
                      onChange={(e)=>setAutoConfig(c=>({...c, simulatePrice: e.target.checked}))}
                      className="rounded bg-dark-inner border-dark-border text-tech-blue focus:ring-tech-blue" />
                    <label htmlFor="sim-price" className="text-sm text-text-secondary">Simulate price movement</label>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-dark-inner border border-dark-border p-4 rounded-lg">
                  <div className="text-sm text-text-secondary">
                    <div>Next sell price: <span className="font-semibold font-mono tabular-nums text-text-primary">{nextSellPrice ? `$${nextSellPrice.toFixed(2)}` : '-'}</span></div>
                    <div className="text-text-muted">Levels: {gridLevels.length} • Step: {autoConfig.stepPct}% • Chunk: {autoConfig.chunkKwh} kWh</div>
                  </div>
                  <div className="flex gap-2">
                    {!autoRunning ? (
                      <button onClick={startAuto} className="px-4 py-2 rounded bg-trade-up text-white font-semibold shadow hover:bg-trade-up/90">Start</button>
                    ) : (
                      <button onClick={stopAuto} className="px-4 py-2 rounded bg-trade-down text-white font-semibold shadow hover:bg-trade-down/90">Stop</button>
                    )}
                    <button onClick={() => { setGridIndex(0); setToastMessage('Grid reset'); setShowToast(true); setTimeout(()=>setShowToast(false), 1200); }} className="px-3 py-2 rounded bg-dark-inner border border-dark-border text-text-secondary hover:border-tech-blue/50">Reset</button>
                  </div>
                </div>

                <p className="text-xs text-text-muted">Auto mode sells in tranches when price crosses each grid level. It does not auto-buy. Ensure you have sufficient storage.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary">{earningsTitle}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setEarningsRange('7d')} className={`px-3 py-1.5 rounded text-sm ${earningsRange==='7d'?'bg-tech-blue text-white':'bg-dark-bg border border-dark-border text-text-secondary hover:border-tech-blue/50'}`}>7D</button>
                <button onClick={() => setEarningsRange('30d')} className={`px-3 py-1.5 rounded text-sm ${earningsRange==='30d'?'bg-tech-blue text-white':'bg-dark-bg border border-dark-border text-text-secondary hover:border-tech-blue/50'}`}>30D</button>
                <button onClick={() => setEarningsRange('1y')} className={`px-3 py-1.5 rounded text-sm ${earningsRange==='1y'?'bg-tech-blue text-white':'bg-dark-bg border border-dark-border text-text-secondary hover:border-tech-blue/50'}`}>1Y</button>
                <button onClick={() => setEarningsRange('custom')} className={`px-3 py-1.5 rounded text-sm ${earningsRange==='custom'?'bg-tech-blue text-white':'bg-dark-bg border border-dark-border text-text-secondary hover:border-tech-blue/50'}`}>Custom</button>
              </div>
            </div>

            {earningsRange === 'custom' && (
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <label htmlFor="earn-start" className="text-text-secondary">Start</label>
                  <input id="earn-start" type="date" value={customStart} onChange={(e)=>setCustomStart(e.target.value)} className="rounded-md bg-dark-bg border border-dark-border text-text-primary focus:border-tech-blue focus:ring-1 focus:ring-tech-blue px-2 py-1" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <label htmlFor="earn-end" className="text-text-secondary">End</label>
                  <input id="earn-end" type="date" value={customEnd} onChange={(e)=>setCustomEnd(e.target.value)} className="rounded-md bg-dark-bg border border-dark-border text-text-primary focus:border-tech-blue focus:ring-1 focus:ring-tech-blue px-2 py-1" />
                </div>
                <span className="text-xs text-text-muted">Max 365 days</span>
              </div>
            )}

            <div className="p-4 bg-dark-card border border-dark-border rounded-lg shadow-inner h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyEarnings.map(d=> d.label? d : { label: d.day, earnings: d.earnings })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
                  <XAxis dataKey="label" tick={{ fill: '#9598a1' }} />
                  <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#9598a1' }} />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} labelStyle={{ color: '#e0e3eb' }} contentStyle={{ backgroundColor: '#1a1e2e', borderRadius: 8, border: '1px solid #2a3142' }} />
                  <Line type="monotone" dataKey="earnings" stroke="#26a69a" strokeWidth={2} dot={{ r: 3, stroke: '#26a69a', fill: '#131722', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-text-primary">Trade History</h3>
            <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden shadow-card">
              <div className="p-4 border-b border-dark-border">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-text-secondary/90 mr-2">Filters:</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setHistoryRange('7d')} className={`px-3 py-1.5 rounded text-xs ${historyRange==='7d'?'bg-tech-blue text-white':'bg-dark-bg border border-dark-border text-text-secondary hover:border-tech-blue/50'}`}>7D</button>
                    <button onClick={() => setHistoryRange('30d')} className={`px-3 py-1.5 rounded text-xs ${historyRange==='30d'?'bg-tech-blue text-white':'bg-dark-bg border border-dark-border text-text-secondary hover:border-tech-blue/50'}`}>30D</button>
                    <button onClick={() => setHistoryRange('all')} className={`px-3 py-1.5 rounded text-xs ${historyRange==='all'?'bg-tech-blue text-white':'bg-dark-bg border border-dark-border text-text-secondary hover:border-tech-blue/50'}`}>All</button>
                    <button onClick={() => setHistoryRange('custom')} className={`px-3 py-1.5 rounded text-xs ${historyRange==='custom'?'bg-tech-blue text-white':'bg-dark-bg border border-dark-border text-text-secondary hover:border-tech-blue/50'}`}>Custom</button>
                  </div>

                  {historyRange === 'custom' && (
                    <div className="flex items-center gap-2 text-xs ml-2">
                      <label htmlFor="hist-start" className="text-text-secondary">Start</label>
                      <input id="hist-start" type="date" value={historyStart} onChange={(e)=>setHistoryStart(e.target.value)} className="rounded-md bg-dark-bg border border-dark-border text-text-primary focus:border-tech-blue focus:ring-1 focus:ring-tech-blue px-2 py-1" />
                      <label htmlFor="hist-end" className="text-text-secondary">End</label>
                      <input id="hist-end" type="date" value={historyEnd} onChange={(e)=>setHistoryEnd(e.target.value)} className="rounded-md bg-dark-bg border border-dark-border text-text-primary focus:border-tech-blue focus:ring-1 focus:ring-tech-blue px-2 py-1" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs ml-2">
                    <label className="text-text-secondary">Amt</label>
                    <input type="number" step="0.1" placeholder="min" value={amountMin} onChange={(e)=>setAmountMin(e.target.value)} className="w-20 rounded-md bg-dark-bg border border-dark-border text-text-primary focus:border-tech-blue focus:ring-1 focus:ring-tech-blue px-2 py-1" />
                    <span className="text-text-muted">-</span>
                    <input type="number" step="0.1" placeholder="max" value={amountMax} onChange={(e)=>setAmountMax(e.target.value)} className="w-20 rounded-md bg-dark-bg border border-dark-border text-text-primary focus:border-tech-blue focus:ring-1 focus:ring-tech-blue px-2 py-1" />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <label className="text-text-secondary">Price</label>
                    <input type="number" step="0.01" placeholder="min" value={priceMin} onChange={(e)=>setPriceMin(e.target.value)} className="w-20 rounded-md bg-dark-bg border border-dark-border text-text-primary focus:border-tech-blue focus:ring-1 focus:ring-tech-blue px-2 py-1" />
                    <span className="text-text-muted">-</span>
                    <input type="number" step="0.01" placeholder="max" value={priceMax} onChange={(e)=>setPriceMax(e.target.value)} className="w-20 rounded-md bg-dark-bg border border-dark-border text-text-primary focus:border-tech-blue focus:ring-1 focus:ring-tech-blue px-2 py-1" />
                  </div>

                  <button onClick={resetHistoryFilters} className="ml-auto text-xs px-3 py-1.5 rounded bg-dark-bg border border-dark-border text-text-secondary hover:border-tech-blue/50">Reset</button>
                </div>
                <div className="mt-2 text-xs text-text-muted">Showing {filteredHistory.length} record(s)</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-secondary uppercase bg-dark-bg border-b border-dark-border">
                    <tr>
                      <th scope="col" className="px-6 py-3">Time</th>
                      <th scope="col" className="px-6 py-3">Amount (kWh)</th>
                      <th scope="col" className="px-6 py-3">Price</th>
                      <th scope="col" className="px-6 py-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-text-muted">No trade records</td>
                      </tr>
                    ) : (
                      filteredHistory.map((trade, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-dark-card border-b border-dark-border' : 'bg-dark-panel border-b border-dark-border'}>
                          <td className="px-6 py-4 text-text-secondary">{formatTradeTime(trade.ts)}</td>
                          <td className="px-6 py-4 font-medium font-mono tabular-nums text-text-primary">{trade.amount.toFixed(1)}</td>
                          <td className="px-6 py-4 font-mono tabular-nums text-text-primary">${trade.price.toFixed(2)}</td>
                          <td className="px-6 py-4 font-bold font-mono text-trade-up tabular-nums">${trade.revenue.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showToast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-dark-card/95 text-text-primary py-3 px-4 rounded-lg shadow-glow-blue border border-tech-blue/50 backdrop-blur">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}

export default Trading;
