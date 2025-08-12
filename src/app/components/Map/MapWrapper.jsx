// "use client";

// import React from "react";
// import MainMap from "./MainMap";

// const MapWrapper = ({ selectedCampaign }) => {

//   return (
//     <div>
//       <MainMap selectedCampaign={selectedCampaign} />
//     </div>
//   );
// };

// export default MapWrapper;


"use client";

import React from "react";
// Menggunakan dynamic import untuk menonaktifkan SSR pada MainMap
import dynamic from "next/dynamic";

// Dynamic import untuk menonaktifkan SSR pada MainMap
const DynamicMainMap = dynamic(() => import("./MainMap"), {
  ssr: false, // Menonaktifkan SSR
});

const MapWrapper = ({ selectedCountry, selectedMenu, selectedStates, selectedTiers, selectedTypes }) => {
  return (
    <div>
      {/* Render komponen MainMap secara dinamis tanpa SSR */}
      <DynamicMainMap 
        selectedCountry={selectedCountry} 
        selectedMenu={selectedMenu} 
        selectedStates={selectedStates}
        selectedTiers={selectedTiers}
        selectedTypes={selectedTypes}
      />
    </div>
  );
};

export default MapWrapper;
