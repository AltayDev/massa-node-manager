import React, { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import JustWatch from "./Steps/JustWatch";
import SetupWithYourServer from "./Steps/SetupWithYourServer";
import StartFromScratch from "./Steps/StartFromScratch";

const START_ITEMS = [
  {
    icon: "🚀",
    title: "Start from Scratch",
    description: "Let us take care of everything for you.",
    stepComponent: StartFromScratch,
  },
  {
    icon: "🖥️",
    title: "Setup with Your Server",
    description: "Quickly install a Massa Node on your existing server",
    stepComponent: SetupWithYourServer,
  },
  {
    icon: "👀",
    title: "Just Watch",
    description: "Do you already have a node? Just watch",
    stepComponent: JustWatch,
  },
];

const GetStarted: React.FC = () => {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(
    null
  );

  const handleBack = () => {
    setSelectedStepIndex(null);
  };

  const renderStep = () => {
    if (selectedStepIndex === null) return null;
    const StepComponent = START_ITEMS[selectedStepIndex].stepComponent;
    return <StepComponent />;
  };

  return (
    <section className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {selectedStepIndex !== null ? (
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
              aria-label="Back to steps"
            >
              <IoMdArrowBack className="mr-2" /> Go Back
            </button>
            <h2 className="text-xl font-normal font-inter">
              {START_ITEMS[selectedStepIndex].title}
            </h2>
          </div>
        ) : (
          <h2 className="text-3xl font-semibold text-center mb-10 font-inter">
            Don't wait, become an actor of the decentralisation now!
          </h2>
        )}

        {selectedStepIndex === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {START_ITEMS.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-lg shadow-lg text-center transition-all duration-200 hover:bg-gray-700 cursor-pointer font-inter"
                onClick={() => setSelectedStepIndex(index)}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">{renderStep()}</div>
        )}
      </div>
    </section>
  );
};

export default GetStarted;
