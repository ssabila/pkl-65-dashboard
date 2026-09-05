"use client";

import { useState } from "react";

import StorySidebar from "./StorySidebar";

import Pembuka from "../scenes/1. Pembuka";
import Siklon from "../scenes/2. Siklon";
import CurahHujan from "../scenes/3. CurahHujan";
import KronologiBencana1 from "../scenes/4. KronologiBencana1";
import KronologiBencana2 from "../scenes/5. KronologiBencana2";
import AwalBanjir from "../scenes/6. AwalBanjir";
import PuncakBanjir from "../scenes/7. PuncakBanjir";
import SurutBertahap from "../scenes/8. SurutBertahap";
import Pemulihan from "../scenes/9. Pemulihan";

export default function StoryLayout() {

  const [currentScene, setCurrentScene] = useState(0);

  const scenes = [
  <Pembuka key="pembuka" />,
  <Siklon key="siklon" />,
  <CurahHujan key="curahhujan" />,
  <KronologiBencana1 key="kronologi1" />,
  <KronologiBencana2 key="kronologi2" />,
  <AwalBanjir key="awalbanjir" />,
  <PuncakBanjir key="puncakbanjir" />,
  <SurutBertahap key="surut" />,
  <Pemulihan key="pemulihan" />,
];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100">

      {scenes[currentScene]}

      <StorySidebar
        currentScene={currentScene}
        setCurrentScene={setCurrentScene}
        total={scenes.length}
      />

    </div>
  );
}