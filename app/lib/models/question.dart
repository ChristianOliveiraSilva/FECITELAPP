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

class Response {
  final int id;
  final int questionId;
  final dynamic response; // Pode ser int (múltipla escolha) ou String (aberta)
  final int score;
  final DateTime createdAt;

  Response({
    required this.id,
    required this.questionId,
    this.response,
    required this.score,
    required this.createdAt,
  });

  factory Response.fromJson(Map<String, dynamic> json) {
    return Response(
      id: json['id'] ?? 0,
      questionId: json['question_id'] ?? 0,
      response: json['response'],
      score: json['score'] ?? 0,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question_id': questionId,
      'response': response,
      'score': score,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class Question {
  final int id;
  final String scientificText;
  final String technologicalText;
  final QuestionType type;
  final int numberAlternatives;
  final Response? previousResponse;

  Question({
    required this.id,
    required this.scientificText,
    required this.technologicalText,
    required this.type,
    required this.numberAlternatives,
    this.previousResponse,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] ?? 0,
      scientificText: json['scientific_text'] ?? '',
      technologicalText: json['technological_text'] ?? '',
      type: QuestionType.fromValue(json['type'] ?? 1),
      numberAlternatives: json['number_alternatives'] ?? 0,
      previousResponse: json['response'] != null ? Response.fromJson(json['response']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'scientific_text': scientificText,
      'technological_text': technologicalText,
      'type': type.value,
      'number_alternatives': numberAlternatives,
      'response': previousResponse?.toJson(),
    };
  }

  String getText(ProjectType projectType) {
    return projectType == ProjectType.scientific ? scientificText : technologicalText;
  }
} 