import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

const fetchProjects = async () => {
  try {
    const response = await fetch('http://localhost/assessments');
    if (!response.ok) throw new Error('Erro ao buscar os assessments');
    
    const data = await response.json();
    return data.map((assessment) => ({
      id: assessment.id,
      projectName: assessment.project.title,
      projectArea: assessment.project.area,
      studentName: assessment.project.students.map(student => student.name).join(', '),
      hasResponse: assessment.has_response,
      area: assessment.project.area,
    }));
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
};

const ProjectItem = ({ item, onPress }) => {
  const iconUri = item.area == 2
    ? 'https://img.icons8.com/ios-filled/50/ffffff/microscope.png'
    : 'https://img.icons8.com/ios-filled/50/ffffff/computer.png';

  return (
    <TouchableOpacity onPress={() => onPress(item.id)} style={styles.itemContainer}>
      <View style={[styles.iconContainer, { backgroundColor: item.area == 2 ? '#56BA54' : '#036daa' }]}>
        <Image source={{ uri: iconUri }} style={styles.icon} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.projecID}>({item.id})</Text>
        <Text style={styles.projectName} numberOfLines={2} ellipsizeMode="tail">{item.projectName}</Text>
        <Text style={styles.studentName} numberOfLines={2} ellipsizeMode="tail">Estudante(s): {item.studentName}</Text>
        <Text style={styles.studentName}>Área: {item.projectArea == 1 ? 'Tecnológico' : 'Científico'}</Text>
      </View>

      <View style={styles.assessmentButtonContainer}>
        <Text style={[styles.assessmentText, item.hasResponse ? styles.hasResponse : styles.noResponse]}>
          {item.hasResponse ? 'Avaliado' : 'Avaliar'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function Index() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const data = await fetchProjects();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handlePress = useCallback((id) => {
    router.push(`/questionnaire/${id}`);
  }, [router]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#56BA54" />
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={({ item }) => <ProjectItem item={item} onPress={handlePress} />}
          keyExtractor={(item) => item.id.toString()}
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    width: 20,
    height: 20,
  },
  textContainer: {
    flex: 1,
  },
  projecID: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 14,
    color: '#555',
  },
  assessmentButtonContainer: {
    justifyContent: 'center',
  },
  assessmentText: {
    fontSize: 16,
    fontWeight: 'bold',
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
