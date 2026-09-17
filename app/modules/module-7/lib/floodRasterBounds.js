// Format Leaflet: [[south, west], [north, east]]
export const FLOOD_RASTER_BOUNDS = {
  aceh:   [[1.9698, 94.9618], [6.0994, 98.3153]],
  sumut:  [[-0.6398, 97.0512], [4.3054, 100.4388]],
  sumbar: [[-3.5786, 98.5956], [0.9085, 101.8987]],
};

export function getFloodRasterUrl(provinsiKey, fase) {
  return `/data/luas-banjir/rasters/${provinsiKey}_${fase}.png`;
}