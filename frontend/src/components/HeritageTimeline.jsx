import React from "react";

const timelineData = [
  {
    year: 1980,
    name: "Takht-i-Bahi & Sehr-i-Bahlol",
    description: "Buddhist monastic complex, Khyber Pakhtunkhwa. Added to UNESCO list in 1980.",
  },
  {
    year: 1980,
    name: "Taxila Buddhist Ruins of Gandhara",
    description: "Ancient Buddhist city, Punjab. Added to UNESCO list in 1980.",
  },
  {
    year: 1980,
    name: "Mohenjo-Daro",
    description: "Indus Valley city, Sindh. Added to UNESCO list in 1980.",
  },
  {
    year: 1981,
    name: "Shalimar Gardens",
    description: "Mughal garden, Lahore. Added to UNESCO list in 1981.",
  },
  {
    year: 1981,
    name: "Thatta Necropolis (Makli)",
    description: "Vast necropolis, Sindh. Added to UNESCO list in 1981.",
  },
  {
    year: 1997,
    name: "Rohtas Fort",
    description: "16th-century fortress, Punjab. Added to UNESCO list in 1997.",
  },
];

const HeritageTimeline = () => (
  <div className="w-full max-w-4xl mx-auto my-16">
    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-blue-900">UNESCO Heritage Timeline</h2>
    <div className="relative border-l-4 border-blue-300 pl-8">
      {timelineData.map((item, idx) => (
        <div key={item.name} className="mb-10 relative">
          <div className="absolute -left-6 top-1 w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {item.year}
          </div>
          <div className="bg-white rounded-xl shadow p-6 ml-4">
            <h3 className="text-xl font-bold text-blue-800 mb-1">{item.name}</h3>
            <p className="text-gray-700 text-sm">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HeritageTimeline;
