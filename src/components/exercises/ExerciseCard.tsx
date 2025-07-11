import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BaseExerciseCard, CARD_WIDTH } from './BaseExerciseCard';
import { BaseExerciseCardProps } from '@/utils/exerciseHelpers';

type ExerciseCardProps = BaseExerciseCardProps;

export function ExerciseCard(props: ExerciseCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { width: CARD_WIDTH }]}
      onPress={props.onPress}
      activeOpacity={0.85}
    >
      <BaseExerciseCard {...props} />
    </TouchableOpacity>
  );
}

export { BaseExerciseCardSkeleton as ExerciseCardSkeleton } from './BaseExerciseCard';

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});