import { formatMinor } from "@/lib/money/format";

type Point = { date: string; incomeMinor: number; expenseMinor: number };

function label(date: string, monthly: boolean) {
  const parsed = new Date(`${date.length === 7 ? `${date}-01` : date}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en", { month: "short", ...(monthly ? { year: "numeric" as const } : { day: "numeric" as const }) }).format(parsed);
}

function TrendChart({ currency, points, monthly }: { currency: string; points: Point[]; monthly: boolean }) {
  const width = 640; const height = 220; const left = 48; const right = 12; const top = 14; const bottom = 36;
  const max = Math.max(1, ...points.flatMap((point) => [point.incomeMinor, point.expenseMinor]));
  const x = (i: number) => left + (points.length < 2 ? 0 : i * (width - left - right) / (points.length - 1));
  const y = (value: number) => top + (max - value) * (height - top - bottom) / max;
  const income = points.map((point, i) => `${x(i)},${y(point.incomeMinor)}`).join(" ");
  const expense = points.map((point, i) => `${x(i)},${y(point.expenseMinor)}`).join(" ");
  const ticks = [0, 0.5, 1].map((fraction) => Math.round(max * fraction));
  const labels = points.filter((_, i) => i === 0 || i === points.length - 1 || (monthly ? i % Math.ceil(points.length / 6) === 0 : i % Math.ceil(points.length / 5) === 0));
  return <figure className="chart-figure">
    <figcaption>{currency} · income and expenses</figcaption>
    <div className="chart-scroll"><svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${currency} income and expense trend for ${points.length} ${monthly ? "months" : "days"}`}>
      {ticks.map((value) => <g key={value}><line x1={left} x2={width - right} y1={y(value)} y2={y(value)} className="chart-gridline"/><text x={left - 7} y={y(value) + 4} textAnchor="end" className="chart-axis">{formatMinor(value, currency)}</text></g>)}
      {points.length > 1 && <><polyline points={income} className="chart-line chart-income"/><polyline points={expense} className="chart-line chart-expense"/></>}
      {points.length === 1 && <><circle cx={x(0)} cy={y(points[0].incomeMinor)} r="4" className="chart-dot-income"/><circle cx={x(0)} cy={y(points[0].expenseMinor)} r="4" className="chart-dot-expense"/></>}
      {labels.map((point) => <text key={point.date} x={x(points.indexOf(point))} y={height - 10} textAnchor="middle" className="chart-axis">{label(point.date, monthly)}</text>)}
    </svg></div>
    <ul className="chart-legend"><li><span className="legend-income"/>Income</li><li><span className="legend-expense"/>Expenses</li></ul>
    <details className="chart-data"><summary>View chart data</summary><ul>{points.map((point) => <li key={point.date}>{label(point.date, monthly)}: income {formatMinor(point.incomeMinor, currency)}, expenses {formatMinor(point.expenseMinor, currency)}</li>)}</ul></details>
  </figure>;
}

export function ReportCharts({ spending, series, monthly }: {
  spending: { currency: string; categories: { name: string; amountMinor: number }[] }[];
  series: { currency: string; points: Point[] }[];
  monthly: boolean;
}) {
  return <section id="reports" className="dashboard-reports" aria-label="Spending and trend charts"><div className="report-grid">
    <section className="report-panel" aria-labelledby="category-title"><div className="section-title-row"><div><p className="eyebrow">Where it went</p><h2 id="category-title">Spending by category</h2></div></div>
      {spending.length === 0 ? <div className="chart-empty-state"><svg className="empty-chart" viewBox="0 0 360 150" role="img" aria-label="No expense data to chart"><line x1="28" y1="18" x2="28" y2="122"/><line x1="28" y1="122" x2="344" y2="122"/><line x1="28" y1="48" x2="344" y2="48"/><line x1="28" y1="84" x2="344" y2="84"/><rect x="62" y="100" width="44" height="22" rx="5"/><rect x="143" y="100" width="44" height="22" rx="5"/><rect x="224" y="100" width="44" height="22" rx="5"/></svg><p>No expenses in this date range yet.</p></div> : spending.map((group) => { const max = Math.max(...group.categories.map((item) => item.amountMinor), 1); return <div className="category-chart" key={group.currency}><h3>{group.currency}</h3><ol>{group.categories.slice(0, 8).map((item) => <li key={item.name}><div className="category-chart-label"><span>{item.name}</span><strong>{formatMinor(item.amountMinor, group.currency)}</strong></div><div className="category-track" role="img" aria-label={`${item.name}: ${formatMinor(item.amountMinor, group.currency)}`}><span style={{ width: `${Math.max(2, item.amountMinor / max * 100)}%` }}/></div></li>)}</ol></div>; })}
    </section>
    <section className="report-panel" aria-labelledby="trend-title"><div className="section-title-row"><div><p className="eyebrow">Over time</p><h2 id="trend-title">Income and expenses</h2></div></div>
      {series.length === 0 ? <div className="chart-empty-state"><svg className="empty-chart" viewBox="0 0 640 220" role="img" aria-label="No transaction trend data to chart"><line x1="48" y1="18" x2="48" y2="184"/><line x1="48" y1="184" x2="628" y2="184"/><line x1="48" y1="72" x2="628" y2="72"/><line x1="48" y1="128" x2="628" y2="128"/><line x1="48" y1="184" x2="628" y2="184" strokeDasharray="5 6"/></svg><p>No transactions in this date range yet.</p></div> : series.map((group) => <TrendChart key={group.currency} currency={group.currency} points={group.points} monthly={monthly}/>)}
    </section>
  </div></section>;
}
