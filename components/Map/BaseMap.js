import React, { Component, PropTypes } from 'react';
import cx from 'classnames';

import mapStyle from '!!file!./mapStyle.json';
import mapboxgl from '../../utils/mapboxgl/mapboxgl';
import lngLat from '../../utils/propTypeValidations/lngLat';
import noop from '../../utils/noop';

import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../../constants/mapbox';

import css from './BaseMap.css';

export default class BaseMap extends Component {
  static propTypes = {
    allowWrap: PropTypes.bool,
    center: lngLat,
    className: PropTypes.string,
    mapboxStyle: React.PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    mapClassName: PropTypes.string,
    zoom: PropTypes.number,
    onClick: PropTypes.func,
    onMapLoad: PropTypes.func,
    onMoveEnd: PropTypes.func,
  };

  static defaultProps = {
    allowWrap: true,
    center: DEFAULT_CENTER,
    mapboxStyle: mapStyle,
    zoom: DEFAULT_ZOOM,
    onClick: noop,
    onMapLoad: noop,
    onMoveEnd: noop,
  };

  componentDidMount() {
    const {
      allowWrap,
      center,
      mapboxStyle,
      zoom,
      onClick,
      onMapLoad,
    } = this.props;

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: mapboxStyle,
      renderWorldCopies: allowWrap,
      center,
      zoom,
    });

    this.map.on('click', onClick);
    this.map.on('moveend', this.handleMoveEnd);
    this.map.on('load', (event) => { onMapLoad(event.target); });
  }

  componentWillReceiveProps(nextProps) {
    const { center, zoom } = this.props;
    const { center: nextCenter, zoom: nextZoom } = nextProps;

    if (center[0] !== nextCenter[0] || center[1] !== nextCenter[1]) this.map.setCenter(nextCenter);
    if (zoom !== nextZoom) this.map.setZoom(nextZoom);
  }

  componentWillUnmount() {
    const { onClick } = this.props;

    this.map.off('click', onClick);
    this.map.off('moveend', this.handleMoveEnd);
    this.map.remove();
  }

  getMaboxGL() {
    return this.map;
  }

  easeTo(options) {
    this.map.easeTo(options, { user: false });
  }

  fitBounds(bounds, options) {
    this.map.fitBounds(bounds, options, { user: false });
  }

  handleMoveEnd = (data) => {
    const { onMoveEnd } = this.props;
    const { user, ...rest } = data;

    const userAction = user !== false;
    onMoveEnd(
      userAction,
      {
        bounds: this.map.getBounds().toArray(),
        center: this.map.getCenter().toArray(),
        zoom: this.map.getZoom(),
      },
      rest,
    );
  };

  mapboxgl = {};

  render() {
    const { className, mapClassName } = this.props;

    return (
      <div className={ cx(css.root, className) }>
        <div ref={ (c) => { this.mapContainer = c; } } className={ cx(css.map, mapClassName) } />
      </div>
    );
  }
}