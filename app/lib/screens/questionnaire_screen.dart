import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/assessment.dart';
import '../models/question.dart';
import '../services/api_service.dart';
import '../widgets/header.dart';
import '../widgets/questionnaire/index.dart';

class QuestionnaireScreen extends StatefulWidget {
  final Assessment assessment;
  final VoidCallback? onAssessmentCompleted;

  const QuestionnaireScreen({
    super.key,
    required this.assessment,
    this.onAssessmentCompleted,
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

      // Usar o objeto assessment passado
      _assessment = widget.assessment;
      
      // Buscar apenas as perguntas da avaliação
      final questionsResponse = await ApiService.get('/questions/${widget.assessment.id}');
      final questionsData = json.decode(utf8.decode(questionsResponse.bodyBytes));
      
      if (questionsData['status'] == true) {
        final data = questionsData['data'];
        _questions = (data['questions'] as List)
            .map((q) => Question.fromJson(q))
            .toList();
        _answers = List.filled(_questions.length, null);
      } else {
        setState(() {
          _errorMessage = questionsData['message'] ?? 'Erro ao carregar perguntas';
        });
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

    if (currentQuestion.type == QuestionType.multipleChoice && response == null) {
      setState(() {
        _errorMessage = 'Esta pergunta é obrigatória.';
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
      final requestData = {
        'assessment': widget.assessment.id,
        'responses': _questions.asMap().entries.map((entry) {
          final index = entry.key;
          final question = entry.value;
          return {
            'question_id': question.id,
            'type': question.type.value,
            'value': _answers[index]?.toString() ?? '',
          };
        }).toList(),
      };
      
      // Debug: imprimir dados sendo enviados
      print('Dados sendo enviados: ${jsonEncode(requestData)}');
      
      final response = await ApiService.post('/responses', requestData);

      // Debug: imprimir resposta do servidor
      print('Status code: ${response.statusCode}');
      print('Response body: ${response.body}');
      
      final data = json.decode(utf8.decode(response.bodyBytes));
      
      if (data['status'] == true) {
        if (mounted) {
          widget.onAssessmentCompleted?.call();
          Navigator.of(context).pop();
        }
      } else {
        setState(() {
          _errorMessage = data['message'] ?? 'Erro ao enviar respostas';
        });
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
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Column(
          children: [
            if (_screen == 0) const Header(),
            if (_screen != 0 && _assessment != null)
              ProjectHeader(assessment: _assessment!),
            Expanded(
              child: _buildContent(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF4CAF50).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF4CAF50).withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4CAF50),
                        borderRadius: BorderRadius.circular(50),
                      ),
                      child: const Icon(
                        Icons.info_outline,
                        color: Colors.white,
                        size: 32,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Atenção',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF4CAF50),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _errorMessage!,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[700],
                        height: 1.4,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() {
                          _errorMessage = null;
                        });
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF4CAF50),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      icon: const Icon(Icons.check, size: 18),
                      label: const Text('Entendi'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_assessment == null) {
      return const Center(child: Text('Avaliação não encontrada'));
    }

    switch (_screen) {
      case 0:
        return AssessmentDetailsCard(
          assessment: _assessment!,
          onStartAssessment: _nextScreen,
          onCancel: () => Navigator.of(context).pop(),
        );
      case 1:
        return QuestionScreen(
          question: _questions[_currentQuestionIndex],
          assessment: _assessment!,
          currentQuestionIndex: _currentQuestionIndex + 1,
          totalQuestions: _questions.length,
          currentAnswer: _answers[_currentQuestionIndex],
          onAnswerChanged: (value) {
            setState(() {
              _answers[_currentQuestionIndex] = value;
            });
          },
          onNext: _nextQuestion,
          onPrevious: _prevQuestion,
          errorMessage: _errorMessage,
        );
      case 2:
        return ResultsScreen(
          questions: _questions,
          answers: _answers,
          assessment: _assessment!,
          onSubmit: _submitAnswers,
          onCancel: () => Navigator.of(context).pop(),
        );
      default:
        return const Center(child: Text('Tela não encontrada'));
    }
  }
} 