'use client';
import { useState, useEffect } from 'react';
import { Funnel, BriefcaseBusiness, UserRound, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { calculateForecast } from '@/lib/forecast';
export default function Home() {
  const [lang, L] = useState('en'),
    [currency, C] = useState('USD'),
    [revenue, R] = useState('10000'),
    [order, O] = useState('1000'),
    [start, S] = useState('2026-05-08'),
    [end, E] = useState('2026-11-04'),
    [lead, A] = useState(40),
    [prospect, B] = useState(20);
  const t = (en: string, bg: string) => (lang === 'bg' ? bg : en);
  const forecast = revenue.trim() !== '' && order.trim() !== ''
    ? calculateForecast({ revenue: Number(revenue), averageOrderValue: Number(order), leadResponseRate: lead, prospectResponseRate: prospect })
    : null;
  const valid = forecast !== null;
  const { customers, leads, prospects } = forecast ?? { customers: 0, leads: 0, prospects: 0 };
  const dates = Boolean(start && end && end >= start),
    months = dates
      ? Math.max(
          1,
          Math.ceil((Date.parse(end) - Date.parse(start)) / 86400000 / 30.4375),
        )
      : 0;
  const rows = Array.from({ length: Math.min(months, 24) }, (_, i) => {
    const month = Math.ceil(((i + 1) * months) / Math.min(months, 24));
    return {
      month,
      prospects: (prospects * month) / months,
      leads: (leads * month) / months,
      customers: (customers * month) / months,
    };
  });
  const fmt = (n: number) =>
    new Intl.NumberFormat(lang === 'bg' ? 'bg-BG' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(Math.ceil(n));
  const cards = [
    {
      name: t('Prospects', 'Контакти'),
      value: prospects,
      percent: 100,
      icon: BriefcaseBusiness,
    },
    {
      name: t('Leads', 'Потенциални клиенти'),
      value: leads,
      percent: prospect,
      icon: UserRound,
    },
    {
      name: t('Customers', 'Клиенти'),
      value: customers,
      percent: (lead * prospect) / 100,
      icon: Trophy,
    },
  ];
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void;
        };
      }
    ).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      context.registerTool(
        {
          name: 'read_campaign_forecast',
          description:
            'Read the current revenue inputs and calculated customer, lead, and prospect targets.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
          execute: () => ({
            valid,
            revenue: Number(revenue),
            averageOrderValue: Number(order),
            leadResponseRate: lead,
            prospectResponseRate: prospect,
            customers,
            leads,
            prospects,
          }),
        },
        { signal: lifecycle.signal },
      );
    } catch {
      /* Optional browser capability. */
    }
    return () => lifecycle.abort();
  }, [valid, revenue, order, lead, prospect, customers, leads, prospects]);
  return (
    <main className="calculator">
      <aside>
        <h1>
          <Funnel />
          <span>
            <b>Lead</b>Predictor
          </span>
        </h1>
        <form className="panel settings" onSubmit={(e) => e.preventDefault()}>
          <label>
            {t('Language', 'Език')}
            <NativeSelect
              aria-label="Language"
              value={lang}
              onChange={(e) => L(e.target.value)}
            >
              <option value="en">🇺🇸 English</option>
              <option value="bg">🇧🇬 Български</option>
            </NativeSelect>
          </label>
          <label>
            {t('Currency', 'Валута')}
            <NativeSelect
              aria-label={t('Currency', 'Валута')}
              value={currency}
              onChange={(e) => C(e.target.value)}
            >
              <option value="USD">$ US Dollar</option>
              <option value="EUR">€ Euro</option>
              <option value="GBP">£ British Pound</option>
            </NativeSelect>
          </label>
          <label>
            {t('Campaign Start', 'Начало на кампанията')}
            <Input
              type="date"
              value={start}
              max={end || undefined}
              onChange={(e) => S(e.target.value)}
            />
          </label>
          <label>
            {t('Campaign End', 'Край на кампанията')}
            <Input
              type="date"
              value={end}
              min={start || undefined}
              onChange={(e) => E(e.target.value)}
            />
          </label>
          <label>
            {t('Total Revenue', 'Общ приход')}
            <div className="money">
              <span>{symbol}</span>
              <Input
                type="number"
                min="0"
                step="any"
                value={revenue}
                onChange={(e) => R(e.target.value)}
              />
            </div>
          </label>
          <label>
            {t('Avg. Order Value', 'Средна стойност на поръчка')}
            <div className="money">
              <span>{symbol}</span>
              <Input
                type="number"
                min="0.01"
                step="any"
                value={order}
                onChange={(e) => O(e.target.value)}
              />
            </div>
          </label>
        </form>
      </aside>
      <section className="workspace" aria-label="Campaign forecast">
        <div className="panel forecast">
          <div className="chart-area">
            <div className="chart-heading">
              <span>{t('CAMPAIGN FORECAST', 'ПРОГНОЗА ЗА КАМПАНИЯТА')}</span>
              <span>
                {months} {t('months', 'месеца')}
              </span>
            </div>
            <ChartContainer
              className="campaign-chart"
              config={{
                prospects: { label: cards[0].name, color: '#667180' },
                leads: { label: cards[1].name, color: '#8b96a6' },
                customers: { label: cards[2].name, color: '#bdc6d2' },
              }}
            >
              <BarChart
                data={valid && dates ? rows : []}
                layout="vertical"
                barGap={-28}
                barSize={28}
                margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
                accessibilityLayer
              >
                <CartesianGrid stroke="#303b4a" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'dataMax']}
                  tickFormatter={(n) => fmt(n)}
                />
                <YAxis
                  type="category"
                  dataKey="month"
                  width={32}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: t('Month', 'Месец'),
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#bdc6d2',
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  cursor={{ fill: '#ffffff06' }}
                  contentStyle={{
                    background: '#2c3849',
                    border: '1px solid #64748b',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => `${t('Month', 'Месец')} ${v}`}
                  formatter={(v, name) => [fmt(Number(v)), name]}
                />
                <Bar
                  dataKey="prospects"
                  name={cards[0].name}
                  fill="#667180"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="leads"
                  name={cards[1].name}
                  fill="#8b96a6"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="customers"
                  name={cards[2].name}
                  fill="#bdc6d2"
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
            <div className="legend">
              {cards.map((c, i) => (
                <span key={i}>
                  <i
                    style={{ background: ['#667180', '#8b96a6', '#bdc6d2'][i] }}
                  />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
          <div className="cards" aria-live="polite">
            {cards.map((c, i) => (
              <section className={`metric metric-${i}`} key={i}>
                <div className="metric-title">
                  <c.icon size={19} />
                  <h2>{c.name}</h2>
                  <span>{Number(c.percent.toFixed(2))}%</span>
                </div>
                <strong>{valid ? fmt(c.value) : '—'}</strong>
                <Progress
                  value={valid ? c.percent : 0}
                  aria-label={`${c.name} %`}
                />
              </section>
            ))}
          </div>
        </div>
        <div className="panel rates">
          {[
            {
              label: t(
                'Lead Response Rate',
                'Процент отговорили потенциални клиенти',
              ),
              value: lead,
              set: A,
            },
            {
              label: t('Prospect Response Rate', 'Процент отговорили контакти'),
              value: prospect,
              set: B,
            },
          ].map((rate) => (
            <div className="rate" key={rate.label}>
              <label>{rate.label}</label>
              <Slider
                aria-label={rate.label}
                min={1}
                max={100}
                step={1}
                value={[rate.value]}
                onValueChange={(v) => rate.set(Array.isArray(v) ? v[0] : v)}
              />
              <output>{rate.value.toFixed(2)}%</output>
            </div>
          ))}
        </div>
        <p className="note" role="status">
          {!valid
            ? t(
                'Enter a non-negative revenue and an average order value greater than zero.',
                'Въведете неотрицателен приход и средна поръчка над нула.',
              )
            : !dates
              ? t(
                  'Choose an end date on or after the start date.',
                  'Крайната дата трябва да бъде след началната.',
                )
              : t(
                  'Cumulative targets · People rounded up · Currency changes the unit, not the amounts',
                  'Натрупани цели · Броят хора е закръглен нагоре · Валутата променя единицата, не сумите',
                )}
        </p>
      </section>
    </main>
  );
}
