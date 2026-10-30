import { useGoals } from '@/storage/GoalsContext';
import { colors, globalStyles } from '@/style/global';
import { validateGoalsDraft, type GoalField } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function GoalsScreen() {
  const { goals, saveGoals } = useGoals();
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [errors, setErrors] = useState<Partial<Record<GoalField, string>>>({});
  const [saving, setSaving] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!goals || hydrated.current) return;
    hydrated.current = true;
    setCalories(String(goals.calories));
    setProtein(String(goals.protein));
    setCarbs(String(goals.carbs));
    setFat(String(goals.fat));
  }, [goals]);

  const updateField = (
    field: GoalField,
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

  const handleSave = async () => {
    const result = validateGoalsDraft({ calories, protein, carbs, fat });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await saveGoals(result.value);
      Alert.alert('Saved', 'Daily goals updated.');
      router.back();
    } catch (error) {
      console.error('Failed to save goals', error);
      Alert.alert('Error', 'Could not save daily goals.');
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
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        accessibilityRole='button'
        accessibilityLabel='Go back'
      >
        <Ionicons name='chevron-back' size={22} color={colors.primary} />
        <Text style={styles.backText}>Home</Text>
      </TouchableOpacity>

      <Text style={globalStyles.title}>Daily Goals</Text>
      <Text style={styles.subtitle}>
        These targets show on the home screen and stay on this device.
      </Text>

      <Text style={styles.label}>Calories</Text>
      <TextInput
        style={[styles.input, errors.calories ? styles.inputInvalid : null]}
        placeholder='Calories'
        placeholderTextColor={colors.textSecondary}
        keyboardType='decimal-pad'
        value={calories}
        onChangeText={(value) => updateField('calories', value, setCalories)}
        editable={!saving && goals != null}
      />
      <FieldError message={errors.calories} />

      <Text style={styles.label}>Protein (g)</Text>
      <TextInput
        style={[styles.input, errors.protein ? styles.inputInvalid : null]}
        placeholder='Protein (g)'
        placeholderTextColor={colors.textSecondary}
        keyboardType='decimal-pad'
        value={protein}
        onChangeText={(value) => updateField('protein', value, setProtein)}
        editable={!saving && goals != null}
      />
      <FieldError message={errors.protein} />

      <Text style={styles.label}>Carbs (g)</Text>
      <TextInput
        style={[styles.input, errors.carbs ? styles.inputInvalid : null]}
        placeholder='Carbs (g)'
        placeholderTextColor={colors.textSecondary}
        keyboardType='decimal-pad'
        value={carbs}
        onChangeText={(value) => updateField('carbs', value, setCarbs)}
        editable={!saving && goals != null}
      />
      <FieldError message={errors.carbs} />

      <Text style={styles.label}>Fat (g)</Text>
      <TextInput
        style={[styles.input, errors.fat ? styles.inputInvalid : null]}
        placeholder='Fat (g)'
        placeholderTextColor={colors.textSecondary}
        keyboardType='decimal-pad'
        value={fat}
        onChangeText={(value) => updateField('fat', value, setFat)}
        editable={!saving && goals != null}
      />
      <FieldError message={errors.fat} />

      <TouchableOpacity
        style={[styles.button, saving || goals == null ? styles.buttonDisabled : null]}
        onPress={handleSave}
        disabled={saving || goals == null}
      >
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Goals'}</Text>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 0,
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
