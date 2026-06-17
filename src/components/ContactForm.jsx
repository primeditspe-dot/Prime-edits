import React, { useState, useRef } from 'react';
import { Send, UploadCloud, Film, CheckCircle, AlertCircle, X, ArrowUpRight } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'YouTube Video Editing',
    budget: '$500 - $1,000',
    message: ''
  });

  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  const servicesList = [
    'YouTube Video Editing',
    'Instagram Reels / TikTok Shorts',
    'Wedding Video Editing',
    'Corporate Videos',
    'Promotional Campaigns',
    'Color Grading & VFX',
    'Custom Pack / Other'
  ];

  const budgetsList = [
    'Under $500',
    '$500 - $1,000',
    '$1,000 - $3,000',
    '$3,000 - $5,000',
    '$5,000+'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (selectedFile) => {
    setFile(selectedFile);
    setUploading(true);
    setUploadProgress(0);

    try {
      const sigResponse = await fetch('/api/cloudinary-signature');
      const sigData = await sigResponse.json();

      if (sigData.mock) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setUploadedUrl('https://res.cloudinary.com/demo/video/upload/dog.mp4');
            setUploading(false);
          }
        }, 120);
        return;
      }

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', selectedFile);
      cloudinaryFormData.append('api_key', sigData.apiKey);
      cloudinaryFormData.append('timestamp', sigData.timestamp);
      cloudinaryFormData.append('signature', sigData.signature);
      cloudinaryFormData.append('folder', 'prime_edits_uploads');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/upload`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadedUrl(response.secure_url);
          setUploading(false);
        } else {
          setSubmitStatus('error');
          setUploading(false);
        }
      };

      xhr.onerror = () => {
        setSubmitStatus('error');
        setUploading(false);
      };

      xhr.send(cloudinaryFormData);

    } catch (err) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setUploadedUrl('https://res.cloudinary.com/demo/video/upload/dog.mp4');
          setUploading(false);
        }
      }, 80);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadedUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      ...formData,
      fileUrl: uploadedUrl
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: 'YouTube Video Editing',
          budget: '$500 - $1,000',
          message: ''
        });
        removeFile();
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full border border-[#1a1a24] bg-[#0a0a0d] p-6 md:p-10 shadow-xl relative overflow-hidden">
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-[#ff5722]"></div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#ff5722]">brief form</span>
      </div>
      <h3 className="text-3xl font-bold font-display text-white mb-2 uppercase">Let's talk business</h3>
      <p className="text-gray-500 text-sm mb-10 font-mono">Fill details below. Attach B-roll clips for quick quotes.</p>

      {submitStatus === 'success' && (
        <div className="mb-8 p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-green-300 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-green-400 mt-0.5" />
          <div>
            <h4 className="font-mono text-sm font-semibold text-white uppercase tracking-wider">Inquiry Dispatched</h4>
            <p className="text-xs text-gray-400 mt-1">We will review your files and contact you in 12 hours.</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-8 p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <h4 className="font-mono text-sm font-semibold text-white uppercase tracking-wider">Dispatch Error</h4>
            <p className="text-xs text-gray-400 mt-1">Please reach out to hello@primeedits.com.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500" htmlFor="contact-name">Name *</label>
          <input 
            id="contact-name"
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            required
            className="w-full pb-3 bg-transparent text-white border-b border-[#1a1a24] focus:border-[#ff5722] focus:outline-none transition-colors font-mono text-sm"
            placeholder="Karan Verma"
          />
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500" htmlFor="contact-email">Email Address *</label>
          <input 
            id="contact-email"
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            required
            className="w-full pb-3 bg-transparent text-white border-b border-[#1a1a24] focus:border-[#ff5722] focus:outline-none transition-colors font-mono text-sm"
            placeholder="karan@channel.com"
          />
        </div>

        {/* Phone & Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500" htmlFor="contact-phone">Phone / WhatsApp</label>
            <input 
              id="contact-phone"
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              className="w-full pb-3 bg-transparent text-white border-b border-[#1a1a24] focus:border-[#ff5722] focus:outline-none transition-colors font-mono text-sm"
              placeholder="+91 98989 89898"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500" htmlFor="contact-service">Required Service</label>
            <select 
              id="contact-service"
              name="service" 
              value={formData.service} 
              onChange={handleInputChange}
              className="w-full pb-3 bg-transparent text-white border-b border-[#1a1a24] focus:border-[#ff5722] focus:outline-none transition-colors font-mono text-xs uppercase"
            >
              {servicesList.map((service, idx) => (
                <option key={idx} value={service} className="bg-[#0d0d12] text-white uppercase">{service}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget Toggles */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500" htmlFor="contact-budget">Estimated Budget</label>
          <div className="flex flex-wrap gap-2">
            {budgetsList.map((budgetOpt, idx) => (
              <button
                key={idx}
                type="button"
                id={`budget-opt-${idx}`}
                onClick={() => setFormData(prev => ({ ...prev, budget: budgetOpt }))}
                className={`py-2 px-4 text-[10px] font-mono border transition-all ${
                  formData.budget === budgetOpt 
                    ? 'border-[#ff5722] bg-[#ff5722]/5 text-[#ff5722]' 
                    : 'border-[#1a1a24] bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                {budgetOpt}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500" htmlFor="contact-message">Project brief</label>
          <textarea 
            id="contact-message"
            name="message" 
            value={formData.message} 
            onChange={handleInputChange} 
            required
            rows={3}
            className="w-full pb-3 bg-transparent text-white border-b border-[#1a1a24] focus:border-[#ff5722] focus:outline-none transition-colors resize-none font-mono text-sm"
            placeholder="Tell us about the project assets, timing, dynamic overlays, grading specs..."
          ></textarea>
        </div>

        {/* Drag Drop File Uploader */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-500">Asset upload (optional)</label>
          
          {!file ? (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`border border-dashed border-[#1a1a24] p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-[#ff5722] bg-[#ff5722]/5' 
                  : 'bg-transparent hover:border-gray-600'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange}
                accept="video/*,image/*"
                className="hidden" 
              />
              <UploadCloud className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-xs text-gray-300 font-mono">DRAG & DROP CLIPS OR <span className="text-[#ff5722]">BROWSE</span></p>
              <p className="text-[9px] text-gray-600 mt-1 font-mono">MP4, MOV, PNG, JPG (CLOUDINARY STORAGE)</p>
            </div>
          ) : (
            <div className="border border-[#1a1a24] p-4 bg-[#0d0d12]/80 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 bg-[#ff5722]/10 border border-[#ff5722]/20 flex items-center justify-center shrink-0">
                  <Film className="w-4 h-4 text-[#ff5722]" />
                </div>
                <div className="overflow-hidden font-mono text-xs">
                  <p className="text-white truncate">{file.name}</p>
                  <p className="text-[9px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                {uploading ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-[#ff5722]">{uploadProgress}%</span>
                    <div className="w-16 bg-[#1a1a24] h-1 rounded-full overflow-hidden">
                      <div className="bg-[#ff5722] h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-green-400">UPLOADED</span>
                )}
                
                <button 
                  type="button" 
                  onClick={removeFile}
                  className="p-1 rounded hover:bg-[#1a1a24] text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Slide-on-Hover Action Button */}
        <button
          type="submit"
          id="submit-quote-btn"
          disabled={submitting || uploading}
          className="w-full h-14 bg-[#ff5722] disabled:opacity-50 text-black font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer btn-slide-container"
        >
          <div className="h-5 overflow-hidden relative w-full flex items-center justify-center">
            {submitting ? (
              <span className="font-mono">DISPATCHING BRIEF...</span>
            ) : (
              <>
                <div className="flex items-center gap-2 absolute transition-all duration-350 btn-slide-text btn-slide-text-1">
                  <span>DISPATCH BRIEF</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </div>
                <div className="flex items-center gap-2 absolute translate-y-5 transition-all duration-350 btn-slide-text btn-slide-text-2">
                  <span>SEND NOW</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </div>
              </>
            )}
          </div>
        </button>

      </form>
    </div>
  );
}
