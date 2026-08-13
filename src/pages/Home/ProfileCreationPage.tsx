import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X, LogOut, Camera } from 'lucide-react';
import { useAppSelector } from '../../store';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { useCategories } from '../../hooks/useCategories';
import { useListings } from '../../hooks/useListings';
import { getInitials } from '../../utils/initials';

const inputClass = 'w-full rounded-xl px-3 py-2 text-sm outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-[color:var(--color-nearby-coral)] transition placeholder:text-[color:var(--color-nearby-dim)]';

export function ProfileCreationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const { data: profileRes, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const p = profileRes?.profile;
  const { data: categories = [] } = useCategories();
  const { data: listingsData } = useListings();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', bio: '' });

  useEffect(() => {
    if (p) setDraft({ name: p.displayName || p.name || '', bio: p.bio || '' });
  }, [p]);

  const displayName = p?.displayName || p?.name || user?.name || '';
  const preferredCategories = categories.filter((c) => (p?.preferredCategoryIds ?? []).includes(Number(c.id)));

  const handleSave = async () => {
    await updateProfile.mutateAsync({ displayName: draft.name, bio: draft.bio });
    setEditing(false);
    showToast('Profile updated', 'success');
  };

  const listings = listingsData?.products ?? [];
  const listedCount = listings.length;
  const soldCount = listings.filter((l) => l.status === 1).length;
  const activeCount = listings.filter((l) => l.status === 0).length;

  const stats = [
    { label: 'Listed', value: listedCount },
    { label: 'Active', value: activeCount },
    { label: 'Sold',   value: soldCount },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-5 pt-10" style={{ background: 'var(--color-nearby-bg)' }}>
        <div className="mx-auto max-w-xl space-y-4">
          <div className="h-24 animate-pulse rounded-2xl" style={{ background: 'var(--color-nearby-surface)' }} />
          <div className="h-12 animate-pulse rounded-2xl" style={{ background: 'var(--color-nearby-surface)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-nearby-bg)' }}>
      <div className="mx-auto max-w-xl px-5 pt-10 pb-20">

        {/* Avatar + name row */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative flex-shrink-0">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center font-display font-bold text-2xl overflow-hidden ring-2 ring-white/10"
              style={{
                background: p?.avatarUrl ? 'transparent' : 'var(--color-nearby-accent)',
                color: '#fff',
              }}
            >
              {p?.avatarUrl
                ? <img src={p.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                : getInitials(displayName || '?')
              }
            </div>
            {editing && (
              <button
                className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-[color:var(--color-nearby-bg)]"
                style={{ background: 'var(--color-nearby-surface-2)' }}
              >
                <Camera className="h-3 w-3" style={{ color: 'var(--color-nearby-text)' }} />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Display name"
                className={inputClass + ' font-display font-bold'}
                style={{ background: 'var(--color-nearby-surface)', color: 'var(--color-nearby-text)' }}
              />
            ) : (
              <>
                <h2 className="font-display text-xl font-bold truncate" style={{ color: 'var(--color-nearby-text)' }}>
                  {displayName || 'No name set'}
                </h2>
                <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--color-nearby-dim)' }}>
                  {user?.email}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 divide-x divide-white/5 rounded-2xl mb-5"
          style={{ background: 'var(--color-nearby-surface)' }}
        >
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-4">
              <span className="font-display text-xl font-bold" style={{ color: 'var(--color-nearby-text)' }}>{value}</span>
              <span className="text-xs mt-0.5" style={{ color: 'var(--color-nearby-dim)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="mb-5">
          {editing ? (
            <textarea
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              placeholder="Write something about yourself…"
              rows={3}
              className={inputClass + ' resize-none'}
              style={{ background: 'var(--color-nearby-surface)', color: 'var(--color-nearby-text)' }}
            />
          ) : (
            p?.bio && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-nearby-dim)' }}>{p.bio}</p>
            )
          )}
        </div>

        {/* Edit / Save buttons */}
        {editing ? (
          <div className="flex gap-2 mb-6">
            <motion.button
              onClick={() => setEditing(false)}
              whileTap={{ scale: 0.97 }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
              style={{ background: 'var(--color-nearby-surface)', color: 'var(--color-nearby-dim)' }}
            >
              <X className="h-4 w-4" /> Cancel
            </motion.button>
            <motion.button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              whileTap={{ scale: 0.97 }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--color-nearby-coral)' }}
            >
              <Save className="h-4 w-4" /> {updateProfile.isPending ? 'Saving…' : 'Save'}
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={() => setEditing(true)}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold mb-6"
            style={{ background: 'var(--color-nearby-surface)', color: 'var(--color-nearby-text)' }}
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit Profile
          </motion.button>
        )}

        {/* Interests */}
        {!editing && preferredCategories.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--color-nearby-dim)' }}>Interests</p>
            <div className="flex flex-wrap gap-2">
              {preferredCategories.map((cat) => (
                <span key={cat.id} className="rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-white/5" style={{ background: 'var(--color-nearby-surface)', color: 'var(--color-nearby-text)' }}>
                  {cat.icon} {cat.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Logout (mobile only) */}
        {!editing && (
          <motion.button
            onClick={async () => { await authService.logoutUser(); navigate('/login'); }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium ring-1 ring-white/10 md:hidden"
            style={{ background: 'var(--color-nearby-surface)', color: 'var(--color-nearby-dim)' }}
          >
            <LogOut className="h-4 w-4" /> Log out
          </motion.button>
        )}
      </div>
    </div>
  );
}
