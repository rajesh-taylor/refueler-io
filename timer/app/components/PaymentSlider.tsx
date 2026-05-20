import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width * 0.85;
const KNOB_SIZE = 54;
const SUCCESS_THRESHOLD = SLIDER_WIDTH - KNOB_SIZE - 10;

export default function PaymentSlider({ onConfirm }: { onConfirm: () => void }) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationX > 0 && event.translationX < SUCCESS_THRESHOLD) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value > SUCCESS_THRESHOLD - 30) {
        translateX.value = withSpring(SUCCESS_THRESHOLD);
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        runOnJS(onConfirm)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedKnobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.track}>
      <Text style={styles.label}>Slide to Confirm Payment</Text>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.knob, animatedKnobStyle]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: SLIDER_WIDTH,
    height: KNOB_SIZE + 10,
    backgroundColor: '#111',
    borderRadius: 35,
    justifyContent: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    backgroundColor: '#E6F4FE',
    borderRadius: 30,
    position: 'absolute',
    left: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  label: {
    color: '#555',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
});