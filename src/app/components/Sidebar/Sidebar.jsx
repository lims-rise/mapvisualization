"use client";
import React, { useEffect, useState } from "react";
import MapWrapper from "../Map/MapWrapper";
import RightSidebar from "../RightSidebar/RightSidebar";

function Sidebar() {
  const [campaigns, setCampaigns] = useState([]); // Daftar kampanye
  const [countries, setCountries] = useState([]); // Daftar negara
  const [settlements, setSettlements] = useState([]) // Daftar settlement
  const [status, setStatus] = useState([]); // Daftar status
  const [objectives, setObjectives] = useState([]); //Daftar objective
  const [equipments, setEquipments] = useState([]); // Daftar equipment
  const [selectedCampaign, setSelectedCampaign] = useState([0]); // Kampanye yang dipilih
  const [selectedCountry, setSelectedCountry] = useState(null); // Negara yang dipilih
  const [selectedSettlement, setSelectedSettlement] = useState(null); // Settlement yang dipilih
  const [selectedStatus, setSelectedStatus] = useState(null); // Status yang dipilih
  const [selectedObjective, setSelectedObjective] = useState(null); // Objective yang dipilih
  const [selectedEquipment, setSelectedEquipment] = useState(null); // Equipment yang dipilih
  const [isLoadingCountries, setIsLoadingCountries] = useState(true); // Loading state untuk negara
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true); // Loading state untuk kampanye
  const [isLoadingSettelments, setIsloadingSettelments] = useState(true); // Loading state untuk settlement
  const [isLoadingStatus, setIsLoadingStatus] = useState(true); // Loading state untuk status
  const [isLoadingObjective, setIsloadingObjective] = useState(true); //Loading state untuk objective
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true); // Loading state untuk equipment
  const [isCheckboxMode, setIsCheckboxMode] = useState(true); // Toggle untuk memilih mode (checkbox atau dropdown)


  const handleObjectiveChange = (event) => {
    const objectiveCode = event.target.value; // Ambil value (url_name)
    const selectedObj = objectives.find((objective) => objective.url_name === objectiveCode);
    setSelectedObjective(selectedObj); // Simpan objek lengkap jika perlu
  };


  const handleCampaignChange = (event) => {
    if (isCheckboxMode) {
      // Ketika menggunakan checkbox, simpan nilai sebagai string
      const campaignValue = event.target.value; // Simpan sebagai string
      
      // Update state dengan menambahkan atau menghapus campaign dari selectedCampaign
      setSelectedCampaign((prevCampaigns) => {
        const newCampaigns = prevCampaigns.includes(campaignValue)
          ? prevCampaigns.filter((campaign) => campaign !== campaignValue) // Hapus jika sudah tercentang
          : [...prevCampaigns, campaignValue]; // Tambahkan jika belum tercentang
  
        // Pastikan selectedCampaign selalu berupa array string
        return newCampaigns.length === 0 ? "" : newCampaigns;
      });
    } else {
      // Ketika menggunakan dropdown (multiple selection), ambil semua opsi yang dipilih
      const campaignValues = Array.from(event.target.selectedOptions, (option) => option.value);
  
      // Update state dengan array kampanye yang dipilih
      setSelectedCampaign(campaignValues.length === 0 ? "" : campaignValues);
    }
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

   // Fungsi umum untuk fetch data dan handle error dan loading
   const fetchData = async (url, setter, loadingSetter) => {
    try {
      loadingSetter(true); // Set loading true
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      setError(error); // Menangani error secara umum
    } finally {
      loadingSetter(false); // Set loading false setelah data didapat
    }
  };

  // Fetch data negara saat pertama kali render
  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const response = await fetch("./api/country");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const countryData = await response.json();
        setCountries(countryData); // Set data negara
        setIsLoadingCountries(false); // Hentikan loading negara
      } catch (error) {
        console.error("Error fetching country data:", error);
        setIsLoadingCountries(false);
      }
    };

    fetchCountryData();
  }, []); // Fetch hanya sekali saat pertama kali render

  // Fetch data lain berdasarkan negara yang dipilih
  useEffect(() => {
    if (!selectedCountry) return; // Jika tidak ada negara yang dipilih, hentikan fetch

    // Fetch kampanye, settlement, status, dan objective setelah negara dipilih
    fetchData(`./api/campaign?country=${selectedCountry.prefix}`, setCampaigns, setIsLoadingCampaigns);
    fetchData(`./api/settlement?country=${selectedCountry.prefix}`, setSettlements, setIsloadingSettelments);
    fetchData(`./api/status?country=${selectedCountry.prefix}`, setStatus, setIsLoadingStatus);
    fetchData(`./api/objective?country=${selectedCountry.prefix}`, setObjectives, setIsloadingObjective);

  }, [selectedCountry]); // Fetch data lain hanya jika selectedCountry berubah



  useEffect(() => {
    if (campaigns.length > 0) {
      // Set the selectedCampaign state to the last campaign
      setSelectedCampaign([String(campaigns[campaigns.length - 1].campaign)]);
    } else {
      setSelectedCampaign([]);
    }
  }, [campaigns]);


  // Reset selectedCampaign dan selectedSettlement saat selectedCountry berubah
  useEffect(() => {
    setSelectedCampaign(""); 
    setSelectedSettlement(null); 
    setSelectedStatus("");
    setSelectedObjective("");
    setSelectedEquipment("");
  }, [selectedCountry]); 


  console.log('selectedSettlement', selectedSettlement);
  console.log('selectedCountry', selectedCountry);
  console.log('selectedStatus', selectedStatus);
  console.log('selectedCampaign', selectedCampaign);
  console.log('selectedEquipment', selectedEquipment);
  return (
    <>
    <div className="sidebar-container hidden sm:hidden md:block w-64 bg-gray-800 text-white shadow-lg max-h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="w-64 bg-primary sm:hidden md:block text-white shadow-lg max-h-screen overflow-y-auto rounded-b-3xl fixed top-0 left-0 z-20">
        <h2 className="text-3xl font-semibold p-4 text-center">Filter Map</h2>
      </div>

      <div className="p-4  max-h-full mt-20">
        {/* Filter Country */}
        <div className="mb-6">
          <label htmlFor="country" className="block text-sm font-medium mb-2">Select country</label>
          {isLoadingCountries ? (
            <select
              id="country"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>No countries available</option>
            </select>
          ) : (
            <select
              id="country"
              value={selectedCountry ? selectedCountry.prefix : ""}
              onChange={handleCountryChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
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

        {/* Filter Objective */}
        <div className="mb-6">
          <label htmlFor="objective" className="block text-sm font-medium mb-2">Select Objective</label>
          {isLoadingObjective ? (
            <select
              id="objective"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>No Objective available</option>
            </select>
          ) : (
            <select
              id="objective"
              value={selectedObjective ? selectedObjective.url_name : ""}
              onChange={handleObjectiveChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>Select a objective</option>
              {objectives.length > 0 ? (
                objectives.map((objective, index) => (
                  <option key={index} value={objective.url_name}>
                    {objective.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No objective available</option>
              )}
            </select>
          )}
        </div>

        {/* Filter Settlement */}
        { selectedObjective && (selectedObjective.url_name === "objective_2b" || selectedObjective.url_name === "objective_2a" || selectedObjective.url_name === "objective_3") && (
          <div className="mb-6">
            <label htmlFor="settlement" className="block text-sm font-medium mb-2">Select settlement</label>
            {isLoadingSettelments ? (
              <select
                id="settlement"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>No settlements available</option>
              </select>
            ) : (
              <select
                id="settlement"
                value={selectedSettlement ? selectedSettlement.settlement : ""}
                onChange={handleSettlementChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
        )}



        {/* Filter Campaign dan Status muncul setelah memilih objective */}
        { selectedSettlement && selectedObjective && (selectedObjective.url_name === "objective_2b" || selectedObjective.url_name === "objective_3") && (
          <>
            {/* Toggle untuk memilih mode filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Filter Mode</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsCheckboxMode(true)}
                  className={`px-4 py-2 rounded-md ${isCheckboxMode ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Checkbox
                </button>
                <button
                  onClick={() => setIsCheckboxMode(false)}
                  className={`px-4 py-2 rounded-md ${!isCheckboxMode ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Dropdown
                </button>
              </div>
            </div>

            {/* Filter Campaign */}
            <div className="mb-6">
              <label htmlFor="campaign" className="block text-sm font-medium mb-2">Select campaign</label>
              <div>
                {isLoadingCampaigns ? (
                  <select
                    id="campaign"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>No campaign available</option>
                  </select>
                ) : (
                  isCheckboxMode ? (
                    <div className="space-y-2">
                      {campaigns.map((campaign, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-2 rounded-md transition-colors duration-200 ${selectedCampaign.includes(campaign.campaign)
                            ? 'bg-blue-500 text-white' // Background biru jika dicentang
                            : 'bg-gray-700 text-gray-300' // Background abu-abu jika tidak dicentang
                            }`}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            id={`campaign-${campaign.campaign}`}
                            value={String(campaign.campaign)} // pastikan nilai yang dikirim adalah string
                            checked={selectedCampaign.includes(String(campaign.campaign))} // pastikan perbandingan selalu menggunakan string
                            onChange={handleCampaignChange} // Menangani perubahan pada checkbox
                            className="mr-2"
                          />
                          {/* Label */}
                          <label
                            htmlFor={`campaign-${campaign.campaign}`}
                            className={`flex-1 ${selectedCampaign.includes(String(campaign.campaign)) ? 'font-semibold' : 'font-normal'}`}
                          >
                            {`Campaign ${campaign.campaign}`}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <select
                    id="campaign"
                    value={selectedCampaign}
                    onChange={handleCampaignChange}
                    multiple
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto overflow-x-hidden custom-scrollbar"
                    style={{ padding: '0.5rem', fontSize: '1rem' }}
                  >
                    {campaigns.map((campaign, index) => (
                      <option
                        key={index}
                        value={campaign.campaign}
                        className="py-2"
                      >
                        {`Campaign ${campaign.campaign}`}
                      </option>
                    ))}
                  </select>

                  )
                )}
              </div>
            </div>

            {/* Filter Status */}
            <div className="mb-6">
              <label htmlFor="status" className="block text-sm font-medium mb-2">Select status</label>
              {isLoadingStatus ? (
                <select
                  id="status"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>No status available</option>
                </select>
              ) : (
                <select
                  id="status"
                  value={selectedStatus ? selectedStatus : ""}
                  onChange={handleStatusChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>Select a status</option>
                  <option value="all">All</option> {/* Opsi All */}
                  {status.length > 0 ? (
                    status.map((sts, index) => (
                      <option key={index} value={sts.status}>
                        {sts.status}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No status available</option>
                  )}
                </select>
              )}
            </div>
          </>
        )}

        {/* Filter Campaign dan Status muncul setelah memilih objective */}
        { selectedSettlement && selectedObjective && (selectedObjective.url_name === "objective_2a") && (
          <>
            {/* Toggle untuk memilih mode filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Filter Mode</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsCheckboxMode(true)}
                  className={`px-4 py-2 rounded-md ${isCheckboxMode ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Checkbox
                </button>
                <button
                  onClick={() => setIsCheckboxMode(false)}
                  className={`px-4 py-2 rounded-md ${!isCheckboxMode ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Dropdown
                </button>
              </div>
            </div>

            {/* Filter Campaign */}
            <div className="mb-6">
              <label htmlFor="campaign" className="block text-sm font-medium mb-2">Select campaign</label>
              <div>
                {isLoadingCampaigns ? (
                  <select
                    id="campaign"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>No campaign available</option>
                  </select>
                ) : (
                  isCheckboxMode ? (
                    <div className="space-y-2">
                      {campaigns.map((campaign, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-2 rounded-md transition-colors duration-200 ${selectedCampaign.includes(campaign.campaign)
                            ? 'bg-blue-500 text-white' // Background biru jika dicentang
                            : 'bg-gray-700 text-gray-300' // Background abu-abu jika tidak dicentang
                            }`}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            id={`campaign-${campaign.campaign}`}
                            value={String(campaign.campaign)} // pastikan nilai yang dikirim adalah string
                            checked={selectedCampaign.includes(String(campaign.campaign))} // pastikan perbandingan selalu menggunakan string
                            onChange={handleCampaignChange} // Menangani perubahan pada checkbox
                            className="mr-2"
                          />
                          {/* Label */}
                          <label
                            htmlFor={`campaign-${campaign.campaign}`}
                            className={`flex-1 ${selectedCampaign.includes(String(campaign.campaign)) ? 'font-semibold' : 'font-normal'}`}
                          >
                            {`Campaign ${campaign.campaign}`}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <select
                      id="campaign"
                      value={selectedCampaign}
                      onChange={handleCampaignChange}
                      multiple
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto overflow-x-hidden custom-scrollbar"
                      style={{ padding: '0.5rem', fontSize: '1rem' }} // Padding agar elemen lebih nyaman
                    >
                      {campaigns.map((campaign, index) => (
                        <option
                          key={index}
                          value={campaign.campaign}
                          className="py-2" // Tambahkan padding vertikal pada opsi untuk memberikan jarak antar item
                        >
                          {`Campaign ${campaign.campaign}`}
                        </option>
                      ))}
                    </select>
                  )
                )}
              </div>
            </div>

          </>
        )}


      </div>
    </div>
    <div className="flex-1 overflow-auto">
      {/* Pass selectedCountry data to MapWrapper */}
      <MapWrapper
        selectedCampaign={selectedCampaign}
        selectedCountry={selectedCountry}
        selectedSettlement={selectedSettlement}
        selectedStatus={selectedStatus}
        selectedObjective = {selectedObjective?.url_name}
        // selectedEquipment = {selectedEquipment}
      />
    </div>
    <div className="sidebar-container hidden sm:hidden md:block w-64 bg-gray-800 text-white p-4 shadow-lg max-h-screen overflow-y-auto">
      <RightSidebar
          selectedSettlementRightSidebar ={selectedSettlement}
          selectedObjectiveRightSidebar = {selectedObjective?.url_name}
          selectedCountryRightSidebar = {selectedCountry?.name}
      />
    </div>
    </>
  );
}

export default Sidebar;