"use client";
import React, { useEffect, useState } from "react";
import MapWrapper from "../Map/MapWrapper";
import RightSidebar from "../RightSidebar/RightSidebar";

function Sidebar() {
  const [campaigns, setCampaigns] = useState([]); // Daftar kampanye
  const [countries, setCountries] = useState([]); // Daftar negara
  const [menus, setMenus] = useState([]) // Daftar menu
  const [status, setStatus] = useState([]); // Daftar status
  const [objectives, setObjectives] = useState([]); //Daftar objective
  const [equipments, setEquipments] = useState([]); // Daftar equipment
  const [selectedCampaign, setSelectedCampaign] = useState([0]); // Kampanye yang dipilih
  const [selectedCountry, setSelectedCountry] = useState(null); // Negara yang dipilih
  const [selectedMenu, setSelectedMenu] = useState(null); // Settlement yang dipilih
  const [selectedStatus, setSelectedStatus] = useState(null); // Status yang dipilih
  const [selectedObjective, setSelectedObjective] = useState(null); // Objective yang dipilih
  const [selectedEquipment, setSelectedEquipment] = useState(null); // Equipment yang dipilih
  const [isLoadingCountries, setIsLoadingCountries] = useState(true); // Loading state untuk negara
  const [isLoadingMenus, setIsLoadingMenus] = useState(true); // Loading state untuk kampanye
  const [isLoadingSettelments, setIsloadingSettelments] = useState(true); // Loading state untuk settlement
  const [isLoadingStatus, setIsLoadingStatus] = useState(true); // Loading state untuk status
  const [isLoadingObjective, setIsloadingObjective] = useState(true); //Loading state untuk objective
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true); // Loading state untuk equipment
  const [isCheckboxMode, setIsCheckboxMode] = useState(true); // Toggle untuk memilih mode (checkbox atau dropdown)


  // const handleObjectiveChange = (event) => {
  //   const objectiveCode = event.target.value; // Ambil value (url_name)
  //   const selectedObj = objectives.find((objective) => objective.url_name === objectiveCode);
  //   setSelectedObjective(selectedObj); // Simpan objek lengkap jika perlu
  // };


  // const handleCampaignChange = (event) => {
  //   if (isCheckboxMode) {
  //     // Ketika menggunakan checkbox, simpan nilai sebagai string
  //     const campaignValue = event.target.value; // Simpan sebagai string
      
  //     // Update state dengan menambahkan atau menghapus campaign dari selectedCampaign
  //     setSelectedCampaign((prevCampaigns) => {
  //       const newCampaigns = prevCampaigns.includes(campaignValue)
  //         ? prevCampaigns.filter((campaign) => campaign !== campaignValue) // Hapus jika sudah tercentang
  //         : [...prevCampaigns, campaignValue]; // Tambahkan jika belum tercentang
  
  //       // Pastikan selectedCampaign selalu berupa array string
  //       return newCampaigns.length === 0 ? "" : newCampaigns;
  //     });
  //   } else {
  //     // Ketika menggunakan dropdown (multiple selection), ambil semua opsi yang dipilih
  //     const campaignValues = Array.from(event.target.selectedOptions, (option) => option.value);
  
  //     // Update state dengan array kampanye yang dipilih
  //     setSelectedCampaign(campaignValues.length === 0 ? "" : campaignValues);
  //   }
  // };
  

  const handleCountryChange = (event) => {
    const countryCode = event.target.value;
    const country = countries.find((country) => country.prefix === countryCode);
    setSelectedCountry(country); // Memperbarui negara yang dipilih
  };

  const handleMenuChange  = (event) => {
    const menuCode = event.target.value;
    const menu = menus.find((menu) => menu.menu === menuCode)
    setSelectedMenu(menu);
  };

  // const handleSettlementChange  = (event) => {
  //   const settlementCode = event.target.value;
  //   const settlement = settlements.find((settlement) => settlement.settlement === settlementCode)
  //   setSelectedSettlement(settlement);
  // };

  // const handleStatusChange = (event) => {
  //   const status = event.target.value;
  //   if (status === "all") {
  //     setSelectedStatus(null); // Menampilkan semua data jika memilih "All"
  //   } else {
  //     setSelectedStatus(status); // Memilih status tertentu
  //   }
  // }

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
    fetchData(`./api/menu?id_country=${selectedCountry.id_country}`, setMenus, setIsLoadingMenus);
    // fetchData(`./api/settlement?country=${selectedCountry.prefix}`, setSettlements, setIsloadingSettelments);
    // fetchData(`./api/status?country=${selectedCountry.prefix}`, setStatus, setIsLoadingStatus);
    // fetchData(`./api/objective?country=${selectedCountry.prefix}`, setObjectives, setIsloadingObjective);

  }, [selectedCountry]); // Fetch data lain hanya jika selectedCountry berubah



  // useEffect(() => {
  //   if (campaigns.length > 0) {
  //     // Set the selectedCampaign state to the last campaign
  //     setSelectedCampaign([String(campaigns[campaigns.length - 1].campaign)]);
  //   } else {
  //     setSelectedCampaign([]);
  //   }
  // }, [campaigns]);


  // Reset selectedCampaign dan selectedSettlement saat selectedCountry berubah
  // useEffect(() => {
  //   setSelectedCampaign(""); 
  //   setSelectedSettlement(null); 
  //   setSelectedStatus("");
  //   setSelectedObjective("");
  //   setSelectedEquipment("");
  // }, [selectedCountry]); 


  // console.log('selectedSettlement', selectedSettlement);
  // console.log('selectedCountry', selectedCountry);
  // console.log('selectedStatus', selectedStatus);
  // console.log('selectedCampaign', selectedCampaign);
  // console.log('selectedEquipment', selectedEquipment);
  return (
    <>
    <div className="sidebar-container hidden sm:hidden md:block w-64 bg-gray-800 text-white shadow-lg max-h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="w-64 bg-primary sm:hidden md:block text-white shadow-lg max-h-screen overflow-y-auto rounded-b-3xl fixed top-0 left-0 z-20">
        <h2 className="text-2xl font-semibold p-4 text-center">Map Visualisation</h2>
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
            <label htmlFor="menu" className="block text-sm font-medium mb-2">Select Visualization</label>
            {isLoadingMenus ? (
              <select
                id="menu"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>No menu available</option>
              </select>
            ) : (
              <select
                id="menu"
                value={selectedMenu ? selectedMenu.settlement : ""}
                onChange={handleMenuChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>Select a menu...</option>
                {menus.length > 0 ? (
                  menus.map((menu, index) => (
                    <option key={index} value={menu.menu}>
                      {menu.menu}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No menu available</option>
                )}
              </select>
            )}
          </div>

        {/* Filter Settlement */}




        {/* Filter Campaign dan Status muncul setelah memilih objective */}


        {/* Filter Campaign dan Status muncul setelah memilih objective */}



      </div>
    </div>
    <div className="flex-1 overflow-auto">
      {/* Pass selectedCountry data to MapWrapper */}
      <MapWrapper
        selectedCountry={selectedCountry}
        selectedMenu={selectedMenu}
        // selectedEquipment = {selectedEquipment}
      />
    </div>
    {/* <div className="sidebar-container hidden sm:hidden md:block w-64 bg-gray-800 text-white p-4 shadow-lg max-h-screen overflow-y-auto">
      <RightSidebar
          selectedSettlementRightSidebar ={selectedSettlement}
          selectedObjectiveRightSidebar = {selectedObjective?.url_name}
          selectedCountryRightSidebar = {selectedCountry?.name}
      />
    </div> */}
    </>
  );
}

export default Sidebar;