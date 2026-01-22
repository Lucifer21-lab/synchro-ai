import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            {/* Centered Card */}
            <div className="bg-[#1e293b] p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full text-center relative">

                {/* Close Button (Top Right) */}
                <button
                    onClick={() => navigate(-1)} // Go back to previous page
                    className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-full transition"
                    title="Close and Go Back"
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertTriangle size={40} className="text-red-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-white mb-2">404</h1>
                <h2 className="text-xl font-semibold text-gray-200 mb-4">Page Not Found</h2>
                <p className="text-gray-400 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <button
                    onClick={() => navigate(-1)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition w-full"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default NotFound;