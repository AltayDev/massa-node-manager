import { Dispatch, SetStateAction } from "react";

interface WelcomeScreenProps {
  setCurrentView: Dispatch<SetStateAction<string>>;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ setCurrentView }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
    <div className="mb-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center">
          <svg
            className="h-16 w-16 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M12 17l5-5h-3V8h-4v4H7l5 5z" />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-2">Massa Node Manager</h1>
      <p className="text-xl text-blue-400">
        Don't wait, become an actor of the decentralisation now!
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
      {/* Start from Scratch Card - Coming Soon */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 opacity-75 relative">
        <div className="p-6 flex flex-col items-center text-center h-full">
          <div className="rounded-full bg-red-500/20 p-4 mb-4">
            <svg
              className="h-10 w-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Start from Scratch</h2>
          <p className="text-gray-400 mb-6">
            Let us take care of everything for you.
          </p>
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-blue-600 text-white py-2 px-4 rounded-full font-bold">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* Setup with Your Server Card - Active */}
      <div
        className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-blue-500 transform hover:scale-105 transition-transform cursor-pointer"
        onClick={() => setCurrentView("server-setup")}
      >
        <div className="p-6 flex flex-col items-center text-center h-full">
          <div className="rounded-full bg-blue-500/20 p-4 mb-4">
            <svg
              className="h-10 w-10 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Setup with Your Server</h2>
          <p className="text-gray-300 mb-6">
            Quickly install a Massa Node on your existing server.
          </p>
          <button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full font-medium">
            Get Started
          </button>
        </div>
      </div>

      {/* Just Watch Card - Coming Soon */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 opacity-75 relative">
        <div className="p-6 flex flex-col items-center text-center h-full">
          <div className="rounded-full bg-purple-500/20 p-4 mb-4">
            <svg
              className="h-10 w-10 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Just Watch</h2>
          <p className="text-gray-400 mb-6">
            Do you already have a node? Just watch.
          </p>
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-blue-600 text-white py-2 px-4 rounded-full font-bold">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-12 text-center text-gray-500">
      <p>© 2025 Massa Node Manager | Created by Altay</p>
    </div>
  </div>
);

export default WelcomeScreen;
