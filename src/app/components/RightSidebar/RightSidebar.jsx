"use client";
import Image from "next/image";
import React, { useState } from "react";
import Flag from "react-world-flags";

// Function to format the date
const formatDate = (date) => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Reusable component for line items (Boundary, Access lines, etc.)
const LineItem = ({ color, label }) => (
  <div className="flex items-center mt-4 ml-1">
    <div className={`flex-1 border-t-4 ${color} rounded-full`} />
    <span className="px-4 text-gray-600 text-xs">{label}</span>
  </div>
);

// Reusable component for status items (Active, Demolished, etc.)
const StatusItem = ({ color, label }) => (
  <div className="flex items-center mt-4 ml-1">
    <div className={`w-10 h-4 ${color} mr-2 rounded-sm`} />
    <span className="px-4 text-gray-600 text-xs">{label}</span>
  </div>
);

// Reusable component for information items (Thermochron, Hygrochron, etc.)
const InformationItem = ({ iconSrc, label, iconSize = { width: 30, height: 30 }, className = 'mr-2' }) => (
  <div className={`p-0 flex items-center ${className}`}>
    <Image src={iconSrc} alt={label} width={iconSize.width} height={iconSize.height} className={`${className}`} style={{ height: iconSize.height, width: iconSize.width }} />
    <div>
      <p className="text-xs">{label}</p>
    </div>
  </div>
);

// Component for displaying the flag based on selected country
const CountryFlag = ({ countryCode }) => {
  const defaultCountryCode = ['ID', 'FJ']; // dua negara yang ingin ditampilkan sebagai default

  if (!countryCode) {
    return (
      <div className="flex justify-center">
        {defaultCountryCode.map((code, index) => (
          <Flag code={code} key={index} style={{objectFit: 'cover' }} />
        ))}
      </div>
    );
  }

  switch (countryCode) {
    case 'Indonesia':
      return <Flag code="ID" />;
    case 'Fiji':
      return <Flag code="FJ" />;
    default:
      return (
        <div className="flex justify-center">
          {defaultCountryCode.map((code, index) => (
            <Flag code={code} key={index} className="w-1/2" />
          ))}
        </div>
      );
  }
};

// Main RightSidebar Component
// function RightSidebar({ selectedSettlementRightSidebar, selectedObjectiveRightSidebar, selectedCountryRightSidebar }) {
//   const [selectedPanel, setSelectedPanel] = useState("info"); // Active panel (info, settings, statistics)
//   const currentDate = formatDate(new Date());

//   return (
//     <div className="sidebar-container fixed right-0 top-0 w-64 bg-white text-gray-800 p-0 shadow-lg h-screen">
      
//       {/* Flag Information */}
//       <div className="absolute top-0 w-full p-4 bg-white border-b border-gray-200">
//         <CountryFlag countryCode={selectedCountryRightSidebar} />
//       </div>

//       {/* Sidebar Header */}
//       <div className="text-center p-4 -mt-4">
//         <Image src="/images/rise.png" alt="Right Sidebar Logo" width={200} height={200} className="w-64 h-auto mx-auto" />
//       </div>

//       {/* Sidebar Animation */}
//       <div className="text-center p-2 -mt-6">
//         <Image src="/gifs/wind.gif" alt="Right Sidebar Animation" width={200} height={200} className="w-20 h-auto mx-auto" />
//       </div>

//       {/* Settlement Information */}
//       <div className="p-4 w-64 mt-8">
//         <p className="text-2xl font-bold truncate max-w-full uppercase w-full">
//           {selectedSettlementRightSidebar?.settlement || 'Settlement'}
//         </p>
//         {selectedSettlementRightSidebar?.settlement && (
//           <p className="text-md text-gray-600">{selectedSettlementRightSidebar?.settlement}</p>
//         )}
//       </div>

//       {/* Information Section */}
//       <div className="p-4">
//         <div className="panel-content">

//           {/* Conditional Information Based on Objective */}
//           {["objective_2a", "objective_2b", "objective_3"].includes(selectedObjectiveRightSidebar) && (
//             <div className="mb-4">
//               <p className="text-md font-semibold uppercase mb-4">Information</p>

//               {/* Information Items */}
//               {selectedObjectiveRightSidebar === "objective_2a" && (
//                 <>
//                   <InformationItem iconSrc="/icons/thermochron.png" label="Thermochron" iconSize={{ width: 20, height: 35 }} className="mr-2" />
//                   <InformationItem iconSrc="/icons/hygrochron.png" label="Hygrochron" iconSize={{ width: 20, height: 30 }} className="mr-3 mt-2" />
//                   <InformationItem iconSrc="/icons/raingauge.png" label="Raingauge" iconSize={{ width: 25, height: 40 }} className="mr-2 mt-1" />
//                   <InformationItem iconSrc="/icons/well.png" label="Ultrasonic" iconSize={{ width: 25, height: 40 }} className="mr-2 mt-1" />
//                 </>
//               )}
//               {selectedObjectiveRightSidebar === "objective_2b" && (
//                 <>
//                   <InformationItem iconSrc="/icons/inhouse.png" label="In House Water Sample" />
//                   <InformationItem iconSrc="/icons/soil.png" label="Soil Sample" />
//                   <InformationItem iconSrc="/icons/water.png" label="Water Sample" />
//                   <InformationItem iconSrc="/icons/well.png" label="Well Water" />
//                 </>
//               )}

