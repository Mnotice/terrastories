import React, { Component } from 'react';
import PropTypes from 'prop-types';

// @NOTE: MAKE SURE ARRAY IS [LONGITUDE, LATITUDE]
const defaultCenter = [-108, 38.5];
const defaultBounds = [
  [-180, -85], //southwest
  [180, 85] //northeast
]
const defaultZoom = 3.5;

export default class Map extends Component {
  constructor(props) {
    super(props);
    mapboxgl.accessToken = this.props.mapboxAccessToken;
  }

  static propTypes = {
    activePoint: PropTypes.object,
    points: PropTypes.object,
    pointCoords: PropTypes.array,
    onMapPointClick: PropTypes.func,
    mapboxStyle: PropTypes.string,
    mapboxAccessToken: PropTypes.string
  };

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: this.props.mapboxStyle,
      center: defaultCenter,
      zoom: defaultZoom,
      maxBounds: defaultBounds
    });

    this.map.on('load', () => {
      this.updateMarkers();
      this.addHomeButton();
    });

    this.map.addControl(new mapboxgl.NavigationControl());
  }

  componentDidUpdate() {
    // update popups
    // only display one at a time, remove all other popups
    const popupNodes = document.getElementsByClassName('mapboxgl-popup');
    Array.from(popupNodes).forEach(node => node.remove());
    if (this.props.activePoint) {
      const marker = this.props.activePoint;
      var popup = new mapboxgl.Popup({offset: 15, className: 'ts-markerPopup', closeButton: true, closeOnClick: false})
        .setLngLat(marker.geometry.coordinates)
        .setHTML('<h1>' + marker.properties.title + '</h1>' + '<h2>' + marker.properties.region + '</h2>')
        .addTo(this.map);
      popup.on('close', () => {
        this.props.clearFilteredStories();
      });
    }
    // update points/markers
    if (this.props.points) {
      const popupNodes = document.getElementsByClassName('mapboxgl-marker');
      Array.from(popupNodes).forEach(node => node.remove());
      this.updateMarkers();
    }

    if (this.props.pointCoords.length > 0) {
      if (this.map) {
        this.map.panTo(this.props.pointCoords);
      }
      return;
    } else {
      if (this.map) {
        this.resetMapToCenter();
      }
    }
  }

  resetMapToCenter() {
    this.map.flyTo({
      center: defaultCenter,
      zoom: defaultZoom,
      maxBounds: defaultBounds
    });
  }

  // TODO: update this to JSX
  createHomeButton() {
    const homeButton = document.createElement('button');
    homeButton.setAttribute('aria-label', 'Map Home');
    homeButton.setAttribute('type', 'button');
    homeButton.setAttribute('class', 'home-icon');
    return homeButton;
  }

  addHomeButton() {
    const homeButton = this.createHomeButton();
    const navControl = document.getElementsByClassName('mapboxgl-ctrl-zoom-in')[0];
    if (navControl) {
      navControl.parentNode.insertBefore(homeButton, navControl);
    }
    homeButton.addEventListener('click', () => {
      this.resetMapToCenter();
    });
  }

  updateMarkers() {
    this.props.points.features.forEach(marker => {
      // create a HTML element for each feature
      var el = document.createElement('div');
      el.className = 'marker';
      el.id = 'storypoint' + marker.id;
      // make a marker for each feature and add to the map
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(this.map);

      el.addEventListener('click', () => {
        this.props.onMapPointClick(marker, marker.properties.stories);
        this.map.panTo(marker.geometry.coordinates);
      });
    });
  }

  render() {
    return (
      <div ref={
        el => this.mapContainer = el
      }
        className="ts-MainMap" />
    );
  }
}