import { useEffect } from 'react';
import { useScanStore } from '../store/scanStore';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScanSearch, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function History() {
  const history = useScanStore((state) => state.history);
  const removeOldHistory = useScanStore((state) => state.removeOldHistory);
  const clearHistory = useScanStore((state) => state.clearHistory);
  const setResult = useScanStore((state) => state.setResult);
  const navigate = useNavigate();

  useEffect(() => {
    // Cleanup 7 day old history on load
    removeOldHistory();
  }, [removeOldHistory]);

  const viewResult = (result: any, imageBase64?: string) => {
    setResult(result);
    // Explicitly update scanStore image to history item's image
    useScanStore.getState().setImage(imageBase64 || null);
    navigate('/results');
  };

  if (history.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-6"
      >
        <div className="w-24 h-24 bg-white shadow-xl shadow-[#16a34a]/10 rounded-full flex items-center justify-center mb-2 border border-[#16a34a]/10">
           <ScanSearch className="h-10 w-10 text-[#16a34a]/60" />
        </div>
        <h2 className="text-2xl font-bold text-[#064e3b]">No scan history</h2>
        <p className="text-gray-500">Your recent scans will appear here. Scans are saved securely on your device for 7 days.</p>
        <Button onClick={() => navigate('/scan')} className="bg-[#16a34a] hover:bg-[#15803d] w-full h-12 shadow-lg shadow-[#16a34a]/20 rounded-xl">
          Start Scanning
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full px-4 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#064e3b]">Scan History</h1>
          <p className="text-sm text-gray-500 mt-1">Stored locally for 7 days. Backed up to Cloud if logged in.</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearHistory} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 rounded-lg">
           <Trash2 className="h-4 w-4 mr-2" /> Clear All
        </Button>
      </div>

      <motion.div 
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } }}}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {history.map((item) => {
          const score = item.result.safety_score;
          let colorClass = "bg-green-100 text-green-800 border-green-200";
          if (score < 41) colorClass = "bg-red-100 text-red-800 border-red-200";
          else if (score < 71) colorClass = "bg-amber-100 text-amber-800 border-amber-200";

          return (
            <motion.div 
              key={item.id}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className="h-full overflow-hidden shadow-sm hover:shadow-[0_12px_30px_rgb(91,71,204,0.1)] border-[#16a34a]/10 transition-all cursor-pointer flex flex-col" onClick={() => viewResult(item.result, item.imageBase64)}>
                {/* Image Section */}
                <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                   {item.imageBase64 ? (
                      <img src={item.imageBase64} alt={item.result.product.name} className="w-full h-full object-cover" />
                   ) : (
                      <span className="text-xs text-gray-300">No Image</span>
                   )}
                </div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                   <div className="flex justify-between items-start">
                      <Badge className={`font-bold px-2 py-1 shadow-sm ${colorClass}`}>
                         {score}/100
                      </Badge>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                   </div>
                   <div className="mt-2">
                     <h3 className="font-bold text-gray-900 leading-tight line-clamp-1">{item.result.product.name}</h3>
                     <p className="text-sm text-gray-500 truncate mt-1">{item.result.product.brand}</p>
                   </div>
                   <Badge variant="secondary" className="w-fit text-xs mt-auto bg-gray-100 text-gray-600">
                     {item.result.product.category}
                   </Badge>
                </div>
                <div className="bg-[#f0fdf4]/50 px-5 py-3 border-t border-[#16a34a]/5 flex justify-end items-center text-[#16a34a] text-sm font-semibold">
                   View Report <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
