import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLocale } from '@/store/preferencesSlice';
import { setUser } from '@/store/authSlice';
import { authService } from '@/services/authService';
import { changeLanguage } from '@/i18n';

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

// List of supported languages and associated flag emoji.  Expand as needed.
const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
  { code: 'en-uk', label: 'English - UK', flag: '🇬🇧' },
  { code: 'ms', label: 'Melayu', flag: '🇲🇾' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
];

/**
 * LanguageScreen lets the user choose a language for the app.  A search bar
 * filters the list.  Upon selection and pressing the button, the locale is
 * updated in preferences and the user profile is saved on the server.
 */
export default function LanguageScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const currentLocale = useAppSelector((s) => s.preferences.locale);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>(currentLocale);
  const [filtered, setFiltered] = useState<LanguageOption[]>(LANGUAGE_OPTIONS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!search) {
      setFiltered(LANGUAGE_OPTIONS);
    } else {
      const s = search.toLowerCase();
      setFiltered(
        LANGUAGE_OPTIONS.filter((opt) =>
          opt.label.toLowerCase().includes(s) || opt.code.toLowerCase().includes(s)
        ),
      );
    }
  }, [search]);

  async function handleSelect() {
    setSaving(true);
    try {
      // Update preferences
      dispatch(setLocale(selected));
      // Change i18n language
      await changeLanguage(selected);
      // Persist to server if user logged in
      if (user) {
        const updated = await authService.updateProfile({ language: selected });
        dispatch(setUser(updated));
      }
      navigation.goBack();
    } catch (e) {
      console.error(t('failedToUpdateLanguage'), e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language')}</Text>
        <View style={{ width: 24 }} />
      </View>
      {/* Search bar */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder={t('searchLanguage')}
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>
      {/* Language choices */}
      <Text style={styles.sectionTitle}>{t('languageChoice')}</Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {filtered.map((opt) => {
          const isSelected = selected === opt.code;
          return (
            <TouchableOpacity
              key={opt.code}
              style={styles.languageRow}
              onPress={() => setSelected(opt.code)}
            >
              <Text style={styles.flag}>{opt.flag}</Text>
              <Text style={styles.languageLabel}>{opt.label}</Text>
              <View style={styles.radioOuter}>{isSelected && <View style={styles.radioInner} />}</View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        style={[styles.selectBtn, { backgroundColor: saving ? '#9CA3AF' : '#0E7490' }]}
        onPress={handleSelect}
        disabled={saving}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          {saving ? t('saving') : t('selectLanguage')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  searchBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  searchInput: { fontSize: 14, color: '#111827' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#111827' },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  flag: { fontSize: 24, marginRight: 16 },
  languageLabel: { flex: 1, fontSize: 16, color: '#111827' },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0E7490',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0E7490',
  },
  selectBtn: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
});