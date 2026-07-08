import React, { useState, useRef } from 'react';
import { Send, UploadCloud, Film, CheckCircle, AlertCircle, X, ArrowUpRight } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'YouTube Video Editing',
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
    <div className="w-full glass rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, var(--color-cyan), transparent 70%)' }}></div>
      
      <div className="mb-4">
        <span className="kicker">brief form</span>
      </div>
      <h3 className="h-display text-4xl sm:text-5xl text-gradient mb-3 uppercase">Let's talk business</h3>
      <p className="text-fg-dim text-sm mb-10 font-mono">Fill in the details below. Send us your project assets and reference links.</p>

      {submitStatus === 'success' && (
        <div className="mb-8 p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-green-300 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-green-400 mt-0.5" />
          <div>
            <h4 className="font-mono text-sm font-semibold text-white uppercase tracking-wider">Inquiry Dispatched</h4>
            <p className="text-xs text-gray-400 mt-1">We will review your files and contact you in 12 hours.</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-300 flex items-start gap-3">
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
          <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-fg-faint" htmlFor="contact-name">Name *</label>
          <div className="glass flex items-center rounded-full px-2 py-1.5 border border-white/5 focus-within:border-white/20 transition-colors">
            <input 
              id="contact-name"
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required
              className="w-full bg-transparent px-5 py-2 text-[0.95rem] text-white placeholder:text-fg-faint focus:outline-none font-mono"
              placeholder="Prem Sawairam"
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-fg-faint" htmlFor="contact-email">Email Address *</label>
          <div className="glass flex items-center rounded-full px-2 py-1.5 border border-white/5 focus-within:border-white/20 transition-colors">
            <input 
              id="contact-email"
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required
              className="w-full bg-transparent px-5 py-2 text-[0.95rem] text-white placeholder:text-fg-faint focus:outline-none font-mono"
              placeholder="abc@gmail.com"
            />
          </div>
        </div>

        {/* Phone & Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-fg-faint" htmlFor="contact-phone">Phone / WhatsApp</label>
            <div className="glass flex items-center rounded-full px-2 py-1.5 border border-white/5 focus-within:border-white/20 transition-colors">
              <input 
                id="contact-phone"
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                className="w-full bg-transparent px-5 py-2 text-[0.95rem] text-white placeholder:text-fg-faint focus:outline-none font-mono"
                placeholder="+91 98989 89898"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-fg-faint" htmlFor="contact-service">Required Service</label>
            <div className="glass flex items-center rounded-full px-5 py-1.5 border border-white/5 focus-within:border-white/20 transition-colors">
              <select 
                id="contact-service"
                name="service" 
                value={formData.service} 
                onChange={handleInputChange}
                className="w-full bg-transparent py-2 text-[0.95rem] text-white focus:outline-none cursor-pointer uppercase font-mono text-xs"
              >
                {servicesList.map((service, idx) => (
                  <option key={idx} value={service} className="bg-[#04050a] text-white uppercase">{service}</option>
                ))}
              </select>
            </div>
          </div>
        </div>


        {/* Message Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-fg-faint" htmlFor="contact-message">Project brief</label>
          <div className="glass flex items-center rounded-2xl px-2 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
            <textarea 
              id="contact-message"
              name="message" 
              value={formData.message} 
              onChange={handleInputChange} 
              required
              rows={4}
              className="w-full bg-transparent px-5 py-2 text-[0.95rem] text-white placeholder:text-fg-faint focus:outline-none resize-none font-mono"
              placeholder="Tell us about your channels, pacing requirements, overlay styles, reference channels..."
            ></textarea>
          </div>
        </div>

        {/* Drag Drop File Uploader */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono font-bold tracking-widest uppercase text-fg-faint">Asset upload (optional)</label>
          
          {!file ? (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`border border-dashed p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-[var(--color-cyan)] bg-[var(--color-cyan)]/5 shadow-[0_0_15px_rgba(76,219,232,0.1)]' 
                  : 'border-white/10 bg-transparent hover:border-white/30'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange}
                accept="video/*,image/*"
                className="hidden" 
              />
              <UploadCloud className="w-8 h-8 text-fg-faint mb-2" />
              <p className="text-xs text-white font-mono uppercase">Drag & drop files or <span className="text-[var(--color-cyan)]">browse</span></p>
              <p className="text-[9px] text-fg-faint mt-1 font-mono uppercase">MP4, MOV, PNG, JPG (Cloudinary Storage)</p>
            </div>
          ) : (
            <div className="border border-white/10 p-4 rounded-xl bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/25 flex items-center justify-center shrink-0">
                  <Film className="w-4 h-4 text-[var(--color-cyan)]" />
                </div>
                <div className="overflow-hidden font-mono text-xs">
                  <p className="text-white truncate">{file.name}</p>
                  <p className="text-[9px] text-fg-dim">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                {uploading ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-[var(--color-cyan)]">{uploadProgress}%</span>
                    <div className="w-16 bg-white/10 h-1 rounded-full overflow-hidden">
                      <div className="bg-[var(--color-cyan)] h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-green-400">UPLOADED</span>
                )}
                
                <button 
                  type="button" 
                  onClick={removeFile}
                  className="p-1 rounded hover:bg-white/10 text-fg-faint hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit button following subtl.cc style */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="btn btn-primary w-full h-[54px] text-[0.95rem] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? 'Dispatching brief...' : 'Send Briefing'}
        </button>

      </form>
    </div>
  );
}
