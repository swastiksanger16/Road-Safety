import React, { useState } from 'react';
import { X, Camera, MapPin, Upload, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface HazardFormProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
}

const HazardForm: React.FC<HazardFormProps> = ({ isOpen, onClose, userLocation }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hazardType, setHazardType] = useState('');

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !hazardType || !userLocation) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('lat', userLocation.lat.toString());
    formData.append('lng', userLocation.lng.toString());
    formData.append('hazard_type', hazardType);
    formData.append('description', description);
    formData.append('file', selectedImage);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token'); // Corrected key
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:8000/api/hazards/', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.status === 401) {
        toast.error('Unauthorized! Please log in again.');
        return;
      }
      if (!res.ok) throw new Error(`Submission failed with status ${res.status}`);

      const data = await res.json();
      if (!res.ok || data.success === false) {
  toast.error(data.message);
  return;
}

toast.success('Hazard reported successfully! Thank you for keeping roads safe.');

      // Reset state and close modal
      setSelectedImage(null);
      setImagePreview('');
      setDescription('');
      setHazardType('');
      onClose();
    } catch (error) {
      console.error('Error reporting hazard:', error);
       toast.error('Uploaded image is not a valid hazard. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Report Hazard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Camera Note */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <div className="flex items-start space-x-3">
              <Camera className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Camera Required</p>
                <p className="text-xs text-amber-700 mt-1">
                  Please capture the hazard live using your camera. Gallery uploads are not allowed.
                </p>
              </div>
            </div>
          </div>

          {/* Image Capture */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Capture Hazard Image *
            </label>

            {!imagePreview ? (
              <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 cursor-pointer transition-colors">
                <div className="flex flex-col items-center justify-center h-full text-gray-500 hover:text-blue-500 transition-colors">
                  <Camera className="w-12 h-12 mb-3" />
                  <span className="font-medium">Tap to capture photo</span>
                  <span className="text-sm">Use your camera to take a picture</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                  required
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Hazard preview"
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Hazard Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hazard Type</label>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 shadow-sm"
              required
            >
              <option value="">Select a type</option>
              <option value="pothole">Pothole</option>
              <option value="accident">Accident</option>
              <option value="construction">Construction</option>
              <option value="flood">Flood</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hazard (e.g., Large pothole on main road, blocks half the lane)"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Location Info */}
          {userLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Location Captured</p>
                  <p className="text-xs text-blue-600">
                    Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedImage || !description.trim() || isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HazardForm;
