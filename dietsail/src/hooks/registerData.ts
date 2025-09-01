import { useEffect, useState, useMemo } from 'react';
import { ZCQL } from '@zcatalyst/zcql';

interface UserData {
    user_id: string;
    [key: string]: unknown;
}

interface RegisterState {
    userDataLoading: boolean;
    userData: UserData | null;
    updateProfile: (updates: Partial<UserData>) => Promise<void>;
    refreshUserData: () => Promise<void>;
}

export const useRegisterState = (userId: string): RegisterState => {
    const [userDataLoading, setLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);
    const zcql = useMemo(() => new ZCQL(), []);

    const updateProfile = async (updates: Partial<UserData>) => {
        setLoading(true);
        try {
            // Example: await zcql.executeZCQLQuery(`UPDATE users SET ... WHERE id='${userData.user_id}'`);
            // Implement actual update logic here
            console.log('Updating profile:', updates);
        } finally {
            setLoading(false);
        }
    };

    const refreshUserData = async () => {
        if (!userId) return;
        
        setLoading(true);
        try {
            const safeUserId = String(userId).replace(/'/g, "''");
            const userDetail = await zcql.executeZCQLQuery(`SELECT * FROM users WHERE id='${safeUserId}'`);
            const userRecord = Array.isArray(userDetail) && userDetail.length > 0 ? userDetail[0] : null;
            setUserData(userRecord as UserData);
        } catch (err) {
            console.error('Failed to refresh user data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const register = async (): Promise<unknown> => {
            try {
                // Use parameterized queries or sanitize input to prevent SQL injection
                const safeUserId = String(userId).replace(/'/g, "''");
                if (safeUserId === '') {
                    return false;
                }
                const userDetail = await zcql.executeZCQLQuery(`SELECT * FROM users WHERE id='${safeUserId}'`);
                const userRecord = Array.isArray(userDetail) && userDetail.length > 0 ? userDetail[0] : null;
                setUserData(userRecord as UserData);
                if (userRecord) {
                    return true;
                }
            } catch (err) {
                console.error('Failed to load user data:', err);
                return false;
            } finally {
                setLoading(false);
            }
        };
        register();
    }, [userId, zcql]);

    return {
        userDataLoading,
        userData,
        updateProfile,
        refreshUserData,
    };
};