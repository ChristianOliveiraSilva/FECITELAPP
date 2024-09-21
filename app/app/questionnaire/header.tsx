import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = ({ project }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText} numberOfLines={2} ellipsizeMode="tail">({project.projectId}) {project.projectName}</Text>
      <Text style={styles.subHeaderText} numberOfLines={2} ellipsizeMode="tail">Estudante(s): {project.studentNames}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#56BA54',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default Header;
