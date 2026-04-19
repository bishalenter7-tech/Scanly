import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanStore } from '../store/scanStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Scan as ScanIcon, Sparkles, ShoppingBag, Leaf, AlertCircle, Quote, Globe, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function Results() {
  const navigate = useNavigate();
  const result = useScanStore((state) => state.result);
  const imagePreview = useScanStore((state) => state.imagePreview);
  const reset = useScanStore((state) => state.reset);

  useEffect(() => {
    if (!result) {
      navigate('/scan');
    }
  }, [result, navigate]);

  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 86) return '#22C55E';
    if (score >= 71) return '#84CC16';
    if (score >= 41) return '#F59E0B';
    return '#EF4444';
  };

  const getQualityBadge = (quality: string) => {
    const q = quality?.toLowerCase();
    if (q === 'good' || q === 'excellent') {
      return <Badge className="bg-green-500 text-white text-xs">✅ Good</Badge>;
    }
    if (q === 'medium' || q === 'moderate') {
      return <Badge className="bg-amber-500 text-white text-xs">⚠️ Moderate</Badge>;
    }
    return <Badge className="bg-red-500 text-white text-xs">🚫 Poor</Badge>;
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-32">
      <Button variant="ghost" className="mb-4 -ml-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {/* Section A: Product Identity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border p-6 flex flex-col lg:flex-row gap-8 mb-8"
      >
        <div className="flex-shrink-0 w-32 h-32 lg:w-48 lg:h-48 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border">
          {imagePreview ? (
            <img src={imagePreview} alt={result.product?.name || 'Product'} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-300">No Image</div>
          )}
        </div>
        <div className="flex-1 flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-bold text-[#022c22] leading-tight">{result.product?.name || 'Unknown Product'}</h1>
                <p className="text-lg text-gray-500 font-medium mt-1">{result.product?.brand || 'Unknown Brand'}</p>
              </div>
              {result.recommendation && (
                <div className="flex-shrink-0 w-full md:w-auto">
                  <div className={`inline-flex rounded-full text-xs font-bold px-3 py-1.5 break-words whitespace-normal text-white ${result.recommendation === 'BUY' ? 'bg-[#22c55e]' : result.recommendation === 'AVOID' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'}`}>
                    AI Verdict: {result.recommendation}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {result.product?.category && <Badge variant="secondary">{result.product.category}</Badge>}
              {result.product?.country_of_origin && <Badge variant="outline">{result.product.country_of_origin}</Badge>}
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-[#f0fdf4] rounded-2xl min-w-[200px]">
            <SafetyGauge score={result.safety_score || 0} color={getScoreColor(result.safety_score || 0)} />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 p-6 bg-[#16a34a]/5 border border-[#16a34a]/20 rounded-2xl"
        >
          <h2 className="font-semibold text-[#064e3b] mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#16a34a]" /> Scanly Analysis Summary
          </h2>
          {result.summary && (
            <p className="text-[#022c22] leading-relaxed">{result.summary}</p>
          )}
        </motion.div>

        {/* Translation Card */}
        {result.translation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white border rounded-2xl shadow-sm flex flex-col"
          >
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Quote className="h-4 w-4 text-blue-500" /> Label Translation
            </h2>
            <div className="flex-1 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 italic border border-gray-100 overflow-y-auto max-h-[250px] custom-scrollbar">
              {result.translation}
            </div>
          </motion.div>
        )}
      </div>

      {/* Alternatives */}
      {result.alternatives && result.alternatives.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-[#064e3b] mb-6 flex items-center gap-2">
            <ShoppingBag className="text-[#16a34a]" /> Healthier Alternatives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.alternatives.map((alt: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="shadow-sm border-[#16a34a]/20 hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#f0fdf4] rounded-full flex items-center justify-center flex-shrink-0 text-[#16a34a] font-bold text-sm">
                        {idx + 1}
                      </div>
                      {getQualityBadge(alt.quality)}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{alt.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{alt.reason}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Ingredients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#064e3b] mb-6">What's Inside — Decoded</h2>
          <div className="space-y-4">
            {result.ingredients && result.ingredients.map((ing: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10px" }}
                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
              >
                <IngredientCard ingredient={ing} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimers & Sources */}
      <div className="mt-8 pt-8 border-t space-y-6">
        {result.sources && result.sources.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#064e3b]">Sources & References:</span>
            <div className="flex flex-wrap gap-2">
              {result.sources.map((src: any, i: number) => (
                <a 
                  key={i} 
                  href={src.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs bg-white border border-[#16a34a]/20 text-[#16a34a] hover:bg-[#16a34a] hover:text-white transition-colors px-3 py-1.5 rounded-full inline-flex items-center gap-1 shadow-sm"
                >
                  {src.name || new URL(src.url).hostname.replace('www.', '')} <ExternalLink size={10} />
                </a>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded-xl border border-gray-100">
          ⚠️ This analysis is generated by Scanly AI and is for informational purposes only. It is not medical advice, nutritional guidance, or a substitute for professional consultation. Accuracy may vary. Always read product labels directly and consult a qualified professional for health-related decisions.
        </p>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-5xl mx-auto flex gap-4">
          <Button className="flex-1 bg-[#16a34a] hover:bg-[#15803d] h-12 shadow-lg shadow-[#16a34a]/20 rounded-xl font-bold" onClick={() => { reset(); navigate('/scan'); }}>
            <ScanIcon className="mr-2 h-5 w-5" /> Scan Another Product
          </Button>
        </div>
      </div>
    </div>
  );
}

// Subcomponents

function SafetyGauge({ score, color }: { score: number, color: string }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let label = "Caution";
  if (score >= 86) label = "Excellent";
  else if (score >= 71) label = "Good";
  else if (score >= 41) label = "Moderate";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="12" />
          <motion.circle 
            cx="70" cy="70" r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth="12" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="relative text-center flex flex-col items-center">
          <span className="text-4xl font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Score</div>
        <div className="text-sm font-medium" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

function IngredientCard({ ingredient }: { ingredient: any }) {
  let colorClass = "border-l-green-500 bg-green-50";
  let impactIcon = "⚪";
  let impactLabel = "Neutral";
  
  const impact = ingredient.health_impact?.toLowerCase();
  if (impact === 'beneficial' || impact === 'good' || impact === 'healthy') {
    colorClass = "border-l-green-500 bg-green-50"; impactIcon = "✅"; impactLabel = "Beneficial";
  } else if (impact === 'caution' || impact === 'moderate') {
    colorClass = "border-l-amber-500 bg-amber-50"; impactIcon = "⚠️"; impactLabel = "Caution";
  } else if (impact === 'avoid' || impact === 'harmful' || impact === 'poor') {
    colorClass = "border-l-red-500 bg-red-50"; impactIcon = "🚫"; impactLabel = "Avoid";
  }

  return (
    <Card className={`border-l-4 overflow-hidden ${colorClass}`}>
      <CardContent className="p-0">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h4 className="font-bold text-gray-900">{ingredient.name}</h4>
            </div>
            <div className="flex items-center text-xs font-medium gap-1 text-gray-600">
              <span>{impactIcon}</span> <span>{impactLabel}</span>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{ingredient.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}