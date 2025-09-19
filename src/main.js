import './style.css'
import { parse } from 'papaparse';
import { Chart } from 'chart.js/auto'; 

let chart = null;

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
        labels: data.map((item) => item.timestamp),
        datasets: [{
          data: data.map((item) => item.usage),
        }]
      }
    })
  } else {
    chart.data = {
      labels: data.map((item) => item.timestamp),
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

