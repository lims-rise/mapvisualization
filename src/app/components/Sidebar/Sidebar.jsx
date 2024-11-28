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


// "use client";
// import React, { useEffect, useState } from "react";
// import MapWrapper from "../Map/MapWrapper";

// function Sidebar() {
//   const [campaigns, setCampaigns] = useState([]);
//   const [countries, setCountries] = useState([]);
//   const [selectedCampaign, setSelectedCampaign] = useState(""); // Initialize with empty string
//   const [selectedCountry, setSelectedCountry] = useState(null); // Initialize with null to handle the data better
//   const [isLoading, setIsLoading] = useState(true); // Track loading state

//   const handleCampaignChange = (event) => {
//     setSelectedCampaign(event.target.value); // Update selected campaign
//   };

//   const handleCountryChange = (event) => {
//     const countryCode = event.target.value;
//     const country = countries.find((country) => country.prefix === countryCode);
//     setSelectedCountry(country); // Memperbarui negara yang dipilih
//   };

//   useEffect(() => {
//     const fetchCountryData = async () => {
//       try {
//         const response = await fetch("./api/country", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const countryData = await response.json();
//         setCountries(countryData);
//       } catch (error) {
//         console.error("Error fetching country data:", error);
//       }
//     };

//     const fetchCampaignData = async () => {
//         try {
//           const response = await fetch("./api/campaign", {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//             },
//           });
  
//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
  
//           const data = await response.json();
//           setCampaigns(data); // Store the fetched campaign data
  
//         } catch (error) {
//           console.error("Error fetching data:", error);
//         } finally {
//           setIsLoading(false); // Stop loading when data fetch is complete
//         }
//       };
      
//     fetchCountryData();
//     fetchCampaignData();
//   }, []); // Only run once on component mount

//   console.log('data campaign', selectedCountry);

//   return (
//     <>
//       <div className="sidebar-container hidden sm:hidden md:block w-64 bg-gray-800 text-white p-4 shadow-lg">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Filter Map</h2>

//         {/* Filter Country */}
//         <div className="mb-6">
//           <label htmlFor="campaign" className="block text-sm font-medium mb-2">
//             Select Country
//           </label>

//           {isLoading ? (
//             <div className="text-center text-white">Loading countries...</div>
//           ) : (
//             <select
//               id="country"
//               name="name"
//               value={selectedCountry ? selectedCountry.prefix : ""}
//               onChange={handleCountryChange}
//               className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
//             >
//               <option value="" disabled>Select a country...</option>

//               {countries.length > 0 ? (
//                 countries.map((country, index) => (
//                   <option key={index} value={country.prefix}>
//                     {country.name}
//                   </option>
//                 ))
//               ) : (
//                 <option value="" disabled>No countries available</option>
//               )}
//             </select>
//           )}
//         </div>

//         {/* Filter Campaign */}
//         <div className="mb-6">
//           <label htmlFor="campaign" className="block text-sm font-medium mb-2">
//             Select Campaign
//           </label>

//           {isLoading ? (
//             <div className="text-center text-white">Loading campaigns...</div>
//           ) : (
//             <select
//               id="campaign"
//               name="campaign"
//               value={selectedCampaign} // Control value by selectedCampaign state
//               onChange={handleCampaignChange} // Handle campaign selection change
//               className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
//             >
//               <option value="" disabled>Select a campaign...</option>
//               {campaigns.length > 0 ? (
//                 campaigns.map((campaign, index) => (
//                   <option key={index} value={campaign.campaign}>
//                     Campaign {campaign.campaign}
//                   </option>
//                 ))
//               ) : (
//                 <option value="" disabled>No campaigns available</option>
//               )}
//             </select>
//           )}
//         </div>
//       </div>

//       <div className="flex-1 overflow-auto">
//         {/* Pass selectedCountry data to MainMap */}
//         <MapWrapper
//           selectedCampaign={selectedCampaign}
//           selectedCountry={selectedCountry}
//         />
//       </div>
//     </>
//   );
// }

// export default Sidebar;


"use client";
import React, { useEffect, useState } from "react";
import MapWrapper from "../Map/MapWrapper";

