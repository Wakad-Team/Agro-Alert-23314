const supabaseUrl = 'https://egzxadpxgtdthwynbngy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnenhhZHB4Z3RkdGh3eW5ibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MDYyMjYsImV4cCI6MjA0OTA4MjIyNn0.ewtZcI1-SUCFFjq6awv2XLEUZsWhBOMY3-3bNLVKklY';

const fetchData = async () => {
    const response = await fetch(`${supabaseUrl}/rest/v1/sensor_data`, {
        headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
        }
    });
    const data = await response.json();
    return data;
};

const downloadCSV = async () => {
    const data = await fetchData();
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
};

const updateDashboard = (data) => {
    if (data && data.length > 0) { // Check if data exists and is not empty
        const lastDataPoint = data[data.length - 1];
        document.getElementById('temperature').innerText = `${lastDataPoint.temperature} °C`;
        document.getElementById('humidity').innerText = `${lastDataPoint.humidity} %`;
        document.getElementById('lightIntensity').innerText = `${lastDataPoint.ldr} %`;
        document.getElementById('soilMoisture').innerText = `${lastDataPoint.soilMoisture} %`;
    }
};

const renderCharts = (data) => {
    if (!data || data.length === 0) {
        console.error('No data available for chart rendering');
        return;
    }

    const recentData = data.slice(-10); // Get the last 50 points

    const timestamps = recentData.map(item => moment(item.timestamp));
    const temperatureData = recentData.map(item => item.temperature);
    const humidityData = recentData.map(item => item.humidity);
    const lightIntensityData = recentData.map(item => item.ldr);
    const soilMoistureData = recentData.map(item => item.soilMoisture);

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                    tooltipFormat: 'll HH:mm',
                    displayFormats: {
                        minute: 'HH:mm',
                        hour: 'HH:mm',
                        day: 'll',
                    }
                },
                adapters: {
                    date: {
                        locale: 'en-GB'
                    }
                },
                ticks: {
                    color: '#fff'
                }
            },
            y: {
                ticks: {
                    color: '#fff'
                }
            }
        }
    };

    const createChart = (canvasId, chartData, label, borderColor) => {
        new Chart(document.getElementById(canvasId), {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: label,
                    data: chartData,
                    borderColor: borderColor,
                    tension: 0.1,
                    fill: false
                }]
            },
            options: chartOptions
        });
    };

    createChart('temperatureChart', temperatureData, 'Temperature (°C)', 'rgb(255, 99, 132)');
    createChart('humidityChart', humidityData, 'Humidity (%)', 'rgb(54, 162, 235)');
    createChart('lightIntensityChart', lightIntensityData, 'Light Intensity (lux)', 'rgb(75, 192, 192)');
    createChart('soilMoistureChart', soilMoistureData, 'Soil Moisture (%)', 'rgb(153, 102, 255)');
};

fetchData().then(data => {
    updateDashboard(data);
    renderCharts(data);
}).catch(error => {
    console.error('Error fetching data:', error);
});

const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', downloadCSV);