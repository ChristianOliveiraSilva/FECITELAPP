import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Image } from 'react-native';

const fetchProjects = async () => {
  return [
    { id: '1', projectName: 'Projeto A', studentName: 'Aluno 1' },
    { id: '2', projectName: 'Projeto B', studentName: 'Aluno 2' },
    { id: '3', projectName: 'Projeto C', studentName: 'Aluno 3' },
  ];
};

export default function Index() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      const data = await fetchProjects();
      setProjects(data);
    };

    loadProjects();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Image
          source={{
            uri: 'https://img.icons8.com/ios-filled/50/ffffff/user.png',
          }}
          style={styles.icon}
        />
      </View>
      <View>
        <Text style={styles.projectName}>{item.projectName}</Text>
        <Text style={styles.studentName}>{item.studentName}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5FCFF',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    width: 20,
    height: 20,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 14,
    color: '#555',
  },
});
