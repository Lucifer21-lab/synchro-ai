import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Export the hook separately here
export const useAuth = () => {
    return useContext(AuthContext);
};