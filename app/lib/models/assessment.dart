import 'project.dart';

class Assessment {
  final int id;
  final Project project;
  final bool hasResponse;
  final Map<String, dynamic>? projectType;

  Assessment({
    required this.id,
    required this.project,
    required this.hasResponse,
    this.projectType,
  });

  factory Assessment.fromJson(Map<String, dynamic> json) {
    return Assessment(
      id: json['id'] ?? 0,
      project: Project.fromJson(json['project'] ?? {}),
      hasResponse: json['has_response'] ?? false,
      projectType: json['project_type'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'project': project.toJson(),
      'has_response': hasResponse,
      'project_type': projectType,
    };
  }
} 