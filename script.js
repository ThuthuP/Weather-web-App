// Function to fetch weather data asynchronously
async function fetchWeatherData(location, units) {
  try {
    const apiKey = 'a18f532405fa93d80f9de2deb9ea3fbe';
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&appid=${apiKey}`;
    const forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${units}&appid=${apiKey}`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastWeatherUrl)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Weather data not available');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    return { current: currentData, forecast: forecastData };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Function to render current weather data
function renderCurrentWeather(weather) {
  const currentWeatherElement = document.getElementById('currentWeather');
  if (!weather) {
    currentWeatherElement.innerHTML = '<p>Current weather data unavailable. Please try again later.</p>';
    return;
  }
  currentWeatherElement.innerHTML = `
    <h2>${weather.name}</h2>
    <p>Current Temperature: ${weather.main.temp} °C</p>
    <p>Feels like: ${weather.main.feels_like} °C</p>
    <p>Weather: ${weather.weather[0].main}</p>
    <img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="${weather.weather[0].description}" />
  `;

  // Update additional weather information
  document.getElementById('humidity').textContent = `Humidity: ${weather.main.humidity} %`;
  document.getElementById('pressure').textContent = `Pressure: ${weather.main.pressure} hPa`;
  document.getElementById('windSpeed').textContent = `Wind Speed: ${weather.wind.speed} m/s`;
  document.getElementById('sunrise').textContent = `Sunrise: ${formatTime(weather.sys.sunrise)}`;
  document.getElementById('sunset').textContent = `Sunset: ${formatTime(weather.sys.sunset)}`;
}

// Function to render forecasted weather data
function renderForecastWeather(forecast) {
  const forecastWeatherElement = document.getElementById('forecastWeather');
  if (!forecast) {
    forecastWeatherElement.innerHTML = '<p>Forecast data unavailable. Please try again later.</p>';
    return;
  }

  const forecastDays = forecast.list.filter((item, index) => index % 8 === 0); // Get every 8th item for daily forecast

  forecastWeatherElement.innerHTML = `
    <h2>5-Day Forecast</h2>
    <div class="forecast">
      ${forecastDays.map(day => `
        <div class="forecast-day">
          <p>${formatDate(day.dt)}</p>
          <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" />
          <p>Temp: ${day.main.temp} °C</p>
          <p>${day.weather[0].main}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// Function to handle unit change
function changeUnit(unit) {
  const locationInput = document.getElementById('locationInput').value;
  fetchWeather(locationInput, unit);
}

// Function to fetch weather based on user input
function fetchWeather(location, units) {
  fetchWeatherData(location, units)
    .then(data => {
      if (data) {
        renderCurrentWeather(data.current);
        renderForecastWeather(data.forecast);
      }
    })
    .catch(error => console.error('Error fetching weather data:', error));
}

// Function to format UNIX timestamp to readable date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Function to format UNIX timestamp to readable time
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Function to update current date and time
function updateDateTime() {
  const now = new Date();
  const dateElement = document.getElementById('date');
  const timeElement = document.getElementById('time');

  dateElement.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  timeElement.textContent = now.toLocaleTimeString('en-US');
}

// Update date and time initially
updateDateTime();
// Update date and time every second
setInterval(updateDateTime, 1000);

// Event listener for form submission
document.getElementById('locationInput').addEventListener('change', function (event) {
  const location = event.target.value;
  fetchWeather(location, 'metric'); // Default to metric units
});

// Initial weather fetch for default location
fetchWeather('Durban, ZA', 'metric'); // Default location and units

