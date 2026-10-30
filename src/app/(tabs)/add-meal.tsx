import { useMeals } from '@/storage/MealsContext';
import { colors, globalStyles } from '@/style/global';
import { validateMealDraft, type MealField } from '@/utils/validation';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddMealScreen() {
  const { addMeal } = useMeals();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [errors, setErrors] = useState<Partial<Record<MealField, string>>>({});
  const [saving, setSaving] = useState(false);

  const updateField = (
    field: MealField,
    value: string,
    setter: (next: string) => void,
  ) => {
    setter(value);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleAddMeal = async () => {
    const result = validateMealDraft({ name, calories, protein, carbs, fat });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await addMeal(result.value);

      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');

      Alert.alert('Success', 'Meal added successfully!');
      try {
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (e) {
        console.warn('Haptics failed', e);
      }

      router.push('/');
    } catch (error) {
      console.error('Failed to add meal', error);
      Alert.alert('Error', 'Could not save meal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      keyboardShouldPersistTaps='handled'
      contentContainerStyle={styles.content}
    >
      <Text style={globalStyles.title}>Add Meal</Text>

      <TextInput
        style={[styles.input, errors.name ? styles.inputInvalid : null]}
        placeholder='Meal name'
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={(value) => updateField('name', value, setName)}
        editable={!saving}
        maxLength={80}
      />
      <FieldError message={errors.name} />

      <TextInput
        style={[styles.input, errors.calories ? styles.inputInvalid : null]}
        placeholder='Calories'
        placeholderTextColor={colors.textSecondary}
        keyboardType='decimal-pad'
        value={calories}
        onChangeText={(value) => updateField('calories', value, setCalories)}
        editable={!saving}
      />
      <FieldError message={errors.calories} />

      <View style={styles.row}>
        <View style={styles.rowField}>
          <TextInput
            style={[styles.input, errors.protein ? styles.inputInvalid : null]}
            placeholder='Protein (g)'
            placeholderTextColor={colors.textSecondary}
            keyboardType='decimal-pad'
            value={protein}
            onChangeText={(value) => updateField('protein', value, setProtein)}
            editable={!saving}
          />
          <FieldError message={errors.protein} />
        </View>
        <View style={styles.rowField}>
          <TextInput
            style={[styles.input, errors.carbs ? styles.inputInvalid : null]}
            placeholder='Carbs (g)'
            placeholderTextColor={colors.textSecondary}
            keyboardType='decimal-pad'
            value={carbs}
            onChangeText={(value) => updateField('carbs', value, setCarbs)}
            editable={!saving}
          />
          <FieldError message={errors.carbs} />
        </View>
        <View style={styles.rowField}>
          <TextInput
            style={[styles.input, errors.fat ? styles.inputInvalid : null]}
            placeholder='Fat (g)'
            placeholderTextColor={colors.textSecondary}
            keyboardType='decimal-pad'
            value={fat}
            onChangeText={(value) => updateField('fat', value, setFat)}
            editable={!saving}
          />
          <FieldError message={errors.fat} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, saving ? styles.buttonDisabled : null]}
        onPress={handleAddMeal}
        disabled={saving}
      >
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Add Meal'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputInvalid: {
    borderColor: colors.alert,
  },
  error: {
    color: colors.alert,
    fontSize: 13,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowField: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
