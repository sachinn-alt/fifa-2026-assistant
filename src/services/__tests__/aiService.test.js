import { describe, it, expect } from 'vitest';
import { 
  generateAIResponse, 
  translateVolunteerDispatch, 
  generateMatchdayItinerary, 
  classifyFanComment 
} from '../aiService';

describe('FIFA 2026 Nexus AI Service Unit Tests', () => {
  
  // 1. Test generateAIResponse - Fan Persona Query Matching & Translation Locales
  describe('generateAIResponse - Fan Queries', () => {
    it('should return welcome greeting in English by default', async () => {
      const response = await generateAIResponse('hello', 'fan', 'en');
      expect(response).toContain('Welcome to FIFA 2026 Nexus');
    });

    it('should translate welcome greeting in Spanish', async () => {
      const response = await generateAIResponse('hola', 'fan', 'es');
      expect(response).toContain('Bienvenido a FIFA 2026 Nexus');
    });

    it('should match concessions query for vegetarian food', async () => {
      const response = await generateAIResponse('Where is the veg food concession?', 'fan', 'en');
      expect(response).toContain('vegetarian options');
      expect(response).toContain('Block 104');
    });

    it('should match concessions query for halal food', async () => {
      const response = await generateAIResponse('Show me halal certified stands', 'fan', 'en');
      expect(response).toContain('Halal options');
      expect(response).toContain('Block 202');
    });

    it('should match transportation query', async () => {
      const response = await generateAIResponse('How do I take the Metro or leave Lot B?', 'fan', 'en');
      expect(response).toContain('Metro Line 2');
      expect(response).toContain('carbon footprint');
    });

    it('should match accessibility query for wheelchair support', async () => {
      const response = await generateAIResponse('Show me wheelchair accessible toilets', 'fan', 'en');
      expect(response).toContain('Wheelchair-accessible');
      expect(response).toContain('elevator');
    });

    it('should match sensory room query', async () => {
      const response = await generateAIResponse('Where is the quiet sensory quiet room?', 'fan', 'en');
      expect(response).toContain('Sensory Room');
      expect(response).toContain('Block 205');
    });

    it('should inject personalized seating sector advisory if sector block is set', async () => {
      const response = await generateAIResponse('veg food', 'fan', 'en', '104');
      expect(response).toContain('Block 104');
      expect(response).toContain('Elevator Lift 1');
    });
  });

  // 2. Test generateAIResponse - Staff Incident Parsing
  describe('generateAIResponse - Staff Incident Parsing', () => {
    it('should parse a high severity medical emergency', async () => {
      const result = await generateAIResponse('Fan has fainted and is unconscious at Block 202', 'staff');
      expect(result.category).toBe('MEDICAL');
      expect(result.severity).toBe('HIGH');
      expect(result.location).toBe('BLOCK 202');
      expect(result.action).toContain('Immediate medical alert');
    });

    it('should parse security altercation incidents', async () => {
      const result = await generateAIResponse('steward needs help, fight broke out in Sector 105', 'staff');
      expect(result.category).toBe('SECURITY');
      expect(result.severity).toBe('HIGH');
      expect(result.location).toBe('SECTOR 105');
      expect(result.action).toContain('Security Response Unit');
    });

    it('should parse low severity maintenance events', async () => {
      const result = await generateAIResponse('trash spill on floor near Block 101 concourse', 'staff');
      expect(result.category).toBe('MAINTENANCE');
      expect(result.severity).toBe('LOW');
      expect(result.location).toBe('BLOCK 101');
      expect(result.action).toContain('Sanitation Crew assigned');
    });

    it('should handle unmapped incident structures safely', async () => {
      const result = await generateAIResponse('some weird custom notification in outer parking zone', 'staff');
      expect(result.category).toBe('MAINTENANCE');
      expect(result.severity).toBe('MEDIUM');
      expect(result.location).toBe('Unknown Block');
    });
  });

  // 3. Test translateVolunteerDispatch translations
  describe('translateVolunteerDispatch', () => {
    it('should translate medical dispatches to Spanish', () => {
      const msg = 'Medical response team to Gate A immediately';
      const trans = translateVolunteerDispatch(msg, 'es');
      expect(trans).toBe('Equipo de respuesta médica a la Puerta A inmediatamente');
    });

    it('should translate sanitation alerts to French', () => {
      const msg = 'Sanitation staff needed at Block 104 for spill cleanup';
      const trans = translateVolunteerDispatch(msg, 'fr');
      expect(trans).toBe("Personnel d'entretien demandé au Bloc 104 pour nettoyage d'un déversement");
    });

    it('should translate wheelchair dispatches to Arabic', () => {
      const msg = 'Assistance required for a wheelchair fan at Block 202 elevator';
      const trans = translateVolunteerDispatch(msg, 'ar');
      expect(trans).toBe('مطلوب مساعدة لمشجع على كرسي متحرك عند مصعد المربع 202');
    });

    it('should generate fallback translation for unmapped texts', () => {
      const msg = 'Clean up garbage at gate lobby';
      const trans = translateVolunteerDispatch(msg, 'ja');
      expect(trans).toContain('Clean up garbage');
      expect(trans).toContain('[日本語に翻訳]');
    });
  });

  // 4. Test generateMatchdayItinerary (Feature 1)
  describe('generateMatchdayItinerary', () => {
    it('should generate detailed timeline for standard metro transit with vegetarian targets', async () => {
      const itinerary = await generateMatchdayItinerary('metro', 'none', 'veg', '104');
      expect(itinerary).toContain('METRO');
      expect(itinerary).toContain('Block 104');
      expect(itinerary).toContain('Gate B (East)');
      expect(itinerary).toContain('Green Pitch');
    });

    it('should inject wheelchair priority advice when wheelchair accessibility is selected', async () => {
      const itinerary = await generateMatchdayItinerary('parking', 'wheelchair', 'halal', '202');
      expect(itinerary).toContain('WHEELCHAIR');
      expect(itinerary).toContain('Gate A (West)');
      expect(itinerary).toContain('Elevator Lift A-1');
      expect(itinerary).toContain('🕌 \'Hub Concessions\'');
    });

    it('should handle sensory quiet guidelines in sensory mode', async () => {
      const itinerary = await generateMatchdayItinerary('shuttle', 'sensory', 'any', '205');
      expect(itinerary).toContain('SENSORY');
      expect(itinerary).toContain('Gate C (North)');
      expect(itinerary).toContain('Sensory Rooms with quiet zones');
    });
  });

  // 5. Test classifyFanComment (Feature 3 Sentiment Classifier)
  describe('classifyFanComment', () => {
    it('should classify line congestion feedback as frustrated crowd alert', () => {
      const result = classifyFanComment('The lines at sector 104 food court are massive, been waiting 20 minutes!');
      expect(result.sentiment).toBe('FRUSTRATED');
      expect(result.category).toBe('CROWD');
      expect(result.location).toBe('Sector 104 Food Court');
      expect(result.action).toContain('Crowd Alert');
    });

    it('should classify bathroom leakage as frustrated facility incident', () => {
      const result = classifyFanComment('Water leak and wet floor mess in gate B bathroom, dangerous!');
      expect(result.sentiment).toBe('FRUSTRATED');
      expect(result.category).toBe('FACILITY');
      expect(result.location).toBe('Gate B Restrooms');
      expect(result.action).toContain('Maintenance dispatcher');
    });

    it('should classify fluid fast entry as positive feedback', () => {
      const result = classifyFanComment('Gate B restrooms were super fast and clean. Thanks!');
      expect(result.sentiment).toBe('POSITIVE');
      expect(result.location).toBe('Gate B Restrooms');
      expect(result.action).toContain('Positive feedback cataloged');
    });

    it('should handle questions as neutral categories', () => {
      const result = classifyFanComment('Where is the sensory quiet space in 205?');
      expect(result.sentiment).toBe('NEUTRAL');
      expect(result.location).toBe('Sector 205 Sensory Room');
      expect(result.action).toContain('AI routing guide');
    });
  });
});
