import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, DollarSign, Loader2, MapPin, Package, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { listingService } from "../../services/listingService";
import { useCategories } from "../../hooks/useCategories";
import { useQueryClient } from "@tanstack/react-query";
import { LISTINGS_KEY } from "../../hooks/useListings";
import type { CreateProductDto } from "../../types/dto";
import { useToast } from "../../components/Toast";
import { imageService } from "../../services/imageService";

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;

const conditions = ["New", "Like New", "Excellent", "Good", "Fair"];

export function CreateListingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const { data: categories = [] } = useCategories();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    condition: "",
    productCategoryId: null as number | null,
    estimatedValue: "",
    originalValue: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported'); return; }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const a = data.address || {};
          setForm((prev) => ({
            ...prev,
            latitude,
            longitude,
            country: a.country || prev.country,
            state: a.state || a.region || prev.state,
            city: a.city || a.town || a.village || a.county || prev.city,
            postalCode: a.postcode || prev.postalCode,
          }));
        } catch {
          setForm((prev) => ({ ...prev, latitude, longitude }));
          setLocError('Could not fetch address, please fill manually');
        } finally {
          setLocating(false);
        }
      },
      () => { setLocating(false); setLocError('Location access denied'); }
    );
  };

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
      const dto: CreateProductDto = {
        name: form.name,
        description: form.description || undefined,
        condition: form.condition,
        productCategoryId: form.productCategoryId!,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
        originalValue: form.originalValue ? Number(form.originalValue) : undefined,
        location: {
          country: form.country,
          state: form.state,
          city: form.city,
          postalCode: form.postalCode,
          ...(form.latitude != null && form.longitude != null ? { latitude: form.latitude, longitude: form.longitude } : {}),
        },
      };
      const result = await listingService.createListing(dto);
      const productId = result.productId;

      // Upload images
      setUploadProgress(new Array(selectedFiles.length).fill(0));
      for (let i = 0; i < selectedFiles.length; i++) {
        const { file } = selectedFiles[i];
        try {
          const { uploadUrl, s3Key } = await imageService.getUploadUrl(productId, file.type);
          await imageService.uploadToS3(uploadUrl, file, file.type, (p) => {
            setUploadProgress((prev) => { const copy = [...prev]; copy[i] = p; return copy; });
          });
          await imageService.confirmUpload(productId, s3Key, file.type);
        } catch {
          showToast(`Failed to upload ${file.name}`, 'error');
        }
      }

      await qc.invalidateQueries({ queryKey: LISTINGS_KEY });
      showToast('Listing published successfully!', 'success');
      navigate('/home/sell');
    } catch (err) {
      console.error("Failed to create listing:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 pt-6 sm:pt-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/home/sell')}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h2 className="text-2xl sm:text-3xl">Create Listing</h2>
            <p className="text-sm sm:text-base text-muted-foreground">List an item for sale or swap</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-4 sm:p-6 shadow-md"
          >
            <label className="block text-sm font-medium mb-3">Photos ({selectedFiles.length}/{MAX_IMAGES}) *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {selectedFiles.map((item, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  {uploadProgress.length > 0 && uploadProgress[i] < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-300">
                      <div className="h-full bg-purple-500 transition-all" style={{ width: `${uploadProgress[i]}%` }} />
                    </div>
                  )}
                  {!submitting && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFile(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              ))}
              {selectedFiles.length < MAX_IMAGES && !submitting && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-100 transition-colors"
                >
                  <Camera className="w-6 h-6 text-purple-500" />
                  <span className="text-xs text-purple-600">Add Photo</span>
                </motion.button>
              )}
            </div>
            <input ref={fileRef} type="file" accept={ACCEPTED_TYPES.join(',')} multiple onChange={handleFileSelect} className="hidden" />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-4 sm:p-6 shadow-md space-y-4 sm:space-y-5"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Item Name *</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="What are you selling?"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe your item — condition, why you're selling, etc."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Value</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="number"
                    value={form.estimatedValue}
                    onChange={(e) => update("estimatedValue", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Original Value</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="number"
                    value={form.originalValue}
                    onChange={(e) => update("originalValue", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl p-4 sm:p-6 shadow-md space-y-3 sm:space-y-4"
          >
            <label className="block text-sm font-medium">Location *</label>
            <motion.button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locating}
              whileHover={{ scale: locating ? 1 : 1.02 }}
              whileTap={{ scale: locating ? 1 : 0.98 }}
              className="w-full py-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {locating ? 'Detecting location...' : 'Use my current location'}
            </motion.button>
            {locError && <p className="text-sm text-red-500">{locError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="Country *"
                className="px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
              <input
                type="text"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="State *"
                className="px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="City *"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
                placeholder="Postal Code *"
                className="px-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
          </motion.div>

          {/* Category & Condition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-4 sm:p-6 shadow-md space-y-4 sm:space-y-5"
          >
            <div>
              <label className="block text-sm font-medium mb-3">Category *</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => update("productCategoryId", Number(cat.id))}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-sm transition-all ${
                      form.productCategoryId === Number(cat.id)
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Condition *</label>
              <div className="flex flex-wrap gap-2">
                {conditions.map((cond) => (
                  <motion.button
                    key={cond}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => update("condition", cond)}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-sm transition-all ${
                      form.condition === cond
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                    }`}
                  >
                    {cond}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: canSubmit ? 1.02 : 1 }}
            whileTap={{ scale: canSubmit ? 0.98 : 1 }}
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            {submitting ? 'Uploading...' : 'Publish Listing'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
