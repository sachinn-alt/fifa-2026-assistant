/**
 * AI Service Module - FIFA 2026 Nexus
 * Handles intelligent interaction, incident parsing, crowd flow predictions,
 * simulated multilingual translation, itinerary generation, and sentiment analysis.
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Translation database for high-fidelity multilingual simulation
const TRANSLATIONS = {
  en: {
    welcome: "Welcome to FIFA 2026 Nexus! I'm your AI Concierge. I speak multiple languages. Ask me about concessions, navigation, sustainability, or accessibility!",
    food_veg: "The nearest vegetarian options are at 'Green Pitch', located in Block 104, Level 1. Current wait time is estimated at 5 minutes.",
    food_halal: "Halal options are available at 'Hub Concessions' in Block 202 and 'Global Eats' in Block 308. All ingredients are certified.",
    bathroom: "The closest restrooms are 50 meters to your left, near Gate B. The queue is light (approx. 2 min wait).",
    transport: "To minimize your carbon footprint, we recommend taking Metro Line 2. The next train departs in 12 minutes. Shuttle buses are also active from Lot B.",
    access_toilet: "Wheelchair-accessible restrooms are located in Block 104 and Block 202, adjacent to the elevator lobbies. They feature automated doors and call buttons.",
    sensory: "A dedicated Sensory Room is located in Block 205, Level 2. It offers soundproofing, soft lighting, and calming activities for sensory-sensitive fans.",
    waste: "Help us reach net-zero! Dispose of food leftovers and paper packaging in the GREEN compost bin. Recyclables (bottles, cups) go in the BLUE bin, and landfill in the GREY bin.",
    gate_c: "To reach Gate C, exit Sector 104, turn left onto the outer concourse, and follow the green arrows. Walking time is approximately 4 minutes.",
    default: "I'm your FIFA 2026 Nexus Assistant! I can help you find amenities, get green navigation routes, or check queue times. How can I assist you today?"
  },
  es: {
    welcome: "¡Bienvenido a FIFA 2026 Nexus! Soy tu conserje de IA. Hablo varios idiomas. ¡Pregúntame sobre comida, navegación, sustentabilidad o accesibilidad!",
    food_veg: "Las opciones vegetarianas más cercanas están en 'Green Pitch', ubicado en el Bloque 104, Nivel 1. El tiempo de espera es de 5 minutos.",
    food_halal: "Opciones Halal en 'Hub Concessions' en el Bloque 202 y 'Global Eats' en el Bloque 308. Todos los ingredientes están certificados.",
    bathroom: "Los baños más cercanos están a 50 metros a tu izquierda, cerca de la Puerta B. La fila es corta (aprox. 2 minutos de espera).",
    transport: "Para reducir tu huella de carbono, recomendamos tomar la Línea 2 del Metro. Próximo tren en 12 minutos. Los autobuses lanzadera salen del Lote B.",
    access_toilet: "Los baños accesibles están en los Bloques 104 y 202, junto a los ascensores. Cuentan con puertas automáticas y botones de asistencia.",
    sensory: "La Sala Sensorial está en el Bloque 205, Nivel 2. Cuenta con aislamiento acústico, luces tenues y actividades de relajación.",
    waste: "¡Ayúdanos a lograr cero residuos! Desecha comida y papel en el contenedor VERDE. Reciclables en el AZUL y desechos generales en el GRIS.",
    gate_c: "Para ir a la Puerta C, sal del Sector 104, gira a la izquierda en el pasillo exterior y sigue las flechas verdes. Tiempo aproximado: 4 minutos.",
    default: "¡Soy tu asistente de FIFA 2026 Nexus! Te ayudo a ubicar servicios, rutas ecológicas y tiempos de fila. ¿En qué te ayudo hoy?"
  },
  fr: {
    welcome: "Bienvenue sur FIFA 2026 Nexus! Je suis votre concierge IA. Je parle plusieurs langues. Posez-moi des questions sur les concessions, l'accessibilité ou le transport!",
    food_veg: "Les options végétariennes les plus proches se trouvent au 'Green Pitch', Bloc 104, Niveau 1. Attente estimée à 5 minutes.",
    food_halal: "Les options Halal sont disponibles chez 'Hub Concessions' (Bloc 202) et 'Global Eats' (Bloc 308). Ingrédients certifiés.",
    bathroom: "Les toilettes les plus proches sont à 50 mètres sur votre gauche, près de la Porte B. La file d'attente est très fluide.",
    transport: "Pour réduire votre empreinte carbone, prenez la ligne 2 du métro. Prochain départ dans 12 minutes. Navettes disponibles au Parking B.",
    access_toilet: "Des toilettes accessibles aux fauteuils roulants se trouvent aux Blocs 104 et 202, près des ascenseurs, avec portes automatiques.",
    sensory: "Une salle sensorielle est située au Bloc 205, Niveau 2, offrant insonorisation, lumière douce et calme pour les personnes sensibles.",
    waste: "Aidez-nous! Jetez les restes et cartons dans le bac VERT (compost). Les bouteilles/gobelets vont dans le bac BLEU, le reste dans le bac GRIS.",
    gate_c: "Pour rejoindre la Porte C, sortez du Secteur 104, tournez à gauche et suivez les flèches vertes. Environ 4 minutes de marche.",
    default: "Je suis votre assistant FIFA 2026 Nexus! Je peux vous guider, trouver des concessions écologiques ou vérifier les files d'attente."
  },
  ar: {
    welcome: "مرحباً بكم في FIFA 2026 Nexus! أنا المساعد الذكي الخاص بك. يمكنني مساعدتك في العثور على الأطعمة، التنقل، الاستدامة، أو سهولة الوصول.",
    food_veg: "تتوفر خيارات نباتية في 'Green Pitch' في المربع 104، الطابق الأول. وقت الانتظار المقدر هو 5 دقائق.",
    food_halal: "الأطعمة الحلال متوفرة في 'Hub Concessions' في المربع 202 و 'Global Eats' في المربع 308. جميع المكونات معتمدة.",
    bathroom: "أقرب دورات مياه على بعد 50 متراً إلى يسارك، بالقرب من البوابة B. الانتظار خفيف جداً.",
    transport: "لتقليل الانبعاثات الكربونية، ننصح باستخدام خط المترو 2. القطار التالي يصل خلال 12 دقيقة. حافلات النقل نشطة من الموقف B.",
    access_toilet: "دورات المياه المخصصة للكراسي المتحركة تقع في المربع 104 والمربع 202 بجوار المصاعد. وتتميز بأبواب تلقائية وأزرار نداء.",
    sensory: "غرفة الحث الحسي تقع في المربع 205، الطابق الثاني. توفر عزلًا صوتيًا وإضاءة خافتة وأنشطة مهدئة.",
    waste: "ساعدنا في حماية البيئة! ضع بقايا الطعام والورق في الحاوية الخضراء، والمواد القابلة لإعادة التدوير في الزرقاء، والنفايات الأخرى في الرمادية.",
    gate_c: "للوصول إلى البوابة C، اخرج من القطاع 104، اتجه يساراً واتبع الأسهم الخضراء. مسافة المشي حوالي 4 دقائق.",
    default: "أنا مساعدك الذكي في FIFA 2026 Nexus! يمكنني مساعدتك في العثور على الخدمات، أو التحقق من طوابير الانتظار. كيف يمكنني مساعدتك اليوم؟"
  },
  ja: {
    welcome: "FIFA 2026 Nexusへようこそ！私はAIコンシェルジュです。飲食、ナビゲーション、環境への取り組み、アクセシビリティについてお尋ねください！",
    food_veg: "最寄りのベジタリアン料理はブロック104の1階「Green Pitch」にあります。現在の待ち時間は約5分です。",
    food_halal: "ハラールフードはブロック202の「Hub Concessions」およびブロック308の「Global Eats」で提供されています。すべて認証済みです。",
    bathroom: "最寄りのトイレは左へ50メートル、ゲートBの近くにあります。現在列は非常に短いです（待ち時間約2分）。",
    transport: "エコ移動のために地下鉄2号線をお勧めします。次の電車は12分後に出発します。駐車場Bからシャトルバスも運行中です。",
    access_toilet: "車椅子対応トイレはブロック104およびブロック202のエレベーターホール横にあります。自動ドアと非常ボタンを完備しています。",
    sensory: "センサリールーム（感覚過敏の方向け）はブロック205の2階にあります。防音対策、調光照明、リラックスできるツールを備えています。",
    waste: "ゴミゼロにご協力ください！食べ残しや紙パックは「緑色」のコンポスト用へ。プラスチックやカップは「青色」の回収箱へ、その他は「灰色」へ。",
    gate_c: "ゲートCへは、セクター104を出て左折し、外通路の緑色の矢印に従ってください。徒歩約4分です。",
    default: "FIFA 2026 Nexusアシスタントです！施設案内、エコルートの検索、混雑状況の確認などをお手伝いします。どのようなご用件でしょうか？"
  }
};

// Simple semantic matching utility for fan queries
function matchQueryKey(prompt) {
  const lower = prompt.toLowerCase();
  
  if (lower.includes("halal") || lower.includes("muslim")) return "food_halal";
  if (lower.includes("veg") || lower.includes("vegetarian") || lower.includes("vegan") || lower.includes("meat-free") || lower.includes("eat")) return "food_veg";
  if (lower.includes("bathroom") || lower.includes("restroom") || lower.includes("toilet") || lower.includes("wc") || lower.includes("lavatory")) return "bathroom";
  if (lower.includes("metro") || lower.includes("train") || lower.includes("bus") || lower.includes("transport") || lower.includes("transit") || lower.includes("leave") || lower.includes("parking")) return "transport";
  if (lower.includes("wheelchair") || lower.includes("accessible") || lower.includes("disabled") || lower.includes("elevator") || lower.includes("handicap")) return "access_toilet";
  if (lower.includes("sensory") || lower.includes("quiet") || lower.includes("calm") || lower.includes("autism") || lower.includes("adhd")) return "sensory";
  if (lower.includes("waste") || lower.includes("recycle") || lower.includes("compost") || lower.includes("bin") || lower.includes("trash") || lower.includes("sustainability")) return "waste";
  if (lower.includes("gate c") || lower.includes("gatec") || lower.includes("find gate")) return "gate_c";
  
  return "default";
}

/**
 * Main function to generate AI responses for Fans
 */