//               {/* Lines and Status Items */}
//               <LineItem color="border-orange" label="Boundary Line" />
//               <LineItem color="border-blue" label="Road Access Line" />
//               {selectedObjectiveRightSidebar === "objective_2b" && (
//                 <LineItem color="border-pink" label="Bootsock Line" />
//               )}

//               <StatusItem color="bg-active" label="Active" />
//               <StatusItem color="bg-underconstruction" label="Underconstruction" />
//               <StatusItem color="bg-demolished" label="Demolished" />
//               <StatusItem color="bg-vacant" label="Vacant" />
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-200">
//         <p className="text-sm text-gray-600 font-bold">{currentDate}</p>
//       </div>
//     </div>
    
//   );
// }

function RightSidebar({ selectedSettlementRightSidebar, selectedObjectiveRightSidebar, selectedCountryRightSidebar }) {
  const [selectedPanel, setSelectedPanel] = useState("info"); // Active panel (info, settings, statistics)
  const currentDate = formatDate(new Date());

  return (
    <div className="sidebar-container fixed right-0 top-0 w-64 bg-white text-gray-800 p-0 shadow-lg h-screen flex flex-col">
      <div className="absolute top-0 w-full bg-white shadow-xl">
        {/* Flag Information */}
        <CountryFlag countryCode={selectedCountryRightSidebar} />
      </div>
      <div className="flex-1 overflow-y-auto mt-16 pt-16 custom-scrollbar">
        {/* Bagian atas yang bisa di-scroll */}
        <div className="p-4">
          {/* Sidebar Header */}
          <div className="text-center p-4 -mt-4">
            <Image src="/images/rise.png" alt="Right Sidebar Logo" width={200} height={200} className="w-64 h-auto mx-auto" />
          </div>

          {/* Sidebar Animation */}
          <div className="text-center p-2 -mt-6">
            <Image src="/gifs/wind.gif" alt="Right Sidebar Animation" width={200} height={200} className="w-20 h-auto mx-auto" />
          </div>

          {/* Settlement Information */}
          <div className="p-4 w-64 mt-8">
            <p className="text-2xl font-bold truncate max-w-full uppercase w-full">
              {selectedSettlementRightSidebar?.settlement || 'Settlement'}
            </p>
            {selectedSettlementRightSidebar?.settlement && (
              <p className="text-sm text-gray-600 italic">{selectedSettlementRightSidebar?.settlement}</p>
            )}
          </div>

          {/* Information Section */}
          <div className="p-4">
            <div className="panel-content">
            <p className="text-md font-semibold uppercase mb-4">Information</p>
            
              {/* Conditional Information Based on Objective */}
              {["objective_2a", "objective_2b", "objective_3"].includes(selectedObjectiveRightSidebar) && (
                <div className="mb-4">
              

                  {/* Information Items */}
                  {selectedObjectiveRightSidebar === "objective_2a" && (
                    <>

                      <InformationItem iconSrc="/icons/thermochron.png" label="Thermochron" iconSize={{ width: 20, height: 35 }} className="mr-2" />
                      <InformationItem iconSrc="/icons/hygrochron.png" label="Hygrochron" iconSize={{ width: 20, height: 30 }} className="mr-3 mt-2" />
                      <InformationItem iconSrc="/icons/raingauge.png" label="Raingauge" iconSize={{ width: 25, height: 40 }} className="mr-2 mt-1" />
                      <InformationItem iconSrc="/icons/well.png" label="Ultrasonic" iconSize={{ width: 25, height: 40 }} className="mr-2 mt-1" />
                    </>
                  )}
                  {selectedObjectiveRightSidebar === "objective_2b" && (
                    <>

                      <InformationItem iconSrc="/icons/inhouse.png" label="In House Water Sample" />
                      <InformationItem iconSrc="/icons/soil.png" label="Soil Sample" />
                      <InformationItem iconSrc="/icons/water.png" label="Water Sample" />
                      <InformationItem iconSrc="/icons/well.png" label="Well Water" />
                    </>
                  )}

                  {/* Lines and Status Items */}
                  <LineItem color="border-orange" label="Boundary Line" />
                  <LineItem color="border-blue" label="Road Access Line" />
                  {selectedObjectiveRightSidebar === "objective_2b" && (
                    <LineItem color="border-pink" label="Bootsock Line" />
                  )}


                  <StatusItem color="bg-active" label="Active" />
                  {selectedObjectiveRightSidebar !== "objective_2a" && (
                    <>
                    <StatusItem color="bg-underconstruction" label="Underconstruction" />
                    <StatusItem color="bg-demolished" label="Demolished" />
                    <StatusItem color="bg-vacant" label="Vacant" />
                    </>
                  )}
                  {selectedObjectiveRightSidebar !== "objective_2b" && selectedObjectiveRightSidebar !== "objective_3"  && (
                    <>
                      <StatusItem color="bg-rundown" label="RunDown" />
                      <StatusItem color="bg-risehouse" label="RiseHouse" />
                      <StatusItem color="bg-replace" label="Replace" />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 w-full p-4 bg-white shadow-t">
        <p className="text-sm text-gray-600 font-bold">{currentDate}</p>
      </div>
    </div>
  );
}

export default RightSidebar;
