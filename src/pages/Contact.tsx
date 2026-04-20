import { motion } from 'framer-motion';
import { Mail, Instagram, Youtube, Linkedin } from 'lucide-react';

export default function Contact() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-3xl mx-auto w-full px-4 py-12"
    >
      <h1 className="text-3xl font-bold text-[#064e3b] mb-8 text-center">Contact Us</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mb-4">
            <Mail size={32} className="text-[#16a34a]" />
          </div>
          <h2 className="text-xl font-bold text-[#064e3b] mb-2">Contact Support</h2>
          <p className="text-gray-600 mb-4">
            Have questions or need help? Reach out to us at:
          </p>
          <a 
            href="mailto:bishalenter7@gmail.com" 
            className="text-[#16a34a] font-semibold text-lg hover:underline"
          >
            bishalenter7@gmail.com
          </a>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#064e3b] mb-6 text-center">Follow Us</h2>
        <p className="text-gray-600 text-center mb-6">
          Stay connected with us on social media
        </p>
        
        <div className="flex justify-center gap-4">
          <a 
            href="https://www.instagram.com/sempai.devfo?utm_source=qr&igsh=MXUzbWlrMGVmMnF3eA==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
          >
            <Instagram size={24} />
          </a>
          
          <a 
            href="https://www.youtube.com/@Semapi-r5c" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
          >
            <Youtube size={24} />
          </a>
          
          <a 
            href="https://www.linkedin.com/in/bisal-paul-20ab513a5?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-14 h-14 bg-[#0077b5] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
          >
            <Linkedin size={24} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}