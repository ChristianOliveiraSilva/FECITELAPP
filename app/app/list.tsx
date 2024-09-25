import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SCIENTIFIC = 2;

const fetchProjects = async () => {
  try {
    const response = await fetch('http://localhost/assessments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('key')}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) throw new Error('Erro ao buscar os assessments');
    
    const data = await response.json();

    const groupedByCategory = data.reduce((acc, assessment) => {
      const categoryName = assessment.project.category.name;
    
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
    
      acc[categoryName].push({
        id: assessment.id,
        projectName: assessment.project.title,
        projectArea: assessment.project.area,
        projectId: assessment.project.external_id,
        studentName: assessment.project.students.map(student => student.name).join(', '),
        hasResponse: assessment.has_response,
      });
    
      return acc;
    }, {});
    
    return groupedByCategory;
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
};

const ProjectItem = ({ item, onPress }) => {
  const iconUri = item.projectArea == SCIENTIFIC
    ? 'https://img.icons8.com/ios-filled/50/ffffff/microscope.png'
    : 'https://img.icons8.com/ios-filled/50/ffffff/computer.png';

    return (
      <TouchableOpacity key={item.id} onPress={() => onPress(item.id)} style={styles.itemContainer}>
        <View style={[styles.iconContainer, { backgroundColor: item.projectArea == SCIENTIFIC ? '#56BA54' : '#036daa' }]}>
          <Image source={{ uri: iconUri }} style={styles.icon} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.projectName} numberOfLines={2} ellipsizeMode="tail">{item.projectId} - {item.projectName}</Text>
          <Text style={styles.studentName} numberOfLines={2} ellipsizeMode="tail">Estudante(s): {item.studentName}</Text>
          <Text style={styles.studentName}>{item.projectArea == SCIENTIFIC ? 'Científico' : 'Tecnológico'}</Text>
        </View>

        <View style={styles.assessmentButtonContainer}>
          <Text style={[styles.assessmentText, item.hasResponse ? styles.hasResponse : styles.noResponse]}>
            {item.hasResponse ? 'Avaliado' : 'Avaliar'}
          </Text>
        </View>
      </TouchableOpacity>
    );
};

export default function List() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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
    navigation.navigate('questionnaire/[assessmentId]', { assessmentId: id });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#56BA54" />
        </View>
      ) : Object.entries(projects).length == 0 ? (
        <View style={styles.noProjectsContainer}>
          <Text style={[styles.noProjectsText, {marginBottom: 20}]}>Não há projetos para serem avaliados</Text>
          <Button title="Tentar Novamente" onPress={loadProjects} color="#56BA54" />
        </View>
      ) : (
        <>
          {
            Object.keys(projects).map((group, index) => (
              <View key={index}>
                <Text style={styles.groupTitle}>{group}</Text>

                {projects[group].map((item) => (
                  <ProjectItem 
                    key={item.id} 
                    item={item} 
                    onPress={handlePress} 
                  />
                ))}
              </View>
            ))
          }
        </>
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
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
    textAlign: 'left',
    paddingLeft: 10,
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
  noProjectsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProjectsText: {
    fontSize: 18,
    color: '#666',
  },
});
