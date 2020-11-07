const $header = document.getElementById('header-wrapper'),
	$form = document.getElementById('form'),
	$inputIP = document.getElementById('input-ip');

let map;

const checkIpDetailsLS = () => {
	return JSON.parse(localStorage.getItem('ownIP')) || null;
};

const saveIpDetailsLS = (ipDetails) => {
	localStorage.setItem('ownIP', JSON.stringify(ipDetails));
};

const getIpDetails = async ({ type, text }) => {
	const baseURL = 'https://geo.ipify.org/api/v1';
	let url = baseURL + '?apiKey=at_w8x0gtwjj3kHjXFtPrEm4IpVV6VDu';
	if (text) {
		url += `&${type}=${text}`;
	}
	try {
		const response = await fetch(url);
		const ipDetails = await response.json();
		return ipDetails;
	} catch (err) {
		console.log('error al obtener detalles de ip:', err);
		return false;
	}
};

const loadMap = (lat, lng) => {
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
	addMapMarker();
};

const addMapMarker = () => {
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

const positionMap = (lat, lng) => {
	map.setView(
		new ol.View({ center: ol.proj.fromLonLat([lng, lat]), zoom: 15 })
	);
	addMapMarker();
};

const renderResult = (ipDetails) => {
	const {
		ip,
		location: { country, region, city, timezone },
		isp,
	} = ipDetails;
	let resultBox = $header.children[2];
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

const showAlert = (text) => {
	const alert = document.createElement('div');
	alert.className = 'alert__overlay';
	alert.id = 'alert';
	alert.innerHTML = `
  <div class="alert">
        <p class="alert__text">${text}</p>
        <div class="alert__actions">
          <button class="alert__close">Close</button>
        </div>
  </div>
  `;
	document.body.appendChild(alert);
	alert.addEventListener('click', handleAlertClick);
};

const handleAlertClick = ({ target }) => {
	if (
		target.classList.contains('alert__overlay') ||
		target.classList.contains('alert__close')
	) {
		dismissAlert();
	}
};

const dismissAlert = () => {
	const alert = document.getElementById('alert');
	alert.addEventListener('animationend', (e) => alert.remove());
	alert.firstElementChild.classList.add('alert--dismiss');
};

const isValidIP = (text) => {
	return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
		text
	);
};

const isValidDomain = (text) => {
	return /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi.test(
		text
	);
};

const handleSubmit = (e) => {
	e.preventDefault();
	let text = $inputIP.value.trim();
	if (!text) {
		showAlert('Enter a valid IP or domain');
		return;
	}
	const isIP = isValidIP(text),
		isDomain = isValidDomain(text);
	if (!isDomain && !isIP) {
		showAlert('Enter a valid IP or domain');
		return;
	}
	const req = { type: 'ipAddress', text };
	if (isDomain) {
		text = text.replace(/http:\/\/|https:\/\//, '');
		let slashI = text.indexOf('/');
		if (slashI > -1) {
			text = text.substring(0, slashI);
		}
		req.text = text;
		req.type = 'domain';
	}
	$form.reset();
	manageDetailsProcess(req);
};

const manageDetailsProcess = async (req) => {
	const ipDetails = await getIpDetails(req);
	if (ipDetails) {
		renderResult(ipDetails);
		positionMap(ipDetails.location.lat, ipDetails.location.lng);
	}
};

const init = async () => {
	let ipDetails = checkIpDetailsLS();
	if (!ipDetails) {
		ipDetails = await getIpDetails({ type: 'ipAddress' }); // Puede devolver false
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
$form.addEventListener('submit', handleSubmit);