export async function generateAIResponse(prompt, mode = 'fan', lang = 'en', userSector = '') {
  await delay(800 + Math.random() * 600); // Realistic AI response latency
  
  if (mode === 'fan') {
    const key = matchQueryKey(prompt);
    const langDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    let baseResponse = langDict[key] || langDict.default;
    
    // Inject personalized seating block recommendations if user selected a block
    if (userSector && key !== 'default') {
      const sectorNote = {
        en: `\n\n*Navigation Advice:* Since you are seated in Block ${userSector}, the quickest access route is via the Elevator Lift ${userSector[0]} nearby.`,
        es: `\n\n*Consejo de Navegación:* Como estás ubicado en el Bloque ${userSector}, la ruta más rápida es a través del Ascensor ${userSector[0]} cercano.`,
        fr: `\n\n*Conseil de Guidage:* Comme vous êtes assis au Bloc ${userSector}, l'accès le plus rapide se fait par l'ascenseur ${userSector[0]} à proximité.`,
        ar: `\n\n*نصيحة التنقل:* نظراً لجلوسك في المربع ${userSector}، فإن أسرع طريق للوصول هو عبر المصعد ${userSector[0]} القريب منك.`,
        ja: `\n\n*移動アドバイス:* お客様はブロック${userSector}にお座りですので、近くのエレベーター${userSector[0]}をご利用いただくのが最もスムーズです。`
      };
      baseResponse += (sectorNote[lang] || sectorNote.en);
    }
    
    return baseResponse;
  } else {
    // Mode is Staff
    return parseStaffIncident(prompt);
  }
}

