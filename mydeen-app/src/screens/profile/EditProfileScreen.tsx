import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/authSlice';
import { authService } from '@/services/authService';

const genderOptions: { label: string; value: 'male' | 'female' | 'other' }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

/**
 * EditProfileScreen allows the user to update their name, gender and location.
 * The email is shown read‑only.  A simple modal is used to select gender.
 */
export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [location, setLocation] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setGender((user.gender as any) || 'other');
      setLocation(user.location || '');
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({ name, gender, location });
      dispatch(setUser(updated));
      navigation.goBack();
    } catch (e) {
      console.error('Failed to update profile', e);
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#F3F4F6', color: '#9CA3AF' }]}
            value={email}
            editable={false}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setShowGenderPicker(true)}
          >
            <Text style={{ color: gender ? '#111827' : '#9CA3AF' }}>{genderOptions.find((g) => g.value === gender)?.label}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your city or address"
          />
        </View>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: saving ? '#9CA3AF' : '#0E7490' }]}
          onPress={handleSave}
          disabled={saving || !name}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Gender picker modal */}
      <Modal
        visible={showGenderPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <View style={styles.modalHandle} />
            </View>
            {genderOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.optionRow}
                onPress={() => {
                  setGender(opt.value);
                  setShowGenderPicker(false);
                }}
              >
                <Text style={{ fontSize: 16, color: '#111827' }}>{opt.label}</Text>
                {gender === opt.value && <Text style={{ fontSize: 16 }}>✔</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center', color: '#111827' },
  inputGroup: { marginBottom: 16 },
  label: { marginBottom: 4, fontSize: 14, color: '#6B7280' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  saveButton: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
});