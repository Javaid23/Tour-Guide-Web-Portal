import React from "react";

const facts = [
  {
    fact: "Takht-i-Bahi is considered one of the most well-preserved Buddhist monastic complexes in the world.",
  },
  {
    fact: "Taxila was once a renowned center of learning, attracting students from as far as Greece and China.",
  },
  {
    fact: "Rohtas Fort was never conquered by force, thanks to its formidable defenses.",
  },
  {
    fact: "The Shalimar Gardens use a sophisticated water distribution system, with 410 fountains still functional today.",
  },
  {
    fact: "Makli Necropolis is the final resting place for over half a million people, including kings, saints, and scholars.",
  },
  {
    fact: "Mohenjo-Daro’s advanced drainage and urban planning were unmatched in the ancient world.",
  },
];

const HeritageFacts = () => (
  <div className="w-full max-w-3xl mx-auto my-16">
    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-blue-900">Did You Know?</h2>
    <ul className="grid gap-6 md:grid-cols-2">
      {facts.map((item, idx) => (
        <li key={idx} className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-xl shadow text-blue-900 text-lg">
          <span className="mr-2 text-blue-600 font-bold">•</span>{item.fact}
        </li>
      ))}
    </ul>
  </div>
);

export default HeritageFacts;
