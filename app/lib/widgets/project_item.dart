import 'package:flutter/material.dart';
import '../models/assessment.dart';
import '../models/project.dart';

class ProjectItem extends StatelessWidget {
  final Assessment assessment;
  final VoidCallback onTap;

  const ProjectItem({
    super.key,
    required this.assessment,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isScientific = assessment.project.projectType == ProjectType.scientific;
    
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 5, horizontal: 0),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(15),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: isScientific 
                      ? const Color(0xFF56BA54) 
                      : const Color(0xFF036DAA),
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Icon(
                  isScientific ? Icons.science : Icons.computer,
                  color: Colors.white,
                  size: 25,
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${assessment.project.externalId} - ${assessment.project.title}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                        children: [
                          TextSpan(
                            text: 'Estudante(s): ${assessment.project.students.map((s) => s.name).join(', ')} - ',
                          ),
                          TextSpan(
                            text: isScientific ? 'Científico' : 'Tecnológico',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: assessment.hasResponse 
                      ? const Color(0xFF56BA54) 
                      : Colors.red,
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Text(
                  assessment.hasResponse ? 'Avaliado' : 'Avaliar',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
} 