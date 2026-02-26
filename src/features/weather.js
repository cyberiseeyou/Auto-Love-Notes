const axios = require('axios');
const { config } = require('../config');

let cachedWeather = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function getWeather() {
  if (cachedWeather && Date.now() - cacheTime < CACHE_TTL) {
    return cachedWeather;
  }

  if (!config.weather.apiKey) {
    return null;
  }

  try {
    const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: config.weather.city,
        appid: config.weather.apiKey,
        units: config.weather.units,
      },
    });

    cachedWeather = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      main: data.weather[0].main,
      icon: data.weather[0].icon,
      city: data.name,
    };
    cacheTime = Date.now();
    return cachedWeather;
  } catch (err) {
    console.error(`[Weather] Failed to fetch: ${err.message}`);
    return null;
  }
}

/**
 * Generate a weather-aware prefix or standalone message.
 */
function weatherMessage(weather) {
  if (!weather) return null;

  const { temp, description, main } = weather;
  const unit = config.weather.units === 'imperial' ? '°F' : '°C';

  const messages = {
    Rain: [
      `It's rainy out there (${temp}${unit}) — stay cozy today 🌧️`,
      `Rainy day vibes! Perfect excuse to stay in and think about you 🌧️`,
      `It's raining and all I can think about is cuddling with you`,
    ],
    Snow: [
      `It's snowing! (${temp}${unit}) Stay warm for me ❄️`,
      `Snow day energy — wish I could keep you warm right now ❄️`,
    ],
    Clear: [
      `Beautiful clear skies today (${temp}${unit}) — almost as beautiful as you ☀️`,
      `The sun is out (${temp}${unit}) but you're still the brightest thing in my life`,
    ],
    Clouds: [
      `Cloudy day (${temp}${unit}) but you always brighten things up ☁️`,
      `Even on a grey day like today, thinking of you makes everything sunny`,
    ],
    Thunderstorm: [
      `There's a thunderstorm outside — stay safe my love! ⛈️`,
      `Stormy weather but nothing could dampen how I feel about you ⛈️`,
    ],
  };

  const pool = messages[main] || [
    `It's ${description} and ${temp}${unit} out there — hope you're having a great day!`,
  ];

  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = { getWeather, weatherMessage };
