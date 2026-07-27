const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const colorPicker = document.getElementById('colorPicker');
const lineWidthInput = document.getElementById('lineWidth');
const exportBtn = document.getElementById('exportBtn');
const errorDiv = document.getElementById('error');
const formatSelect = document.getElementById('formatSelect');
const previewInfo = document.getElementById('previewInfo');

let chartData = null;

// Format presets
const formats = {
  landscape: { width: 1600, height: 900, name: 'Landscape' },
  square: { width: 1080, height: 1080, name: 'Square' },
  mobile: { width: 900, height: 1600, name: 'Mobile' }
};

// Initialize with empty chart
drawChart([], [], '#ff6b9d', 3);

// Format change handler
formatSelect.addEventListener('change', () => {
  const format = formats[formatSelect.value];
  canvas.width = format.width;
  canvas.height = format.height;
  previewInfo.textContent = `Preview: ${format.width} × ${format.height}px (${format.name})`;
  if (chartData) {
    drawChart(chartData.x, chartData.y, colorPicker.value, parseInt(lineWidthInput.value));
  } else {
    drawChart([], [], '#ff6b9d', 3);
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  fileName.textContent = file.name;
  hideError();
  console.log('Processing file:', file.name);

  try {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      console.log('Parsed data:', jsonData);

      // Find x and y rows
      let xRow = null;
      let yRow = null;

      for (const row of jsonData) {
        const keys = Object.keys(row);
        if (keys.length === 0) continue;
        const firstCell = String(row[keys[0]]).toLowerCase().trim();
        
        if (firstCell === 'x' || firstCell === 'x values' || firstCell === 'x-axis') {
          xRow = keys.slice(1).map(k => row[k]).filter(v => v !== undefined);
        } else if (firstCell === 'y' || firstCell === 'y values' || firstCell === 'y-axis') {
          yRow = keys.slice(1).map(k => row[k]).filter(v => v !== undefined);
        }
      }

      if (!xRow || !yRow) {
        showError('Excel must have rows labeled "x" and "y"');
        chartData = null;
        exportBtn.disabled = true;
        return;
      }

      if (xRow.length !== yRow.length) {
        showError('X and Y rows must have the same number of values');
        chartData = null;
        exportBtn.disabled = true;
        return;
      }

      chartData = {
        x: xRow.map(v => parseFloat(v)),
        y: yRow.map(v => parseFloat(v))
      };

      drawChart(chartData.x, chartData.y, colorPicker.value, parseInt(lineWidthInput.value));
      exportBtn.disabled = false;
      console.log('Chart data loaded:', chartData.x.length, 'points');
    };
    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to parse Excel file: ' + error.message);
    chartData = null;
    exportBtn.disabled = true;
  }
});

colorPicker.addEventListener('input', () => {
  if (chartData) {
    drawChart(chartData.x, chartData.y, colorPicker.value, parseInt(lineWidthInput.value));
  }
});

lineWidthInput.addEventListener('input', () => {
  if (chartData) {
    drawChart(chartData.x, chartData.y, colorPicker.value, parseInt(lineWidthInput.value));
  }
});

exportBtn.addEventListener('click', () => {
  if (!chartData) return;

  const link = document.createElement('a');
  link.download = 'chart-export.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

function drawChart(xData, yData, color, lineWidth) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (xData.length === 0 || yData.length === 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Upload an Excel file with x and y rows to preview', canvas.width / 2, canvas.height / 2);
    return;
  }

  const padding = 40;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  const xMin = Math.min(...xData);
  const xMax = Math.max(...xData);
  const yMin = Math.min(...yData);
  const yMax = Math.max(...yData);

  const yRange = yMax - yMin || 1;
  const yPadding = yRange * 0.1;
  const yDrawMin = yMin - yPadding;
  const yDrawMax = yMax + yPadding;

  const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin || 1)) * chartWidth;
  const scaleY = (y) => padding + chartHeight - ((y - yDrawMin) / (yDrawMax - yDrawMin)) * chartHeight;

  // Gradient fill - solid to transparent
  const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
  gradient.addColorStop(0, hexToRgba(color, 0.8));
  gradient.addColorStop(1, hexToRgba(color, 0));

  ctx.beginPath();
  ctx.moveTo(scaleX(xData[0]), canvas.height - padding);
  ctx.lineTo(scaleX(xData[0]), scaleY(yData[0]));

  for (let i = 1; i < xData.length; i++) {
    ctx.lineTo(scaleX(xData[i]), scaleY(yData[i]));
  }

  ctx.lineTo(scaleX(xData[xData.length - 1]), canvas.height - padding);
  ctx.closePath();

  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.moveTo(scaleX(xData[0]), scaleY(yData[0]));

  for (let i = 1; i < xData.length; i++) {
    ctx.lineTo(scaleX(xData[i]), scaleY(yData[i]));
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function hideError() {
  errorDiv.style.display = 'none';
}
