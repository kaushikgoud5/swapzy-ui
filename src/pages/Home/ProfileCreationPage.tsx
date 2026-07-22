import { useState, useEffect } from "react"; // useEffect kept for draft sync only
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Settings, Heart, Bookmark, MessageCircle, Star,
  MapPin, Edit2, Save, X, Camera, LogOut,
} from "lucide-react";
import { useAppSelector } from "../../store";
import { authService } from "../../services/authService";
import { avatarOptions } from "../../data/avatarOptions";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { useCategories } from "../../hooks/useCategories";

export function ProfileCreationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useAppSelector((state) => state.auth.user);

  const { data: profileRes, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const p = profileRes?.profile;

  const { data: categories = [] } = useCategories();
  const [editing, setEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [draft, setDraft] = useState({ name: '', bio: '', avatar: '', location: { country: '', state: '', city: '' } });

  useEffect(() => {
    if (p) setDraft({ name: p.displayName || p.name || '', bio: p.bio || '', avatar: p.avatarUrl || '', location: p.location || { country: '', state: '', city: '' } });
  }, [p]);

  const preferredCategories = categories.filter((c) => (p?.preferredCategoryIds ?? []).includes(Number(c.id)));

  const startEdit = () => setEditing(true);
  const cancelEdit = () => { setEditing(false); setShowAvatarPicker(false); };

  const handleSave = async () => {
    await updateProfile.mutateAsync({ displayName: draft.name, bio: draft.bio, avatarUrl: draft.avatar, location: draft.location });
    setEditing(false);
    setShowAvatarPicker(false);
    showToast('Profile updated', 'success');
  };

  const isComplete = !!(p?.displayName && p?.bio && p?.avatarUrl && p?.location?.city);
  const completionFields = [p?.displayName, p?.bio, p?.avatarUrl, p?.location?.city];
  const completionPct = completionFields.filter(Boolean).length * 25;

  const stats = [
    { label: "Items Sold", value: "12", icon: Heart },
    { label: "Items Saved", value: "8", icon: Bookmark },
    { label: "Messages", value: "24", icon: MessageCircle },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 pt-6 sm:pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="h-8 bg-gray-200 rounded-xl w-32 animate-pulse mb-8" />
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded-xl w-40 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded-lg w-32 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full animate-pulse mb-3" />
                <div className="h-6 bg-gray-200 rounded-lg w-8 mx-auto animate-pulse mb-2" />
                <div className="h-4 bg-gray-100 rounded-lg w-16 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 pt-6 sm:pt-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl">Profile</h2>
          <motion.button className="p-2 sm:p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Completion Bar */}
        {!isComplete && (
          <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Profile completion</span>
              <span className="text-xs text-purple-600 font-medium">{completionPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {!p?.displayName && "Add a display name • "}
              {!p?.bio && "Write a bio • "}
              {!p?.avatarUrl && "Choose an avatar • "}
              {!p?.location?.city && "Set your location"}
            </p>
          </div>
        )}

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden">
                {(editing ? draft.avatar : p?.avatarUrl) ? (
                  <img src={editing ? draft.avatar : p?.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              {editing && (
                <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <Camera className="w-4 h-4 text-purple-600" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left w-full">
              {editing ? (
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="text-xl sm:text-2xl mb-1 w-full bg-white/60 rounded-xl px-3 py-1 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300" placeholder="Display name" />
              ) : (
                <h3 className="text-xl sm:text-2xl mb-1">{p?.displayName || p?.name || user?.name || "No name set"}</h3>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                {editing ? (
                  <div className="flex gap-2 flex-wrap">
                    {(['city', 'state', 'country'] as const).map((field) => (
                      <input key={field} value={(draft.location as any)[field]} onChange={(e) => setDraft({ ...draft, location: { ...draft.location, [field]: e.target.value } })} className="bg-white/60 rounded-lg px-2 py-1 text-sm border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 w-24" placeholder={field.charAt(0).toUpperCase() + field.slice(1)} />
                    ))}
                  </div>
                ) : (
                  <span>{[p?.location?.city, p?.location?.state, p?.location?.country].filter(Boolean).join(", ") || "No location set"}</span>
                )}
              </div>

              {!editing && (
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-lg">4.9</span>
                  <span className="text-sm text-muted-foreground ml-1">(47 reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Avatar Picker */}
          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <p className="text-sm text-muted-foreground mb-2">Choose an avatar:</p>
                <div className="flex gap-3 flex-wrap">
                  {avatarOptions.map((url) => (
                    <button key={url} onClick={() => setDraft({ ...draft, avatar: url })} className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${draft.avatar === url ? "border-purple-600 scale-110" : "border-transparent hover:border-purple-300"}`}>
                      <img src={url} alt="avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bio */}
          {editing ? (
            <textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} className="w-full bg-white/60 rounded-xl px-4 py-3 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none text-sm" rows={3} placeholder="Write something about yourself..." />
          ) : (
            <p className="text-muted-foreground mb-4">{p?.bio || "No bio yet"}</p>
          )}

          {!editing && (
            <div className="flex gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 bg-white/80 rounded-full text-sm">{user?.email}</span>
              {isComplete && <span className="px-3 py-1 bg-white/80 rounded-full text-sm">Verified Seller</span>}
            </div>
          )}
        </motion.div>

        {/* Preferred Categories */}
        {!editing && preferredCategories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-6 mb-6">
            <h3 className="text-lg mb-3">Preferred Categories</h3>
            <div className="flex gap-2 flex-wrap">
              {preferredCategories.map((cat) => (
                <span key={cat.id} className={`px-4 py-2 rounded-full text-sm text-white bg-gradient-to-r ${cat.gradient}`}>{cat.icon} {cat.label}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl p-3 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <p className="text-xl sm:text-2xl mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        {editing ? (
          <div className="flex gap-2 sm:gap-3">
            <motion.button onClick={cancelEdit} className="flex-1 h-12 sm:h-14 rounded-2xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <X className="w-4 h-4 sm:w-5 sm:h-5" /> Cancel
            </motion.button>
            <motion.button onClick={handleSave} disabled={updateProfile.isPending} className="flex-1 h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-shadow flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer text-sm sm:text-base" whileHover={{ scale: updateProfile.isPending ? 1 : 1.02 }} whileTap={{ scale: updateProfile.isPending ? 1 : 0.98 }}>
              <Save className="w-4 h-4 sm:w-5 sm:h-5" /> {updateProfile.isPending ? "Saving..." : "Save"}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            <motion.button onClick={startEdit} className="w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-shadow flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" /> Edit Profile
            </motion.button>
            <motion.button onClick={async () => { await authService.logoutUser(); navigate('/login'); }} className="w-full h-12 sm:h-14 rounded-2xl border border-gray-200 text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base md:hidden" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" /> Log out
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
