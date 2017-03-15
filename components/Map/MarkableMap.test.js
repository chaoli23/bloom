/* global jasmine:true */

import React from 'react';
import ReactDOM from 'react-dom';
import MarkableMap from './MarkableMap';
import SpaceMarker from './SpaceMarker';
import mapboxgl from '../../utils/mapboxgl/mapboxgl';

jest.mock('../../utils/mapboxgl/mapboxgl');

const mapSpy = jasmine.createSpy('map');
mapboxgl.setMapSpy(mapSpy);

const markerSpy = jasmine.createSpy('marker');
mapboxgl.setMarkerSpy(markerSpy);

const labeledCalls = (spy, label) => spy.calls.all().filter(call => call.args[0] === label);

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MarkableMap MarkerComponent={ SpaceMarker } />, div);
});

it('it renders markers correctly', () => {
  markerSpy.calls.reset();

  const div = document.createElement('div');
  ReactDOM.render(
    <MarkableMap MarkerComponent={ SpaceMarker } markers={ [{ id: 1, lngLat: [1, 0] }] } />,
    div
  );

  const constructorCalls = labeledCalls(markerSpy, 'constructor');
  expect(constructorCalls.length).toEqual(1);

  const setLngLatCalls = labeledCalls(markerSpy, 'setLngLat');
  expect(setLngLatCalls.length).toEqual(1);
  expect(setLngLatCalls[0].args[1]).toEqual([1, 0]);

  const addToCalls = labeledCalls(markerSpy, 'addTo');
  expect(addToCalls.length).toEqual(1);
});

it('it autosizes the map correctly', () => {
  mapSpy.calls.reset();
  const div = document.createElement('div');
  ReactDOM.render(
    <MarkableMap
      MarkerComponent={ SpaceMarker }
      markers={ [{ id: 1, lngLat: [1, 0] }] }
      autoFit
    />,
    div
  );

  let fitBoundsCalls = labeledCalls(mapSpy, 'fitBounds');
  expect(fitBoundsCalls.length).toEqual(1);
  expect(fitBoundsCalls[0].args[1]).toEqual([[1, 0], [1, 0]]);

  ReactDOM.render(
    <MarkableMap
      MarkerComponent={ SpaceMarker }
      markers={ [
        { id: 1, lngLat: [0, 0] },
        { id: 2, lngLat: [1, 1] },
      ] }
      autoFit
    />,
    div
  );

  fitBoundsCalls = labeledCalls(mapSpy, 'fitBounds');
  expect(fitBoundsCalls.length).toEqual(2);
  expect(fitBoundsCalls[1].args[1]).toEqual([[0, 0], [1, 1]]);

  // re rendering with no marker changes
  mapSpy.calls.reset();

  ReactDOM.render(
    <MarkableMap
      MarkerComponent={ SpaceMarker }
      markers={ [
        { id: 1, lngLat: [0, 0] },
        { id: 2, lngLat: [1, 1] },
      ] }
      autoFit
    />,
    div
  );

  fitBoundsCalls = labeledCalls(mapSpy, 'fitBounds');
  expect(fitBoundsCalls.length).toEqual(0);
});

it('it correctly removes markers', () => {
  markerSpy.calls.reset();

  const div = document.createElement('div');
  ReactDOM.render(
    <MarkableMap
      MarkerComponent={ SpaceMarker }
      markers={ [{ id: 1, lngLat: [1, 0] }] }
    />,
    div
  );

  ReactDOM.render(
    <MarkableMap
      MarkerComponent={ SpaceMarker }
      markers={ [] }
    />,
    div
  );

  const removeCalls = labeledCalls(markerSpy, 'remove');
  expect(removeCalls.length).toEqual(1);
});

it('unmounts without crashing', () => {
  mapSpy.calls.reset();

  const div = document.createElement('div');
  ReactDOM.render(
    <MarkableMap
      MarkerComponent={ SpaceMarker }
      markers={ [{ id: 1, lngLat: [1, 0] }] }
    />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);

  expect(labeledCalls(mapSpy, 'remove').length).toEqual(1);
});