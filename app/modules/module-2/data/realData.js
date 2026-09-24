import summary from "../../../../public/data/modul2_skor-resiko-summary.json";

export const provinsiOptions = Object.keys(summary.provinces);
export const tahunOptions = Object.keys(summary.provinces[provinsiOptions[0]].trend).sort();
export const bulanOptions = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const getProvince = provinsi => summary.provinces[provinsi] || summary.provinces[provinsiOptions[0]];

export const ringkasanByProvinsi = Object.fromEntries(
  provinsiOptions.map(provinsi => [provinsi, getProvince(provinsi)])
);

export const trendTahunanData = Object.fromEntries(
  tahunOptions.map(tahun => [tahun, (getProvince(provinsiOptions[0]).trend[tahun] || []).map(item => ({
    ...item,
    solid: item.solid,
    dashed: item.dashed,
  }))])
);

export const faktorPemicuByProvinsi = Object.fromEntries(
  provinsiOptions.map(provinsi => [provinsi, getProvince(provinsi).faktor])
);

export const donutBanjirByProvinsi = Object.fromEntries(
  provinsiOptions.map(provinsi => [provinsi, getProvince(provinsi).donutBanjir])
);

export const donutLongsorByProvinsi = Object.fromEntries(
  provinsiOptions.map(provinsi => [provinsi, getProvince(provinsi).donutLongsor])
);

export const frekuensiBencana = Object.fromEntries(
  provinsiOptions.map(provinsi => [provinsi, getProvince(provinsi).frekuensi])
);

export const wilayahByProvinsi = Object.fromEntries(
  provinsiOptions.map(provinsi => [provinsi, getProvince(provinsi).wilayah])
);

export const curahHujanBulananByProvinsi = Object.fromEntries(
  provinsiOptions.map(provinsi => [provinsi, getProvince(provinsi).curahHujanBulanan])
);

export const longsorBulananByProvinsi = curahHujanBulananByProvinsi;

export const getCurahHujanHarian = (provinsi, bulan) => {
  const data = getProvince(provinsi).curahHujanHarian[bulan];
  return data?.length ? data : getProvince(provinsi).curahHujanBulanan[bulan] ? [getProvince(provinsi).curahHujanBulanan[bulan]] : [];
};

export const getLatestMetrics = provinsi => getProvince(provinsi).latestMetrics;
export const getTrend = (provinsi, tahun) => getProvince(provinsi).trend[tahun] || [];
export const getCenter = provinsi => getProvince(provinsi).center;
export const getAlertFeed = provinsi => {
  const data = getProvince(provinsi);
  return [
    { id: `${provinsi}-banjir`, message: `${provinsi}: skor banjir ${data.skorRisikoBanjir}`, severity: "high", time: "Data terbaru" },
    { id: `${provinsi}-longsor`, message: `${provinsi}: skor longsor ${data.skorRisikoLongsor}`, severity: "high", time: "Data terbaru" },
  ];
};