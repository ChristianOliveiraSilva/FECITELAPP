import 'package:flutter/material.dart';
import '../../models/question.dart';

class MultipleChoiceQuestion extends StatelessWidget {
  final Question question;
  final dynamic currentAnswer;
  final Function(dynamic) onAnswerChanged;

  const MultipleChoiceQuestion({
    super.key,
    required this.question,
    required this.currentAnswer,
    required this.onAnswerChanged,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    const outerPadding = 40.0; // padding do container pai (20 + 20)
    const innerPadding = 48.0; // padding do card (24 + 24)
    const spacing = 12.0; // espaçamento entre itens
    final availableWidth = screenWidth - outerPadding - innerPadding;
    final itemWidth = (availableWidth - (spacing * 3)) / 4; // 4 itens por linha
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Selecione uma nota:',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
        const SizedBox(height: 16),
        Container(
          constraints: const BoxConstraints(
            minHeight: 100,
          ),
          child: Wrap(
            spacing: spacing,
            runSpacing: spacing,
            alignment: WrapAlignment.start,
            children: List.generate(
              question.numberAlternatives + 1,
              (index) => GestureDetector(
                onTap: () {
                  onAnswerChanged(index);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: itemWidth,
                  height: itemWidth,
                  decoration: BoxDecoration(
                    color: currentAnswer == index
                        ? const Color(0xFF4CAF50)
                        : Colors.white,
                    border: Border.all(
                      color: currentAnswer == index
                          ? const Color(0xFF4CAF50)
                          : Colors.grey.withOpacity(0.3),
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: currentAnswer == index
                        ? [
                            BoxShadow(
                              color: const Color(0xFF4CAF50).withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ]
                        : null,
                  ),
                  child: Center(
                    child: Text(
                      index.toString(),
                      style: TextStyle(
                        color: currentAnswer == index
                            ? Colors.white
                            : Colors.grey[700],
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
} 