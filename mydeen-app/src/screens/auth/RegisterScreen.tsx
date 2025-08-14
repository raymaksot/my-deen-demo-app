import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register, googleLogin } from '@/store/authSlice';
import * as Google from 'expo-auth-session/providers/google';
import { ENV } from '@/config/env';
import { useThemeColors } from '@/theme/theme';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({ webClientId: ENV.googleWebClientId });

  // Retrieve current colour palette.
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) dispatch(googleLogin(idToken));
    }
  }, [response]);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim() || !agree) return;
    const result = await dispatch(register({ name, email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      setShowSuccess(true);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[{ fontSize: 18 }, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Register Account</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            style={[styles.input, !!name && styles.inputFilled]}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, !!email && styles.inputFilled]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, !!password && styles.inputFilled]}
            secureTextEntry
          />
          <TouchableOpacity onPress={() => setAgree(!agree)} style={styles.checkboxRow}>
            <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
              {agree && <Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the T&Cs and the processing of information as set out in the Privacy Policy.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRegister}
            style={[
              styles.primaryBtn,
              (!name || !email || !password || !agree) && styles.primaryBtnDisabled,
              status === 'loading' && { opacity: 0.7 },
            ]}
            disabled={!name || !email || !password || !agree || status === 'loading'}
          >
            {status === 'loading' ? <ActivityIndicator color={colors.text} /> : <Text style={styles.primaryText}>Sign Up</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={{ marginHorizontal: 8, color: colors.muted }}>Or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity onPress={() => promptAsync()} style={styles.socialBtn}>
            <Text style={styles.socialText}>Sign Up with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={styles.socialBtn}>
            <Text style={styles.socialText}>Sign Up with Facebook</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>
              Already have an account?
              <Text onPress={() => navigation.navigate('Login')} style={styles.link}> Sign in</Text>
            </Text>
          </View>
        </View>

        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8, color: colors.text }}>Create Account Success</Text>
              <Text style={{ textAlign: 'center', color: colors.muted, marginBottom: 16 }}>
                You have created your account. Please login to enjoy our features right now!
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSuccess(false);
                  navigation.navigate('Login');
                }}
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.primaryText, { color: '#fff' }]}>Login Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const createStyles = (colors: { [key: string]: string }) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      padding: 24,
      backgroundColor: colors.background,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backBtn: {
      padding: 4,
      marginRight: 8,
    },
    header: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    form: {
      width: '100%',
    },
    label: {
      marginBottom: 4,
      marginTop: 12,
      fontWeight: '600',
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 8,
      fontSize: 16,
      backgroundColor: colors.background === '#0B1220' ? '#1F2937' : '#f9fafb',
      color: colors.text,
    },
    inputFilled: {
      borderColor: colors.primary,
      backgroundColor: colors.background === '#0B1220' ? '#0E3b47' : '#ecfdf5',
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 12,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxLabel: {
      flex: 1,
      flexWrap: 'wrap',
      color: colors.muted,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    primaryBtnDisabled: {
      backgroundColor: colors.primary + '40',
    },
    primaryText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    socialBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: colors.background === '#0B1220' ? '#1F2937' : '#fff',
    },
    socialText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    link: {
      color: colors.primary,
      fontWeight: '600',
    },
    modalWrap: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 24,
      width: '100%',
      maxWidth: 320,
      alignItems: 'center',
    },
  });