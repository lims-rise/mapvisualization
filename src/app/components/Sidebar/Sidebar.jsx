"use client";
import React, { useEffect, useState } from "react";
import MapWrapper from "../Map/MapWrapper";

function Sidebar() {
  const [campaigns, setCampaigns] = useState([]); // Daftar kampanye
  const [countries, setCountries] = useState([]); // Daftar negara
  const [settlements, setSettlements] = useState([]) // Daftar settlement
  const [status, setStatus] = useState([]); // Daftar status
  const [selectedCampaign, setSelectedCampaign] = useState([]); // Kampanye yang dipilih
  const [selectedCountry, setSelectedCountry] = useState(null); // Negara yang dipilih
  const [selectedSettlement, setSelectedSettlement] = useState(null); // Settlement yang dipilih
  const [selectedStatus, setSelectedStatus] = useState(null); // Status yang dipilih
  const [isLoadingCountries, setIsLoadingCountries] = useState(true); // Loading state untuk negara
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true); // Loading state untuk kampanye
  const [isLoadingSettelments, setIsloadingSettelments] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isCheckboxMode, setIsCheckboxMode] = useState(true); // Toggle untuk memilih mode (checkbox atau dropdown)

  const handleCampaignChange = (event) => {
    if (isCheckboxMode) {
      // Ketika menggunakan checkbox, simpan nilai sebagai string
      const campaignValue = event.target.value; // Simpan sebagai string
  
      // Update state dengan menambahkan atau menghapus campaign dari selectedCampaign
      setSelectedCampaign((prevCampaigns) =>
        prevCampaigns.includes(campaignValue)
          ? prevCampaigns.filter((campaign) => campaign !== campaignValue) // Hapus jika sudah tercentang
          : [...prevCampaigns, campaignValue] // Tambahkan jika belum tercentang
      );
    } else {
      // Ketika menggunakan dropdown (multiple selection), ambil semua opsi yang dipilih
      const campaignValues = Array.from(event.target.selectedOptions, (option) => option.value);
      setSelectedCampaign(campaignValues); // Update state dengan array kampanye yang dipilih
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
  console.log('selectedCampaign', selectedCampaign);
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

        {/* Toggle untuk memilih mode filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Filter Mode</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsCheckboxMode(true)}
              className={`px-4 py-2 rounded-md ${isCheckboxMode ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Checkbox
            </button>
            <button
              onClick={() => setIsCheckboxMode(false)}
              className={`px-4 py-2 rounded-md ${!isCheckboxMode ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'}`}
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
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
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