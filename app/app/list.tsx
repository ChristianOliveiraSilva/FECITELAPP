import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

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
      hasResponse: assessment.has_response,
      type: assessment.project.type,
    }));
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
};

export default function Index() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
      setLoading(false);
    };

    loadProjects();
  }, []);

  const handlePress = (id: string) => {
    router.push(`/questionnaire/${id}`);
  };

  const renderItem = ({ item }) => {
    const iconUri = item.type == 'cientifico'
      ? 'https://img.icons8.com/ios-filled/50/ffffff/microscope.png'
      : 'https://img.icons8.com/ios-filled/50/ffffff/computer.png';
  
    return (
      <TouchableOpacity onPress={() => handlePress(item.id)} style={styles.itemContainer}>
        <View style={[styles.iconContainer, { backgroundColor: item.type == 'cientifico' ? '#56BA54' : '#036daa' }]}>
          <Image
            source={{
              uri: iconUri,
            }}
            style={styles.icon}
          />
        </View>
  
        <View>
          <Text style={styles.projectName}>{item.projectName} (ID: {item.id})</Text>
          <Text style={styles.studentName}>{item.studentName}</Text>
        </View>
  
        <View style={styles.assessmentButtonContainer}>
          <Text style={[
            styles.assessmentText,
            item.hasResponse ? styles.hasResponse : styles.noResponse
          ]}>
            {item.hasResponse ? 'Avaliado' : 'Avaliar'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#56BA54" />
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5FCFF',
  },
  flatListContent: {
    flexGrow: 1, 
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
    backgroundColor: '#56BA54',
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
  assessmentText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  hasResponse: {
    color: '#56BA54',
  },
  noResponse: {
    color: 'red',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
