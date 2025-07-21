class Question {
  final int id;
  final String scientificText;
  final String technologicalText;
  final int type;
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
      type: json['type'] ?? 0,
      numberAlternatives: json['number_alternatives'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'scientific_text': scientificText,
      'technological_text': technologicalText,
      'type': type,
      'number_alternatives': numberAlternatives,
    };
  }

  // Método para obter o texto apropriado baseado no tipo de projeto
  String getText(int projectType) {
    return projectType == 2 ? scientificText : technologicalText;
  }
} 