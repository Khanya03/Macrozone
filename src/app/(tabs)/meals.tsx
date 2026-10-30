import MealItem from '@/components/MealItem';
import { useMeals } from '@/storage/MealsContext';
import { colors, globalStyles } from '@/style/global';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AllMealsScreen() {
  const { meals, clearMeals } = useMeals();
  const [clearing, setClearing] = useState(false);

  const handleClearAll = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await clearMeals();
    } catch (error) {
      console.error('Failed to clear meals', error);
      Alert.alert('Error', 'Could not clear meals.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>All Meals</Text>
        <TouchableOpacity
          onPress={handleClearAll}
          style={[
            styles.clearButton,
            clearing || meals.length === 0 ? styles.clearButtonDisabled : null,
          ]}
          disabled={clearing || meals.length === 0}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 30 }}>
        {meals.length === 0 ? (
          <Text style={globalStyles.empty}>No meals logged yet.</Text>
        ) : (
          meals.map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    backgroundColor: colors.alert,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonDisabled: {
    opacity: 0.45,
  },
});
