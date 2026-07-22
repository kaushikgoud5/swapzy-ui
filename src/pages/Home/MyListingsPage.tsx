import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Edit2, Trash2, Tag, X, Save, Pause, Play, Loader2, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { SkeletonList } from "../../components/Skeleton";
import { useListings, useUpdateListing, useDeleteListing, useToggleAvailability } from "../../hooks/useListings";
import { useCategories } from "../../hooks/useCategories";
import type { ProductListing } from "../../services/listingService";

const STATUS = {
  0: { label: "Active",  dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  1: { label: "Sold",    dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-700 ring-violet-200" },
  2: { label: "Paused",  dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 ring-amber-200" },
} as const;

const CONDITIONS = ["New", "Like New", "Excellent", "Good", "Fair"];

const FILTERS = [
  { value: "all" as const, label: "All" },
  { value: 0 as const,     label: "Active" },
  { value: 2 as const,     label: "Paused" },
  { value: 1 as const,     label: "Sold" },
];

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

  const [filter, setFilter] = useState<"all" | 0 | 1 | 2>("all");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ProductListing | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", condition: "", estimatedValue: "", originalValue: "", productCategoryId: 0, country: "", state: "", city: "", postalCode: "", latitude: null as number | null, longitude: null as number | null });
  const [editLocating, setEditLocating] = useState(false);
  const [editLocError, setEditLocError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const getCategoryLabel = (id: number) => categories.find((c) => Number(c.id) === id)?.label ?? "Other";

  // Filter by status — status 0=Active, 1=Sold, 2=Paused (set optimistically on toggle)
  const filtered = filter === "all" ? listings : listings.filter((l) => l.status === filter);

  const counts = {
    all: listings.length,
    0: listings.filter((l) => l.status === 0).length,
    2: listings.filter((l) => l.status === 2).length,
    1: listings.filter((l) => l.status === 1).length,
  };

  const formatDate = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days < 1) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString();
  };

  const openEdit = (item: ProductListing) => {
    setOpenMenuId(null);
    setEditingItem(item);
    setEditLocError('');
    setEditForm({ name: item.name, description: item.description || "", condition: item.condition, estimatedValue: String(item.estimatedValue || ""), originalValue: String(item.originalValue || ""), productCategoryId: item.productCategoryId, country: item.location?.country || "", state: item.location?.state || "", city: item.location?.city || "", postalCode: item.location?.postalCode || "", latitude: item.location?.latitude ?? null, longitude: item.location?.longitude ?? null });
  };

  const handleEditUseMyLocation = () => {
    if (!navigator.geolocation) { setEditLocError('Geolocation not supported'); return; }
    setEditLocating(true); setEditLocError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const { address: a = {} } = await res.json();
          setEditForm((prev) => ({ ...prev, latitude, longitude, country: a.country || prev.country, state: a.state || a.region || prev.state, city: a.city || a.town || a.village || a.county || prev.city, postalCode: a.postcode || prev.postalCode }));
        } catch {
          setEditForm((prev) => ({ ...prev, latitude, longitude }));
          setEditLocError('Could not fetch address, fill manually');
        } finally { setEditLocating(false); }
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

  const handleDelete = async (id: number) => {
    await deleteListing.mutateAsync(id);
    showToast('Listing deleted', 'info');
  };

  const handleToggle = async (item: ProductListing) => {
    setOpenMenuId(null);
    await toggleAvailability.mutateAsync(item.id);
    showToast(item.isAvailable ? 'Listing paused' : 'Listing resumed', 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 pt-6 sm:pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 bg-gray-200 rounded-xl w-40 animate-pulse mb-2" />
          <div className="h-4 bg-gray-100 rounded-lg w-24 animate-pulse mb-8" />
          <SkeletonList count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 pt-6 sm:pt-8">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Listings</h2>
            <p className="text-sm text-gray-500 mt-0.5">{listings.length} {listings.length === 1 ? "item" : "items"} total</p>
          </div>
          <button onClick={() => navigate('/home/create-listing')} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" /> New listing
          </button>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl mb-6 w-fit">
          {FILTERS.map(({ value, label }) => (
            <button key={String(value)} onClick={() => setFilter(value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${filter === value ? "bg-violet-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${filter === value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {counts[value]}
              </span>
            </button>
          ))}
        </div>

        {/* ── List ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">{filter === "all" ? "📦" : filter === 0 ? "✅" : filter === 1 ? "🎉" : "⏸️"}</p>
            <p className="text-gray-900 font-medium mb-1">{filter === "all" ? "No listings yet" : `No ${STATUS[filter as 0|1|2]?.label.toLowerCase()} listings`}</p>
            <p className="text-sm text-gray-500 mb-5">{filter === "all" ? "Create your first listing to start selling" : "Items matching this filter will appear here"}</p>
            {filter === "all" && (
              <button onClick={() => navigate('/home/create-listing')} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl cursor-pointer hover:bg-violet-700 transition-colors">
                <Plus className="w-4 h-4" /> Create listing
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((listing) => {
                const st = STATUS[listing.status as 0|1|2] ?? STATUS[0];
                const thumb = listingImages[listing.id]?.[0];
                const isToggling = toggleAvailability.isPending;

                return (
                  <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-28 sm:w-36 flex-shrink-0 bg-gray-100 relative">
                        {thumb ? (
                          <img src={thumb.url} alt={listing.name} className="w-full h-full object-cover" style={{ minHeight: 112 }} />
                        ) : (
                          <div className="w-full h-full min-h-[112px] flex items-center justify-center text-gray-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                        {listingImages[listing.id]?.length > 1 && (
                          <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">+{listingImages[listing.id].length - 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 sm:p-4 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{listing.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{listing.description || "No description"}</p>
                          </div>
                          {/* Kebab menu */}
                          <div className="relative flex-shrink-0">
                            <button onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {openMenuId === listing.id && (
                                <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.1 }} className="absolute right-0 top-8 z-20 w-40 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                                  <button onClick={() => openEdit(listing)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Edit listing
                                  </button>
                                  <button onClick={() => handleToggle(listing)} disabled={isToggling} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50">
                                    {listing.isAvailable ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
                                    {listing.isAvailable ? "Pause" : "Resume"}
                                  </button>
                                  <div className="border-t border-gray-100" />
                                  <button onClick={() => { setOpenMenuId(null); setConfirmDeleteId(listing.id); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${st.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" />{getCategoryLabel(listing.productCategoryId)}
                          </span>
                          <span className="text-xs text-gray-400">{listing.condition}</span>
                          {listing.location?.city && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{listing.location.city}
                            </span>
                          )}
                        </div>

                        {/* Price + date */}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-base font-semibold text-gray-900">₹{listing.estimatedValue.toLocaleString()}</span>
                          <span className="text-xs text-gray-400">{formatDate(listing.createdOn)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Click-outside to close menu */}
      {openMenuId !== null && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

      <ConfirmDialog open={confirmDeleteId !== null} title="Delete listing" message="This action cannot be undone. Are you sure?" onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); setConfirmDeleteId(null); }} onCancel={() => setConfirmDeleteId(null)} />

      {/* ── Edit modal ── */}
      <AnimatePresence>
        {editingItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={() => setEditingItem(null)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl">
                <h3 className="font-semibold text-gray-900">Edit listing</h3>
                <button onClick={() => setEditingItem(null)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-400"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => setEditForm({ ...editForm, productCategoryId: Number(cat.id) })} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${editForm.productCategoryId === Number(cat.id) ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{cat.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Condition</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CONDITIONS.map((cond) => (
                      <button key={cond} onClick={() => setEditForm({ ...editForm, condition: cond })} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${editForm.condition === cond ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{cond}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['estimatedValue', 'originalValue'] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{field === 'estimatedValue' ? 'Est. Value (₹)' : 'Original (₹)'}</label>
                      <input type="number" value={editForm[field]} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
                  <button type="button" onClick={handleEditUseMyLocation} disabled={editLocating} className="w-full py-2 bg-violet-50 text-violet-600 rounded-xl border border-violet-200 hover:bg-violet-100 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60 mb-2 cursor-pointer">
                    {editLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                    {editLocating ? 'Detecting...' : 'Use my location'}
                  </button>
                  {editLocError && <p className="text-xs text-red-500 mb-2">{editLocError}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    {(['country', 'state', 'city', 'postalCode'] as const).map((field) => (
                      <input key={field} value={editForm[field] as string} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} placeholder={field === 'postalCode' ? 'Postal code' : field.charAt(0).toUpperCase() + field.slice(1)} className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-2">
                <button onClick={() => setEditingItem(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={updateListing.isPending || !editForm.name || !editForm.condition} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {updateListing.isPending ? "Saving..." : "Save changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