function Sidebar() {
  const [campaigns, setCampaigns] = useState([]); // Daftar kampanye
  const [countries, setCountries] = useState([]); // Daftar negara
  const [settlements, setSettlements] = useState([]) // Daftar settlement
  const [status, setStatus] = useState([]); // Daftar status
  const [selectedCampaign, setSelectedCampaign] = useState(""); // Kampanye yang dipilih
  const [selectedCountry, setSelectedCountry] = useState(null); // Negara yang dipilih
  const [selectedSettlement, setSelectedSettlement] = useState(null); // Settlement yang dipilih
  const [selectedStatus, setSelectedStatus] = useState(null); // Status yang dipilih
  const [isLoadingCountries, setIsLoadingCountries] = useState(true); // Loading state untuk negara
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true); // Loading state untuk kampanye
  const [isLoadingSettelments, setIsloadingSettelments] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  
  const handleCampaignChange = (event) => {
    setSelectedCampaign(event.target.value); // Memperbarui kampanye yang dipilih
  };

  const handleCountryChange = (event) => {
    const countryCode = event.target.value;
    const country = countries.find((country) => country.prefix === countryCode);
    setSelectedCountry(country); // Memperbarui negara yang dipilih
  };

  const handleSettlementChange  = (event) => {
    const settlementCode = event.target.value;
    const settlement = settlements.find((settlement) => settlement.settlement === settlementCode)
    setSelectedSettlement(settlement);
  };

  const handleStatusChange = (event) => {
    const status = event.target.value;
    if (status === "all") {
      setSelectedStatus(null); // Menampilkan semua data jika memilih "All"
    } else {
      setSelectedStatus(status); // Memilih status tertentu
    }
  }

  // Fetch data negara dan kampanye pada saat pertama kali render
  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const response = await fetch("./api/country");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const countryData = await response.json();
        console.log('Country Data:', countryData); // Log data negara
        setCountries(countryData);
        setIsLoadingCountries(false); // Set loading false setelah data negara berhasil dimuat
      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };

    fetchCountryData();
  }, []); // Hanya dijalankan saat komponen pertama kali di-render

  // Fetch kampanye berdasarkan negara yang dipilih
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!selectedCountry) return;

      try {
        const response = await fetch(`./api/campaign?country=${selectedCountry.prefix}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const campaignData = await response.json();
        console.log('Campaign Data:', campaignData); // Log data kampanye
        setCampaigns(campaignData);
        setIsLoadingCampaigns(false); // Set loading false setelah data kampanye berhasil dimuat
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      }
    };

    fetchCampaignData();
  }, [selectedCountry]); // Hanya dijalankan setiap kali selectedCountry berubah

  useEffect(() => {
    const fetchSettlementData = async () => {
      if (!selectedCountry) return;

      try {
        const response = await fetch(`./api/settlement?country=${selectedCountry.prefix}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const settlementData = await response.json();
        console.log('Settlement Data:', settlementData);
        setSettlements(settlementData);
        setIsloadingSettelments(false);
      } catch (error) {
        console.error("Error fetching settlement data:", error);
        setIsloadingSettelments(false); // Pastikan loading diset false meskipun ada error
      }
    };
    fetchSettlementData();
}, [selectedCountry]);  // Trigger data settlement jika selectedCountry berubah


useEffect(() => {
  const fetchStatusData = async () => {
    if (!selectedCountry) return;

    try{
      const response = await fetch(`./api/status?country=${selectedCountry.prefix}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const statusData = await response.json();
      console.log('Status Data : ', statusData);
      setStatus(statusData);
      setIsLoadingStatus(false);
    } catch {
      console.error("Error fetching status data: ", error);
      setIsLoadingStatus(false);
    }
  }
  fetchStatusData();
}, [selectedCountry]);

  // Reset selectedCampaign dan selectedSettlement saat selectedCountry berubah
  useEffect(() => {
    setSelectedCampaign(""); 
    setSelectedSettlement(null); 
    setSelectedStatus("");
  }, [selectedCountry]); 


  console.log('selectedSettlement', selectedSettlement);
  console.log('selectedCountry', selectedCountry);
  console.log('selectedStatus', selectedStatus);
  return (
    <>
      <div className="sidebar-container hidden sm:hidden md:block w-64 bg-gray-800 text-white p-4 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Filter Map</h2>

        {/* Filter Country */}
        <div className="mb-6">
          <label htmlFor="country" className="block text-sm font-medium mb-2">Select country</label>

          {isLoadingCountries ? (
            <select
                id="country"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
                <option value="" disabled>No countries available</option>
            </select>
          ) : (
            <select
              id="country"
              value={selectedCountry ? selectedCountry.prefix : ""}
              onChange={handleCountryChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="" disabled>Select a country...</option>
              {countries.map((country) => (
                <option key={country.prefix} value={country.prefix}>
                  {country.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Filter Settlement */}
        <div className="mb-6">
          <label htmlFor="settlement" className="block text-sm font-medium mb-2">Select settlement</label>

          {isLoadingSettelments ? (
            <select
                id="settlement"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
                <option value="" disabled>No settlements available</option>
            </select>
          ) : (
            <select
              id="settlement"
              value={selectedSettlement ? selectedSettlement.settlement : ""}
              onChange={handleSettlementChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="" disabled>Select a settlement...</option>
              {settlements.length > 0 ? (
                settlements.map((settlement, index) => (
                  <option key={index} value={settlement.settlement}>
                    {settlement.settlement}
                  </option>
                ))
              ) : (
                <option value="" disabled>No settlements available</option>
              )}
            </select>

          )}
        </div>

        {/* Filter Campaign */}
        <div className="mb-6">
          <label htmlFor="campaign" className="block text-sm font-medium mb-2">Select campaign</label>

          {isLoadingCampaigns ? (
            <select
                id="campaign"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
                <option value="" disabled>No campaigns available</option>
            </select>
          ) : (
            <select
              id="campaign"
              value={selectedCampaign}
              onChange={handleCampaignChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="" disabled>Select a campaign...</option>
              {campaigns.length > 0 ? (
                campaigns.map((campaign, index) => (
                  <option key={index} value={campaign.campaign}>
                    Campaign {campaign.campaign}
                  </option>
                ))
              ) : (
                <option value="" disabled>No campaigns available</option>
              )}
            </select>
          )}
        </div>

        {/* Filter Status */}
        <div className="mb-6">
          <label htmlFor="status" className="block text-sm font-medium mb-2">Select status</label>
          {
            isLoadingStatus ? (
              <select
                id="status"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="" disabled>No status available</option>
              </select>
            ) : (
              <select
                id="status"
                value={selectedStatus ? selectedStatus : ""}
                onChange={handleStatusChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="" disabled>Select a status</option>
                <option value="all">All</option> {/* Opsi All */}
                {
                  status.length > 0 ? (
                    status.map((sts, index) => (
                      <option key={index} value={sts.status}>
                        {sts.status}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No status available</option>
                  )
                }
              </select>
            )
          }
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {/* Pass selectedCountry data to MapWrapper */}
        <MapWrapper
          selectedCampaign={selectedCampaign}
          selectedCountry={selectedCountry}
          selectedSettlement={selectedSettlement}
          selectedStatus={selectedStatus}
        />
      </div>
    </>
  );
}

export default Sidebar;