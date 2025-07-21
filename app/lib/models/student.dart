class Student {
  final int id;
  final String name;
  final String email;
  final int schoolId;
  final String schoolGrade;
  final String? createdAt;
  final String? updatedAt;
  final String? deletedAt;

  Student({
    required this.id,
    required this.name,
    required this.email,
    required this.schoolId,
    required this.schoolGrade,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      schoolId: json['school_id'] ?? 0,
      schoolGrade: json['school_grade'] ?? '',
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      deletedAt: json['deleted_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'school_id': schoolId,
      'school_grade': schoolGrade,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'deleted_at': deletedAt,
    };
  }
} 