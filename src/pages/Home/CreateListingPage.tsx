import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Loader2, MapPin, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../../services/listingService';
import { useCategories } from '../../hooks/useCategories';
import { useQueryClient } from '@tanstack/react-query';
import { LISTINGS_KEY } from '../../hooks/useListings';
import type { CreateProductDto } from '../../types/dto';
import { useToast } from '../../components/Toast';
import { imageService } from '../../services/imageService';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];

const inputClass = 'w-full rounded-xl px-4 py-3 text-base outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-[color:var(--color-nearby-coral)] transition placeholder:text-[color:var(--color-nearby-dim)]';
const labelClass = 'mb-1.5 block font-display text-sm font-semibold';

export function CreateListingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const { data: categories = [] } = useCategories();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: '', description: '', condition: '', productCategoryId: null as number | null, estimatedValue: '', originalValue: '', country: '', state: '', city: '', postalCode: '', latitude: null as number | null, longitude: null as number | null });
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const update = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported'); return; }
    setLocating(true); setLocError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const data = await res.json(); const a = data.address || {};
          setForm((prev) => ({ ...prev, latitude, longitude, country: a.country || prev.country, state: a.state || a.region || prev.state, city: a.city || a.town || a.village || a.county || prev.city, postalCode: a.postcode || prev.postalCode }));
        } catch { setForm((prev) => ({ ...prev, latitude, longitude })); setLocError('Could not fetch address, fill manually'); }
        finally { setLocating(false); }
      },
      () => { setLocating(false); setLocError('Location access denied'); }
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fileRef.current) fileRef.current.value = '';
    const available = MAX_IMAGES - selectedFiles.length;
    if (available <= 0) { showToast(`Maximum ${MAX_IMAGES} images allowed`, 'error'); return; }
    const valid = files.slice(0, available).filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) { showToast(`${file.name}: use JPEG, PNG, or WebP`, 'error'); return false; }
      if (file.size > MAX_SIZE) { showToast(`${file.name}: exceeds 5MB`, 'error'); return false; }
      return true;
    });
    setSelectedFiles((prev) => [...prev, ...valid.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
  };

  const canSubmit = form.name && form.condition && form.productCategoryId && form.country && form.state && form.city && form.postalCode && !submitting && selectedFiles.length > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const dto: CreateProductDto = { name: form.name, description: form.description || undefined, condition: form.condition, productCategoryId: form.productCategoryId!, estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined, originalValue: form.originalValue ? Number(form.originalValue) : undefined, location: { country: form.country, state: form.state, city: form.city, postalCode: form.postalCode, ...(form.latitude != null && form.longitude != null ? { latitude: form.latitude, longitude: form.longitude } : {}) } };
      const result = await listingService.createListing(dto);
      const productId = result.productId;
      setUploadProgress(new Array(selectedFiles.length).fill(0));
      for (let i = 0; i < selectedFiles.length; i++) {
        const { file } = selectedFiles[i];
        try {
          const { uploadUrl, s3Key } = await imageService.getUploadUrl(productId, file.type);
          await imageService.uploadToS3(uploadUrl, file, file.type, (p) => { setUploadProgress((prev) => { const copy = [...prev]; copy[i] = p; return copy; }); });
          await imageService.confirmUpload(productId, s3Key, file.type);
        } catch { showToast(`Failed to upload ${file.name}`, 'error'); }
      }
      await qc.invalidateQueries({ queryKey: LISTINGS_KEY });
      showToast('Listing published!', 'success');
      navigate('/home/sell');
    } catch { /* silent — toast shown per-image */ }
    finally { setSubmitting(false); }
  };

  const cardClass = 'rounded-[24px] p-5 sm:p-6 ring-1 ring-white/5 space-y-4';

  return (
    <div className="min-h-screen p-5 pt-8" style={{ background: 'var(--color-nearby-bg)' }}>
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-7 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/home/sell')}
            className="flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/10 cursor-pointer"
            style={{ background: 'var(--color-nearby-surface)' }}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: 'var(--color-nearby-text)' }} />
          </motion.button>
          <div>
            <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--color-nearby-text)' }}>Create listing</h2>
            <p className="text-sm" style={{ color: 'var(--color-nearby-dim)' }}>List an item for sale</p>
          </div>
        </div>

        <div className="space-y-4">

          {/* Photos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cardClass} style={{ background: 'var(--color-nearby-surface)' }}>
            <label className={labelClass} style={{ color: 'var(--color-nearby-text)' }}>
              Photos ({selectedFiles.length}/{MAX_IMAGES}) *
            </label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {selectedFiles.map((item, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl">
                  <img src={item.preview} alt="" className="h-full w-full object-cover" />
                  {uploadProgress.length > 0 && uploadProgress[i] < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <div className="h-full transition-all" style={{ width: `${uploadProgress[i]}%`, background: 'var(--color-nearby-coral)' }} />
                    </div>
                  )}
                  {!submitting && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFile(i)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ background: 'var(--color-nearby-coral)' }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </div>
              ))}
              {selectedFiles.length < MAX_IMAGES && !submitting && (
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors"
                  style={{ borderColor: 'rgba(255,90,95,0.3)', background: 'rgba(255,90,95,0.05)' }}
                >
                  <Camera className="h-5 w-5" style={{ color: 'var(--color-nearby-coral)' }} />
                  <span className="font-display text-xs" style={{ color: 'var(--color-nearby-coral)' }}>Add photo</span>
                </motion.button>
              )}
            </div>
            <input ref={fileRef} type="file" accept={ACCEPTED_TYPES.join(',')} multiple onChange={handleFileSelect} className="hidden" />
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardClass} style={{ background: 'var(--color-nearby-surface)' }}>
            <div>
              <label className={labelClass} style={{ color: 'var(--color-nearby-text)' }}>Item name *</label>
              <div className="relative">
                <Package className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-nearby-dim)' }} />
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="What are you selling?" className={inputClass + ' pl-10'} style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }} />
              </div>
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--color-nearby-text)' }}>Description</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Condition, why you're selling, any defects…" rows={3} className={inputClass + ' resize-none'} style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['estimatedValue', 'originalValue'] as const).map((field) => (
                <div key={field}>
                  <label className={labelClass} style={{ color: 'var(--color-nearby-text)' }}>{field === 'estimatedValue' ? 'Asking price (₹)' : 'Original price (₹)'}</label>
                  <input type="number" value={form[field]} onChange={(e) => update(field, e.target.value)} placeholder="0" min="0" className={inputClass} style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Location */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass} style={{ background: 'var(--color-nearby-surface)' }}>
            <label className={labelClass} style={{ color: 'var(--color-nearby-text)' }}>Location *</label>
            <motion.button
              type="button" onClick={handleUseMyLocation} disabled={locating}
              whileHover={{ scale: locating ? 1 : 1.02 }} whileTap={{ scale: locating ? 1 : 0.98 }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 font-display text-sm font-medium ring-1 ring-white/5 transition-colors disabled:opacity-60"
              style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-coral)' }}
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {locating ? 'Detecting location…' : 'Use my current location'}
            </motion.button>
            {locError && <p className="text-sm" style={{ color: 'var(--color-nearby-coral)' }}>{locError}</p>}
            <div className="grid grid-cols-2 gap-3">
              {(['country', 'state', 'city', 'postalCode'] as const).map((field) => (
                <input key={field} type="text" value={form[field] as string} onChange={(e) => update(field, e.target.value)} placeholder={field === 'postalCode' ? 'Postal code *' : `${field.charAt(0).toUpperCase() + field.slice(1)} *`} className={inputClass} style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }} />
              ))}
            </div>
          </motion.div>

          {/* Category & Condition */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass} style={{ background: 'var(--color-nearby-surface)' }}>
            <div>
              <label className={labelClass} style={{ color: 'var(--color-nearby-text)' }}>Category *</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <motion.button key={cat.id} whileTap={{ scale: 0.95 }} onClick={() => update('productCategoryId', Number(cat.id))} className="cursor-pointer rounded-xl px-3 py-2 font-display text-sm font-medium transition-all" style={{ background: form.productCategoryId === Number(cat.id) ? 'var(--color-nearby-coral)' : 'var(--color-nearby-surface-2)', color: form.productCategoryId === Number(cat.id) ? '#fff' : 'var(--color-nearby-dim)' }}>
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--color-nearby-text)' }}>Condition *</label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((cond) => (
                  <motion.button key={cond} whileTap={{ scale: 0.95 }} onClick={() => update('condition', cond)} className="cursor-pointer rounded-xl px-3 py-2 font-display text-sm font-medium transition-all" style={{ background: form.condition === cond ? 'var(--color-nearby-coral)' : 'var(--color-nearby-surface-2)', color: form.condition === cond ? '#fff' : 'var(--color-nearby-dim)' }}>
                    {cond}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            whileHover={{ scale: canSubmit ? 1.02 : 1, boxShadow: canSubmit ? '0 20px 45px -12px rgba(255,90,95,0.55)' : undefined }}
            whileTap={{ scale: canSubmit ? 0.98 : 1 }}
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-4 font-display text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
          >
            {submitting ? 'Uploading…' : 'Post it'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
