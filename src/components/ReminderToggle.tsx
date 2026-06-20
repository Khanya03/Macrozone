import { colors } from '@/style/global';
import {
  cancelMealReminders,
  requestPermissions,
  scheduleMealReminders,
} from '@/utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

const REMINDERS_KEY = 'remindersEnabled';

export default function ReminderToggle() {
  const [enabled, setEnabled] = useState(false);
  const isProcessing = useRef(false);

  useEffect(() => {
    const load = async () => {
      const val = await AsyncStorage.getItem(REMINDERS_KEY);
      setEnabled(val === 'true');
    };
    load();
  }, []);

  const toggle = async (value: boolean) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      if (Platform.OS !== 'web') {
        if (value) {
          const granted = await requestPermissions();
          if (!granted) return;
          await scheduleMealReminders();
        } else {
          await cancelMealReminders();
        }
      }

      setEnabled(value);
      await AsyncStorage.setItem(REMINDERS_KEY, value.toString());
    } finally {
      isProcessing.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Meal Reminders</Text>
      <Switch
        value={enabled}
        onValueChange={toggle}
        trackColor={{ false: colors.surface, true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  label: {
    color: colors.text,
    fontSize: 16,
  },
});