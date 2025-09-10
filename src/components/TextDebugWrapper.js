// src/components/TextDebugWrapper.js
import React from 'react';
import { Text, View } from 'react-native';

const TextDebugWrapper = ({ children, componentName }) => {
  // Check if children contains any raw strings
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      console.error(`RAW TEXT FOUND in ${componentName}:`, child);
    }
  });

  return (
    <View>
      {React.Children.map(children, (child) => {
        if (typeof child === 'string' || typeof child === 'number') {
          return <Text>{child}</Text>;
        }
        return child;
      })}
    </View>
  );
};

export default TextDebugWrapper;