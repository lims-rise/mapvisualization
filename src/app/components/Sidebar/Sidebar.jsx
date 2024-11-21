// "use client";
// import React, { useState } from "react";
// import MapWrapper from "../Map/MapWrapper";

// function Sidebar() {
//   const [selectedCampaign, setSelectedCampaign] = useState("18");

//   const handleCampaignChange = (event) => {
//     setSelectedCampaign(event.target.value); // Update state campaign
//   };

//   return (
//     <>
//         <div className="sidebar-container hidden sm:hidden md:block w-64 bg-gray-800 text-white p-4 shadow-lg">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Filter Map</h2>

//         {/* Filter Campaign */}
//         <div className="mb-6">
//             <label htmlFor="campaign" className="block text-sm font-medium mb-2">
//             Select Campaign
//             </label>
//             <select
//             id="campaign"
//             name="campaign"
//             value={selectedCampaign}
//             onChange={handleCampaignChange} // Menangani perubahan pilihan campaign
//             className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
//             >
//             <option value="0">Campaign 0</option>
//             <option value="2">Campaign 2</option>
//             <option value="4">Campaign 4</option>
//             <option value="6">Campaign 6</option>
//             <option value="8">Campaign 8</option>
//             <option value="10">Campaign 10</option>
//             <option value="12">Campaign 12</option>
//             <option value="14">Campaign 14</option>
//             <option value="16">Campaign 16</option>
//             <option value="18">Campaign 18</option>
//             </select>
//         </div>

//         {/* Langsung render MainMap dan kirimkan selectedCampaign dan selectedCountry sebagai prop */}
//         </div>
//         <div className="flex-1 overflow-auto">
//             <MapWrapper selectedCampaign={selectedCampaign} />
//         </div>
//     </>
//   );
// }

// export default Sidebar;


"use client";
import React, { useState } from "react";
import MapWrapper from "../Map/MapWrapper";

function Sidebar() {
  const [selectedCampaign, setSelectedCampaign] = useState("18");

  const handleCampaignChange = (event) => {
    setSelectedCampaign(event.target.value); // Update state campaign
  };

  return (
    <>
      <div className="sidebar-container hidden sm:hidden md:block w-64 bg-gray-800 text-white p-4 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Filter Map</h2>

        {/* Filter Campaign */}
        <div className="mb-6">
          <label htmlFor="campaign" className="block text-sm font-medium mb-2">
            Select Campaign
          </label>
          <select
            id="campaign"
            name="campaign"
            value={selectedCampaign}
            onChange={handleCampaignChange} // Menangani perubahan pilihan campaign
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="0">Campaign 0</option>
            <option value="2">Campaign 2</option>
            <option value="4">Campaign 4</option>
            <option value="6">Campaign 6</option>
            <option value="8">Campaign 8</option>
            <option value="10">Campaign 10</option>
            <option value="12">Campaign 12</option>
            <option value="14">Campaign 14</option>
            <option value="16">Campaign 16</option>
            <option value="18">Campaign 18</option>
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {/* MapWrapper akan merender MainMap dengan dynamic import */}
        <MapWrapper selectedCampaign={selectedCampaign} />
      </div>
    </>
  );
}

export default Sidebar;
