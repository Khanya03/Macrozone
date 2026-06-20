import { Meal } from '@/storage/meals';
import { colors } from '@/style/global';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

type CopyButtonProps = {
  meals: Meal[];
};

export default function CopyButton({ meals }: CopyButtonProps) {
  console.log('CopyButton rendered, meals:', meals.length);
    console.log('CopyButton mounted, meals:', meals.length);
  const handleCopy = async () => {
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const summary = `MacroZone Daily Summary\n\nCalories: ${totals.calories}\nProtein: ${totals.protein}g\nCarbs: ${totals.carbs}g\nFat: ${totals.fat}g\n\nMeals: ${meals.length} logged today`;

    try {
        await Clipboard.setStringAsync(summary);
        console.log('CopyButton: copied to clipboard');
    } catch (e: any) {
      console.error('Clipboard copy failed', e);
      Alert.alert('Copy failed', e?.message || String(e));
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.warn('Haptics failed', e);
    }

    Alert.alert('Copied!', 'Macro summary copied to clipboard.');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleCopy} accessibilityLabel="Copy summary">
      <Ionicons name="copy-outline" size={18} color={colors.primary} />
      <Text style={styles.text}>Copy Summary</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});