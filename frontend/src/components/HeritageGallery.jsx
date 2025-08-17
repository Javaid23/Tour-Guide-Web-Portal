import React, { useState } from "react";

const galleryImages = [
  // Takht-i-Bahi
  { src: "/images/heritage/takht-i-bahi.jpeg", alt: "Takht-i-Bahi Monastery", caption: "Takht-i-Bahi: Buddhist Monastic Complex", blogUrl: "https://en.wikipedia.org/wiki/Takht-i-Bahi" },
  // Taxila
  { src: "/images/heritage/taxila.jpeg", alt: "Taxila Ruins", caption: "Taxila: Ancient Buddhist City", blogUrl: "https://en.wikipedia.org/wiki/Taxila" },
  // Rohtas Fort
  { src: "/images/heritage/rohtas-fort.jpeg", alt: "Rohtas Fort", caption: "Rohtas Fort: 16th-century Fortress", blogUrl: "https://en.wikipedia.org/wiki/Rohtas_Fort" },
  // Shalimar Garden
  { src: "/images/heritage/shalimar-garden.jpeg", alt: "Shalimar Garden", caption: "Shalimar Garden: Mughal Paradise", blogUrl: "https://en.wikipedia.org/wiki/Shalimar_Gardens,_Lahore" },
  // Thatta Necropolis (Makli Necropolis)
  { src: "/images/heritage/thatta-makli.jpeg", alt: "Thatta Makli Necropolis", caption: "Makli Necropolis: City of Silence", blogUrl: "https://en.wikipedia.org/wiki/Makli_Necropolis" },
  // Mohenjo-Daro
  { src: "/images/heritage/mohenjo-daro.jpeg", alt: "Mohenjo-Daro", caption: "Mohenjo-Daro: Indus Valley Civilization", blogUrl: "https://en.wikipedia.org/wiki/Mohenjo-daro" },
];

const HeritageGallery = () => {
  const [current, setCurrent] = useState(0);
  const total = galleryImages.length;

  const prev = () => setCurrent((current - 1 + total) % total);
  const next = () => setCurrent((current + 1) % total);

  return (
    <div className="w-full max-w-2xl mx-auto my-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-blue-900">Gallery</h2>
      <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white">
        <img
          src={galleryImages[current].src}
          alt={galleryImages[current].alt}
          className="w-full h-80 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4 text-center text-lg font-semibold">
          {galleryImages[current].caption}
        </div>
        <button
          onClick={prev}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-blue-800 transition"
          aria-label="Previous"
        >
          &#8592;
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-blue-800 transition"
          aria-label="Next"
        >
          &#8594;
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {galleryImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full ${idx === current ? 'bg-blue-600' : 'bg-blue-200'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeritageGallery;
