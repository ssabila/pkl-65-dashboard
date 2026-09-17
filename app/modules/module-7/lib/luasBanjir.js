const FASES = ["fase1", "fase2", "fase3", "fase4"];

// Total luas per fase, dijumlahkan lintas 3 provinsi
export function getTotalLuasPerFase(ringkasanAceh, ringkasanSumut, ringkasanSumbar) {
  const result = {};
  FASES.forEach((fase) => {
    const a = ringkasanAceh.find((r) => r.fase === fase)?.luas_km2 || 0;
    const s = ringkasanSumut.find((r) => r.fase === fase)?.luas_km2 || 0;
    const b = ringkasanSumbar.find((r) => r.fase === fase)?.luas_km2 || 0;
    result[fase] = Number((a + s + b).toFixed(2));
  });
  return result;
}

// Ambil map nama kabupaten -> luas (km2) untuk fase tertentu, dari satu provinsi
export function getKabupatenLuasForFase(kabupatenFaseRows, fase) {
  const map = new Map();
  kabupatenFaseRows.forEach((row) => {
    if (row.kabupaten) map.set(row.kabupaten, Number(row[fase]) || 0);
  });
  return map;
}

export function getPercentChange(totalPerFase) {
  const order = ["fase1", "fase2", "fase3", "fase4"];
  const result = {};
  order.forEach((fase, i) => {
    if (i === 0) {
      result[fase] = null;
      return;
    }
    const prev = totalPerFase[order[i - 1]];
    const curr = totalPerFase[fase];
    result[fase] = prev ? Number((((curr - prev) / prev) * 100).toFixed(1)) : null;
  });
  return result;
}