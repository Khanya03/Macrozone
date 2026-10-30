import { GoalsProvider } from '@/storage/GoalsContext';
import { MealsProvider } from '@/storage/MealsContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <MealsProvider>
      <GoalsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(tabs)' />
          <Stack.Screen name='goals' />
        </Stack>
      </GoalsProvider>
    </MealsProvider>
  );
}
