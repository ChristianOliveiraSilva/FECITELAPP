import 'package:flutter/material.dart';
import '../../models/assessment.dart';

class AssessmentDetailsCard extends StatelessWidget {
  final Assessment assessment;
  final VoidCallback onStartAssessment;
  final VoidCallback onCancel;

  const AssessmentDetailsCard({
    super.key,
    required this.assessment,
    required this.onStartAssessment,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Scrollable content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF4CAF50).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(
                                    Icons.info_outline,
                                    color: Color(0xFF4CAF50),
                                    size: 24,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Detalhes do Projeto',
                                        style: TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey[800],
                                        ),
                                      ),
                                      Text(
                                        'Revise as informações antes de iniciar',
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            
                            // Tabela de detalhes
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                children: [
                                  _buildTableRow('ID', assessment.project.externalId, isHeader: true),
                                  _buildTableRow('Título', assessment.project.title),
                                  _buildTableRow(
                                    'Tipo',
                                    assessment.project.projectType == 2 ? 'Científico' : 'Tecnológico',
                                  ),
                                  _buildTableRow('Categoria', assessment.project.category.name),
                                  _buildTableRow('Ano', assessment.project.year.toString()),
                                  _buildTableRow(
                                    'Estudante(s)',
                                    assessment.project.students.map((s) => s.name).join(', '),
                                  ),
                                  _buildTableRow('Descrição', assessment.project.description, isLast: true),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Fixed buttons at bottom
            Container(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF4CAF50), Color(0xFF45A049)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF4CAF50).withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: onStartAssessment,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.play_arrow, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Iniciar Avaliação',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: onCancel,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Color(0xFF4CAF50)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Cancelar',
                        style: TextStyle(
                          color: Color(0xFF4CAF50),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTableRow(String label, String value, {bool isHeader = false, bool isLast = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isHeader ? const Color(0xFF4CAF50).withOpacity(0.1) : Colors.transparent,
        borderRadius: BorderRadius.only(
          topLeft: isHeader ? const Radius.circular(12) : Radius.zero,
          topRight: isHeader ? const Radius.circular(12) : Radius.zero,
          bottomLeft: isLast ? const Radius.circular(12) : Radius.zero,
          bottomRight: isLast ? const Radius.circular(12) : Radius.zero,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isHeader ? FontWeight.bold : FontWeight.w600,
                color: isHeader ? const Color(0xFF4CAF50) : Colors.grey[700],
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                color: isHeader ? const Color(0xFF4CAF50) : Colors.grey[900],
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
} 