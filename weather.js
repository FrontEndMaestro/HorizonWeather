
/*https://api.openweathermap.org/data/2.5/weather?q=islamabad&appid=9a38e973f64f256ff2dc6e9e33daa403&units=metric */
const apiKey = "9a38e973f64f256ff2dc6e9e33daa403"
const apiURL = "https://api.openweathermap.org/data/2.5/weather?&units=metric"
const apiForecastURL = "https://api.openweathermap.org/data/2.5/forecast?&units=metric";
const geoLocationApi = "https://api.openweathermap.org/geo/1.0/reverse";

const searchinput=document.querySelector(".searchcontainer .searchbar");
const searchbutton=document.querySelector(".searchcontainer .search-button");
const widget=document.querySelector(".widget");
const widgeticon=document.querySelector(".widget .col1 .icon img")

document.querySelector(".sidebar .table").addEventListener("click", function() {
    window.location.href = "table/table.html"; 
});

getCurrentLocation();

async function checkWeather(city){
    const response=await fetch(apiURL+'&q='+city+`&appid=${apiKey}`);
    var data=await response.json();
    if(!data){
        alert("could not connect , check your internet connection");
    }
    else if(data.cod==='404'){
        searchinput.value="";
        alert("Incorrect location name");       
    }
    else {
        console.log(data);
        document.querySelector(".name").textContent=data.name;
        document.querySelector(".windspeed").textContent=Math.round(data.wind.speed*3.6)+" km/h";
        document.querySelector(".temp").textContent=Math.round(data.main.temp)+" °C";
        document.querySelector(".humidityval").textContent=Math.round(data.main.humidity)+" %";
    }
console.log(data);

    if(data.weather[0].main=="Clouds"){
        widget.style.backgroundImage = 'url("cloudy.jpg")';
        widgeticon.src="images/clouds.png";       
    }
    else if(data.weather[0].main=="Clear"){
        widget.style.backgroundImage = 'url("clear.jpg")';
        widgeticon.src="images/clear.png";  
    }
    else if(data.weather[0].main=="Rain"){
        widget.style.backgroundImage = 'url("rain.jpg")';
        widgeticon.src="images/rain.png";  
    }
    else if(data.weather[0].main=="Snow"){
        widget.style.backgroundImage = 'url("snowfall.jpg")';
        widgeticon.src="images/snow.png"; 
    }
}

async function getFiveDayForecast(city) {
    try {
        const response = await fetch(`${apiForecastURL}&q=${city}&appid=${apiKey}`);
        const data = await response.json();
        
        if (data.cod === "404") {
            alert("City not found. Please check the city name.");
            return;
        }

        const dailyForecasts = data.list.reduce((acc, forecast) => {
            const date = forecast.dt_txt.split(" ")[0];
            if (!acc[date]) {
                acc[date] = {
                    date: date,
                    minTemp: forecast.main.temp,
                    maxTemp: forecast.main.temp,
                    description: forecast.weather[0].description
                };
            } else {
                acc[date].minTemp = Math.min(acc[date].minTemp, forecast.main.temp);
                acc[date].maxTemp = Math.max(acc[date].maxTemp, forecast.main.temp);
            }
            return acc;
        }, {});

        const dailyTemps = Object.values(dailyForecasts).slice(0, 5);
        const forecastContainer = document.querySelector('.forecast-container');
        forecastContainer.innerHTML = dailyTemps.map(createForecastItem).join('');

    } catch (error) {
        console.error('Error fetching forecast:', error);
        alert('Error fetching weather forecast. Please try again.');
    }
}


function createForecastItem(day) {
    return `
        <div class="forecast-item">
            <div class="forecast-day">
                <img src="${getWeatherIconPath(day.description)}" alt="weather" class="forecast-icon">
                <span>${formatDate(day.date)}</span>
            </div>
            <div class="forecast-temps">
                <span class="forecast-max">${Math.round(day.maxTemp)}°</span>
                <span class="forecast-min">${Math.round(day.minTemp)}°</span>
            </div>
        </div>
    `;
}


function getWeatherIconPath(description) {
    if (description.includes('cloud')) {
        return "images/clouds.png";
    } else if (description.includes('rain')) {
        return "images/rain.png";
    } else if (description.includes('snow')) {
        return "images/snow.png";
    } else {
        return "images/clear.png";
    }
}

function formatDate(dateStr) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateStr);
    return days[date.getDay()];
}


