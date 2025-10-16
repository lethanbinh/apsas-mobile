import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { s, vs } from 'react-native-size-matters';
import QuestionAccordion from '../components/assessments/QuestionAccordion';
import ScreenHeader from '../components/common/ScreenHeader';
import AppSafeView from '../components/views/AppSafeView';
const MOCK_QUESTIONS = [
  {
    id: 1,
    title: 'Question 1: Create a program',
    description:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do sit amet. Velit officia consequat duis enim velit mollit. Exercitation ven...',
    imageUrl: require('../assets/images/code.png'),
  },
  {
    id: 2,
    title: 'Question 2: Create a program',
    description:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do sit amet. Velit officia consequat duis enim velit mollit. Exercitation ven...',
    imageUrl: require('../assets/images/code.png'),
  },
  { id: 3, title: 'Question 3: Create a program', description: '...', imageUrl: require('../assets/images/code.png') },
  { id: 4, title: 'Question 4: Create a program', description: '...', imageUrl: require('../assets/images/code.png') },
  { id: 5, title: 'Question 5: Create a program', description: '...', imageUrl: require('../assets/images/code.png') },
];

const RequirementScreen = () => {
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const handleToggle = (id: number) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Paper Assignment1" />
      <ScrollView contentContainerStyle={styles.container}>
        {MOCK_QUESTIONS.map(question => (
          <QuestionAccordion
            key={question.id}
            title={question.title}
            description={question.description}
            imageUrl={question.imageUrl}
            isExpanded={expandedId === question.id}
            onPress={() => handleToggle(question.id)}
            showCriteria={false} // << TRUYỀN PROP ĐỂ ẨN CRITERIA
          />
        ))}
      </ScrollView>

    </AppSafeView>
  );
};

export default RequirementScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(20),
    paddingVertical: vs(16),
  },
});