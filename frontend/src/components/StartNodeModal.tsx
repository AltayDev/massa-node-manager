import { Dispatch, SetStateAction } from "react";

interface StartNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodePassword: string;
  setNodePassword: Dispatch<SetStateAction<string>>;
  onStartNode: () => Promise<void>;
  isStartingNode: boolean;
}

const StartNodeModal: React.FC<StartNodeModalProps> = ({
  isOpen,
  onClose,
  nodePassword,
  setNodePassword,
  onStartNode,
  isStartingNode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-400">Start Massa Node</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-300 mb-4">
          Your Massa node is installed but not running. Enter your node password
          to start it.
        </p>

        <div className="mb-4">
          <label
            htmlFor="modalNodePassword"
            className="block text-gray-300 mb-2"
          >
            Node Password:
          </label>
          <input
            id="modalNodePassword"
            type="password"
            value={nodePassword}
            onChange={(e) => setNodePassword(e.target.value)}
            placeholder="Enter your node password"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            disabled={isStartingNode}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            disabled={isStartingNode}
          >
            Cancel
          </button>
          <button
            onClick={onStartNode}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center"
            disabled={isStartingNode || !nodePassword}
          >
            {isStartingNode ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Starting...
              </>
            ) : (
              <>Start Node</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartNodeModal;
