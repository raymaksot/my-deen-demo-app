import { quranService } from '@/services/quranService';
import { hadithService } from '@/services/hadithService';

describe('Daily Content Services', () => {
  it('quranService has getDailyAyah method', () => {
    expect(typeof quranService.getDailyAyah).toBe('function');
  });

  it('hadithService has getDailyHadith method', () => {
    expect(typeof hadithService.getDailyHadith).toBe('function');
  });

  it('daily content services return proper interface', () => {
    // Verify the service interfaces are properly exported
    expect(quranService).toHaveProperty('getDailyAyah');
    expect(hadithService).toHaveProperty('getDailyHadith');
    expect(quranService).toHaveProperty('getSurahs');
    expect(quranService).toHaveProperty('getSurahAyahs');
    expect(hadithService).toHaveProperty('search');
  });
});