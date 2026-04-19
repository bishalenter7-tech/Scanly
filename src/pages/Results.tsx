import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanStore } from '../store/scanStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Scan as ScanIcon, Sparkles, ShoppingBag, AlertCircle, Quote, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

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

  const radarData = [
    { subject: 'Health & Safety', x: Number(result.category_scores?.health_safety) || 0 },
    { subject: 'Ingredient Transparency', x: Number(result.category_scores?.ingredient_transparency) || 0 },
    { subject: 'Claim Honesty', x: Number(result.category_scores?.claim_honesty) || 0 },
    { subject: 'Nutritional Value', x: Number(result.category_scores?.nutritional_value) || 0 }
  ];
  
  // Validate radar data values are within 0-100 range
  const validatedRadarData = radarData.map(item => ({
    ...item,
    x: Math.max(0, Math.min(100, item.x))
  }));

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-32">
      <Button variant="ghost" className="mb-4 -ml-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border p-6 flex flex-col lg:flex-row gap-8 mb-8"
      >
        <div className="flex-shrink-0 w-32 h-32 lg:w-48 lg:h-48 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border">
          {imagePreview ? (
            <img src={imagePreview} alt={result.product?.name || 'Product Image'} className="w-full h-full object-cover" />
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
              {result.product_category && (
                <Badge className={`${
                  result.product_category === 'FOOD_DRINK' ? 'bg-green-100 text-green-800' :
                  result.product_category === 'COSMETIC_SKINCARE' ? 'bg-pink-100 text-pink-800' :
                  result.product_category === 'HOUSEHOLD_CHEMICAL' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {result.product_category.replace('_', ' ')}
                </Badge>
              )}
              {result.product?.category && <Badge variant="secondary">{result.product.category}</Badge>}
              {result.product?.country_of_origin && <Badge variant="outline">{result.product.country_of_origin}</Badge>}
            </div>
            {result.ai_confidence && (
              <div className="mt-4 inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                 AI Confidence: {result.ai_confidence}%
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-[#f0fdf4] rounded-2xl min-w-[200px]">
            <SafetyGauge score={result.safety_score || 0} color={getScoreColor(result.safety_score || 0)} />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
          {result.summary && result.summary.length > 0 && (
            <ul className="space-y-3 mb-6">
              {result.summary.map((point: string, i: number) => (
                 <li key={i} className="flex gap-3 text-[#022c22] leading-relaxed">
                    <span className="text-[#16a34a] mt-1">•</span> {point}
                 </li>
              ))}
            </ul>
          )}
          {result.health_note && (
            <div className="p-4 bg-white rounded-xl border border-[#16a34a]/10">
               <p className="font-bold text-sm text-[#064e3b] mb-1">Health Note:</p>
               <p className="text-sm text-gray-700">{result.health_note}</p>
            </div>
          )}
        </motion.div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-20px" }}
        >
          <Card className="shadow-sm border-gray-200">
             <CardContent className="p-6">
                <h3 className="font-bold text-[#064e3b] mb-2 text-center">Category Scores</h3>
                 <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="70%" data={validatedRadarData}>
                       <PolarGrid stroke="#e5e7eb" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 600 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                       <Radar
                         name="Score"
                         dataKey="x"
                         stroke="#16a34a"
                         fill="#16a34a"
                         fillOpacity={0.4}
                       />
                     </RadarChart>
                   </ResponsiveContainer>
                 </div>
             </CardContent>
          </Card>
        </motion.div>

        {/* UNIFIED Usage & Safety Guidelines - Dynamic based on product category */}
        {result.usage_and_safety_guidelines && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className={`shadow-sm overflow-hidden h-full ${
              result.product_category === 'FOOD_DRINK' ? 'border-green-200' :
              result.product_category === 'COSMETIC_SKINCARE' ? 'border-pink-200' :
              result.product_category === 'HOUSEHOLD_CHEMICAL' ? 'border-purple-200' :
              'border-gray-200'
            }`}>
                <div className={`p-6 border-b ${
                  result.product_category === 'FOOD_DRINK' ? 'bg-gradient-to-r from-green-50 to-transparent border-green-100' :
                  result.product_category === 'COSMETIC_SKINCARE' ? 'bg-gradient-to-r from-pink-50 to-transparent border-pink-100' :
                  result.product_category === 'HOUSEHOLD_CHEMICAL' ? 'bg-gradient-to-r from-purple-50 to-transparent border-purple-100' :
                  'bg-gradient-to-r from-gray-50 to-transparent border-gray-100'
                }`}>
                  <h3 className={`font-bold flex items-center gap-2 ${
                    result.product_category === 'FOOD_DRINK' ? 'text-green-800' :
                    result.product_category === 'COSMETIC_SKINCARE' ? 'text-pink-800' :
                    result.product_category === 'HOUSEHOLD_CHEMICAL' ? 'text-purple-800' :
                    'text-gray-800'
                  }`}>
                    <ShieldCheck className="h-5 w-5" /> 
                    {result.product_category === 'FOOD_DRINK' ? 'Food & Nutrition Guide' :
                     result.product_category === 'COSMETIC_SKINCARE' ? 'Skin Safety & Usage Guide' :
                     result.product_category === 'HOUSEHOLD_CHEMICAL' ? 'Safe Handling Guide' :
                     'Product Safety Guide'}
                  </h3>
                </div>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                    {/* FOOD_DRINK fields */}
                    {result.product_category === 'FOOD_DRINK' && (
                      <>
                        <div className="p-5">
                          <h4 className="font-bold text-green-700 mb-2 flex items-center gap-1">✅ Good Points</h4>
                          <p className="text-sm text-gray-700">{result.usage_and_safety_guidelines?.what_to_eat || 'Not specified'}</p>
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-red-700 mb-2 flex items-center gap-1">⚠️ Concerns</h4>
                          <p className="text-sm text-gray-700">{result.usage_and_safety_guidelines?.what_not_to_eat || 'Not specified'}</p>
                        </div>
                      </>
                    )}
                    
                    {/* COSMETIC_SKINCARE fields */}
                    {result.product_category === 'COSMETIC_SKINCARE' && (
                      <>
                        <div className="p-5">
                          <h4 className="font-bold text-green-700 mb-2 flex items-center gap-1">✅ Skin Safe</h4>
                          <p className="text-sm text-gray-700">{result.usage_and_safety_guidelines?.skin_safety || result.usage_and_safety_guidelines?.proper_usage || 'Not specified'}</p>
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-1">⚠️ Allergy Alert</h4>
                          <p className="text-sm text-gray-700">{result.usage_and_safety_guidelines?.allergy_risks || 'No specific allergens'}</p>
                        </div>
                      </>
                    )}
                    
                    {/* HOUSEHOLD_CHEMICAL fields */}
                    {result.product_category === 'HOUSEHOLD_CHEMICAL' && (
                      <>
                        <div className="p-5">
                          <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-1">⚠️ Handle With Care</h4>
                          <p className="text-sm text-gray-700">{result.usage_and_safety_guidelines?.handling_safety || result.usage_and_safety_guidelines?.caution_warnings || 'Not specified'}</p>
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-1">📦 Storage</h4>
                          <p className="text-sm text-gray-700">{result.usage_and_safety_guidelines?.storage_requirements || 'Not specified'}</p>
                        </div>
                      </>
                    )}
                    
                    {/* OTHER category */}
                    {result.product_category === 'OTHER' && (
                      <>
                        <div className="p-5">
                          <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-1">ℹ️ General Safety</h4>
                          <p className="text-sm text-gray-700">{result.usage_and_safety_guidelines?.general_safety || 'Not specified'}</p>
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-1">⚠️ Warnings</h4>
                          <p className="text-sm text-gray-700">{result.usage_and_safety_guidelines?.material_warnings || result.usage_and_safety_guidelines?.caution_warnings || 'None'}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Disposal/Environmental for applicable categories */}
                  {(result.usage_and_safety_guidelines?.disposal_info || result.usage_and_safety_guidelines?.environmental_impact) && (
                    <div className={`p-5 ${
                      result.product_category === 'HOUSEHOLD_CHEMICAL' ? 'bg-purple-50' :
                      result.product_category === 'OTHER' ? 'bg-gray-50' : 'bg-green-50'
                    }`}>
                      <h4 className="font-bold text-sm mb-1 flex items-center gap-1">
                        {result.product_category === 'HOUSEHOLD_CHEMICAL' ? '♻️ Disposal' : '🌍 Environmental'}
                      </h4>
                      <p className="text-sm">
                        {result.usage_and_safety_guidelines?.disposal_info || result.usage_and_safety_guidelines?.environmental_impact}
                      </p>
                    </div>
                  )}
                </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {result.online_alternatives && result.online_alternatives.length > 0 && (
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
                {result.online_alternatives && result.online_alternatives.map((alt: string, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="shadow-sm border-[#16a34a]/20 hover:shadow-md transition-shadow h-full">
                       <CardContent className="p-5 flex gap-3 pb-6">
                          <div className="w-10 h-10 bg-[#f0fdf4] rounded-full flex items-center justify-center flex-shrink-0 text-[#16a34a] font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-sm font-medium text-gray-800 pt-1 leading-snug">{alt || 'Alternative product'}</p>
                       </CardContent>
                    </Card>
                  </motion.div>
                ))}
             </div>
         </motion.div>
      )}

      {result.claims && result.claims.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[#064e3b] mb-6">Marketing Claims vs. Reality</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.claims && result.claims.map((claim: any, idx: number) => (
                 <motion.div
                   initial={{ opacity: 0, scale: 0.95, y: 20 }}
                   whileInView={{ opacity: 1, scale: 1, y: 0 }}
                   viewport={{ once: true, margin: "-20px" }}
                   transition={{ delay: Math.min(idx * 0.1, 0.4) }}
                   key={idx}
                   className="bg-white rounded-xl border p-5 shadow-sm"
                 >
                   <p className="text-gray-500 italic text-sm mb-4">"{claim.claim_text || ''}"</p>
                   <div className="mb-3">
                     {claim.verdict === 'TRUE' && <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs px-2 py-1">✅ TRUE</Badge>}
                     {claim.verdict === 'MISLEADING' && <Badge className="bg-amber-500 text-white hover:bg-amber-600 text-xs px-2 py-1">⚠️ MISLEADING</Badge>}
                     {claim.verdict === 'FALSE' && <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs px-2 py-1">❌ FALSE</Badge>}
                   </div>
                   <p className="text-sm font-medium text-gray-800 leading-relaxed">{claim.explanation || 'No explanation provided'}</p>
                 </motion.div>
              ))}
            </div>
          </div>
       )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#064e3b] mb-6">Components & Ingredients</h2>
          <div className="space-y-4">
            {result.components_or_ingredients && result.components_or_ingredients.map((ing: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10px" }}
                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                key={idx}
              >
                <IngredientCard ingredient={ing} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
            >
              <Card className="shadow-sm">
                <CardContent className="p-6">
                   <h3 className="font-bold text-[#064e3b] mb-6">Additive Breakdown</h3>
                   {result.safety_breakdown && (
                     <div className="space-y-5">
                        <BreakdownBar label="Sugar Level" value={Number(result.safety_breakdown.sugar_level) || 0} invertColor />
                        <BreakdownBar label="Sodium Level" value={Number(result.safety_breakdown.sodium_level) || 0} invertColor />
                        <BreakdownBar label="Preservatives" value={Number(result.safety_breakdown.preservatives_level) || 0} invertColor />
                        <BreakdownBar label="Artificial Additives" value={Number(result.safety_breakdown.artificial_additives_level) || 0} invertColor />
                        <BreakdownBar label="Allergen Risk" value={Number(result.safety_breakdown.allergen_risk) || 0} invertColor />
                     </div>
                   )}
                </CardContent>
              </Card>
            </motion.div>

           {result.warnings && result.warnings.length > 0 && (
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: "-20px" }}
               transition={{ delay: 0.1 }}
             >
               <Card className="shadow-sm border-red-100">
                 <CardContent className="p-6">
                    <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2"><AlertCircle size={20} /> Detected Alerts</h3>
                    <div className="flex flex-col gap-3">
                      {result.warnings.map((warn: any, idx: number) => (
                         <WarningBadge key={idx} warning={warn} />
                      ))}
                    </div>
                 </CardContent>
               </Card>
             </motion.div>
           )}
        </div>
      </div>

       <div className="mt-8 pt-8 border-t space-y-6">
          {result.sources && result.sources.length > 0 && (
            <div className="flex flex-col gap-2">
               <span className="text-sm font-bold text-[#064e3b]">Sources & References:</span>
               <div className="flex flex-wrap gap-2">
                 {result.sources.map((src: string, i: number) => {
                   if (!src) return null;
                   const isUrl = src.startsWith('http');
                   if (isUrl) {
                     try {
                       const url = new URL(src);
                       const hostname = url.hostname.replace('www.', '');
                       const path = url.pathname;
                       // Truncate display: show hostname + first path segment, max 40 chars
                       const displayUrl = path ? `${hostname}${path.length > 30 ? path.substring(0, 30) + '...' : path}` : hostname;
                       return (
                         <a 
                           key={i} 
                           href={src} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="text-xs bg-white border border-[#16a34a]/20 text-[#16a34a] hover:bg-[#16a34a] hover:text-white transition-colors px-3 py-1.5 rounded-full inline-flex items-center gap-1 shadow-sm truncate max-w-[200px]"
                           title={src}
                         >
                           {displayUrl} <Share2 size={10} className="flex-shrink-0" />
                         </a>
                       );
                     } catch (e) {
                       // Invalid URL, fallback to text badge
                       return (
                         <Badge key={i} variant="outline" className="text-xs text-gray-500 bg-gray-50 font-medium px-3 py-1 truncate max-w-[200px]">
                           {src.substring(0, 50)}{src.length > 50 ? '...' : ''}
                         </Badge>
                       );
                     }
                   }
                   return (
                     <Badge key={i} variant="outline" className="text-xs text-gray-500 bg-gray-50 font-medium px-3 py-1">{src}</Badge>
                   );
                 })}
               </div>
            </div>
          )}
         <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded-xl border border-gray-100">
           ⚠️ This Scanly analysis is generated by AI and is for informational purposes only. It is not medical advice, nutritional guidance, or a substitute for professional consultation. Accuracy may vary. Always read product labels directly.
         </p>
      </div>

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

function BreakdownBar({ label, value, invertColor = false }: { label: string, value: number, invertColor?: boolean }) {
  let indicatorColor = "bg-green-500";
  if (invertColor) {
    if (value > 60) indicatorColor = "bg-red-500";
    else if (value > 30) indicatorColor = "bg-amber-500";
  } else {
    if (value < 40) indicatorColor = "bg-red-500";
    else if (value < 70) indicatorColor = "bg-amber-500";
  }

  return (
    <div>
      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1.5">
        <span>{label}</span>
        <span className="text-gray-400 text-xs">{value}/100</span>
      </div>
      <Progress value={value} indicatorColor={indicatorColor} className="h-2" />
    </div>
  );
}

function WarningBadge({ warning }: { warning: any; key?: any }) {
  let styles = "bg-gray-100 text-gray-600 border-gray-200";
  let icon = "ℹ️";
  if (warning.severity === 'high') {
    styles = "bg-red-50 text-red-700 border-red-200";
    icon = "🔴";
  } else if (warning.severity === 'medium') {
    styles = "bg-amber-50 text-amber-700 border-amber-200";
    icon = "⚠️";
  }

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${styles}`}>
      <span className="text-sm pt-0.5">{icon}</span>
      <div className="flex-1">
         <div className="font-semibold text-sm">{warning.type || 'Warning'}</div>
         <div className="text-xs mt-0.5 leading-snug opacity-90">{warning.message || 'No details'}</div>
      </div>
    </div>
  );
}

function IngredientCard({ ingredient }: { ingredient: any }) {
  if (!ingredient) return null;
  
  let colorClass = "border-gray-400";
  let impactIcon = "⚪";
  let impactLabel = "Neutral";
   
  if (ingredient.health_impact === 'beneficial') {
    colorClass = "border-green-500"; impactIcon = "✅"; impactLabel = "Beneficial";
  } else if (ingredient.health_impact === 'caution') {
    colorClass = "border-amber-500"; impactIcon = "⚠️"; impactLabel = "Caution";
  } else if (ingredient.health_impact === 'avoid') {
    colorClass = "border-red-500"; impactIcon = "🚫"; impactLabel = "Avoid";
  }

  return (
    <Card className={`border-l-4 overflow-hidden ${colorClass}`}>
      {ingredient.is_flagged && (
        <div className="bg-amber-50 text-amber-800 text-xs px-4 py-2 font-medium border-b border-amber-100">
           ⚠️ {ingredient.flag_reason || 'Flagged for concern'}
        </div>
      )}
      <CardContent className="p-0">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h4 className="font-bold text-gray-900">{ingredient.simplified_name || 'Unknown Ingredient'}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{ingredient.original_name || ''}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="text-xs bg-gray-50">{ingredient.function || 'Unknown'}</Badge>
              <div className="flex items-center text-xs font-medium gap-1 text-gray-600">
                <span>{impactIcon}</span> <span>{impactLabel}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{ingredient.explanation || 'No explanation available'}</p>
          
          {ingredient.detail && (
          <details className="group">
            <summary className="text-xs font-semibold text-[#16a34a] cursor-pointer hover:underline outline-none list-none">
              <span className="flex items-center gap-1 group-open:hidden">See more <span>↓</span></span>
              <span className="flex items-center gap-1 hidden group-open:flex">See less <span>↑</span></span>
            </summary>
            <div className="mt-3 text-xs text-gray-600 bg-[#f0fdf4] p-3 rounded-md border border-[#16a34a]/10 leading-relaxed">
              {ingredient.detail}
            </div>
          </details>
          )}
        </div>
      </CardContent>
    </Card>
  );
}