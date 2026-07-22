"use client";

import { useState } from "react";
import Link from "next/link";
import WilayahTab from "./wilayah/WilayahTab";
import KomponenTab from "./komponen/KomponenTab";
import MetadataTab from "./metadata/MetadataTab";
import "./styles/module6.css";

/**
 * Main orchestrator for Module 6 dashboard.
 * Handles tab switching and shared layout (header, decorative elements).
 * Each tab is a self-contained component in its own folder.
 */
export default function Module6Dashboard() {
  const [activeTab, setActiveTab] = useState("wilayah");

  const tabs = [
    { key: "wilayah", label: "Wilayah" },
    { key: "komponen", label: "Komponen" },
    { key: "metadata", label: "Metadata" },
  ];

  return (
    <div className="m6-wrapper">
      {/* Decorative stars */}
      <span className="m6-deco-star m6-deco-star--1" />
      <span className="m6-deco-star m6-deco-star--2" />
      <span className="m6-deco-star m6-deco-star--3" />
      <span className="m6-deco-star m6-deco-star--4" />
      <span className="m6-deco-star m6-deco-star--5" />
      <span className="m6-deco-star m6-deco-star--6" />

      <div className="m6-content">
        {/* Back link */}
        <Link href="/" className="m6-back" id="m6-back-link">
          ← Kembali
        </Link>

        {/* Header */}
        <header className="m6-header">
          <h1 className="m6-header__title" id="m6-page-title">
            Modul 6 - Prioritas Penanganan
          </h1>

          <nav className="m6-header__nav" aria-label="Module 6 tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                id={`m6-tab-${tab.key}`}
                className={`m6-header__nav-link ${
                  activeTab === tab.key ? "m6-header__nav-link--active" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}
                aria-current={activeTab === tab.key ? "page" : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Tab Content */}
        {activeTab === "wilayah" && <WilayahTab />}
        {activeTab === "komponen" && <KomponenTab />}
        {activeTab === "metadata" && <MetadataTab />}
      </div>
    </div>
  );
}
