import { AlertCircle } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, projectTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-[#1e293b] rounded-xl border border-red-500/30 p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Delete Workspace?</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        Are you sure you want to delete <span className="text-white font-bold">"{projectTitle}"</span>?
                        <br /><br />
                        This action is <span className="text-red-400 font-bold">permanent</span>. All tasks, files, and team activity will be erased immediately.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition"
                        >
                            {isDeleting ? 'Deleting...' : 'Yes, Delete It'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;