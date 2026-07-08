/**
 * globe.js
 * Renders the 3D globe using globe.gl (a Three.js-based globe helper loaded via CDN).
 * globe.gl was chosen over raw Three.js scene setup because it ships a ready-made
 * WebGL globe + point-layer + camera/controls combo, so pins-on-a-sphere works
 * reliably without hand-rolling geo-to-3D projection math or lighting/orbit controls.
 */

const PortfolioGlobe = (() => {
  let globeInstance = null;

  function pointColor(d) {
    return d.__isHover ? "#ffb24f" : "#4fa3ff";
  }

  function init(containerEl, projects, { onPointClick, onPointHover }) {
    const points = projects.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      id: p.id,
      project: p.project,
      employer: p.employer,
      size: 0.55,
    }));

    globeInstance = Globe()(containerEl)
      .globeImageUrl("https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png")
      .backgroundColor("#000000")
      .pointsData(points)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor(pointColor)
      .pointAltitude(0.02)
      .pointRadius("size")
      .pointLabel((d) => `<b>${d.project}</b><br/>${d.employer}`)
      .onPointClick((d) => onPointClick && onPointClick(d.id))
      .onPointHover((d) => onPointHover && onPointHover(d));

    globeInstance.controls().autoRotate = true;
    globeInstance.controls().autoRotateSpeed = 0.35;
    globeInstance.controls().enableDamping = true;

    // US-centric default view since nearly all projects are KY/IN/IL/TN.
    globeInstance.pointOfView({ lat: 38.0, lng: -86.5, altitude: 1.8 }, 0);

    fitToContainer(containerEl);
    window.addEventListener("resize", () => fitToContainer(containerEl));

    return globeInstance;
  }

  function fitToContainer(containerEl) {
    if (!globeInstance) return;
    const { clientWidth, clientHeight } = containerEl;
    globeInstance.width(clientWidth).height(clientHeight);
  }

  return { init };
})();
