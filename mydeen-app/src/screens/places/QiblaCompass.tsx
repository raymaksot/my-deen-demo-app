import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';

// Compute the tilt-compensated heading (degrees) from magnetometer and accelerometer readings.
// Returns a value between 0 and 360, where 0 is north. Uses accelerometer data to compensate for device tilt.
function calculateTiltCompensatedHeading(
  mag: { x: number; y: number; z: number },
  accel: { x: number; y: number; z: number }
) {
  // Normalize accelerometer data
  const norm = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
  const ax = accel.x / norm;
  const ay = accel.y / norm;
  const az = accel.z / norm;
  
  // Calculate roll and pitch from accelerometer
  const roll = Math.atan2(ay, az);
  const pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));
  
  // Tilt compensation for magnetometer
  const magXComp = mag.x * Math.cos(pitch) + mag.z * Math.sin(pitch);
  const magYComp = mag.x * Math.sin(roll) * Math.sin(pitch) + mag.y * Math.cos(roll) - mag.z * Math.sin(roll) * Math.cos(pitch);
  
  // Calculate heading with tilt compensation
  let heading = Math.atan2(magYComp, magXComp) * (180 / Math.PI);
  
  // Normalize to 0-360 degrees
  return heading >= 0 ? heading : heading + 360;
}

// Fallback function for magnetometer-only heading calculation
function calculateHeading({ x, y }: { x: number; y: number }) {
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  return angle >= 0 ? angle : angle + 360;
}

// Calculate the bearing from user's location to Kaaba (Mecca)
function calculateBearingToKaaba(userLat: number, userLng: number): number {
  const kaabaLat = 21.4225; // Kaaba latitude
  const kaabaLng = 39.8262; // Kaaba longitude
  
  // Convert to radians
  const lat1 = userLat * (Math.PI / 180);
  const lat2 = kaabaLat * (Math.PI / 180);
  const deltaLng = (kaabaLng - userLng) * (Math.PI / 180);
  
  // Calculate bearing using great circle formula
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  
  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  
  // Normalize to 0-360 degrees
  return (bearing + 360) % 360;
}

/**
 * QiblaCompass renders a simple compass graphic that rotates an arrow toward
 * the Qibla direction based on the device’s magnetometer reading.  The
 * Qibla direction is approximated at 118° from north for demonstration.  A
 * more accurate implementation would calculate the direction based on the
 * user’s location.
 */
export default function QiblaCompass() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(118); // fallback direction
  const [locationLoading, setLocationLoading] = useState(true);
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  
  // Animated value for smooth arrow rotation
  const rotationValue = useRef(new Animated.Value(0)).current;

  // Get user location and calculate qibla direction
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationLoading(false);
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const bearing = calculateBearingToKaaba(
          location.coords.latitude,
          location.coords.longitude
        );
        setQiblaDirection(bearing);
      } catch (error) {
        console.warn('Failed to get location, using fallback direction:', error);
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  // Set up magnetometer
  useEffect(() => {
    Magnetometer.setUpdateInterval(200);
    const magnetometerSub = Magnetometer.addListener((data) => {
      setMagnetometerData(data);
    });
    return () => magnetometerSub && magnetometerSub.remove();
  }, []);

  // Set up accelerometer  
  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    const accelerometerSub = Accelerometer.addListener((data) => {
      setAccelerometerData(data);
    });
    return () => accelerometerSub && accelerometerSub.remove();
  }, []);

  // Calculate tilt-compensated heading when sensor data changes
  useEffect(() => {
    if (magnetometerData.x !== 0 || magnetometerData.y !== 0 || magnetometerData.z !== 0) {
      const tiltCompensatedHeading = calculateTiltCompensatedHeading(
        magnetometerData,
        accelerometerData
      );
      setHeading(tiltCompensatedHeading);
    }
  }, [magnetometerData, accelerometerData]);

  // Calculate rotation and animate arrow
  useEffect(() => {
    const rotation = (qiblaDirection - heading + 360) % 360;
    
    Animated.timing(rotationValue, {
      toValue: rotation,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [heading, qiblaDirection, rotationValue]);

  // Convert animated value to rotation transform
  const animatedRotation = rotationValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.compassOuter}>
        <Animated.View
          style={[
            styles.arrow,
            {
              transform: [{ rotate: animatedRotation }],
            },
          ]}
        />
        <View style={styles.compassInner} />
      </View>
      <Text style={styles.headingText}>{heading.toFixed(0)}°</Text>
      {locationLoading ? (
        <Text style={styles.instruction}>Getting your location...</Text>
      ) : (
        <Text style={styles.instruction}>Rotate until the arrow points up to face Qibla</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 24 },
  compassOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#D1FAE5',
    position: 'absolute',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#10B981',
  },
  headingText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#065F46' },
  instruction: { marginTop: 4, fontSize: 12, color: '#6B7280', textAlign: 'center' },
});