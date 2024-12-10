"use client";
import Image from "next/image";
import React, { useState } from "react";

// Fungsi untuk memformat tanggal
const formatDate = (date) => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];

  const dayOfWeek = daysOfWeek[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
};

function RightSidebar({ selectedSettlement1 }) {
  const [selectedPanel, setSelectedPanel] = useState("info"); // Panel aktif (info, settings, statistics)

  const currentDate = formatDate(new Date());

  return (
    <div className="sidebar-container fixed right-0 top-0 w-64 bg-white text-gray-800 p-0 shadow-lg h-screen">
      {/* Ganti judul dengan gambar */}
      <div className="text-center p-4">
        <Image
          src="/images/rise.png"
          alt="Right Sidebar Logo"
          width={256}
          height={256}
          className="w-64 h-auto mx-auto"
        />
      </div>

      <div className="p-4 w-64">
        {/* Teks terpotong dengan elipsis */}
        <div className="-mt-12">
          <p className="text-2xl font-bold truncate max-w-full uppercase w-full">
            {selectedSettlement1?.settlement ? selectedSettlement1?.settlement : 'Settlement'}
          </p>
          {/* Teks lengkap dengan ukuran kecil di bawah */}
          {selectedSettlement1?.settlement && (
            <p className="text-md text-gray-600">{selectedSettlement1.settlement}</p>
          )}
        </div>
      </div>

      <div className="text-center p-4">
        <Image
          src="/gifs/wind.gif"
          alt="Right Sidebar Animation"
          width={256}
          height={256}
          className="w-40 h-auto mx-auto"
        />
      </div>

      <div className="p-4">
        {/* Navigasi Panel */}
        <div className="panel-content">
          {selectedPanel === "info" && (
            <>
              <div className="mb-4">
                <p className="text-2xl font-semibold uppercase mb-2">Information</p>

                {/* Information items */}
                <div className="p-0 flex items-center">
                  <Image
                    src="/icons/inhouse.png"
                    alt="Right Sidebar Animation"
                    width={100}
                    height={100}
                    className="w-8 h-auto mr-2"
                  />
                  <div>
                    <p className="text-xs">In House Water Sample</p>
                  </div>
                </div>

                <div className="p-0 flex items-center">
                  <Image
                    src="/icons/soil.png"
                    alt="Right Sidebar Animation"
                    width={100}
                    height={100}
                    className="w-8 h-auto mr-2"
                  />
                  <div>
                    <p className="text-xs">Soil Sample</p>
                  </div>
                </div>

                <div className="p-0 flex items-center">
                  <Image
                    src="/icons/water.png"
                    alt="Right Sidebar Animation"
                    width={100}
                    height={100}
                    className="w-8 h-auto mr-2"
                  />
                  <div>
                    <p className="text-xs">Water Sample</p>
                  </div>
                </div>

                <div className="p-0 flex items-center">
                  <Image
                    src="/icons/well.png"
                    alt="Right Sidebar Animation"
                    width={100}
                    height={100}
                    className="w-8 h-auto mr-2"
                  />
                  <div>
                    <p className="text-xs">Well Water</p>
                  </div>
                </div>

                {/* Garis dengan Keterangan */}
                <div className="flex items-center mt-4 ml-1">
                  <div className="flex-1 border-t-4 border-orange rounded-full"></div> {/* Menggunakan border-t-4 untuk garis lebih tebal */}
                  <span className="px-4 text-gray-600 text-xs">Boundary Line</span>
                </div>
                <div className="flex items-center mt-4 ml-1">
                  <div className="flex-1 border-t-4 border-blue rounded-full"></div>
                  <span className="px-4 text-gray-600 text-xs">Road Access Line</span>
                </div>
                <div className="flex items-center mt-4 ml-1">
                  <div className="flex-1 border-t-4 border-pink rounded-full"></div>
                  <span className="px-4 text-gray-600 text-xs">Bootsock Line</span>
                </div>
                <div className="flex items-center mt-4 ml-1">
                  <div className="w-10 h-4 bg-active mr-2 rounded-sm"></div>
                  <span className="px-4 text-gray-600 text-xs">Active</span>
                </div>
                <div className="flex items-center mt-4 ml-1">
                  <div className="w-10 h-4 bg-underconstruction mr-2 rounded-sm"></div>
                  <span className="px-4 text-gray-600 text-xs">Underconstruction</span>
                </div>
                <div className="flex items-center mt-4 ml-1">
                  <div className="w-10 h-4 bg-demolished mr-2 rounded-sm"></div>
                  <span className="px-4 text-gray-600 text-xs">Demolished</span>
                </div>
                <div className="flex items-center mt-4 ml-1">
                  <div className="w-10 h-4 bg-vacant mr-2 rounded-sm"></div>
                  <span className="px-4 text-gray-600 text-xs">Vacant</span>
                </div>

              </div>
              <div className="mb-4">
                {/* Menambahkan Tanggal */}
                <div className="mt-10 text-md text-gray-600 font-bold">
                  <p className="tracking-wide">{currentDate}</p> {/* Menampilkan tanggal dalam format yang diinginkan */}
                </div>
              </div>
            </>
          )}

          {/* Konten untuk panel lain */}
          {selectedPanel === "settings" && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Settings</h3>
              <p>Adjust map settings here (e.g., zoom level, map type, etc.)</p>
              <label className="block text-sm font-medium">Map Zoom</label>
              <input
                type="range"
                min="1"
                max="20"
                defaultValue="10"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 mt-2"
              />
            </div>
          )}

          {selectedPanel === "statistics" && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Statistics</h3>
              <p>Statistics will be displayed here, such as the total campaigns, settlements, etc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
