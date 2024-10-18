
/*https://api.openweathermap.org/data/2.5/weather?q=islamabad&appid=9a38e973f64f256ff2dc6e9e33daa403&units=metric */
const apiKey = "9a38e973f64f256ff2dc6e9e33daa403"
const apiForecastURL = "https://api.openweathermap.org/data/2.5/forecast?&units=metric";
const geminiKey = "AIzaSyBhyvhbAsD-uTiyRm80oyzNV3n_cfT-Nvg";
const geminiapiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`;

const searchinput = document.querySelector(".searchcontainer .searchbar");
const searchbutton = document.querySelector(".searchcontainer .search-button");

const chatbox = document.querySelector(".grid .card2");

document.querySelector(".sidebar .dashboard").addEventListener("click", function () {
    window.location.href = "../index.html";
});

const weatherheading=document.querySelector(".card1 h3 span");

const chatboxsend=document.querySelector(".chat-input-container .chat-send");
const chatboxinput=document.querySelector(".chat-input-container .chat-input")
async function GeminiResponse(userMessage) {
    try {
        const response = await fetch(geminiapiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text:userMessage }]
                }]
            })
        });

        const data=await response.json();
        const apiResponse=data?.candidates[0].content.parts[0].text;
        console.log(apiResponse);

    } catch {

    }
}

chatbox.addEventListener("click",()=>{
GeminiResponse(chatboxinput.value);
});


let originalForecastData = [];

async function getFiveDayForecast(city) {
    try {
        const response = await fetch(`${apiForecastURL}&q=${city}&appid=${apiKey}`);
        const data = await response.json();

        if (data.cod === "404") {
            alert("City not found. Please check the city name.");
            return;
        }
weatherheading.textContent=`, ${city}`;
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

        originalForecastData = Object.values(dailyForecasts).slice(0, 5);
        renderForecastItems(originalForecastData);

    } catch (error) {
        console.error('Error fetching forecast:', error);
        alert('Error fetching weather forecast. Please try again.');
    }
}

function renderForecastItems(forecasts) {
    const forecastContainer = document.querySelector('.forecast-container');
    forecastContainer.innerHTML = forecasts.map(createForecastItem).join('');
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
        return "../images/clouds.png";
    } else if (description.includes('rain')) {
        return "../images/rain.png";
    } else if (description.includes('snow')) {
        return "../images/snow.png";
    } else {
        return "../images/clear.png";
    }
}

function formatDate(dateStr) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateStr);
    return days[date.getDay()];
}

let defaultForcast = [];

function sortForecastByTemp(order) {
    let forecastsToRender = [...originalForecastData];

    if (order === 'asc' || order === 'desc') {
        forecastsToRender.sort((a, b) => {
            return order === 'asc' ? a.maxTemp - b.maxTemp : b.maxTemp - a.maxTemp;
        });
    }
    renderForecastItems(forecastsToRender);
}
function filterRainDays(showRainOnly) {
    const filteredForecasts = originalForecastData.filter(item => {
        const hasRain = item.description.includes('rain');
        return showRainOnly ? hasRain : true;
    });

    renderForecastItems(filteredForecasts); 
}


document.getElementById('sort-dropdown').addEventListener('change', (event) => {
    const order = event.target.value; 
    sortForecastByTemp(order);
});

document.getElementById('filter-rain').addEventListener('click', () => {
    const showRainOnly = document.getElementById('filter-rain').classList.toggle('active');
    filterRainDays(showRainOnly);
});



getFiveDayForecast("Islamabad");
searchbutton.addEventListener("click", () => {
    getFiveDayForecast(searchinput.value);
});


const messagesContainer = document.querySelector(".chat-messages");
const chatInput = document.querySelector(".chat-input-container .chat-input");
const sendButton = document.querySelector(".chat-input-container .chat-send");

function createMessageElement(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


async function GeminiResponse(userMessage) {
    if (!userMessage.trim()) return;
    createMessageElement(userMessage, true);   
    try {
        const response = await fetch(geminiapiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();
        const apiResponse = data?.candidates[0]?.content?.parts[0]?.text;
        
        if (apiResponse) {
            createMessageElement(apiResponse, false);
        } else {
            createMessageElement("I apologize, but I couldn't process that request. Please try again.", false);
        }

    } catch (error) {
        console.error('Error:', error);
        createMessageElement("I apologize, but there was an error processing your request. Please try again.", false);
    }
}

sendButton.addEventListener("click", () => {
    const message = chatInput.value;
    if (message.trim()) {
        GeminiResponse(message);
        chatInput.value = '';
    }
});

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const message = chatInput.value;
        if (message.trim()) {
            GeminiResponse(message);
            chatInput.value = '';
        }
    }
});


function setLoadingState(isLoading) {
    sendButton.disabled = isLoading;
    sendButton.style.opacity = isLoading ? '0.5' : '1';
}