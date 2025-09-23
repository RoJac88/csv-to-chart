import './style.css'
import { parse } from 'papaparse';
import { Chart } from 'chart.js/auto'; 

let chart = null;

function fmtTime(item) {
  const date = new Date(item.timestamp * 1000);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`
}

function onData(results) {
  const { data, errors } = results;
  if (errors.length) {
    console.warn(errors);
    return;
  }
  if (!chart) {
    const el = document.getElementById('chart');
    console.log(el)
    chart = new Chart(el, {
      type: 'line',
      data: {
        labels: data.map(fmtTime),
        datasets: [{
          label: 'Memory usage in KB',
          data: data.map((item) => item.usage),
        }]
      }
    })
  } else {
    chart.data = {
      labels: data.map(fmtTime),
      datasets: [{
        label: 'Memory usage in KB',
        data: data.map((item) => item.usage),
      }]
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

