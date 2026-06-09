import React from 'react';
import './metadata.css';

export default function MetadataTab() {
  return (
    <div className="m6-meta-container">
      {/* Top Row */}
      <div className="m6-meta-top-row">
        <div className="m6-card-wrapper m6-card-wrapper--green m6-meta-desc">
          <div className="m6-card-content">
            <p>Teks paragraf Anda</p>
          </div>
        </div>
        <div className="m6-meta-summary-table">
          <div className="m6-meta-summary-header">
            <div>Cakupan Wilayah</div>
            <div>Rentang Waktu</div>
            <div>Level Data</div>
          </div>
          <div className="m6-meta-summary-body">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Middle Row - Main Table */}
      <div className="m6-meta-main-table">
        <table className="m6-meta-table">
          <thead>
            <tr>
              <th>Nama Indikator</th>
              <th>Definisi</th>
              <th>Rumus</th>
              <th>Interpretasi</th>
              <th>Variabel Pembangun</th>
            </tr>
          </thead>
          <tbody>
            <tr><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Row */}
      <div className="m6-meta-bottom-row">
        <div className="m6-card-wrapper m6-card-wrapper--orange">
          <div className="m6-card-content">
            <h4>Sumber Data</h4>
          </div>
        </div>
        <div className="m6-card-wrapper m6-card-wrapper--orange">
          <div className="m6-card-content">
            <h4>Metodologi</h4>
          </div>
        </div>
        <div className="m6-card-wrapper m6-card-wrapper--orange">
          <div className="m6-card-content">
            <h4>Catatan dan Batasan</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
