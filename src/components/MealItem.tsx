import { useMeals } from '@/storage/MealsContext';
import { colors } from '@/style/global';
import * as Haptics from 'expo-haptics';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

type MealItemProps = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function MealItem({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
}: MealItemProps) {
  const { deleteMeal } = useMeals();

  const performDelete = async () => {
    try {
      await deleteMeal(id);
    } catch (error) {
      console.error('Failed to delete meal', error);
      Alert.alert('Error', 'Could not delete meal.');
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (e) {
      console.warn('Haptics failed', e);
    }
  };

  const handleLongPress = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
      if (confirmed) {
        void performDelete();
      }
      return;
    }

    Alert.alert('Delete Meal', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void performDelete();
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleLongPress}
      onLongPress={handleLongPress}
    >
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.macros}>
        {calories} cal • {protein}g P • {carbs}g C • {fat}g F
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  macros: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});