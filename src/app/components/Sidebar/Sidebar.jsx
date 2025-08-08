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

  // === Map Filters State ===
  const [availableMapStates, setAvailableMapStates] = useState([]);
  const [availableMapTiers, setAvailableMapTiers] = useState([]);
  const [availableMapTypes, setAvailableMapTypes] = useState([]);
  const [selectedMapStates, setSelectedMapStates] = useState([]); // array of state codes
  const [selectedMapTiers, setSelectedMapTiers] = useState([]);   // array of tier values (string)
  const [selectedMapTypes, setSelectedMapTypes] = useState([]);   // array of organisation_type values
  const [loadingMapFilters, setLoadingMapFilters] = useState(false);
  const [mapFilterError, setMapFilterError] = useState(null);

  // Helper toggle & reset for map filters
  const toggleInArray = (value, setter) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };
  const clearAllMapFilters = () => {
    setSelectedMapStates([]);
    setSelectedMapTiers([]);
    setSelectedMapTypes([]);
  };

  // Fetch base map data to extract unique filter values when Map menu active
  useEffect(() => {
    if (!selectedCountry || selectedMenu?.menu !== 'Map') {
      // Reset when leaving Map menu
      setAvailableMapStates([]);
      setAvailableMapTiers([]);
      setAvailableMapTypes([]);
      clearAllMapFilters();
      return;
    }
    let abort = false;
    const controller = new AbortController();
    const loadMapFilterData = async () => {
      try {
        setLoadingMapFilters(true);
        setMapFilterError(null);
        const res = await fetch(`./api/map?id_country=${selectedCountry.id_country}` , { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed loading map data (${res.status})`);
        const raw = await res.json();
        if (abort) return;
        const statesSet = new Set();
        const tiersSet = new Set();
        const typesSet = new Set();
        raw.forEach(item => {
          if (item?.state) statesSet.add(item.state);
          if (item?.tier !== null && item?.tier !== undefined && item?.tier !== '') tiersSet.add(String(item.tier));
          if (item?.organisation_type) typesSet.add(item.organisation_type);
        });
        setAvailableMapStates(Array.from(statesSet).sort());
        setAvailableMapTiers(Array.from(tiersSet).sort((a,b)=> Number(a)-Number(b)));
        setAvailableMapTypes(Array.from(typesSet).sort());
      } catch (e) {
        if (!abort) setMapFilterError(e.message);
      } finally {
        if (!abort) setLoadingMapFilters(false);
      }
    };
    loadMapFilterData();
    return () => { abort = true; controller.abort(); };
  }, [selectedCountry, selectedMenu]);

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
    <div className="sidebar-container hidden sm:hidden md:block w-80 bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-800 shadow-2xl max-h-screen overflow-y-auto overflow-x-hidden custom-scrollbar border-r border-gray-200">
      {/* Modern Header with Light Gradient - Matching DataTable */}
      <div className="w-80 sm:hidden md:block text-white shadow-xl max-h-screen overflow-y-auto rounded-b-3xl fixed top-0 left-0 z-20 backdrop-blur-sm" style={{
        background: 'linear-gradient(135deg, #0FB3BA 0%, #1976d2 100%)',
        boxShadow: '0 4px 20px rgba(15, 179, 186, 0.3)'
      }}>
        <div className="relative p-6 text-center">
          <div className="absolute inset-0 bg-black/10 rounded-b-3xl"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 mx-auto mb-3 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-wide">Map Visualization</h2>
            <p className="text-sm text-white/90 mt-1">Interactive Data Explorer</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-h-full mt-40 space-y-8">
        {/* Modern Filter Country - Light Theme */}
        <div className="group">
          <label htmlFor="country" className="flex items-center text-sm font-semibold mb-3 text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
            <div className="w-5 h-5 mr-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Select Country
          </label>
          <div className="relative">
            {isLoadingCountries ? (
              <div className="w-full bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-gray-600">Loading countries...</span>
                </div>
              </div>
            ) : (
              <select
                id="country"
                value={selectedCountry ? selectedCountry.prefix : ""}
                onChange={handleCountryChange}
                className="w-full bg-white text-gray-800 border-2 border-gray-200 rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 hover:border-cyan-400 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
              >
                <option value="" disabled>🌍 Choose your region...</option>
                {countries.map((country) => (
                  <option key={country.prefix} value={country.prefix} className="bg-white">
                    {country.name}
                  </option>
                ))}
              </select>
            )}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Modern Filter Visualization - Light Theme */}
        <div className="group">
          <label htmlFor="menu" className="flex items-center text-sm font-semibold mb-3 text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
            <div className="w-5 h-5 mr-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Select Visualization
          </label>
          <div className="relative">
            {isLoadingMenus ? (
              <div className="w-full bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="animate-pulse w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Loading visualization options...</span>
                </div>
              </div>
            ) : (
              <select
                id="menu"
                value={selectedMenu ? selectedMenu.settlement : ""}
                onChange={handleMenuChange}
                className="w-full bg-white text-gray-800 border-2 border-gray-200 rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 hover:border-cyan-400 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
              >
                <option value="" disabled>📊 Select visualization type...</option>
                {menus.length > 0 ? (
                  menus.map((menu, index) => (
                    <option key={index} value={menu.menu} className="bg-white">
                      {menu.menu}
                    </option>
                  ))
                ) : (
                  <option value="" disabled className="bg-white">❌ No visualizations available</option>
                )}
              </select>
            )}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Indicator - Light Theme */}
        {selectedCountry && selectedMenu && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Configuration Ready</p>
                <p className="text-xs text-emerald-600">
                  {selectedCountry.name} • {selectedMenu.menu}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* === Map Specific Checkbox Filters === */}
        {selectedMenu?.menu === 'Map' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Map Filters</h3>
              {(selectedMapStates.length || selectedMapTiers.length || selectedMapTypes.length) > 0 && (
                <button onClick={clearAllMapFilters} className="text-xs text-red-500 hover:underline">Reset</button>
              )}
            </div>

            {/* Active Filter Pills Display */}
            {(selectedMapStates.length || selectedMapTiers.length || selectedMapTypes.length) > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedMapStates.map(s => (
                  <span key={`pill-s-${s}`} className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-[10px] font-medium flex items-center gap-1">
                    {s}
                    <button onClick={() => toggleInArray(s, setSelectedMapStates)} className="text-cyan-500 hover:text-red-500">×</button>
                  </span>
                ))}
                {selectedMapTiers.map(t => (
                  <span key={`pill-t-${t}`} className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-[10px] font-medium flex items-center gap-1">
                    Tier {t}
                    <button onClick={() => toggleInArray(t, setSelectedMapTiers)} className="text-cyan-500 hover:text-red-500">×</button>
                  </span>
                ))}
                {selectedMapTypes.map(tp => (
                  <span key={`pill-ty-${tp}`} className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-[10px] font-medium flex items-center gap-1">
                    {tp}
                    <button onClick={() => toggleInArray(tp, setSelectedMapTypes)} className="text-cyan-500 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
            {loadingMapFilters && (
              <div className="text-xs text-gray-500 animate-pulse">Loading filter options...</div>
            )}
            {mapFilterError && (
              <div className="text-xs text-red-500">Error: {mapFilterError}</div>
            )}
            {/* State Filter */}
            <div className="border border-gray-200 rounded-lg p-3 bg-white/70 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">State</span>
                {selectedMapStates.length > 0 && (
                  <span className="text-[10px] text-cyan-600 font-medium">{selectedMapStates.length} selected</span>
                )}
              </div>
              <div className="max-h-40 overflow-auto pr-1 space-y-1 custom-scrollbar">
                {availableMapStates.length === 0 && !loadingMapFilters && (
                  <p className="text-[11px] text-gray-400 italic">No state data</p>
                )}
                {availableMapStates.map(state => (
                  <label key={state} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-cyan-50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      className="rounded text-cyan-500 focus:ring-cyan-400"
                      checked={selectedMapStates.includes(state)}
                      onChange={() => toggleInArray(state, setSelectedMapStates)}
                    />
                    <span>{state}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Tier Filter */}
            <div className="border border-gray-200 rounded-lg p-3 bg-white/70 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tier</span>
                {selectedMapTiers.length > 0 && (
                  <span className="text-[10px] text-cyan-600 font-medium">{selectedMapTiers.length} selected</span>
                )}
              </div>
              <div className="max-h-40 overflow-auto pr-1 space-y-1 custom-scrollbar">
                {availableMapTiers.length === 0 && !loadingMapFilters && (
                  <p className="text-[11px] text-gray-400 italic">No tier data</p>
                )}
                {availableMapTiers.map(tier => (
                  <label key={tier} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-cyan-50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      className="rounded text-cyan-500 focus:ring-cyan-400"
                      checked={selectedMapTiers.includes(tier)}
                      onChange={() => toggleInArray(tier, setSelectedMapTiers)}
                    />
                    <span>Tier {tier}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Type Filter */}
            <div className="border border-gray-200 rounded-lg p-3 bg-white/70 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</span>
                {selectedMapTypes.length > 0 && (
                  <span className="text-[10px] text-cyan-600 font-medium">{selectedMapTypes.length} selected</span>
                )}
              </div>
              <div className="max-h-40 overflow-auto pr-1 space-y-1 custom-scrollbar">
                {availableMapTypes.length === 0 && !loadingMapFilters && (
                  <p className="text-[11px] text-gray-400 italic">No type data</p>
                )}
                {availableMapTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-cyan-50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      className="rounded text-cyan-500 focus:ring-cyan-400"
                      checked={selectedMapTypes.includes(type)}
                      onChange={() => toggleInArray(type, setSelectedMapTypes)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <div className="flex-1 overflow-auto">
      <MapWrapper
        selectedCountry={selectedCountry}
        selectedMenu={selectedMenu}
        selectedStates={selectedMapStates}
        selectedTiers={selectedMapTiers}
        selectedTypes={selectedMapTypes}
      />
    </div>
    </>
  );
}

export default Sidebar;