import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Edit2, Trash2, Tag, X, Save, Pause, Play, Loader2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useListings, useUpdateListing, useDeleteListing, useToggleAvailability } from '../../hooks/useListings';
import { useCategories } from '../../hooks/useCategories';
import type { ProductListing } from '../../services/listingService';

const STATUS = {
  0: { label: 'Active', color: 'var(--color-nearby-yellow)',  bg: 'rgba(255,210,63,0.12)' },
  1: { label: 'Sold',   color: 'var(--color-nearby-blue)',    bg: 'rgba(61,139,255,0.12)' },
  2: { label: 'Paused', color: 'var(--color-nearby-dim)',     bg: 'rgba(155,161,172,0.12)' },
} as const;

const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];
const FILTERS = [
  { value: 'all' as const, label: 'All' },
  { value: 0 as const,     label: 'Active' },
  { value: 2 as const,     label: 'Paused' },
  { value: 1 as const,     label: 'Sold' },
];

const inputClass = 'w-full rounded-xl px-3.5 py-2.5 text-sm outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-[color:var(--color-nearby-coral)] transition placeholder:text-[color:var(--color-nearby-dim)]';

export function MyListingsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, isLoading } = useListings();
  const { data: categories = [] } = useCategories();
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const toggleAvailability = useToggleAvailability();

  const listings = data?.products ?? [];
  const listingImages = data?.imagesMap ?? {};

  const [filter, setFilter] = useState<'all' | 0 | 1 | 2>('all');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ProductListing | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', condition: '', estimatedValue: '', originalValue: '', productCategoryId: 0, country: '', state: '', city: '', postalCode: '', latitude: null as number | null, longitude: null as number | null });
  const [editLocating, setEditLocating] = useState(false);
  const [editLocError, setEditLocError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const getCategoryLabel = (id: number) => categories.find((c) => Number(c.id) === id)?.label ?? 'Other';
  const filtered = filter === 'all' ? listings : listings.filter((l) => l.status === filter);
  const counts = { all: listings.length, 0: listings.filter((l) => l.status === 0).length, 2: listings.filter((l) => l.status === 2).length, 1: listings.filter((l) => l.status === 1).length };

  const formatDate = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days < 1) return 'Today'; if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString();
  };

  const openEdit = (item: ProductListing) => {
    setOpenMenuId(null); setEditingItem(item); setEditLocError('');
    setEditForm({ name: item.name, description: item.description || '', condition: item.condition, estimatedValue: String(item.estimatedValue || ''), originalValue: String(item.originalValue || ''), productCategoryId: item.productCategoryId, country: item.location?.country || '', state: item.location?.state || '', city: item.location?.city || '', postalCode: item.location?.postalCode || '', latitude: item.location?.latitude ?? null, longitude: item.location?.longitude ?? null });
  };

  const handleEditLocation = () => {
    if (!navigator.geolocation) { setEditLocError('Geolocation not supported'); return; }
    setEditLocating(true); setEditLocError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const { address: a = {} } = await res.json();
          setEditForm((prev) => ({ ...prev, latitude, longitude, country: a.country || prev.country, state: a.state || a.region || prev.state, city: a.city || a.town || a.village || a.county || prev.city, postalCode: a.postcode || prev.postalCode }));
        } catch { setEditForm((prev) => ({ ...prev, latitude, longitude })); setEditLocError('Could not fetch address'); }
        finally { setEditLocating(false); }
      },
      () => { setEditLocating(false); setEditLocError('Location access denied'); }
    );
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    await updateListing.mutateAsync({ id: editingItem.id, payload: { name: editForm.name, description: editForm.description || undefined, condition: editForm.condition, productCategoryId: editForm.productCategoryId, estimatedValue: editForm.estimatedValue ? Number(editForm.estimatedValue) : undefined, originalValue: editForm.originalValue ? Number(editForm.originalValue) : undefined, location: { country: editForm.country, state: editForm.state, city: editForm.city, postalCode: editForm.postalCode, ...(editForm.latitude != null && editForm.longitude != null ? { latitude: editForm.latitude, longitude: editForm.longitude } : {}) } } });
    setEditingItem(null);
    showToast('Listing updated', 'success');
  };

  const handleDelete = async (id: number) => { await deleteListing.mutateAsync(id); showToast('Listing deleted', 'info'); };
  const handleToggle = async (item: ProductListing) => { setOpenMenuId(null); await toggleAvailability.mutateAsync(item.id); showToast(item.isAvailable ? 'Listing paused' : 'Listing resumed', 'success'); };

  if (isLoading) {
    return (
      <div className="min-h-screen p-5 pt-8" style={{ background: 'var(--color-nearby-bg)' }}>
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="h-8 w-36 animate-pulse rounded-xl" style={{ background: 'var(--color-nearby-surface)' }} />
          <div className="h-4 w-24 animate-pulse rounded-lg" style={{ background: 'var(--color-nearby-surface)' }} />
          <div className="mt-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-[24px]" style={{ background: 'var(--color-nearby-surface)' }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 pt-8" style={{ background: 'var(--color-nearby-bg)' }}>
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--color-nearby-text)' }}>My Listings</h2>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--color-nearby-dim)' }}>{listings.length} {listings.length === 1 ? 'item' : 'items'} total</p>
          </div>
          <motion.button
            onClick={() => navigate('/home/create-listing')}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 45px -12px rgba(255,90,95,0.55)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 font-display text-sm font-semibold text-white"
            style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
          >
            <Plus className="h-4 w-4" /> New listing
          </motion.button>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-1 rounded-xl p-1 w-fit ring-1 ring-white/5" style={{ background: 'var(--color-nearby-surface)' }}>
          {FILTERS.map(({ value, label }) => (
            <button
              key={String(value)}
              onClick={() => setFilter(value)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-sm font-medium transition-all"
              style={{
                background: filter === value ? 'var(--color-nearby-coral)' : 'transparent',
                color: filter === value ? '#fff' : 'var(--color-nearby-dim)',
              }}
            >
              {label}
              <span
                className="rounded-full px-1.5 py-0.5 text-xs font-bold"
                style={{
                  background: filter === value ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                  color: filter === value ? '#fff' : 'var(--color-nearby-dim)',
                }}
              >
                {counts[value]}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-[24px] py-20 text-center ring-1 ring-white/5"
            style={{ background: 'var(--color-nearby-surface)' }}
          >
            <p className="mb-1 font-display text-base font-bold" style={{ color: 'var(--color-nearby-text)' }}>
              {filter === 'all' ? 'No listings yet' : `No ${STATUS[filter as 0|1|2]?.label.toLowerCase()} listings`}
            </p>
            <p className="mb-5 text-sm" style={{ color: 'var(--color-nearby-dim)' }}>
              {filter === 'all' ? 'Create your first listing to start selling' : 'Items matching this filter will appear here'}
            </p>
            {filter === 'all' && (
              <motion.button
                onClick={() => navigate('/home/create-listing')}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 font-display text-sm font-semibold text-white"
                style={{ background: 'var(--color-nearby-coral)' }}
              >
                <Plus className="h-4 w-4" /> Create listing
              </motion.button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((listing) => {
                const st = STATUS[listing.status as 0|1|2] ?? STATUS[0];
                const thumb = listingImages[listing.id]?.[0];
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }}
                    className="flex overflow-hidden rounded-[24px] ring-1 ring-white/5"
                    style={{ background: 'var(--color-nearby-surface)' }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 flex-shrink-0 sm:w-36" style={{ background: 'var(--color-nearby-surface-2)', minHeight: 112 }}>
                      {thumb ? (
                        <img src={thumb.url} alt={listing.name} className="h-full w-full object-cover" style={{ minHeight: 112 }} />
                      ) : (
                        <div className="flex h-full min-h-[112px] w-full items-center justify-center">
                          <MapPin className="h-7 w-7" style={{ color: 'var(--color-nearby-dim)' }} />
                        </div>
                      )}
                      {listingImages[listing.id]?.length > 1 && (
                        <span className="absolute bottom-1.5 right-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: 'rgba(0,0,0,0.6)' }}>
                          +{listingImages[listing.id].length - 1}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h3 className="font-display text-sm font-bold truncate" style={{ color: 'var(--color-nearby-text)' }}>{listing.name}</h3>
                          <p className="mt-0.5 text-xs line-clamp-1" style={{ color: 'var(--color-nearby-dim)' }}>{listing.description || 'No description'}</p>
                        </div>
                        {/* Kebab */}
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)}
                            className="rounded-lg p-1.5 cursor-pointer transition-colors"
                            style={{ color: 'var(--color-nearby-dim)' }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <AnimatePresence>
                            {openMenuId === listing.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-2xl ring-1 ring-white/10"
                                style={{ background: 'var(--color-nearby-surface-2)' }}
                              >
                                <button onClick={() => openEdit(listing)} className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm transition-colors" style={{ color: 'var(--color-nearby-text)' }}>
                                  <Edit2 className="h-3.5 w-3.5" style={{ color: 'var(--color-nearby-dim)' }} /> Edit
                                </button>
                                <button onClick={() => handleToggle(listing)} disabled={toggleAvailability.isPending} className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm transition-colors disabled:opacity-50" style={{ color: 'var(--color-nearby-text)' }}>
                                  {listing.isAvailable
                                    ? <Pause className="h-3.5 w-3.5" style={{ color: 'var(--color-nearby-yellow)' }} />
                                    : <Play className="h-3.5 w-3.5" style={{ color: 'var(--color-nearby-blue)' }} />}
                                  {listing.isAvailable ? 'Pause' : 'Resume'}
                                </button>
                                <div className="border-t border-white/5" />
                                <button onClick={() => { setOpenMenuId(null); setConfirmDeleteId(listing.id); }} className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm transition-colors" style={{ color: 'var(--color-nearby-coral)' }}>
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-xs font-semibold" style={{ background: st.bg, color: st.color }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} />
                          {st.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-nearby-dim)' }}>
                          <Tag className="h-3 w-3" />{getCategoryLabel(listing.productCategoryId)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-nearby-dim)' }}>{listing.condition}</span>
                        {listing.location?.city && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-nearby-dim)' }}>
                            <MapPin className="h-3 w-3" />{listing.location.city}
                          </span>
                        )}
                      </div>

                      {/* Price + date */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-display text-base font-bold" style={{ color: 'var(--color-nearby-coral)' }}>₹{listing.estimatedValue.toLocaleString()}</span>
                        <span className="text-xs" style={{ color: 'var(--color-nearby-dim)' }}>{formatDate(listing.createdOn)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {openMenuId !== null && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

      <ConfirmDialog open={confirmDeleteId !== null} title="Delete listing" message="This action cannot be undone. Are you sure?" onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); setConfirmDeleteId(null); }} onCancel={() => setConfirmDeleteId(null)} />

      {/* Edit modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full overflow-y-auto rounded-t-[28px] sm:rounded-[28px] sm:max-w-lg ring-1 ring-white/10"
              style={{ background: 'var(--color-nearby-surface)', maxHeight: '92vh' }}
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-white/5 px-5 py-4 rounded-t-[28px]" style={{ background: 'var(--color-nearby-surface)' }}>
                <h3 className="font-display font-bold" style={{ color: 'var(--color-nearby-text)' }}>Edit listing</h3>
                <button onClick={() => setEditingItem(null)} className="rounded-xl p-1.5 cursor-pointer" style={{ color: 'var(--color-nearby-dim)' }}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--color-nearby-dim)' }}>Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }} />
                </div>
                {/* Description */}
                <div>
                  <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--color-nearby-dim)' }}>Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className={inputClass + ' resize-none'} style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }} />
                </div>
                {/* Category */}
                <div>
                  <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--color-nearby-dim)' }}>Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => setEditForm({ ...editForm, productCategoryId: Number(cat.id) })} className="cursor-pointer rounded-xl px-3 py-1.5 font-display text-xs font-medium transition-all" style={{ background: editForm.productCategoryId === Number(cat.id) ? 'var(--color-nearby-coral)' : 'var(--color-nearby-surface-2)', color: editForm.productCategoryId === Number(cat.id) ? '#fff' : 'var(--color-nearby-dim)' }}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Condition */}
                <div>
                  <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--color-nearby-dim)' }}>Condition</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CONDITIONS.map((cond) => (
                      <button key={cond} onClick={() => setEditForm({ ...editForm, condition: cond })} className="cursor-pointer rounded-xl px-3 py-1.5 font-display text-xs font-medium transition-all" style={{ background: editForm.condition === cond ? 'var(--color-nearby-coral)' : 'var(--color-nearby-surface-2)', color: editForm.condition === cond ? '#fff' : 'var(--color-nearby-dim)' }}>
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Values */}
                <div className="grid grid-cols-2 gap-3">
                  {(['estimatedValue', 'originalValue'] as const).map((field) => (
                    <div key={field}>
                      <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--color-nearby-dim)' }}>{field === 'estimatedValue' ? 'Est. Value (₹)' : 'Original (₹)'}</label>
                      <input type="number" value={editForm[field]} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} className={inputClass} style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }} />
                    </div>
                  ))}
                </div>
                {/* Location */}
                <div>
                  <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--color-nearby-dim)' }}>Location</label>
                  <button type="button" onClick={handleEditLocation} disabled={editLocating} className="mb-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 font-display text-sm font-medium ring-1 ring-white/5 transition-colors disabled:opacity-60" style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-coral)' }}>
                    {editLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                    {editLocating ? 'Detecting…' : 'Use my location'}
                  </button>
                  {editLocError && <p className="mb-2 text-xs" style={{ color: 'var(--color-nearby-coral)' }}>{editLocError}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    {(['country', 'state', 'city', 'postalCode'] as const).map((field) => (
                      <input key={field} value={editForm[field] as string} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} placeholder={field === 'postalCode' ? 'Postal code' : field.charAt(0).toUpperCase() + field.slice(1)} className={inputClass} style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 flex gap-2 border-t border-white/5 px-5 py-4" style={{ background: 'var(--color-nearby-surface)' }}>
                <button onClick={() => setEditingItem(null)} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl py-2.5 font-display text-sm font-medium ring-1 ring-white/10 transition-colors" style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-dim)' }}>
                  <X className="h-4 w-4" /> Cancel
                </button>
                <motion.button
                  onClick={handleSaveEdit}
                  disabled={updateListing.isPending || !editForm.name || !editForm.condition}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl py-2.5 font-display text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'var(--color-nearby-coral)' }}
                >
                  <Save className="h-4 w-4" /> {updateListing.isPending ? 'Saving…' : 'Save'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
