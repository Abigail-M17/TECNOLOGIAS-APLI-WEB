// --- CONFIGURACIÓN ---
const apiKey = '5001f838a12cc1e54b333487033951ec'; 
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

// Mapeo de códigos OWM a clases de Weather Icons
const owmToWiMap = {
    '01d': 'wi-day-sunny', '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy', '02n': 'wi-night-partly-cloudy',
    '03d': 'wi-day-cloudy-high', '03n': 'wi-night-cloudy-high',
    '04d': 'wi-cloudy', '04n': 'wi-cloudy',
    '09d': 'wi-day-rain-mix', '09n': 'wi-night-rain-mix',
    '10d': 'wi-day-rain', '10n': 'wi-night-rain',
    '11d': 'wi-day-thunderstorm', '11n': 'wi-night-thunderstorm',
    '13d': 'wi-day-snow', '13n': 'wi-night-snow',
    '50d': 'wi-day-fog', '50n': 'wi-night-fog',
    'default': 'wi-cloud'
};

// --- ELEMENTOS DEL DOM ---
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const weatherResults = document.getElementById('weather-results');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');

// --- FUNCIONES ---
function updateUIState({ loading = false, error = false, results = false }, message = '') {
    loader.classList.toggle('hidden', !loading);
    errorMessage.classList.toggle('hidden', !error);
    weatherResults.classList.toggle('hidden', !results);
    
    if (error) errorText.textContent = message;
    else errorText.textContent = '';
}

/**
 * Obtiene el clima por nombre de ciudad.
 * @param {string} city - El nombre de la ciudad.
 */
async function getWeatherData(city) {
    if (!city || city.trim() === '') {
        updateUIState({ error: true }, 'Ingresa una ciudad válida.');
        return;
    }
    const weatherUrl = `${weatherApiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
    const forecastUrl = `${forecastApiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
    await fetchAndDisplayWeather(weatherUrl, forecastUrl, 'Ciudad no encontrada. Intenta con país (ej. "Madrid, ES").');
}

/**
 * Novedad: Obtiene el clima por coordenadas geográficas.
 * @param {number} lat - Latitud.
 * @param {number} lon - Longitud.
 */
async function getWeatherByCoords(lat, lon) {
    const weatherUrl = `${weatherApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
    const forecastUrl = `${forecastApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
    await fetchAndDisplayWeather(weatherUrl, forecastUrl, 'Error al obtener datos del clima para tu ubicación.');
}

/**
 * Función centralizada para obtener y mostrar el clima.
 * @param {string} weatherUrl - URL para el clima actual.
 * @param {string} forecastUrl - URL para el pronóstico.
 * @param {string} notFoundMessage - Mensaje de error si no se encuentra la ubicación.
 */
async function fetchAndDisplayWeather(weatherUrl, forecastUrl, notFoundMessage) {
    updateUIState({ loading: true });

    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        if (!weatherResponse.ok) {
            const errorData = await weatherResponse.json();
            throw new Error(errorData.message === 'city not found' ? notFoundMessage : `Error: ${errorData.message}`);
        }
        if (!forecastResponse.ok) {
            const errorData = await forecastResponse.json();
            throw new Error(`Error en el pronóstico: ${errorData.message}`);
        }

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(weatherData);
        displayForecast(forecastData);
        updateUIState({ results: true });

    } catch (error) {
        console.error("Error al obtener datos del clima:", error);
        updateUIState({ error: true }, error.message);
    }
}


/**
 * Muestra los datos del clima actual en la UI.
 */
function displayCurrentWeather(data) {
    const { name, main, weather, wind } = data;
    const iconCode = weather[0].icon;
    const wiClass = owmToWiMap[iconCode] || owmToWiMap['default'];
    
    currentWeatherDiv.innerHTML = `
        <div class="main-info">
            <h2>${name}</h2>
            <p class="text-7xl">${Math.round(main.temp)}°C</p>
            <p class="text-xl">${weather[0].description}</p>
        </div>
        <div class="icon-and-details">
            <i class="wi ${wiClass} weather-icon"></i>
            <div class="details">
                <p>Humedad: ${main.humidity}%</p>
                <p>Viento: ${wind.speed} m/s</p>
            </div>
        </div>
    `;
}

/**
 * Muestra el pronóstico de 5 días en la UI.
 */
function displayForecast(data) {
    const dailyForecasts = {};

    data.list.forEach(item => {
        const forecastDate = item.dt_txt.split(' ')[0];
        if (!dailyForecasts[forecastDate]) dailyForecasts[forecastDate] = [];
        dailyForecasts[forecastDate].push(item);
    });

    forecastDiv.innerHTML = '';
    
    const forecastDates = Object.keys(dailyForecasts).slice(0, 5);

    forecastDates.forEach(date => {
        const dayItems = dailyForecasts[date];
        const temps = dayItems.map(item => item.main.temp);
        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);
        
        const representativeItem = dayItems.find(item => item.dt_txt.includes('12:00')) || dayItems[0];
        const { weather, dt_txt } = representativeItem;
        const iconCode = weather[0].icon;
        const wiClass = owmToWiMap[iconCode] || owmToWiMap['default'];
        const dayName = new Date(dt_txt).toLocaleDateString('es-ES', { weekday: 'short' });

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <p class="font-bold">${dayName}</p>
            <i class="wi ${wiClass} forecast-icon"></i>
            <p class="font-semibold">${Math.round(maxTemp)}° / ${Math.round(minTemp)}°</p>
        `;
        forecastDiv.appendChild(forecastCard);
    });
}

// --- EVENT LISTENERS ---
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
        cityInput.value = '';
    } else {
        updateUIState({ error: true }, 'Ingresa una ciudad primero.');
    }
}

searchButton.addEventListener('click', handleSearch);
cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') handleSearch();
});

// --- INICIALIZACIÓN ---

/**
 * Novedad: Lógica para obtener la ubicación del usuario al cargar la página.
 */
function initializeWeather() {
    // 1. Comprueba si el navegador soporta la geolocalización
    if ("geolocation" in navigator) {
        // 2. Pide la ubicación actual
        navigator.geolocation.getCurrentPosition(
            // 3. Si el usuario acepta
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            // 4. Si el usuario no acepta o hay un error
            (error) => {
                console.error("Error de geolocalización:", error);
                updateUIState({ error: true }, "No se pudo obtener tu ubicación. Mostrando clima de una ciudad por defecto.");
                // Carga una ciudad por defecto si falla la geolocalización
                getWeatherData('Tampico'); 
            }
        );
    } else {
        // 5. Si el navegador no soporta la geolocalización
        console.error("Geolocalización no soportada por el navegador.");
        updateUIState({ error: true }, "Tu navegador no soporta geolocalización. Mostrando ciudad por defecto.");
        getWeatherData('Tampico');
    }
}

// Llama a la nueva función de inicialización cuando la página cargue
window.addEventListener('load', initializeWeather);