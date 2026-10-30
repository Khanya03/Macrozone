import CopyButton from '@/components/CopyButton';
import HomeHeader from '@/components/HomeHeader';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import ReminderToggle from '@/components/ReminderToggle';
import { useGoals } from '@/storage/GoalsContext';
import { useMeals } from '@/storage/MealsContext';
import { colors, globalStyles } from '@/style/global';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { meals } = useMeals();
  const { goals } = useGoals();

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>MacroZone</Text>
      </View>
      <HomeHeader meals={meals} />
      {goals ? <MacroGrid meals={meals} goals={goals} /> : null}
      <TouchableOpacity
        onPress={() => router.push('/goals')}
        style={styles.editGoals}
        accessibilityRole='button'
        accessibilityLabel='Edit daily goals'
      >
        <Text style={styles.editGoalsText}>Edit daily goals</Text>
      </TouchableOpacity>
      <CopyButton meals={meals} />
      <ReminderToggle />
      <RecentMeals meals={meals} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  editGoals: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  editGoalsText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
