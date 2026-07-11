/**
 * globe.js
 * Renders the interactive 3D map using CesiumJS — same engine/CDN pattern
 * (version) as the Allerion-Digital-Twin repo, so this can later layer in
 * richer patterns from that repo (Ion terrain, tilesets) without a
 * rendering-engine swap. Base imagery is Esri World Imagery (free, no
 * account/token — real aerial/satellite photography, the "Google Earth"
 * look) with OSM as an instant-paint fallback while it loads/if it fails.
 * Set window.CESIUM_ION_TOKEN before this script loads to opt into Ion
 * World Imagery/Terrain instead — every Ion feature requires a real
 * account-linked token (Cesium ships no public/shared demo token as of
 * 2026), so there's no fake/placeholder value baked in here.
 */

const PortfolioGlobe = (() => {
  let viewer = null;
  let selectedId = null;

  function pointColor(isHover, isSelected) {
    if (isSelected) return Cesium.Color.fromCssColorString('#ff9fce');
    return isHover ? Cesium.Color.fromCssColorString('#9c6bf0') : Cesium.Color.fromCssColorString('#7c9cff');
  }

  function refreshPointColor(entity) {
    if (!entity || !entity.point) return;
    entity.point.color = pointColor(false, entity.id === selectedId);
  }

  // Esri World Imagery is real aerial/satellite photography, free, no
  // account/token — the actual "Google Earth" look the OSM street-map
  // fallback can't give. Loaded async and swapped in after first paint so
  // the globe never sits blank while a slower tile source loads; if this
  // fails (network hiccup, provider outage) the OSM baseLayer just stays.
  async function upgradeToSatelliteImagery(viewer) {
    try {
      const provider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
      );
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(provider);
    } catch (err) {
      console.error('Satellite imagery failed to load, keeping OSM fallback:', err);
    }
  }

  function init(containerEl, projects, { onPointClick, onPointHover }) {
    const ionToken = window.CESIUM_ION_TOKEN || null;
    if (ionToken) Cesium.Ion.defaultAccessToken = ionToken;

    viewer = new Cesium.Viewer(containerEl, {
      animation: false,
      timeline: false,
      homeButton: true,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      geocoder: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      // No Ion token by default: use OSM imagery (no account needed) instead
      // of Cesium's Ion-backed default, so the globe renders out of the box.
      baseLayer: ionToken
        ? undefined
        : new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' })),
    });
    viewer.scene.globe.enableLighting = false;

    if (!ionToken) upgradeToSatelliteImagery(viewer);

    projects.forEach((p) => {
      viewer.entities.add({
        id: p.id,
        position: Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
        point: {
          pixelSize: 10,
          color: pointColor(false, false),
          outlineColor: Cesium.Color.fromCssColorString('#08090f'),
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        __project: p,
      });
    });

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-86.5, 38.0, 1_800_000),
      duration: 0,
    });

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let hovered = null;

    handler.setInputAction((movement) => {
      const picked = viewer.scene.pick(movement.endPosition);
      const entity = picked && picked.id;
      if (entity !== hovered) {
        refreshPointColor(hovered);
        hovered = entity && entity.__project ? entity : null;
        if (hovered && hovered.point) hovered.point.color = pointColor(true, hovered.id === selectedId);
        onPointHover && onPointHover(hovered ? hovered.__project : null);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position);
      const entity = picked && picked.id;
      if (entity && entity.__project && onPointClick) onPointClick(entity.__project.id);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return viewer;
  }

  // Flies the camera to a project's pin and marks it selected (distinct pin
  // color) until the next selection — used by both pin clicks and the search
  // panel's project list, so both entry points land in the same visual state.
  function flyToProject(project) {
    if (!viewer || !project) return;
    const prevSelected = selectedId;
    selectedId = project.id;
    const prevEntity = viewer.entities.getById(prevSelected);
    if (prevEntity) refreshPointColor(prevEntity);
    const entity = viewer.entities.getById(project.id);
    if (entity) refreshPointColor(entity);

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(project.lng, project.lat, 120_000),
      duration: 1.4,
    });
  }

  function resize(containerEl) {
    if (!viewer) return;
    viewer.resize();
  }

  return { init, flyToProject, resize };
})();
