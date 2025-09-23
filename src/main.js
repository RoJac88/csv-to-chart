import './style.css'
import { parse } from 'papaparse';
import { Chart } from 'chart.js/auto'; 

const radio = document.getElementById('radio');
let chart = null;
let rawData = null;

function fmtTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`
}

// pid,timestamp,ram,vram

function createDatasets(data) {
  const sets = {};
  const labels = [];
  for (const entry of data) {
    const { pid, timestamp, ram } = entry;
    if (!labels.includes(timestamp)) {
      labels.push(timestamp);
    }
    if (pid in sets) {
      sets[pid].data.push(ram)
    } else {
      sets[pid] = {
        label: `RAM usage for pid ${pid}`,
        data: [ram],
      }
    }
  }
  return { labels, datasets: Object.values(sets) };
}

function createAggregate(data) {
  const values = new Map();
  const labels = [];
  for (const entry of data) {
    const { timestamp, ram } = entry;
    if (!labels.includes(timestamp)) {
      labels.push(timestamp);
    }
    const exists = values.get(timestamp);
    if (exists) {
      values.set(timestamp, exists + ram);
    } else {
      values.set(timestamp, ram);
    }
  }
  const datasets = [{
    label: 'Total RAM usage',
    data: [...values.values()],
  }]
  return { labels, datasets };
}

function onData(results) {
  const { data, errors } = results;
  if (errors.length) {
    console.warn(errors);
    return;
  }
  radio.style.display = 'block';
  rawData = data;
  const radioInput = document.querySelector('input[type=radio]:checked');
  const aggregate = radioInput?.value === 'agg';
  const { labels, datasets } = aggregate ? createAggregate(data) : createDatasets(data);
  console.log({ labels, datasets });
  if (!chart) {
    const el = document.getElementById('chart');
    chart = new Chart(el, {
      type: 'line',
      data: {
        labels: labels.map(fmtTime),
        datasets,
      }
    })
  } else {
    chart.data = {
      labels: labels.map(fmtTime),
      datasets,
    }
    chart.update();
  }
}

function onError(err) {
  console.warn(err);
}

function handleFileChange(event) {
  const { files } = event.target;
  const csv = files[0];
  if (!csv) return;
  parse(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: onData,
    error: onError,
  });
}

const csvInput = document.getElementById('csv-input');

csvInput.addEventListener('change', handleFileChange);

const radios = document.querySelectorAll('input[type=radio]');
for (const input of radios) {
  input.addEventListener('change', (ev) => {
    if (!rawData) return;
    if (!chart) return;
    const aggregate = ev.target.value === 'agg';
    const { labels, datasets } = aggregate ? createAggregate(rawData) : createDatasets(rawData);
    chart.data = {
      labels: labels.map(fmtTime),
      datasets,
    }
    chart.update();
  })
}

