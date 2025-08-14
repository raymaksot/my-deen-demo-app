import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Google from 'expo-auth-session/providers/google';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { googleLogin } from '@/store/authSlice';
import { ENV } from '@/config/env';
import { useThemeColors } from '@/theme/theme';
import { PrimaryButton, SecondaryButton } from '@/components/common';

/**
 * WelcomeScreen renders the initial onboarding experience.  It shows
 * branding and allows the user to sign up with Google or Facebook or
 * continue with email registration/login.  The background image is
 * provided via the assets folder and should reflect your desired
 * aesthetic.  If the Google login succeeds, the user will be signed
 * in automatically.
 */
export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const [request, response, promptAsync] = Google.useAuthRequest({ webClientId: ENV.googleWebClientId });
  // Access current colour palette based on theme mode.
  const colors = useThemeColors();
  // Choose appropriate onboarding background image depending on light/dark theme.
  const onboardingImg =
    colors.background === '#0B1220'
      ? require('../../../assets/onboarding_dark.png')
      : require('../../../assets/onboarding.png');

  React.useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) dispatch(googleLogin(idToken));
    }
  }, [response]);

  return (
    <ImageBackground source={onboardingImg} style={styles.bg} resizeMode="cover">
      <View style={[styles.overlay, { backgroundColor: colors.background === '#0B1220' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome to Nice Muslim
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Lorem ipsum dolor sit amet consectetur. Ultrices pellentesque ut rutrum nibh diam. Ullamcorper
          adipiscing ut iaculis amet urna id integer libero.
        </Text>
        {/* Sign up with Google */}
        <SecondaryButton
          title="Sign Up with Google"
          onPress={() => promptAsync()}
          style={[
            styles.socialBtn, 
            { 
              borderColor: colors.background === '#0B1220' ? colors.border : '#fff',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          ]}
          textStyle={{ color: colors.text }}
        />
        {/* Sign up with Facebook */}
        <SecondaryButton
          title="Sign Up with Facebook"
          onPress={() => {}}
          style={[
            styles.socialBtn, 
            { 
              borderColor: colors.background === '#0B1220' ? colors.border : '#fff',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          ]}
          textStyle={{ color: colors.text }}
        />
        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={{ color: colors.muted, marginHorizontal: 8 }}>or</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>
        {/* Sign in with email */}
        <PrimaryButton
          title="Sign In with Email"
          onPress={() => navigation.navigate('Login')}
          loading={status === 'loading'}
          style={[
            styles.primaryBtn,
            { backgroundColor: colors.primary },
          ]}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  socialBtn: {
    borderRadius: 24,
    marginBottom: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  primaryBtn: {
    borderRadius: 24,
  },
});