/**
 * Parses unstructured natural language input from staff and returns a structured object.
 */
function parseStaffIncident(prompt) {
  const lower = prompt.toLowerCase();
  let severity = 'MEDIUM';
  let category = 'MAINTENANCE';
  let location = 'Unknown Block';
  let action = 'Notify supervisor and stand by.';

  // Location detection
  const blockMatch = prompt.match(/(?:block|sector|gate|level)\s*([a-zA-Z0-9]+)/i);
  if (blockMatch) {
    location = blockMatch[0].toUpperCase();
  }

  // Category and Severity evaluation
  if (lower.includes("medical") || lower.includes("hurt") || lower.includes("chest pain") || lower.includes("faint") || lower.includes("unconscious") || lower.includes("breathing")) {
    category = "MEDICAL";
    severity = "HIGH";
    action = `Immediate medical alert dispatched to ${location}. First-responder cart sent. Coordinate clear path with nearest section stewards.`;
  } else if (lower.includes("fight") || lower.includes("altercation") || lower.includes("crowd rush") || lower.includes("barrier broke") || lower.includes("riot")) {
    category = "SECURITY";
    severity = "HIGH";
    action = `Security Response Unit dispatched to ${location}. CCTV tracking locked on area. Direct spectators away from active zone.`;
  } else if (lower.includes("spill") || lower.includes("broken glass") || lower.includes("leak") || lower.includes("flood") || lower.includes("trash")) {
    category = "MAINTENANCE";
    severity = lower.includes("glass") || lower.includes("slip") ? "MEDIUM" : "LOW";
    action = `Sanitation Crew assigned to ${location} for cleanup and hazard control. Safety cone marking requested.`;
  } else if (lower.includes("stolen") || lower.includes("lost child") || lower.includes("suspicious package")) {
    category = "SECURITY";
    severity = lower.includes("package") || lower.includes("child") ? "HIGH" : "MEDIUM";
    action = lower.includes("child")
      ? `Lost Child Protocol activated. Visual description broadcasted to all staff terminals near ${location}. Dispatching welfare coordinator.`
      : `Security notified. Verify bag registry and check CCTV history near ${location}.`;
  }

  return {
    raw: prompt,
    category,
    severity,
    location,
    action,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Simulated Translation engine for volunteer dispatch messages
 */
export function translateVolunteerDispatch(message, targetLang) {
  const translations = {
    es: {
      "Medical response team to Gate A immediately": "Equipo de respuesta médica a la Puerta A inmediatamente",
      "Sanitation staff needed at Block 104 for spill cleanup": "Personal de limpieza requerido en el Bloque 104 para limpiar derrame",
      "Crowd control volunteers, please redirect flow from Metro Gate": "Voluntarios de control de multitudes, redirijan el flujo desde la Puerta del Metro",
      "Assistance required for a wheelchair fan at Block 202 elevator": "Se requiere asistencia para un aficionado en silla de ruedas en el ascensor del Bloque 202"
    },
    fr: {
      "Medical response team to Gate A immediately": "Équipe d'intervention médicale à la Porte A immédiatement",
      "Sanitation staff needed at Block 104 for spill cleanup": "Personnel d'entretien demandé au Bloc 104 pour nettoyage d'un déversement",
      "Crowd control volunteers, please redirect flow from Metro Gate": "Volontaires de gestion des foules, veuillez rediriger le flux depuis la Porte Métro",
      "Assistance required for a wheelchair fan at Block 202 elevator": "Assistance requise pour un fan en fauteuil roulant à l'ascenseur du Bloc 202"
    },
    ar: {
      "Medical response team to Gate A immediately": "فريق الاستجابة الطبية إلى البوابة A فوراً",
      "Sanitation staff needed at Block 104 for spill cleanup": "مطلوب عمال نظافة في المربع 104 لتنظيف انسكاب",
      "Crowd control volunteers, please redirect flow from Metro Gate": "متطوعو تنظيم الحشود، يرجى توجيه التدفق بعيداً عن بوابة المترو",
      "Assistance required for a wheelchair fan at Block 202 elevator": "مطلوب مساعدة لمشجع على كرسي متحرك عند مصعد المربع 202"
    }
  };

  const cleanMessage = message.trim();
  if (translations[targetLang] && translations[targetLang][cleanMessage]) {
    return translations[targetLang][cleanMessage];
  }

  // Fallback translation generator (mimics real translation output)
  const langSuffixes = {
    es: " [Traducido al Español]",
    fr: " [Traduit en Français]",
    ar: " [مترجم إلى العربية]",
    ja: " [日本語に翻訳]"
  };
  return cleanMessage + (langSuffixes[targetLang] || ` [Translated to ${targetLang.toUpperCase()}]`);
}

/**
 * Feature 1: AI Personal Matchday Itinerary Generator
 */
export async function generateMatchdayItinerary(arrival, accessibility, food, block = '') {
  await delay(1200); // Simulated scheduling lookup latency
  
  const selectedBlock = block || 'your sector';
  let gates = 'Gate A';
  let elevatorNote = '';
  let foodConcession = 'Concourse Concessions';
  let quietZoneNote = '';
  
  // Resolve gate based on arrival
  if (arrival === 'metro') gates = 'Gate B (East)';
  if (arrival === 'shuttle') gates = 'Gate C (North)';
  if (arrival === 'parking') gates = 'Gate A (West)';

  // Resolve accessibility routes
  if (accessibility === 'wheelchair') {
    elevatorNote = '⚠️ Wheelchair Path: Enter via Elevator Lift A-1 adjacent to Gate B lobby. St Stewards will assist with ramp routing.';
  } else if (accessibility === 'sensory') {
    quietZoneNote = '🧩 Sensory Advisory: Sensory Rooms with quiet zones and noise-reduction packs are located in Sector 205 (Level 2).';
  }

  // Resolve concession recommendations
  if (food === 'veg') {
    foodConcession = "🌱 'Green Pitch' Concessions (Block 104, Level 1) - Estimated wait time: 5 mins.";
  } else if (food === 'halal') {
    foodConcession = "🕌 'Hub Concessions' (Block 202) or 'Global Eats' (Block 308) - Certified ingredients.";
  }

  const timeline = `
📋 YOUR PERSONAL MATCHDAY PLAN:
----------------------------------------
📍 SECTOR: Block ${selectedBlock.toUpperCase()}
🚗 ARRIVAL MODE: ${arrival.toUpperCase()}
🛡️ ACCESSIBILITY: ${accessibility.toUpperCase()}
🍔 CONCESSION TARGET: ${food.toUpperCase()}

⏱️ ITINERARY TIMELINE:
- [T - 2.0 Hrs] Arrive via ${arrival.toUpperCase()} transport terminal.
- [T - 1.7 Hrs] Proceed to stadium entry gate: ${gates}.
- [T - 1.5 Hrs] Security scan & check-in. ${elevatorNote ? `\n  ${elevatorNote}` : ''}
- [T - 1.2 Hrs] Concession Stop: Visit ${foodConcession}
- [T - 0.8 Hrs] ${quietZoneNote ? `${quietZoneNote}\n- [T - 0.5 Hrs] ` : ''}Locate seats in Block ${selectedBlock.toUpperCase()}. E-navigation route highlights lift corridors.
- [T - 0.1 Hrs] Kick-off ceremony. Enjoy the match!
  `;

  return timeline;
}

/**
 * Feature 3: Fan Comments Sentiment Analysis Classifier
 */
export function classifyFanComment(comment) {
  const lower = comment.toLowerCase();
  let sentiment = 'NEUTRAL';
  let category = 'AMENITIES';
  let location = 'Stadium Area';
  let action = 'Logged in operations feedback stream.';

  // Location detection
  if (lower.includes('gate b') || lower.includes('gateb')) location = 'Gate B Restrooms';
  else if (lower.includes('sector 104') || lower.includes('104')) location = 'Sector 104 Food Court';
  else if (lower.includes('gate c') || lower.includes('gatec')) location = 'Gate C';
  else if (lower.includes('metro')) location = 'Metro Entrance';
  else if (lower.includes('205') || lower.includes('sensory')) location = 'Sector 205 Sensory Room';

  // Sentiment detection
  if (lower.includes('huge line') || lower.includes('wait') || lower.includes('congested') || lower.includes('crowded') || lower.includes('leak') || lower.includes('broken') || lower.includes('stuck') || lower.includes('mess') || lower.includes('frustrated') || lower.includes('slow')) {
    sentiment = 'FRUSTRATED';
    
    // Category mapping
    if (lower.includes('line') || lower.includes('wait') || lower.includes('stuck') || lower.includes('slow')) {
      category = 'CROWD';
      action = `Crowd Alert generated. Send detour advisories to spectators near ${location}.`;
    } else {
      category = 'FACILITY';
      action = `Maintenance dispatcher alert. Request cleanup/inspection squad at ${location}.`;
    }
  } else if (lower.includes('great') || lower.includes('good') || lower.includes('fast') || lower.includes('clean') || lower.includes('happy') || lower.includes('excellent') || lower.includes('fluid')) {
    sentiment = 'POSITIVE';
    category = 'FACILITY';
    action = 'No action required. Positive feedback cataloged.';
  }

  return {
    raw: comment,
    sentiment,
    category,
    location,
    action,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
