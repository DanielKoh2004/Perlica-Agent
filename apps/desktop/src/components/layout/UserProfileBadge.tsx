import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { useUserProfile } from "../../features/profile/profile-context.js";

export const UserProfileBadge: React.FC = () => {
  const { userProfile, updateUserProfile } = useUserProfile();
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);

  const handleSaveProfile = () => {
    if (tempName.trim()) {
      updateUserProfile({ ...userProfile, name: tempName.trim() });
    }
    setEditingProfile(false);
  };

  if (editingProfile) {
    return (
      <div className="flex items-center gap-1 bg-surface-secondary px-2 py-0.5 rounded-md border border-border">
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveProfile();
            if (e.key === "Escape") setEditingProfile(false);
          }}
          className="w-28 bg-transparent text-xs text-foreground focus:outline-none"
          autoFocus
        />
        <button
          onClick={handleSaveProfile}
          className="text-success hover:text-success/80 p-0.5"
          aria-label="Save name"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={() => setEditingProfile(false)}
          className="text-muted-foreground hover:text-foreground p-0.5"
          aria-label="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setTempName(userProfile.name);
        setEditingProfile(true);
      }}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-surface-secondary transition-colors"
      title="Click to edit your name"
    >
      <div className="w-5 h-5 rounded-full overflow-hidden border border-border shrink-0">
        <img
          src="/endministrator_chat_img.jpg"
          alt="Endministrator"
          className="w-full h-full object-cover object-center"
        />
      </div>
      <span className="font-medium text-foreground/90">{userProfile.name}</span>
    </button>
  );
};
