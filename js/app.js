// const $map = document.getElementById('map');

let map;

const loadMap = () => {
	map = new ol.Map({
		target: 'map',
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM(),
			}),
		],
		view: new ol.View({
			center: ol.proj.fromLonLat([37.41, 8.82]),
			zoom: 4,
		}),
	});
};

document.addEventListener('DOMContentLoaded', loadMap);
