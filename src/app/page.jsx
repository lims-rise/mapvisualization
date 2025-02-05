// import React from "react";
// import MapWrapper from "./components/Map/MapWrapper";
// import Sidebar from "./components/Sidebar/Sidebar";

// const Home = () => {
//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <Sidebar />
//       {/* Map */}
//     </div>
//   );
// };

// export default Home;
import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";


const Home = () => {
  return (
    <>
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      {/* Map - Akan di-render oleh Sidebar dengan MapWrapper */}
    </div>
    </>

  );
};

export default Home;
