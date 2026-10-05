import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Upload,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
  Camera,
  Loader2,
} from 'lucide-react';
import { Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: Product) => void;
  editProduct?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
  editProduct,
}) => {
  const [formData, setFormData] = useState({
    product_name: editProduct?.product_name || '',
    price: editProduct?.price ? String(editProduct.price) : '',
    discount_price: editProduct?.discount_price ? String(editProduct.discount_price) : '',
    colors: editProduct?.colors.join(', ') || 'রয়েল ব্লু, টকটকে লাল, কালো',
    stock: editProduct?.stock ? String(editProduct.stock) : '20',
    size: editProduct?.size || 'আনস্টিচড ফ্রি সাইজ (Unstitched Free Size)',
    fabric: editProduct?.fabric || '১০০% পিওর সুতি ভয়েল (Pure Cotton Voile)',
    kameez_length: editProduct?.kameez_length || '৪৮ ইঞ্চি (বহর ২.৫ গজ)',
    salwar_length: editProduct?.salwar_length || '২.৫ গজ পিওর কটন',
    orna_length: editProduct?.orna_length || '৫ হাত নামাজি ওড়না',
    description:
      editProduct?.description ||
      'খাঁটি মোম বাটিক ও প্রাকৃতিক পাকা রঙের নিখুঁত প্রিন্ট। ধোয়ার পরও রঙ নষ্ট হবে না।',
    delivery_info: editProduct?.delivery_info || 'ঢাকা সিটির ভেতরে ২ কার্যদিবস, ঢাকার বাইরে ৩-৪ দিন।',
    status: editProduct?.status || 'active',
  });

  // Multiple images state (direct upload or urls)
  const [imageList, setImageList] = useState<string[]>(() => {
    if (editProduct?.images && editProduct.images.length > 0) {
      return editProduct.images;
    }
    return [];
  });

  const [imageUploadMode, setImageUploadMode] = useState<'device' | 'url'>('device');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle direct file upload from device
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const newUploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Read file as Base64 Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      try {
        // Upload to server /uploads directory
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataUrl }),
        });

        if (res.ok) {
          const data = await res.json();
          newUploadedUrls.push(data.url);
        } else {
          // If upload fails, fallback to using Data URL directly
          newUploadedUrls.push(dataUrl);
        }
      } catch (err) {
        // Fallback to data url directly
        newUploadedUrls.push(dataUrl);
      }
    }

    setImageList((prev) => [...prev, ...newUploadedUrls]);
    setIsUploading(false);

    // Reset file input so user can pick the same file again if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setImageList((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImageList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.product_name.trim()) {
      setError('প্রোডাক্টের নাম প্রদান করুন।');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('সঠিক বিক্রয় মূল্য প্রদান করুন।');
      return;
    }

    if (imageList.length === 0) {
      setError('কমপক্ষে একটি প্রোডাক্টের ছবি আপলোড করুন অথবা ছবির লিঙ্ক দিন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const colorsArr = formData.colors.split(/[,/]/).map((c) => c.trim()).filter(Boolean);
      const discountNum = formData.discount_price ? parseFloat(formData.discount_price) : undefined;
      const stockNum = parseInt(formData.stock, 10) || 10;

      const payload = {
        product_name: formData.product_name,
        price: priceNum,
        discount_price: discountNum,
        colors: colorsArr.length > 0 ? colorsArr : ['এক কালার'],
        stock: stockNum,
        size: formData.size,
        fabric: formData.fabric,
        kameez_length: formData.kameez_length,
        salwar_length: formData.salwar_length,
        orna_length: formData.orna_length,
        description: formData.description,
        delivery_info: formData.delivery_info,
        status: stockNum > 0 ? formData.status : 'out_of_stock',
        images: imageList,
      };

      const url = editProduct ? `/api/products/${editProduct.product_id}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save product');
      }

      const saved: Product = await res.json();
      onProductAdded(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden border border-slate-200 animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-blue-700 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">
              {editProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন বাটিক প্রোডাক্ট যুক্ত করুন'}
            </h3>
            <p className="text-xs text-indigo-100 font-light">
              সরাসরি মোবাইল বা কম্পিউটার থেকে ছবি আপলোড করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Direct Image Upload Section (Prominent) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>প্রোডাক্টের ছবি আপলোড (এক বা একাধিক ছবি) *</span>
              </label>

              {/* Mode switch */}
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setImageUploadMode('device')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    imageUploadMode === 'device' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  ডিভাইস থেকে আপলোড
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMode('url')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    imageUploadMode === 'url' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  ছবির লিঙ্ক (URL)
                </button>
              </div>
            </div>

            {/* Device Upload Drag & Drop Area */}
            {imageUploadMode === 'device' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="product-image-file-input"
                />
                <label
                  htmlFor="product-image-file-input"
                  className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/40 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {isUploading ? 'ছবি প্রসেস ও আপলোড হচ্ছে...' : 'ছবি নির্বাচন করতে ক্লিক করুন বা টেনে আনুন'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    মোবাইল ক্যামেরা, গ্যালারি বা কম্পিউটার থেকে সরাসরি সিলেক্ট করুন (JPG, PNG, WEBP)
                  </span>
                </label>
              </div>
            )}

            {/* URL Input Mode */}
            {imageUploadMode === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/batik-dress.jpg"
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  যোগ করুন
                </button>
              </div>
            )}

            {/* Thumbnails of Uploaded Images */}
            {imageList.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">
                  নির্বাচিত ছবিসমূহ ({imageList.length}টি):
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {imageList.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-slate-300 group aspect-square bg-slate-100"
                    >
                      <img
                        src={imgUrl}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          প্রধান ছবি
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-80 hover:opacity-100 transition-opacity"
                        title="ছবিটি মুছুন"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Product Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              প্রোডাক্টের নাম (Product Name) *
            </label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="যেমন: প্রিমিয়াম চুন্দ্রি সুতি বাটিক থ্রি-পিস"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          {/* 3 & 4. Price & Discount Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                রেগুলার মূল্য (৳ Price) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="1250"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ডিসকাউন্ট/অফার মূল্য (৳ Discount Price)
              </label>
              <input
                type="number"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                placeholder="1150 (ঐচ্ছিক)"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* 5 & 6. Colors & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                অ্যাভেইলেবল কালারসমূহ (Available Colors) *
              </label>
              <input
                type="text"
                required
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder="রয়েল ব্লু, টকটকে লাল, কালো, সি গ্রিন"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              />
              <span className="text-[10px] text-slate-400">কমা (,) দিয়ে আলাদা করুন</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                স্টক সংখ্যা (Stock Quantity) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="25"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* 7. Fabric & Sizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                কাপড়ের ধরন (Fabric Type)
              </label>
              <input
                type="text"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                placeholder="১০০% পিওর সুতি ভয়েল"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সাইজ / ধরণ (Size)
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="আনস্টিচড ফ্রি সাইজ"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Measurements: Kameez, Salwar, Orna */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                কামিজ বহর/দৈর্ঘ্য
              </label>
              <input
                type="text"
                value={formData.kameez_length}
                onChange={(e) => setFormData({ ...formData, kameez_length: e.target.value })}
                placeholder="৪৮ ইঞ্চি (২.৫ গজ)"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                সেলোয়ারের কাপড়
              </label>
              <input
                type="text"
                value={formData.salwar_length}
                onChange={(e) => setFormData({ ...formData, salwar_length: e.target.value })}
                placeholder="২.৫ গজ"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                ওড়নার বহর
              </label>
              <input
                type="text"
                value={formData.orna_length}
                onChange={(e) => setFormData({ ...formData, orna_length: e.target.value })}
                placeholder="৫ হাত নামাজি ওড়না"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Description & Delivery Info */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              বিস্তারিত বিবরণ ও ডেলিভারি তথ্য
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="কাপড়ের বৈশিষ্ট্য, মোম প্রিন্ট ও ব্যবহার সংক্রান্ত তথ্য..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : editProduct ? (
                'আপডেট সম্পন্ন করুন'
              ) : (
                'প্রোডাক্ট যুক্ত করুন'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
