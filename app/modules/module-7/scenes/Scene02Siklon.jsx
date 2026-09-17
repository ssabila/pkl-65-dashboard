"use client";

import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function Scene02Siklon() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={variants}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white/90 rounded-3xl shadow-lg p-12 max-w-3xl text-center"
      >
        <h3 className="text-2xl italic mb-3 text-slate-700">Pemicu Awal</h3>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
          Siklon Tropis di Samudra Hindia
        </h1>
        <p className="text-lg text-slate-700 leading-relaxed">
          Aktivitas siklon tropis di sekitar Samudra Hindia pada akhir November 2025
          mendorong massa uap air dalam jumlah besar ke arah pesisir barat Sumatera,
          menjadi pemicu awal rentetan curah hujan ekstrem yang akan kita lihat
          selanjutnya.
        </p>
      </motion.div>
    </div>
  );
}
