class Question {
  final int id;
  final String text;
  final int type;
  final int numberAlternatives;

  Question({
    required this.id,
    required this.text,
    required this.type,
    required this.numberAlternatives,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] ?? 0,
      text: json['text'] ?? '',
      type: json['type'] ?? 0,
      numberAlternatives: json['number_alternatives'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
      'type': type,
      'number_alternatives': numberAlternatives,
    };
  }
} 