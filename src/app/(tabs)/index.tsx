import CopyButton from '@/components/CopyButton';
import HomeHeader from '@/components/HomeHeader';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import ReminderToggle from '@/components/ReminderToggle';
import { getMeals, Meal } from '@/storage/meals';
import { globalStyles } from '@/style/global';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
    console.log('Loaded meals:', data);
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  useEffect(() => {
    const handler = () => loadMeals();
    if (typeof window !== 'undefined' && 'addEventListener' in window) {
      window.addEventListener('mealsChanged', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined' && 'removeEventListener' in window) {
        window.removeEventListener('mealsChanged', handler as EventListener);
      }
    };
  }, []);

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>MacroZone</Text>
      </View>
      <HomeHeader meals={meals} />
      <MacroGrid meals={meals}/>
      <CopyButton meals={meals} />
      <ReminderToggle />
      <RecentMeals meals={meals} onDelete={loadMeals} />
    </ScrollView>
  );
}