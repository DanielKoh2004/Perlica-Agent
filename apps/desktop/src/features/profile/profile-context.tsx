import React, { createContext, useContext, useState, useCallback } from "react";
import { StorageService, UserProfile } from "../../lib/storage/storage-service.js";

interface UserProfileContextValue {
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userProfile, setUserProfileState] = useState<UserProfile>(() =>
    StorageService.getUserProfile()
  );

  const updateUserProfile = useCallback((profile: UserProfile) => {
    setUserProfileState(profile);
    StorageService.setUserProfile(profile);
  }, []);

  return (
    <UserProfileContext.Provider value={{ userProfile, updateUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export function useUserProfile(): UserProfileContextValue {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
