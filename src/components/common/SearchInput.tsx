import React from 'react';
import { StyleSheet } from 'react-native';
import { s } from 'react-native-size-matters';
import AppTextInput from '../inputs/AppTextInput';

interface SearchInputProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
}
const SearchInput = ({ title, value, onChange }: SearchInputProps) => {
  return (
    <AppTextInput
      placeholder={title}
      searchType
      style={{
        borderWidth: 0,
        paddingHorizontal: s(25),
      }}
      value={value}
      onChangeText={onChange}
    />
  );
};

export default SearchInput;

const styles = StyleSheet.create({});
