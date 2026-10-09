// Ubah GeometryCollection polos jadi FeatureCollection dengan properti index,
// supaya bisa diwarnai per-bentuk. FeatureCollection asli dibiarkan apa adanya.
export function normalizeToFeatureCollection(geojson) {
  if (geojson.type === "FeatureCollection") return geojson;

  if (geojson.type === "GeometryCollection") {
    return {
      type: "FeatureCollection",
      features: geojson.geometries.map((geom, i) => ({
        type: "Feature",
        properties: { index: i },
        geometry: geom,
      })),
    };
  }

  // bare single geometry (Polygon/MultiPolygon tanpa wrapper Feature)
  return {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: {}, geometry: geojson }],
  };
}