const $header = document.getElementById('header-wrapper');
// const $map = document.getElementById('map');

let map;

const checkIpDetailsLS = () => {
	return JSON.parse(localStorage.getItem('ownIP')) || null;
};

const saveIpDetailsLS = (ipDetails) => {
	localStorage.setItem('ownIP', JSON.stringify(ipDetails));
};

const getIpDetails = async (ip) => {
	const baseURL = 'https://geo.ipify.org/api/v1';
	let url = baseURL + '?apiKey=at_w8x0gtwjj3kHjXFtPrEm4IpVV6VDu';
	if (ip) {
		url += `&ipAddress=${ip}`;
	}
	try {
		const response = await fetch(
			'https://geo.ipify.org/api/v1?apiKey=at_w8x0gtwjj3kHjXFtPrEm4IpVV6VDu'
		);
		const ipDetails = await response.json();
		return ipDetails;
	} catch (err) {
		console.log('error al obtener detalles de ip:', err);
		return false;
	}
};

const loadMap = (lat, lng) => {
	// var iconFeature = new ol.Feature({
	// 	geometry: new ol.geom.Point([lng, lat]),
	// 	name: 'location',
	// 	population: 4000,
	// 	rainfall: 500,
	// });

	// var iconStyle = new ol.style.Style({
	// 	image: new ol.style.Icon({
	// 		anchor: [0.5, 46],
	// 		anchorXUnits: 'fraction',
	// 		anchorYUnits: 'pixels',
	// 		src: 'img/icon-location.svg',
	// 	}),
	// });
	// iconFeature.setStyle(iconStyle);

	// var vectorSource = new ol.source.Vector({
	// 	features: [iconFeature],
	// });

	// var vectorLayer = new ol.layer.Vector({
	// 	source: vectorSource,
	// });
	// console.log(vectorLayer);

	map = new ol.Map({
		target: 'map',
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM(),
			}),
		],
		view: new ol.View({
			center: ol.proj.fromLonLat([lng, lat]),
			zoom: 15,
		}),
	});
	// Add the marker position
	const center = map.getView().getCenter();
	ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
	const feature = new ol.Feature(new ol.geom.Point(center));
	const pinLayer = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: [feature],
		}),
		style: new ol.style.Style({
			image: new ol.style.Icon({
				src: 'img/icon-location.svg',
			}),
		}),
	});
	map.addLayer(pinLayer);
};

const renderResult = (ipDetails) => {
	const {
		ip,
		location: { country, region, city, timezone },
		isp,
	} = ipDetails;
	let resultBox;
	if ($header.childElementCount == 2) {
		resultBox = document.createElement('div');
		resultBox.className = 'result__box';
	}
	resultBox.innerHTML = `
    <div class="result__grid">
      <div class="result__item">
        <h2 class="result__category">IP address</h2>
        <p class="result__text">${ip}</p>
      </div>
      <div class="result__item">
        <h2 class="result__category">Location</h2>
        <p class="result__text">${city}, ${region} ${country}</p>
      </div>
      <div class="result__item">
        <h2 class="result__category">Timezone</h2>
        <p class="result__text">UTC ${timezone}</p>
      </div>
      <div class="result__item">
        <h2 class="result__category">ISP</h2>
        <p class="result__text">${isp}</p>
      </div>
    </div>
  `;
	if ($header.childElementCount == 2) {
		$header.appendChild(resultBox);
	}
};

const init = async () => {
	let ipDetails = checkIpDetailsLS();
	if (!ipDetails) {
		console.log(
			'No se encuentra en el storage, entonces consultamos la api'
		);
		ipDetails = await getIpDetails(); // Puede devolver false
		if (ipDetails) {
			saveIpDetailsLS(ipDetails);
		}
	}
	if (ipDetails) {
		loadMap(ipDetails.location.lat, ipDetails.location.lng);
		renderResult(ipDetails);
	}
};

document.addEventListener('DOMContentLoaded', init);
