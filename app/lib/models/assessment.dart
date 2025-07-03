import 'project.dart';

class Assessment {
  final int id;
  final Project project;
  final bool hasResponse;

  Assessment({
    required this.id,
    required this.project,
    required this.hasResponse,
  });

  factory Assessment.fromJson(Map<String, dynamic> json) {
    return Assessment(
      id: json['id'] ?? 0,
      project: Project.fromJson(json['project'] ?? {}),
      hasResponse: json['has_response'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'project': project.toJson(),
      'has_response': hasResponse,
    };
  }
} 