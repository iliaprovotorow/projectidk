import './style.css';
import {Map, Overlay, View} from 'ol';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import axios from "axios";

const API_KEY = '24926c415ff3487289782702240801';
const KRASNOYARSK_LON_LAT = [92.868329, 56.01035];

const popup = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: olProj.fromLonLat(KRASNOYARSK_LON_LAT),
    zoom: 12
  })
});

const overlay = new Overlay({
  element: popup,
  autoPan: true,
})
map.addOverlay(overlay);

map.addEventListener('moveend', async (ev) => {
  const [lon, lat] = olProj.toLonLat(map.getView().getCenter());
  console.log(`${lat},${lon}`);

  const weatherData = await getWeatherData(lat, lon);
  if (!weatherData) {
    return;
  }

  popupContent.innerHTML = getPopupContent(weatherData);
  overlay.setPosition(olProj.fromLonLat([weatherData.location.lon, weatherData.location.lat]));
});

async function getWeatherData(lat, lon) {
  const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
    params: {
      key: API_KEY,
      q: `${lat},${lon}`
    },
  });

  console.log(response.status);
  console.log(response.data);

  return response.data;
}

function getPopupContent(weatherData) {
  return `
    <div class="popup_header">
        <img src="${weatherData.current.condition.icon}">
        <b>${weatherData.location.name}<b/>
    </div>
    <div class="popup_main">
        <div class="popup_main_item">Температура <b>${weatherData.current.temp_c}°<b/></div>
        <div class="popup_main_item">Ощущается как <b>${weatherData.current.feelslike_c}°<b/></div>
        <div class="popup_main_item">Ветер ${weatherData.current.wind_dir} <b>${weatherData.current.wind_kph} км/ч<b/></div>
    </div>
`;
}
