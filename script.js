document.getElementById('get-location').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    localStorage.setItem('latitude', latitude);
    localStorage.setItem('longitude', longitude);
    fetchWeather(latitude, longitude);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

function fetchWeather(latitude, longitude) {
    const accuweatherToken = 'QIEVUx0jvG91HHWq9xTrbpgtGSnSiA94';
    const locationUrl = `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${accuweatherToken}&q=${latitude},${longitude}`;

    fetch(locationUrl)
        .then(response => response.json())
        .then(data => {
            const locationKey = data.Key;
            const weatherUrl = `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${accuweatherToken}&details=true`;

            return fetch(weatherUrl);
        })
        .then(response => response.json())
        .then(weatherData => {
            const weatherInfo = weatherData[0];
            const temp = weatherInfo.Temperature.Metric.Value;
            const feelsLike = weatherInfo.RealFeelTemperature.Metric.Value;
            const description = translateCondition(weatherInfo.WeatherText);
            const humidity = weatherInfo.RelativeHumidity;
            const windSpeed = weatherInfo.Wind.Speed.Metric.Value;
            const windDirection = weatherInfo.Wind.Direction.Localized;
            const windGust = weatherInfo.WindGust.Speed.Metric.Value;

            const message = `Temperatura: ${temp}°C\n` +
                            `Sensação Térmica: ${feelsLike}°C\n` +
                            `Condição: ${description}\n` +
                            `Umidade: ${humidity}%\n` +
                            `Vento: ${windSpeed} km/h (${windDirection})\n` +
                            `Rajadas de Vento: até ${windGust} km/h`;

            document.getElementById('weather-info').innerText = message;

            checkTranslations(message); // Call the check function after rendering
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to retrieve weather data.');
        });
}

function checkTranslations(message) {
    const untranslatedWords = ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Snow', 'Thunderstorm', 'Fog', 'Partly Sunny', 'Mostly Cloudy', 'Sunny', 'Windy', 'Storm', 'Haze', 'Drizzle', 'Ice', 'Sleet', 'Blizzard', 'Overcast'];
    untranslatedWords.forEach(word => {
        if (message.includes(word)) {
            console.warn(`Untranslated condition found: ${word}`);
        }
    });
}

function translateCondition(condition) {
    const conditions = {
        'Clear': 'Céu Limpo',
        'Partly Cloudy': 'Parcialmente Nublado',
        'Cloudy': 'Nublado',
        'Rain': 'Chuva',
        'Snow': 'Neve',
        'Thunderstorm': 'Trovoada',
        'Fog': 'Nevoeiro',
        'Partly Sunny': 'Parcialmente Ensolarado',
        'Mostly Cloudy': 'Predominantemente Nublado',
        'Sunny': 'Ensolarado',
        'Windy': 'Ventania',
        'Storm': 'Tempestade',
        'Haze': 'Neblina',
        'Drizzle': 'Chuvisco',
        'Ice': 'Gelo',
        'Sleet': 'Granizo',
        'Blizzard': 'Nevasca',
        'Overcast': 'Encoberto',
        // Add more translations as needed
    };

    console.log(`Weather condition received: ${condition}`); // Debugging line to check the condition received
    return conditions[condition] || condition; // Return translation or original condition if not available
}