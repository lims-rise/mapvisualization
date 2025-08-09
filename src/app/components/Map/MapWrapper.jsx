"use client";

import React from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";

// Dynamic import MainMap with SSR disabled and a lightweight loading fallback
const DynamicMainMap = dynamic(() => import("./MainMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 300,
        display: "grid",
        placeItems: "center",
        color: "#6b7280",
        fontSize: 14,
      }}
    >
      Loading map...
    </div>
  ),
});

const MapWrapper = ({
  selectedCountry,
  selectedMenu,
  selectedStates,
  selectedTiers,
  selectedTypes,
}) => {
  return (
    <div style={{ width: "100%", minHeight: 300 }}>
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

MapWrapper.propTypes = {
  selectedCountry: PropTypes.string,
  selectedMenu: PropTypes.string,
  selectedStates: PropTypes.array,
  selectedTiers: PropTypes.array,
  selectedTypes: PropTypes.array,
};

export default React.memo(MapWrapper);
