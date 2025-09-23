import './style.css'
import { parse } from 'papaparse';
import { Chart } from 'chart.js/auto'; 

let chart = null;

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
      console.log('pid in datasets')
      sets[pid].data.push(ram)
    } else {
      console.log('pid not in datasets')
      sets[pid] = {
        label: `RAM usage for pid ${pid}`,
        data: [ram],
      }
    }
  }
  return { labels, datasets: Object.values(sets) };
}

function onData(results) {
  const { data, errors } = results;
  if (errors.length) {
    console.warn(errors);
    return;
  }
  const { labels, datasets } = createDatasets(data);
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

