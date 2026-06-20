import { deleteMeal } from '@/storage/meals';
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
  onDelete: () => void;
};

export default function MealItem({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  onDelete,
}: MealItemProps) {
  const handleLongPress = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
      if (confirmed) {
        await deleteMeal(id);
        try {
          if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        } catch (e) {
          console.warn('Haptics failed', e);
        }
        if (onDelete && typeof onDelete === 'function') {
          onDelete();
        } else {
          console.warn('MealItem: onDelete prop is not a function');
        }
      }
      return;
    }

    Alert.alert('Delete Meal', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMeal(id);
          try {
            if (Platform.OS !== 'web') {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          } catch (e) {
            console.warn('Haptics failed', e);
          }
          if (onDelete && typeof onDelete === 'function') {
            onDelete();
          } else {
            console.warn('MealItem: onDelete prop is not a function');
          }
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