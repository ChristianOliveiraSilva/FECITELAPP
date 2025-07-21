import 'package:flutter/material.dart';

class OpenQuestion extends StatelessWidget {
  final dynamic currentAnswer;
  final Function(dynamic) onAnswerChanged;

  const OpenQuestion({
    super.key,
    required this.currentAnswer,
    required this.onAnswerChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Digite sua resposta:',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.withOpacity(0.3)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TextField(
            maxLines: 6,
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.all(16),
              hintText: 'Digite sua resposta aqui...',
              hintStyle: TextStyle(color: Colors.grey),
            ),
            style: const TextStyle(fontSize: 16),
            controller: TextEditingController(text: currentAnswer?.toString() ?? ''),
            onChanged: (value) {
              onAnswerChanged(value);
            },
          ),
        ),
      ],
    );
  }
} 