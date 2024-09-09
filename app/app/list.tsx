import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Image } from 'react-native';

const fetchProjects = async () => {
  try {
    const response = await fetch('http://localhost/assessments');
    
    if (!response.ok) {
      throw new Error('Erro ao buscar os assessments');
    }
    
    const data = await response.json();
    
    return data.map((assessment: any) => ({
      id: assessment.id,
      projectName: assessment.project.title,
      studentName: assessment.project.students.map((student: any) => student.name).join(', '),
    }));
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
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

      <View style={styles.assessmentButtonContainer}>
        <Link
          href={{
            pathname: '/questionnaire/[assessmentId]',
            params: { assessmentId: item.id },
          }}>
          <Text>Avaliar</Text>
        </Link>
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
    justifyContent: 'space-between',
    gap: 10,
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
  assessmentButtonContainer: {
    alignItems: 'flex-end',
    flex: 1,
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
