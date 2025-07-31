enum SchoolGrade {
  fundamental(1),
  medio(2);

  const SchoolGrade(this.value);
  final int value;

  static SchoolGrade fromValue(int value) {
    return SchoolGrade.values.firstWhere(
      (grade) => grade.value == value,
      orElse: () => SchoolGrade.fundamental,
    );
  }
}

class Student {
  final int id;
  final String name;
  final String email;
  final int schoolId;
  final SchoolGrade schoolGrade;
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
      schoolGrade: SchoolGrade.fromValue(json['school_grade'] ?? 1),
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
      'school_grade': schoolGrade.value,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'deleted_at': deletedAt,
    };
  }
} 