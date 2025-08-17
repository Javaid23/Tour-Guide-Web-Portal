import React from "react";

const CancellationPolicy = () => (
  <div className="container mx-auto max-w-3xl py-12 px-4">
    <h1 className="text-3xl font-bold mb-6 text-blue-800">TourGuide Cancellation Policy</h1>
    <ul className="list-disc pl-6 space-y-4 text-gray-700">
      <li>
        <strong>Free Cancellation:</strong> Cancel up to 7 days before your trip for a full refund.
      </li>
      <li>
        <strong>Partial Refund:</strong> Cancellations made 3-6 days before the trip will receive a 50% refund.
      </li>
      <li>
        <strong>No Refund:</strong> Cancellations within 48 hours of the trip start date are non-refundable.
      </li>
      <li>
        <strong>How to Cancel:</strong> Contact us at <a href="mailto:support@tourguide.com" className="text-blue-600 underline">support@tourguide.com</a> or use your account dashboard.
      </li>
      <li>
        <strong>Force Majeure:</strong> In case of events beyond our control (natural disasters, etc.), we will do our best to offer flexible solutions.
      </li>
    </ul>
    <p className="mt-8 text-gray-500 text-sm">Last updated: July 2025</p>
  </div>
);

export default CancellationPolicy;
