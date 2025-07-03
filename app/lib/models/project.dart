import 'category.dart';
import 'student.dart';

class Project {
  final String title;
  final String externalId;
  final int area;
  final int year;
  final String description;
  final Category category;
  final List<Student> students;

  Project({
    required this.title,
    required this.externalId,
    required this.area,
    required this.year,
    required this.description,
    required this.category,
    required this.students,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      title: json['title'] ?? '',
      externalId: json['external_id'] ?? '',
      area: json['area'] ?? 0,
      year: json['year'] ?? 0,
      description: json['description'] ?? '',
      category: Category.fromJson(json['category'] ?? {}),
      students: (json['students'] as List<dynamic>?)
              ?.map((student) => Student.fromJson(student))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'external_id': externalId,
      'area': area,
      'year': year,
      'description': description,
      'category': category.toJson(),
      'students': students.map((student) => student.toJson()).toList(),
    };
  }
} 