import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';

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

/**
 * QiblaCompass renders a simple compass graphic that rotates an arrow toward
 * the Qibla direction based on the device’s magnetometer reading.  The
 * Qibla direction is approximated at 118° from north for demonstration.  A
 * more accurate implementation would calculate the direction based on the
 * user’s location.
 */
export default function QiblaCompass() {
  const [heading, setHeading] = useState(0);
  const qiblaDirection = 118; // degrees from north toward Mecca for demo

  useEffect(() => {
    Magnetometer.setUpdateInterval(200);
    const sub = Magnetometer.addListener((data) => {
      setHeading(calculateHeading(data));
    });
    return () => sub && sub.remove();
  }, []);

  // Determine the rotation needed to point the arrow to the qibla.
  // If heading is 0 (north) and qiblaDirection is 118°, the arrow should
  // rotate 118°.  Subtract the current heading from the qibla direction.
  const rotation = (qiblaDirection - heading + 360) % 360;

  return (
    <View style={styles.container}>
      <View style={styles.compassOuter}>
        <View
          style={[
            styles.arrow,
            {
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}
        />
        <View style={styles.compassInner} />
      </View>
      <Text style={styles.headingText}>{heading.toFixed(0)}°</Text>
      <Text style={styles.instruction}>Rotate until the arrow points up to face Qibla</Text>
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