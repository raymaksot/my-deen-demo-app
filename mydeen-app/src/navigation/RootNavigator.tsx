import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '@/store/hooks';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import WelcomeScreen from '@/screens/auth/WelcomeScreen';
import HomeScreen from '@/screens/home/HomeScreen';
import QuranScreen from '@/screens/quran/QuranScreen';
import HadithScreen from '@/screens/hadith/HadithScreen';
import DuasScreen from '@/screens/duas/DuasScreen';
import TasbeehCounterScreen from '@/screens/duas/TasbeehCounterScreen';
import PlacesScreen from '@/screens/places/PlacesScreen';
import QAScreen from '@/screens/qa/QAScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import PrayerTimesScreen from '@/screens/prayer/PrayerTimesScreen';
import PrayerSettingsScreen from '@/screens/prayer/PrayerSettingsScreen';
import HijriCalendarScreen from '@/screens/calendar/HijriCalendarScreen';
import ZakatCalculatorScreen from '@/screens/zakat/ZakatCalculatorScreen';
import ArticleDetailScreen from '@/screens/articles/ArticleDetailScreen';
import ArticlesScreen from '@/screens/articles/ArticlesScreen';
import VideosScreen from '@/screens/videos/VideosScreen';
import VideoDetailScreen from '@/screens/videos/VideoDetailScreen';
import NotificationScreen from '@/screens/notifications/NotificationScreen';
import FindMosqueScreen from '@/screens/places/FindMosqueScreen';
import FindQiblaScreen from '@/screens/places/FindQiblaScreen';
import SurahDetailScreen from '@/screens/quran/SurahDetailScreen';
import VerseDetailScreen from '@/screens/quran/VerseDetailScreen';
import QADetailScreen from '@/screens/qa/QADetailScreen';
import AdminDashboardScreen from '@/screens/admin/AdminDashboardScreen';
import ReadingGroupsScreen from '@/screens/groups/ReadingGroupsScreen';
import GroupDetailScreen from '@/screens/groups/GroupDetailScreen';
import EventsScreen from '@/screens/events/EventsScreen';
import EventDetailScreen from '@/screens/events/EventDetailScreen';
import MyEventsScreen from '@/screens/events/MyEventsScreen';
import { TermsScreen, PrivacyScreen } from '@/screens/settings/TermsPrivacyScreens';
import QiblaCompass from '@/screens/places/QiblaCompass';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import LanguageScreen from '@/screens/profile/LanguageScreen';
import MyLocationScreen from '@/screens/profile/MyLocationScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
	return (
		<Tabs.Navigator>
			<Tabs.Screen name="Home" component={HomeScreen} />
			<Tabs.Screen name="Quran" component={QuranScreen} />
			<Tabs.Screen name="Duas" component={DuasScreen} />
			<Tabs.Screen name="Hadith" component={HadithScreen} />
			<Tabs.Screen name="QA" component={QAScreen} />
			<Tabs.Screen name="Places" component={PlacesScreen} />
			<Tabs.Screen name="Groups" component={ReadingGroupsScreen} />
			<Tabs.Screen name="Events" component={EventsScreen} />
            <Tabs.Screen name="Profile" component={ProfileScreen} />
		</Tabs.Navigator>
	);
}

export default function RootNavigator() {
	const token = useAppSelector((s) => s.auth.token);
	const user = useAppSelector((s) => s.auth.user);
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!token ? (
                <>
                    {/* Show welcome/onboarding screen first */}
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="Articles" component={ArticlesScreen} />
                    <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
                    <Stack.Screen name="Videos" component={VideosScreen} />
                    <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />
                    <Stack.Screen name="Notifications" component={NotificationScreen} />
                    <Stack.Screen name="FindMosque" component={FindMosqueScreen} />
                    <Stack.Screen name="QiblaCompass" component={QiblaCompass} />
                    <Stack.Screen name="FindQibla" component={FindQiblaScreen} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                    <Stack.Screen name="Language" component={LanguageScreen} />
                    <Stack.Screen name="MyLocation" component={MyLocationScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Main" component={MainTabs} />
                    <Stack.Screen name="PrayerTimes" component={PrayerTimesScreen} />
                    <Stack.Screen name="PrayerSettings" component={PrayerSettingsScreen} options={{ title: 'Prayer Settings' }} />
                    <Stack.Screen name="HijriCalendar" component={HijriCalendarScreen} />
                    <Stack.Screen name="Zakat" component={ZakatCalculatorScreen} />
                    <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
                    <Stack.Screen name="SurahDetail" component={SurahDetailScreen} />
                    <Stack.Screen name="VerseDetail" component={VerseDetailScreen} />
                    <Stack.Screen name="QADetail" component={QADetailScreen} />
                    <Stack.Screen name="TasbeehCounter" component={TasbeehCounterScreen} />
                    <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
                    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
                    <Stack.Screen name="MyEvents" component={MyEventsScreen} />
                    <Stack.Screen name="Articles" component={ArticlesScreen} />
                    <Stack.Screen name="Videos" component={VideosScreen} />
                    <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />
                    <Stack.Screen name="Notifications" component={NotificationScreen} />
                    <Stack.Screen name="FindMosque" component={FindMosqueScreen} />
                    <Stack.Screen name="QiblaCompass" component={QiblaCompass} />
                    <Stack.Screen name="FindQibla" component={FindQiblaScreen} />
                    {user?.role === 'admin' && <Stack.Screen name="Admin" component={AdminDashboardScreen} />}
                    <Stack.Screen name="Terms" component={TermsScreen} />
                    <Stack.Screen name="Privacy" component={PrivacyScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    {/* Profile and related screens */}
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                    <Stack.Screen name="Language" component={LanguageScreen} />
                    <Stack.Screen name="MyLocation" component={MyLocationScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}