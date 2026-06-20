import { Meal } from '@/storage/meals';
import { colors } from '@/style/global';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, Share, StyleSheet, TouchableOpacity } from 'react-native';

type ShareButtonProps = {
  meals: Meal[];
};

const copyToClipboardWeb = (text: string): boolean => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    console.warn('execCommand copy failed', e);
    return false;
  }
};

export default function ShareButton({ meals }: ShareButtonProps) {
  const handleShare = async () => {
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const message = `MacroZone Daily Summary\n\nCalories: ${totals.calories}\nProtein: ${totals.protein}g\nCarbs: ${totals.carbs}g\nFat: ${totals.fat}g\n\nMeals: ${meals.length} logged today`;

    try {
      if (Platform.OS === 'web') {
        // Try modern clipboard API first
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(message);
            Alert.alert('Copied', 'Summary copied to clipboard!');
            return;
          } catch (e) {
            console.warn('navigator.clipboard failed, trying fallback', e);
          }
        }

        // Fallback: execCommand (works without permissions)
        const success = copyToClipboardWeb(message);
        if (success) {
          Alert.alert('Copied', 'Summary copied to clipboard!');
          return;
        }

        // Last resort: show the text so user can copy manually
        Alert.alert('Your Summary', message);
        return;
      }

      // Native (iOS/Android)
      await Share.share({ message });
    } catch (e: any) {
      console.error('Share failed', e);
      Alert.alert('Error', e?.message || 'Unable to share summary.');
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        console.log('ShareButton pressed');
        handleShare();
      }}
      style={styles.button}
      accessibilityLabel="Share summary"
      activeOpacity={0.7}
    >
      <Ionicons name="share-outline" size={28} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginLeft: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});