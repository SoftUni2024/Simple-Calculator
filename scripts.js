'use strict';

function calculateCampaign(revenue, order, leadRate, prospectRate) {
  if (![revenue, order, leadRate, prospectRate].every(Number.isFinite) ||
      revenue < 0 || order <= 0 || leadRate <= 0 || leadRate > 100 ||
      prospectRate <= 0 || prospectRate > 100) return null;
  const customers = revenue / order;
  const leads = customers * 100 / leadRate;
  const prospects = leads * 100 / prospectRate;
  return [customers, leads, prospects].every(Number.isFinite)
    ? { customers, leads, prospects } : null;
}

function campaignRows(start, end, totals) {
  const first = Date.parse(start), last = Date.parse(end);
  if (!Number.isFinite(first) || !Number.isFinite(last) || last < first) return null;
  const months = Math.max(1, Math.ceil((last - first) / 86400000 / 30.4375));
  const count = Math.min(months, 24);
  return { months, rows: Array.from({ length: count }, (_, i) => {
    const month = Math.ceil((i + 1) * months / count);
    return { month, customers: totals.customers * (month / months),
      leads: totals.leads * (month / months), prospects: totals.prospects * (month / months) };
  }) };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { calculateCampaign, campaignRows };

if (typeof document !== 'undefined') {
  const words = {
    en: { language:'Language', currency:'Currency', start:'Campaign Start', end:'Campaign End', revenue:'Total Revenue', order:'Avg. Order Value', forecast:'CAMPAIGN FORECAST', prospects:'Prospects', leads:'Leads', customers:'Customers', leadRate:'Lead Response Rate', prospectRate:'Prospect Response Rate', month:'Month', months:'months', people:'People', chart:'Cumulative campaign targets', description:'Prospects, leads, and customers needed by campaign month.', invalid:'Enter a non-negative revenue and an average order value greater than zero.', invalidDates:'Choose an end date on or after the start date.', note:'Cumulative targets · People rounded up · Currency changes the unit, not the amounts' },
    bg: { language:'Език', currency:'Валута', start:'Начало на кампанията', end:'Край на кампанията', revenue:'Общ приход', order:'Средна стойност на поръчка', forecast:'ПРОГНОЗА ЗА КАМПАНИЯТА', prospects:'Контакти', leads:'Потенциални клиенти', customers:'Клиенти', leadRate:'Процент отговорили потенциални клиенти', prospectRate:'Процент отговорили контакти', month:'Месец', months:'месеца', people:'Хора', chart:'Натрупани цели на кампанията', description:'Необходими контакти, потенциални клиенти и клиенти по месец.', invalid:'Въведете неотрицателен приход и средна поръчка над нула.', invalidDates:'Крайната дата трябва да бъде след началната.', note:'Натрупани цели · Броят хора е закръглен нагоре · Валутата променя единицата, не сумите' }
  };
  const byId = id => document.getElementById(id);
  const keys = ['prospects', 'leads', 'customers'];
  const colors = ['#667180', '#8b96a6', '#bdc6d2'];
  const svgElement = (name, attributes, text) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function drawChart(campaign, totals, text, format) {
    const container = byId('chart-content');
    container.replaceChildren();
    if (!campaign || !totals) return;
    const x = 38, y = 12, width = 365, height = 245;
    const maximum = totals.prospects || 1;
    for (let i = 0; i <= 5; i++) {
      const position = x + width * i / 5;
      container.append(svgElement('line', { x1:position, x2:position, y1:y, y2:y+height, stroke:'#303b4a' }));
      container.append(svgElement('text', { x:position, y:y+height+18, 'text-anchor':i===5?'end':i===0?'start':'middle', fill:'#b9c4d3', 'font-size':9 }, format(maximum*i/5)));
    }
    container.append(svgElement('text', { x:width/2+x, y:295, 'text-anchor':'middle', fill:'#93a2b5', 'font-size':10 }, text.people));
    const rowHeight = height / campaign.rows.length;
    campaign.rows.forEach((row, index) => {
      const rowY = y + index * rowHeight;
      const group = svgElement('g', { tabindex:0, role:'img', class:'chart-row' });
      const summary = `${text.month} ${row.month}: ${keys.map(key => `${text[key]} ${format(row[key])}`).join(', ')}`;
      group.setAttribute('aria-label', summary);
      group.append(svgElement('title', {}, summary));
      group.append(svgElement('rect', { x, y:rowY, width, height:rowHeight, fill:'transparent' }));
      keys.forEach((key, i) => group.append(svgElement('rect', { x, y:rowY+2, width:width*(row[key]/maximum), height:Math.max(2,rowHeight-5), fill:colors[i] })));
      group.append(svgElement('text', { x:x-9, y:rowY+rowHeight/2+3, 'text-anchor':'end', fill:'#c7d0dc', 'font-size':10 }, row.month));
      container.append(group);
    });
  }

  function update() {
    const language = byId('language').value;
    const text = words[language];
    const format = number => new Intl.NumberFormat(language==='bg'?'bg-BG':'en-US', { maximumFractionDigits:0 }).format(Math.ceil(number));
    document.documentElement.lang = language;
    document.querySelectorAll('[data-text]').forEach(element => { element.textContent = text[element.dataset.text]; });
    byId('chart-title').textContent = text.chart;
    byId('chart-description').textContent = text.description;
    byId('forecast-region').setAttribute('aria-label', text.chart);
    const symbol = { USD:'$', EUR:'€', GBP:'£' }[byId('currency').value];
    document.querySelectorAll('.currency-symbol').forEach(element => { element.textContent = symbol; });
    const lead = Number(byId('lead-rate').value), prospect = Number(byId('prospect-rate').value);
    for (const [id, value] of [['lead',lead],['prospect',prospect]]) {
      byId(`${id}-output`).textContent = value.toFixed(2)+'%';
      byId(`${id}-rate`).style.setProperty('--fill', `${(value-1)/99*100}%`);
      byId(`${id}-rate`).setAttribute('aria-valuetext', value+'%');
    }
    const totals = calculateCampaign(byId('revenue').valueAsNumber, byId('order').valueAsNumber, lead, prospect);
    const campaign = campaignRows(byId('start').value, byId('end').value, totals || {customers:0,leads:0,prospects:0});
    byId('start').max = byId('end').value;
    byId('end').min = byId('start').value;
    byId('duration').textContent = campaign ? `${campaign.months} ${text.months}` : '—';
    const percentages = [100, prospect, lead*prospect/100];
    keys.forEach((key,i) => {
      byId(`${key}-value`).textContent = totals ? format(totals[key]) : '—';
      byId(`${key}-percent`).textContent = Number(percentages[i].toFixed(2))+'%';
      byId(`${key}-meter`).style.width = (totals ? percentages[i] : 0)+'%';
    });
    for (const id of ['revenue','order','start','end']) {
      const invalid = ['start','end'].includes(id) ? !campaign : !totals;
      byId(id).setAttribute('aria-invalid', String(invalid));
      if (invalid) byId(id).setAttribute('aria-describedby','feedback');
      else byId(id).removeAttribute('aria-describedby');
    }
    byId('feedback').textContent = !totals ? text.invalid : !campaign ? text.invalidDates : text.note;
    drawChart(campaign, totals, text, format);
  }
  byId('settings').addEventListener('submit', event => event.preventDefault());
  document.querySelectorAll('input,select').forEach(element => {
    element.addEventListener('input', update);
    element.addEventListener('change', update);
  });
  update();
}
