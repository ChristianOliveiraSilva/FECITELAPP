import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/assessment.dart';
import '../models/question.dart';
import '../services/api_service.dart';
import '../widgets/header.dart';

class QuestionnaireScreen extends StatefulWidget {
  final int assessmentId;

  const QuestionnaireScreen({
    super.key,
    required this.assessmentId,
  });

  @override
  State<QuestionnaireScreen> createState() => _QuestionnaireScreenState();
}

class _QuestionnaireScreenState extends State<QuestionnaireScreen> {
  Assessment? _assessment;
  List<Question> _questions = [];
  List<dynamic> _answers = [];
  int _currentQuestionIndex = 0;
  int _screen = 0;
  bool _isLoading = true;
  String? _errorMessage;

  static const int multipleChoiceQuestion = 1;
  static const int openQuestion = 2;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      final assessmentResponse = await ApiService.get('/assessments');
      final questionsResponse = await ApiService.get('/questions/${widget.assessmentId}');

      if (assessmentResponse.statusCode == 200 && questionsResponse.statusCode == 200) {
        final assessments = jsonDecode(assessmentResponse.body) as List;
        final assessmentData = assessments.firstWhere(
          (a) => a['id'] == widget.assessmentId,
          orElse: () => null,
        );

        if (assessmentData != null) {
          _assessment = Assessment.fromJson(assessmentData);
          _questions = (jsonDecode(questionsResponse.body) as List)
              .map((q) => Question.fromJson(q))
              .toList();
          _answers = List.filled(_questions.length, null);
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Erro ao carregar dados.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _nextScreen() {
    setState(() {
      _screen++;
      _errorMessage = null;
    });
  }

  void _nextQuestion() {
    final response = _answers[_currentQuestionIndex];
    final currentQuestion = _questions[_currentQuestionIndex];

    if (currentQuestion.type == multipleChoiceQuestion && response == null) {
      setState(() {
        _errorMessage = 'Esta pergunta é obrigatória.';
      });
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            _errorMessage = null;
          });
        }
      });
      return;
    }

    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
        _errorMessage = null;
      });
    } else {
      _nextScreen();
    }
  }

  void _prevQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
        _errorMessage = null;
      });
    }
  }

  Future<void> _submitAnswers() async {
    try {
      final response = await ApiService.post('/responses', {
        'assessment': widget.assessmentId,
        'responses': _questions.asMap().entries.map((entry) {
          final index = entry.key;
          final question = entry.value;
          return {
            'question_id': question.id,
            'type': question.type,
            'value': _answers[index],
          };
        }).toList(),
      });

      if (response.statusCode == 200) {
        if (mounted) {
          Navigator.of(context).pop();
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Erro ao enviar respostas.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const Header(),
          if (_screen != 0 && _assessment != null)
            Container(
              color: const Color(0xFF4CAF50),
              padding: const EdgeInsets.all(15),
              child: Column(
                children: [
                  Text(
                    '${_assessment!.project.externalId} - ${_assessment!.project.title}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Estudante(s): ${_assessment!.project.students.map((s) => s.name).join(', ')}',
                    style: const TextStyle(color: Colors.white),
                  ),
                ],
              ),
            ),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(child: Text(_errorMessage!));
    }

    if (_assessment == null) {
      return const Center(child: Text('Avaliação não encontrada'));
    }

    switch (_screen) {
      case 0:
        return _buildAssessmentDetails();
      case 1:
        return _buildQuestion();
      case 2:
        return _buildResults();
      default:
        return const Center(child: Text('Tela não encontrada'));
    }
  }

  Widget _buildAssessmentDetails() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailRow('ID:', _assessment!.project.externalId),
                  _buildDetailRow('Título:', _assessment!.project.title),
                  _buildDetailRow(
                    'Tipo:',
                    _assessment!.project.area == 2 ? 'Científico' : 'Tecnológico',
                  ),
                  _buildDetailRow('Categoria:', _assessment!.project.category.name),
                  _buildDetailRow('Ano:', _assessment!.project.year.toString()),
                  _buildDetailRow(
                    'Estudante(s):',
                    _assessment!.project.students.map((s) => s.name).join(', '),
                  ),
                  _buildDetailRow('Descrição:', _assessment!.project.description),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _nextScreen,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF56BA54),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
              ),
              child: const Text('Iniciar Avaliação'),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(fontSize: 16, color: Colors.black),
          children: [
            TextSpan(text: label, style: const TextStyle(fontWeight: FontWeight.bold)),
            TextSpan(text: ' $value'),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestion() {
    if (_currentQuestionIndex >= _questions.length) {
      return const Center(child: Text('Pergunta não encontrada'));
    }

    final question = _questions[_currentQuestionIndex];

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${_currentQuestionIndex + 1}. ${question.text}',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          if (question.type == multipleChoiceQuestion)
            _buildMultipleChoiceQuestion(question)
          else if (question.type == openQuestion)
            _buildOpenQuestion(question),
          if (_errorMessage != null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red),
              ),
            ),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (_currentQuestionIndex > 0)
                ElevatedButton(
                  onPressed: _prevQuestion,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Voltar'),
                )
              else
                const SizedBox.shrink(),
              ElevatedButton(
                onPressed: _nextQuestion,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF56BA54),
                  foregroundColor: Colors.white,
                ),
                child: Text(
                  _currentQuestionIndex < _questions.length - 1 ? 'Avançar' : 'Finalizar',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMultipleChoiceQuestion(Question question) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: List.generate(
        question.numberAlternatives + 1,
        (index) => GestureDetector(
          onTap: () {
            setState(() {
              _answers[_currentQuestionIndex] = index;
            });
          },
          child: Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: _answers[_currentQuestionIndex] == index
                  ? const Color(0xFF4CAF50)
                  : const Color(0xFFB0B0B0),
              borderRadius: BorderRadius.circular(5),
            ),
            child: Center(
              child: Text(
                index.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOpenQuestion(Question question) {
    return TextField(
      maxLines: 6,
      decoration: const InputDecoration(
        border: OutlineInputBorder(),
        hintText: 'Digite sua resposta...',
      ),
      onChanged: (value) {
        _answers[_currentQuestionIndex] = value;
      },
    );
  }

  Widget _buildResults() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Expanded(
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: ListView.builder(
                  itemCount: _questions.length,
                  itemBuilder: (context, index) {
                    final question = _questions[index];
                    final answer = _answers[index];
                    
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            question.text,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 5),
                          Text(answer != null ? answer.toString() : 'sem resposta'),
                          const Divider(),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submitAnswers,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF56BA54),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
              ),
              child: const Text('Finalizar Avaliação'),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
          ),
        ],
      ),
    );
  }
} 