//charts
async function updateCharts(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=9a38e973f64f256ff2dc6e9e33daa403`);
        const data = await response.json();
        if (data.cod === "404") {
            console.error("City not found");
            return;
        }
        const processedData = processForCharts(data.list);
        createBarChart(processedData);
        createDoughnutChart(processedData);
        createLineChart(processedData);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

function processForCharts(forecastList) {
    const dailyData = {};
    const weatherTypes = {};
//getting data from forecast list
    forecastList.forEach(forecast => {
        const date = forecast.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                weatherType: forecast.weather[0].main
            };
        }
        dailyData[date].temps.push(forecast.main.temp);
        
        // counting weather types
        const type = forecast.weather[0].main;
        weatherTypes[type] = (weatherTypes[type] || 0) + 1;
    });

    // avg temp
    const processed = {
        dates: [],
        temps: [],
        weatherCounts: weatherTypes
    };
    Object.entries(dailyData).slice(0, 5).forEach(([date, data]) => {
        processed.dates.push(new Date(date).toLocaleDateString('en-US', { weekday: 'short' }));
        processed.temps.push(data.temps.reduce((a, b) => a + b) / data.temps.length);
    });
    return processed;
}

function createBarChart(data) {
    const ctx = document.getElementById('bar-chart');
    ctx.style.width = '70%';
    ctx.style.height = '70%';
    ctx.width = ctx.offsetWidth * 2;
    ctx.height = ctx.offsetHeight * 2;
    
    const context = ctx.getContext('2d');
    context.scale(2, 2);
    
    if (window.barChart) {
        window.barChart.destroy();
    }
    
    window.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.dates,
            datasets: [{
                label: 'Temperature (°C)',
                data: data.temps,
                backgroundColor: '#0ea5e9',
                borderColor: '#0284c7',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            animation: {
                delay: (context) => {
                    return context.dataIndex * 300; 
                },
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 14,
                            family: "'Poppins', sans-serif"
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: "'Poppins', sans-serif"
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: "'Poppins', sans-serif"
                        }
                    }
                }
            }
        }
    });
}

function createDoughnutChart(data) {
    const ctx = document.getElementById('doughnut-chart');
    ctx.style.width = '100%';
    ctx.style.height = '100%';
    ctx.width = ctx.offsetWidth * 2;
    ctx.height = ctx.offsetHeight * 2;
    
    const context = ctx.getContext('2d');
    context.scale(2, 2);
    
    if (window.doughnutChart) {
        window.doughnutChart.destroy();
    }
    
    const weatherColors = {
        Clear: '#FFD700',
        Clouds: '#A9A9A9',
        Rain: '#4682B4',
        Snow: '#FFFFFF'
    };
    
    const weatherData = Object.entries(data.weatherCounts).map(([type, count]) => ({
        type,
        count,
        color: weatherColors[type] || '#808080'
    }));

    window.doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: weatherData.map(w => w.type),
            datasets: [{
                data: weatherData.map(w => w.count),
                backgroundColor: weatherData.map(w => w.color),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            animation: {
                delay: (context) => {
                    return context.dataIndex * 300; 
                },
                duration: 1000,
                easing: 'easeOutCirc'
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Poppins', sans-serif"
                        },
                        padding: 20
                    }
                }
            }
        }
    });
}

function createLineChart(data) {
    const ctx = document.getElementById('line-chart');
    ctx.style.width = '100%';
    ctx.style.height = '100%';
    ctx.width = ctx.offsetWidth * 2;
    ctx.height = ctx.offsetHeight * 2;
    
    const context = ctx.getContext('2d');
    context.scale(2, 2);
    
    if (window.lineChart) {
        window.lineChart.destroy();
    }
    
    window.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: 'Temperature (°C)',
                data: data.temps,
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                tension: 0.4,
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            animation: {
                y: {
                    duration: 2000,
                    from: -200,
                    delay: (context) => {
                        return context.dataIndex * 100; 
                    }
                },
                easing: 'easeOutBounce'
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 14,
                            family: "'Poppins', sans-serif"
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: "'Poppins', sans-serif"
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: "'Poppins', sans-serif"
                        }
                    }
                }
            }
        }
    });
}


updateCharts('Islamabad');
checkWeather("Islamabad");
getFiveDayForecast("Islamabad");
searchbutton.addEventListener("click", () => {
    checkWeather(searchinput.value);
    getFiveDayForecast(searchinput.value);
    updateCharts(searchinput.value);
});



function getCurrentLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Current position obtained: Latitude ${latitude}, Longitude ${longitude}`);
                await getCityFromCoordinates(latitude, longitude);
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location. Defaulting to Islamabad.");
                checkWeather("Islamabad");
                getFiveDayForecast("Islamabad");
                updateCharts("Islamabad");
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser");
        alert("Geolocation is not supported by your browser. Defaulting to Islamabad.");
        checkWeather("Islamabad");
        getFiveDayForecast("Islamabad");
        updateCharts("Islamabad");
    }
}
async function getCityFromCoordinates(lat, lon) {
    try {
        const response = await fetch(
            `${geoLocationApi}?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
            const city = data[0].name;
            checkWeather(city);
            getFiveDayForecast(city);
            updateCharts(city);
            if (searchinput) {
                searchinput.value = city;
            }
        } else {
            throw new Error("No city found for these coordinates");
        }
    } catch (error) {
        console.error("Error getting city name:", error);
        checkWeather("Islamabad");
        getFiveDayForecast("Islamabad");
        updateCharts("Islamabad");
    }
}