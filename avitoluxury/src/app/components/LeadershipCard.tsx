import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

interface LeadershipProps {
  name: string;
  title: string;
  image: string;
  bio: string;
}

export default function LeadershipCard({ name, title, image, bio }: LeadershipProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Handle card 3D tilt effect based on mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setMousePosition({ x: rotateY, y: rotateX });
  };
  
  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node) && showDetails) {
        setShowDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDetails]);

  // Prevent body scrolling when popup is open
  useEffect(() => {
    if (showDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetails]);

  return (
    <>
      <div 
        ref={cardRef}
        className="text-center cursor-pointer transition-all duration-300 ease-out group relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setShowDetails(true)}
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="relative mb-4 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-300/30 to-blue-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-yellow-300/30 to-pink-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 mix-blend-overlay"></div>
          <img 
            src={image} 
            alt={name}
            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 z-0"></div>
        </div>
        
        <h3 className="text-lg font-bold">{name}</h3>
        <p className="text-gray-600">{title}</p>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              ref={detailsRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(false);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-100 z-10 bg-white/80 rounded-full p-2"
                aria-label="Close"
              >
                <IoClose size={24} />
              </button>
              
              <div className="md:w-2/5 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6 sticky top-0">
                <div className="w-full max-w-xs aspect-square overflow-hidden rounded-full mb-6 border-4 border-white/10 shadow-xl">
                  <img 
                    src={image} 
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-bold text-white text-center">{name}</h2>
                <p className="text-gray-300 text-center">{title}</p>
              </div>
              
              <div className="md:w-3/5 p-6 md:p-8 overflow-y-auto">
                <div className="prose prose-sm md:prose-base max-w-none">
                  <div className="whitespace-pre-line">{bio}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 