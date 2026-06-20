import { Meal } from '@/storage/meals';
import { colors, globalStyles } from '@/style/global';
import { StyleSheet, Text, View } from 'react-native';
import ShareButton from './ShareButton';

type HomeHeaderProps = {
  meals?: Meal[];
};

export default function HomeHeader({ meals = [] }: HomeHeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={globalStyles.header}>
      <Text style={styles.date}>{currentDate}</Text>
      <ShareButton meals={meals} />
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 30,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});