import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';

type FeedbackType =
  | 'soft'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'rigid'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

export const useHaptic = (feedbackType: FeedbackType = 'selection'): (() => void) => {
  const createHapticHandler = useCallback((type: Haptics.ImpactFeedbackStyle) => {
    return Platform.OS === 'web' ? undefined : () => Haptics.impactAsync(type);
  }, []);
  const createNotificationFeedback = useCallback((type: Haptics.NotificationFeedbackType) => {
    return Platform.OS === 'web' ? undefined : () => Haptics.notificationAsync(type);
  }, []);

  const hapticHandlers = useMemo(
    () => ({
      soft: createHapticHandler(Haptics.ImpactFeedbackStyle.Soft),
      light: createHapticHandler(Haptics.ImpactFeedbackStyle.Light),
      medium: createHapticHandler(Haptics.ImpactFeedbackStyle.Medium),
      heavy: createHapticHandler(Haptics.ImpactFeedbackStyle.Heavy),
      rigid: createHapticHandler(Haptics.ImpactFeedbackStyle.Rigid),
      selection: Platform.OS === 'web' ? undefined : Haptics.selectionAsync,
      success: createNotificationFeedback(Haptics.NotificationFeedbackType.Success),
      warning: createNotificationFeedback(Haptics.NotificationFeedbackType.Warning),
      error: createNotificationFeedback(Haptics.NotificationFeedbackType.Error),
    }),
    [createHapticHandler, createNotificationFeedback]
  );

  return (
    hapticHandlers[feedbackType] ??
    (() => {
      console.warn('Haptic feedback type not supported on this platform');
    })
  );
};

/**
 * @description Auto trigger haptic feedback for successful operations on page renders
 * @param delay - Delay in milliseconds before triggering haptic feedback
 */
export const useSuccessHaptic = ({ delay = 200 }: { delay?: number } = {}) => {
  const haptic = useHaptic('success');
  useEffect(() => {
    setTimeout(() => {
      haptic();
    }, delay);
  }, [haptic, delay]);
};
