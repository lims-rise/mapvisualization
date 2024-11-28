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

const MapWrapper = ({ selectedCampaign, selectedCountry, selectedSettlement, selectedStatus }) => {
  return (
    <div>
      {/* Render komponen MainMap secara dinamis tanpa SSR */}
      <DynamicMainMap selectedCampaign={selectedCampaign} selectedCountry={selectedCountry} selectedSettlement={selectedSettlement} selectedStatus={selectedStatus} />
    </div>
  );
};

export default MapWrapper;
