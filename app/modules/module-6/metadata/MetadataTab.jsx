import React from "react";
import "./metadata.css";

export default function MetadataTab() {
  return (
    <div className="m6-meta-container">
      {/* Top Row */}
      <div className="m6-meta-top-row">
        <div className="m6-card-wrapper m6-card-wrapper--green m6-meta-desc">
          <div className="m6-card-content">
            <h3 style={{ margin: "0 0 10px 0", color: "#2a8e74", fontSize: "1.1rem", fontWeight: "700" }}>
              Composite Risk Score (CRS) — Prioritas Penanganan
            </h3>
            <p style={{ lineHeight: "1.6", color: "#475569" }}>
              Composite Risk Score (CRS) merupakan indeks komposit yang mengintegrasikan
              tiga pilar utama risiko bencana hidrometeorologi (banjir dan longsor):
              <strong> Ancaman Bahaya (Hazard)</strong>, <strong>Keterpaparan (Exposure)</strong>,
              dan <strong>Kerentanan (Vulnerability)</strong> untuk menentukan prioritas
              penanganan wilayah secara objektif dan terukur.
            </p>
          </div>
        </div>
        <div className="m6-meta-summary-table">
          <div className="m6-meta-summary-item">
            <div className="m6-meta-summary-label">
              <span></span> Cakupan Wilayah
            </div>
            <div className="m6-meta-summary-value">
              3 Provinsi (Aceh, Sumut, Sumbar) • 75 Kab/Kota
            </div>
          </div>
          <div className="m6-meta-summary-item">
            <div className="m6-meta-summary-label">
              <span></span> Rentang Waktu
            </div>
            <div className="m6-meta-summary-value">Tahun 2025</div>
          </div>
          <div className="m6-meta-summary-item">
            <div className="m6-meta-summary-label">
              <span></span> Level Data
            </div>
            <div className="m6-meta-summary-value">Kabupaten / Kota (Level 2)</div>
          </div>
        </div>
      </div>

      {/* Middle Row - Main Table */}
      <div className="m6-meta-scroll-hint">Geser tabel ke samping untuk melihat detail lengkap ↔</div>
      <div className="m6-meta-main-table">
        <table className="m6-meta-table">
          <thead>
            <tr>
              <th style={{ width: "16%" }}>Nama Indikator</th>
              <th style={{ width: "24%" }}>Definisi</th>
              <th style={{ width: "20%" }}>Rumus</th>
              <th style={{ width: "20%" }}>Interpretasi</th>
              <th style={{ width: "20%" }}>Variabel Pembangun</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: "700", color: "#0f172a", background: "#f8fafc" }}>
                Composite Risk Score (CRS)
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Indeks agregat penentu tingkat prioritas intervensi penanganan risiko bencana banjir dan longsor wilayah.
              </td>
              <td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#0369a1", background: "#f0f9ff", lineHeight: "1.4" }}>
                1) indeks_crs = Hazard × (Exposure + Kerentanan)<br />
                2) norm_crs = indeks_crs / 1.6686
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Semakin tinggi nilai CRS (0–100%), semakin tinggi tingkat urgensi alokasi mitigasi bencana.
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Indeks Hazard, Indeks Exposure, Indeks Kerentanan (Vulnerability)
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "700", color: "#0f172a", background: "#f8fafc" }}>
                Indeks Hazard
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Tingkat intensitas ancaman fisik dan frekuensi bencana hidrometeorologi (banjir dan longsor).
              </td>
              <td style={{ fontFamily: "monospace", fontSize: "0.88rem", color: "#0369a1", background: "#f0f9ff" }}>
                (Skor Banjir + Skor Longsor) / 2
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Nilai tinggi menandakan kerawanan fisik yang besar terhadap curah hujan ekstrem dan topografi lereng.
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Skor Bahaya Banjir (skor_banjir), Skor Bahaya Longsor (skor_longsor)
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "700", color: "#0f172a", background: "#f8fafc" }}>
                Indeks Exposure
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Tingkat keterpaparan elemen rentan, mencakup konsentrasi populasi dan fasilitas fisik/bangunan.
              </td>
              <td style={{ fontFamily: "monospace", fontSize: "0.88rem", color: "#0369a1", background: "#f0f9ff" }}>
                f(Tutupan Lahan, Penduduk, NDBI)
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Semakin padat penduduk dan bangunan di kawasan bahaya, semakin besar potensi kerugian.
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Tutupan Lahan (norm_landuse), Kepadatan Penduduk (norm_penduduk), Kerapatan Bangunan (norm_ndbi)
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "700", color: "#0f172a", background: "#f8fafc" }}>
                Indeks Kerentanan (Vulnerability)
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Kondisi sosio-ekologis masyarakat yang memengaruhi ketahanan dan kemampuan adaptasi saat bencana.
              </td>
              <td style={{ fontFamily: "monospace", fontSize: "0.88rem", color: "#0369a1", background: "#f0f9ff" }}>
                Keterpaparan + Sensitivitas - Kapasitas Adaptasi
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Kapasitas adaptasi yang rendah serta sensitivitas demografi tinggi memperparah dampak bencana.
              </td>
              <td style={{ textAlign: "left", color: "#334155", background: "#ffffff" }}>
                Indeks Keterpaparan, Indeks Sensitivitas, Indeks Kapasitas Adaptasi
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Row */}
      <div className="m6-meta-bottom-row">
        <div className="m6-card-wrapper m6-card-wrapper--orange">
          <div className="m6-card-content">
            <h4 style={{ fontWeight: "700", color: "#ea7e20", marginBottom: "8px" }}>
              Sumber Data
            </h4>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569", lineHeight: "1.5" }}>
              • Badan Nasional Penanggulangan Bencana (InaRISK BNPB)<br />
              • Badan Pusat Statistik (Data Sensus & Survei Penduduk/Sosek 2024–2025)<br />
              • Citra Satelit Penginderaan Jauh Landsat 8/9 & Sentinel-2 (NDBI & Tutupan Lahan)
            </p>
          </div>
        </div>
        <div className="m6-card-wrapper m6-card-wrapper--orange">
          <div className="m6-card-content">
            <h4 style={{ fontWeight: "700", color: "#ea7e20", marginBottom: "8px" }}>
              Metodologi
            </h4>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569", lineHeight: "1.5" }}>
              • Normalisasi Min-Max skala 0 hingga 1<br />
              • Spatial Multi-Criteria Analysis (SMCA) & Formula IPCC / BNPB<br />
              • Klasifikasi 4 Kategori Risiko: Sangat Tinggi, Tinggi, Sedang, Rendah
            </p>
          </div>
        </div>
        <div className="m6-card-wrapper m6-card-wrapper--orange">
          <div className="m6-card-content">
            <h4 style={{ fontWeight: "700", color: "#ea7e20", marginBottom: "8px" }}>
              Catatan dan Batasan
            </h4>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569", lineHeight: "1.5" }}>
              • Analisis mencakup 75 kabupaten/kota di 3 provinsi (Aceh: 23, Sumut: 33, Sumbar: 19)<br />
              • Merefleksikan kondisi baseline per tahun 2025<br />
              • Skor CRS terkalibrasi untuk perbandingan prioritas antar-wilayah
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
