const fs = require("fs");
const path = require("path");
const { parser } = require(path.resolve("node_modules/stream-json/src/parser.js"));
const { pick } = require(path.resolve("node_modules/stream-json/src/filters/pick.js"));
const { streamArray } = require(path.resolve("node_modules/stream-json/src/streamers/stream-array.js"));

const source = path.resolve("public/data/modul2_skor-resiko.json");
const output = path.resolve("public/data/modul2_skor-resiko-summary.json");
const provinceNames = {
  "Nangroe Aceh Darussalam": "Aceh",
  "Sumatera Utara": "Sumatera Utara",
  "Sumatera Barat": "Sumatera Barat",
};
const provinceCenters = {
  Aceh: [4.6, 96.5],
  "Sumatera Utara": [2.2, 99.0],
  "Sumatera Barat": [-0.7, 100.4],
};
const knownCoordinates = {
  "Bener Meriah": [4.72, 96.82],
  "Aceh Tengah": [4.5, 96.5],
  "Aceh Tamiang": [4.18, 97.82],
  "Gayo Lues": [3.8, 97.1],
  Pidie: [4.95, 96],
  "Aceh Besar": [5.4, 95.45],
  "Banda Aceh": [5.55, 95.32],
  Sabang: [5.88, 95.32],
};

const sum = (target, key, value) => {
  if (Number.isFinite(value)) target[key] = (target[key] || 0) + value;
};
const average = (bucket, key) => bucket.count ? (bucket[key] || 0) / bucket.count : 0;
const riskLevel = status => {
  if (!status) return "Sedang";
  if (/kritis|bahaya/i.test(status)) return "Kritis";
  if (/waspada|siaga/i.test(status)) return "Tinggi";
  if (/aman|rendah/i.test(status)) return "Rendah";
  return "Sedang";
};
const monthName = month => ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][month - 1];
const makeBucket = () => ({ count: 0, flood: 0, landslide: 0, rain: 0, rain3: 0, rain7: 0, anomaly: 0, moisture: 0, slope: 0, elevation: 0, ndvi: 0, ndbi: 0, ndwi: 0, floodArea: 0, floodScore: 0, landslideScore: 0, floodRisk: {}, landslideRisk: {} });

const provinces = {};
const getProvince = name => {
  const label = provinceNames[name] || name;
  if (!provinces[label]) provinces[label] = { count: 0, years: {}, months: {}, days: {}, districts: {}, risk: { flood: {}, landslide: {} } };
  return provinces[label];
};
const addRow = (bucket, row) => {
  bucket.count += 1;
  for (const [key, field] of [["rain", "hujan_aktual"], ["rain3", "ch_mean_3hari"], ["rain7", "ch_mean_7hari"], ["anomaly", "anomali_curah_hujan"], ["moisture", "SoilMoi_0_10cm"], ["slope", "Slope_Mean_deg"], ["elevation", "Elevasi_Mean_m"], ["ndvi", "NDVI_Mean"], ["ndbi", "NDBI_Mean"], ["ndwi", "NDWI_Mean"], ["floodArea", "Luas_Genangan_km2"], ["floodScore", "Skor_Banjir"], ["landslideScore", "Skor_Longsor"]]) sum(bucket, key, Number(row[field]));
  const floodRisk = riskLevel(row.Status_Banjir);
  const landslideRisk = riskLevel(row.Status_Longsor);
  bucket.floodRisk[floodRisk] = (bucket.floodRisk[floodRisk] || 0) + 1;
  bucket.landslideRisk[landslideRisk] = (bucket.landslideRisk[landslideRisk] || 0) + 1;
};

const stream = fs.createReadStream(source).pipe(parser.asStream()).pipe(pick.asStream({ filter: "Sheet1" })).pipe(streamArray.asStream());
stream.on("data", ({ value: row }) => {
  const province = getProvince(row.Provinsi);
  const year = String(row.tahun);
  const month = Number(row.bulan);
  const district = row.Kabupaten_Kota;
  province.count += 1;
  province.years[year] ||= makeBucket();
  province.months[year] ||= {};
  province.months[year][month] ||= makeBucket();
  province.days[year] ||= {};
  province.days[year][month] ||= {};
  province.days[year][month][row.hari] ||= makeBucket();
  province.districts[district] ||= makeBucket();
  addRow(province.years[year], row);
  addRow(province.months[year][month], row);
  addRow(province.days[year][month][row.hari], row);
  addRow(province.districts[district], row);
});

