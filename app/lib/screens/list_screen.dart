import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/projects_provider.dart';
import '../widgets/header.dart';
import '../widgets/project_item.dart';
import 'questionnaire_screen.dart';

class ListScreen extends StatefulWidget {
  const ListScreen({super.key});

  @override
  State<ListScreen> createState() => _ListScreenState();
}

class _ListScreenState extends State<ListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProjectsProvider>().loadProjects();
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Column(
          children: [
            const Header(),
            Expanded(
              child: Consumer<ProjectsProvider>(
                builder: (context, projectsProvider, child) {
                  if (projectsProvider.isLoading) {
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
                  }

                  if (projectsProvider.error != null) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            projectsProvider.error!,
                            style: const TextStyle(
                              fontSize: 16,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: () {
                              projectsProvider.loadProjects();
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF56BA54),
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('Tentar Novamente'),
                          ),
                        ],
                      ),
                    );
                  }

                  if (projectsProvider.projects.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Não há projetos para serem avaliados',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 30),
                          SizedBox(
                            width: 280,
                            height: 55,
                            child: ElevatedButton(
                              onPressed: () {
                                projectsProvider.loadProjects();
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF56BA54),
                                foregroundColor: Colors.white,
                              ),
                              child: const Text(
                                'Buscar Novas Avaliações',
                                style: TextStyle(fontSize: 16),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () async {
                      await projectsProvider.loadProjects();
                    },
                    color: const Color(0xFF56BA54),
                    backgroundColor: Colors.white,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(8),
                      itemCount: projectsProvider.projects.length,
                      itemBuilder: (context, index) {
                        final projectType = projectsProvider.projects.keys.elementAt(index);
                        final assessments = projectsProvider.projects[projectType]!;

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Text(
                                _getProjectTypeName(projectType),
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                            ),
                            ...assessments.map((assessment) => ProjectItem(
                              assessment: assessment,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => QuestionnaireScreen(
                                      assessment: assessment,
                                      onAssessmentCompleted: () {
                                        // Recarregar a lista quando uma avaliação for completada
                                        projectsProvider.loadProjects();
                                      },
                                    ),
                                  ),
                                );
                              },
                            )),
                          ],
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getProjectTypeName(int projectType) {
    switch (projectType) {
      case 1:
        return 'Projetos Técnicos';
      case 2:
        return 'Projetos Científicos';
      default:
        return 'Tipo de Projeto: $projectType';
    }
  }
} 