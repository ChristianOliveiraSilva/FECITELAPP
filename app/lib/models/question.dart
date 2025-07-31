import 'project.dart';

enum QuestionType {
  multipleChoice(1),
  essay(2);

  const QuestionType(this.value);
  final int value;

  static QuestionType fromValue(int value) {
    return QuestionType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => QuestionType.multipleChoice,
    );
  }
}

class Question {
  final int id;
  final String scientificText;
  final String technologicalText;
  final QuestionType type;
  final int numberAlternatives;

  Question({
    required this.id,
    required this.scientificText,
    required this.technologicalText,
    required this.type,
    required this.numberAlternatives,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] ?? 0,
      scientificText: json['scientific_text'] ?? '',
      technologicalText: json['technological_text'] ?? '',
      type: QuestionType.fromValue(json['type'] ?? 1),
      numberAlternatives: json['number_alternatives'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'scientific_text': scientificText,
      'technological_text': technologicalText,
      'type': type.value,
      'number_alternatives': numberAlternatives,
    };
  }

  String getText(ProjectType projectType) {
    return projectType == ProjectType.scientific ? scientificText : technologicalText;
  }
} 