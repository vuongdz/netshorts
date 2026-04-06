import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-[#0f0f0f] pt-16 pb-8 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
         
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 text-center md:text-left">© 2026 Developed by VuongDev</p>
          <div className="flex space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;