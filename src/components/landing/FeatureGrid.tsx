import React from "react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    title: "Bathroom",
    description:
      "Expert advice for bathroom renovations, including tile installation, plumbing, and fixtures.",
  },
  {
    title: "Kitchen",
    description: "Guidance for kitchen remodels with countertop, cabinet, and appliance recommendations.",
  },
  {
    title: "Bedroom",
    description:
      "Design ideas and product suggestions for bedroom renovation projects and furniture installation.",
  },
  {
    title: "Living Room",
    description:
      "Recommendations for flooring, wall treatments, and furniture placement in your living spaces.",
  },
];

export default function FeatureGrid() {
  return (
    <div className="w-full max-w-6xl mt-[50px] mb-24 max-md:mt-8 mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {features.map((feature, index) => (
          <div key={feature.title} className="h-full">
            <FeatureCard
              title={feature.title}
              description={feature.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 