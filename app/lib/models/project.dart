import 'category.dart';
import 'student.dart';

enum ProjectType {
  technological(1),
  scientific(2);

  const ProjectType(this.value);
  final int value;

  static ProjectType fromValue(int value) {
    return ProjectType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => ProjectType.technological,
    );
  }
}

class Project {
  final int id;
  final String title;
  final String externalId;
  final ProjectType projectType;
  final int year;
  final String description;
  final Category category;
  final List<Student> students;
  final String? createdAt;
  final String? updatedAt;
  final String? deletedAt;

  Project({
    required this.id,
    required this.title,
    required this.externalId,
    required this.projectType,
    required this.year,
    required this.description,
    required this.category,
    required this.students,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      externalId: json['external_id']?.toString() ?? '',
      projectType: ProjectType.fromValue(json['project_type']?['value'] ?? json['project_type'] ?? json['projectType'] ?? 1),
      year: json['year'] ?? 0,
      description: json['description'] ?? '',
      category: Category.fromJson(json['category'] ?? {}),
      students: (json['students'] as List<dynamic>?)
              ?.map((student) => Student.fromJson(student))
              .toList() ??
          [],
      createdAt: json['created_at']?.toString(),
      updatedAt: json['updated_at']?.toString(),
      deletedAt: json['deleted_at']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'external_id': externalId,
      'projectType': projectType.value,
      'year': year,
      'description': description,
      'category': category.toJson(),
      'students': students.map((student) => student.toJson()).toList(),
      'created_at': createdAt,
      'updated_at': updatedAt,
      'deleted_at': deletedAt,
    };
  }
} 