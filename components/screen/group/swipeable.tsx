import { Icon } from '@roninoss/icons';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { type ViewStyle, Platform, Pressable, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

const deviceDimensions = Dimensions.get('window');
const dimensions = {
  width: deviceDimensions.width - 16 * 2, // 16 is the padding
  height: deviceDimensions.height,
};

const BUTTON_WIDTH = 75;

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

const ACTION_BUTTON_STYLE: ViewStyle = {
  width: BUTTON_WIDTH,
};

export default function Swipeable({
  children,
  onDelete: _onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const translateX = useSharedValue(0);
  const previousTranslateX = useSharedValue(0);
  const initialTouchLocation = useSharedValue<{ x: number; y: number } | null>(null);

  const rootStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  const trashActionStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      right: 0,
      flex: 1,
      height: '100%',
      width: interpolate(-translateX.value, [0, dimensions.width], [0, dimensions.width]),
    };
  });
  const trashIconStyle = useAnimatedStyle(() => {
    return {
      overflow: 'hidden',
      position: 'absolute',
      right:
        previousTranslateX.value > translateX.value
          ? interpolate(
              -translateX.value,
              [0, BUTTON_WIDTH * 1, BUTTON_WIDTH * 2, BUTTON_WIDTH * 2 + 40, dimensions.width],
              [-BUTTON_WIDTH, 0, 0, BUTTON_WIDTH + 40, dimensions.width - BUTTON_WIDTH]
            )
          : interpolate(
              -translateX.value,
              [0, BUTTON_WIDTH * 1, dimensions.width],
              [-BUTTON_WIDTH, 0, dimensions.width - BUTTON_WIDTH]
            ),
      flex: 1,
      height: '100%',
      width: BUTTON_WIDTH,
    };
  });

  function onDelete() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    _onDelete();
  }
  const pan = Gesture.Pan()
    .manualActivation(Platform.OS !== 'ios')
    .onBegin((evt) => {
      initialTouchLocation.value = { x: evt.x, y: evt.y };
    })
    .onStart(() => {
      previousTranslateX.value = translateX.value;
    })
    // Prevents blocking the scroll view
    .onTouchesMove((evt, state) => {
      if (!initialTouchLocation.value || !evt.changedTouches.length) {
        state.fail();
        return;
      }

      const xDiff = Math.abs(evt.changedTouches[0].x - initialTouchLocation.value.x);
      const yDiff = Math.abs(evt.changedTouches[0].y - initialTouchLocation.value.y);
      const isHorizontalPanning = xDiff > yDiff;

      if (isHorizontalPanning && xDiff > 0.5) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onUpdate((event) => {
      translateX.value = clamp(
        event.translationX + previousTranslateX.value,
        -dimensions.width,
        dimensions.width
      );
    })
    .onEnd((event) => {
      const right = event.translationX > 0 && translateX.value > 0;
      const left = event.translationX < 0 && translateX.value < 0;

      if (right) {
        // We're not using this as no right-swipe action is implemented
        // if (translateX.value > BUTTON_WIDTH * 2) {
        //   translateX.value = withSpring(0, SPRING_CONFIG);
        //   runOnJS(onToggleMarkAsRead)();
        //   return;
        // }
        // translateX.value = withSpring(
        //   event.translationX > 0 ? BUTTON_WIDTH : -BUTTON_WIDTH,
        //   SPRING_CONFIG
        // );
        // return;
      }

      if (left) {
        if (translateX.value < -BUTTON_WIDTH * 2) {
          translateX.value = withSpring(-dimensions.width, SPRING_CONFIG);
          runOnJS(onDelete)();
          translateX.value = withDelay(500, withSpring(0, SPRING_CONFIG));
          return;
        }
        translateX.value = withSpring(
          event.translationX > 0 ? BUTTON_WIDTH : -BUTTON_WIDTH,
          SPRING_CONFIG
        );
        return;
      }

      translateX.value = withSpring(0, SPRING_CONFIG);
    });

  function onDeleteActionPress() {
    translateX.value = withSpring(0, SPRING_CONFIG);
    onDelete();
  }
  return (
    <GestureDetector gesture={pan}>
      <View>
        <Animated.View style={trashActionStyle} className="bg-destructive">
          <Animated.View style={trashIconStyle}>
            <Pressable
              style={ACTION_BUTTON_STYLE}
              onPress={onDeleteActionPress}
              className="absolute bottom-0 right-0 top-0 items-center justify-center">
              <Icon name="trash-can" size={24} color="white" />
            </Pressable>
          </Animated.View>
        </Animated.View>
        <Animated.View style={rootStyle}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}