stream.on("end", () => {
  const result = { generatedAt: new Date().toISOString(), source: "modul2_skor-resiko.json", provinces: {} };
  for (const [name, data] of Object.entries(provinces)) {
    const years = Object.keys(data.years).sort();
    const latestYear = years[years.length - 1];
    const previousYear = years[years.length - 2];
    const latest = data.years[latestYear];
    const previous = data.years[previousYear];
    const scoreTotal = latest.floodScore + latest.landslideScore || 1;
    const majority = latest.floodScore >= latest.landslideScore ? "Banjir" : "Longsor";
    const peakMonth = Object.entries(data.months[latestYear] || {}).sort((a, b) => b[1].count - a[1].count)[0];
    const toTrend = bucket => ({ solid: Math.round(bucket.floodScore / Math.max(bucket.count, 1)), dashed: Math.round(bucket.landslideScore / Math.max(bucket.count, 1)) });
    const trend = Object.fromEntries(years.map(year => [year, Object.entries(data.months[year]).sort((a, b) => a[0] - b[0]).map(([month, bucket]) => ({ bulan: monthName(Number(month)), ...toTrend(bucket) }))]));
    const districts = Object.entries(data.districts).sort((a, b) => b[1].count - a[1].count);
    const districtData = (riskKey, scoreKey) => districts.slice(0, 4).map(([district, bucket]) => ({ name: district, value: Number((average(bucket, scoreKey) / Math.max(average(data.years[latestYear], scoreKey), 1) * 100).toFixed(1)) }));
    const factorValues = [
      ["Curah Hujan", average(latest, "rain3")],
      ["Luas Genangan", average(latest, "floodArea")],
      ["Anomali Hujan", Math.abs(average(latest, "anomaly"))],
      ["Soil Moisture", average(latest, "moisture")],
      ["Kemiringan", average(latest, "slope")],
      ["Elevasi", average(latest, "elevation")],
    ];
    const maxFactor = Math.max(...factorValues.map(([, value]) => value), 1);
    const faktor = factorValues.map(([faktor, value]) => ({ faktor, level: Math.max(1, Math.min(4, Math.ceil(value / maxFactor * 4))) }));
    const wilayah = districts.map(([nama, bucket]) => ({
      nama,
      lat: knownCoordinates[nama]?.[0] ?? null,
      lng: knownCoordinates[nama]?.[1] ?? null,
      risikoB: Object.entries(bucket.floodRisk).sort((a, b) => b[1] - a[1])[0]?.[0] || "Sedang",
      risikoL: Object.entries(bucket.landslideRisk).sort((a, b) => b[1] - a[1])[0]?.[0] || "Sedang",
      curahHujan: `${average(bucket, "rain").toFixed(1)} mm`,
      luasGenangan: `${average(bucket, "floodArea").toFixed(1)} km2`,
      skorRisiko: `${average(bucket, "floodScore").toFixed(2)}`,
      jenisTanah: "Data tanah tersedia",
      kemiringan: `${average(bucket, "slope").toFixed(2)} derajat`,
      tutupanLahan: `NDVI ${average(bucket, "ndvi").toFixed(2)}, NDBI ${average(bucket, "ndbi").toFixed(2)}`,
      soilMoisture: `${average(bucket, "moisture").toFixed(2)}`,
      skorRisikoLongsor: `${average(bucket, "landslideScore").toFixed(2)}`,
    }));
    result.provinces[name] = {
      totalKejadian: data.count,
      perubahan: previous ? `${((data.years[latestYear].count - previous.count) / Math.max(previous.count, 1) * 100).toFixed(2)}%` : "0%",
      mayoritasBencana: majority,
      persentaseMayoritas: `${(Math.max(latest.floodScore, latest.landslideScore) / scoreTotal * 100).toFixed(1)}%`,
      puncakBencana: peakMonth ? monthName(Number(peakMonth[0])) : "-",
      persentasePuncak: peakMonth ? `${(peakMonth[1].count / latest.count * 100).toFixed(1)}%` : "0%",
      skorRisikoBanjir: `${average(latest, "floodScore").toFixed(2)}`,
      skorRisikoLongsor: `${average(latest, "landslideScore").toFixed(2)}`,
      latestMetrics: {
        rain: average(latest, "rain"),
        rain3: average(latest, "rain3"),
        rain7: average(latest, "rain7"),
        anomaly: average(latest, "anomaly"),
        moisture: average(latest, "moisture"),
        slope: average(latest, "slope"),
        elevation: average(latest, "elevation"),
        ndvi: average(latest, "ndvi"),
        ndbi: average(latest, "ndbi"),
      },
      trend,
      faktor,
      donutBanjir: districtData("floodRisk", "floodScore"),
      donutLongsor: districtData("landslideRisk", "landslideScore"),
      frekuensi: Object.entries(latest.floodRisk).map(([jenis, frekuensi]) => ({ jenis, frekuensi, highlight: jenis === "Kritis" })),
      curahHujanBulanan: Object.fromEntries(Object.entries(data.months[latestYear] || {}).map(([month, bucket]) => [monthName(Number(month)), { label: monthName(Number(month)), solid: Math.round(average(bucket, "rain")), dashed: Math.round(average(bucket, "rain7")) }])),
      curahHujanHarian: Object.fromEntries(Object.entries(data.days[latestYear] || {}).map(([month, days]) => [monthName(Number(month)), Object.entries(days).map(([day, bucket]) => ({ label: day, solid: Number(average(bucket, "rain").toFixed(2)), dashed: Number(average(bucket, "rain7").toFixed(2)) }))])),
      wilayah,
      center: provinceCenters[name],
    };
  }
  fs.writeFileSync(output, JSON.stringify(result));
  console.log(`Wrote ${output}`);
});
stream.on("error", error => { console.error(error); process.exitCode = 1; });