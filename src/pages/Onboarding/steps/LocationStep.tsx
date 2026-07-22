import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2 } from "lucide-react";

function LocationStep({
  setFormData,
  formData,
}: {
  onNext: () => void;
  formData: any;
  setFormData: any;
}) {
  const loc = formData.location || {};
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  const updateLocation = (field: string, value: string) => {
    setFormData({ location: { ...loc, [field]: value } });
  };

  const handleSetCurrentLocation = () => {
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
          setFormData({
            location: {
              ...loc,
              latitude,
              longitude,
              country: a.country || '',
              state: a.state || a.region || '',
              city: a.city || a.town || a.village || a.county || '',
              postalCode: a.postcode || '',
            },
          });
        } catch {
          // coords saved even if reverse geocode fails
          setFormData({ location: { ...loc, latitude, longitude } });
          setLocError('Could not fetch address, please fill manually');
        } finally {
          setLocating(false);
        }
      },
      () => { setLocating(false); setLocError('Location access denied'); }
    );
  };

  return (
    <div>
      <motion.div
        key="location"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <MapPin className="w-12 h-12 mx-auto mb-4 text-purple-600" />
        <h2 className="text-3xl text-center mb-2">Where are you?</h2>
        <p className="text-muted-foreground text-center mb-8">
          We'll show you items nearby
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Country *</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={loc.country || ""}
                onChange={(e) => updateLocation("country", e.target.value)}
                placeholder="e.g., US"
                className="w-full px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">State *</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={loc.state || ""}
                onChange={(e) => updateLocation("state", e.target.value)}
                placeholder="e.g., NY"
                className="w-full px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">City *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={loc.city || ""}
                  onChange={(e) => updateLocation("city", e.target.value)}
                  placeholder="e.g., Brooklyn"
                  className="w-full pl-12 pr-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Postal Code</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={loc.postalCode || ""}
                onChange={(e) => updateLocation("postalCode", e.target.value)}
                placeholder="e.g., 10001"
                className="w-full px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
          </div>

          <motion.button
            onClick={handleSetCurrentLocation}
            type="button"
            disabled={locating}
            whileHover={{ scale: locating ? 1 : 1.02 }}
            whileTap={{ scale: locating ? 1 : 0.98 }}
            className="w-full py-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : '📍'}
            {locating ? 'Detecting location...' : 'Use my current location'}
          </motion.button>
          {locError && <p className="text-sm text-red-500 text-center">{locError}</p>}
        </div>
      </motion.div>
    </div>
  );
}

export default LocationStep;
