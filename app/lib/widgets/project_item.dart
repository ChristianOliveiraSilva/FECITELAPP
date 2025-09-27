import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../models/assessment.dart';
import '../models/project.dart';
import '../constants/app_theme.dart';
import '../screens/questionnaire_screen.dart';

class ProjectItem extends StatelessWidget {
  final Assessment assessment;
  final VoidCallback onTap;
  final VoidCallback? onAssessmentCompleted;

  const ProjectItem({
    super.key,
    required this.assessment,
    required this.onTap,
    this.onAssessmentCompleted,
  });

  Future<void> _scanQRCodeAndValidate(BuildContext context) async {
    final controller = MobileScannerController();
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Header do modal
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF56BA54),
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.qr_code_scanner, color: Colors.white, size: 24),
                  const SizedBox(width: 12),
                  const Text(
                    'Escanear QR Code do Projeto',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: Colors.white),
                  ),
                ],
              ),
            ),
            // Scanner
            Expanded(
              child: MobileScanner(
                controller: controller,
                onDetect: (BarcodeCapture capture) {
                  final List<Barcode> barcodes = capture.barcodes;
                  for (final barcode in barcodes) {
                    if (barcode.rawValue != null) {
                      Navigator.pop(context);
                      _validateAndOpenProject(context, barcode.rawValue!);
                      break;
                    }
                  }
                },
              ),
            ),
            // Instruções
            Container(
              padding: const EdgeInsets.all(16),
              child: const Text(
                'Posicione o QR Code do projeto dentro do quadro para escaneá-lo',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black54,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _validateAndOpenProject(BuildContext context, String scannedValue) {
    // Verificar se o QR Code escaneado corresponde ao externalId do projeto
    if (scannedValue.trim() == assessment.project.externalId.trim()) {
      // QR Code válido - abrir a tela de avaliação
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => QuestionnaireScreen(
            assessment: assessment,
            onAssessmentCompleted: onAssessmentCompleted,
          ),
        ),
      );
    } else {
      // QR Code inválido - mostrar mensagem de erro
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.error_outline,
                    color: Colors.red,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Erro',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.red,
                  ),
                ),
              ],
            ),
            content: const Text(
              'Projeto não encontrado. Verifique se o QR Code escaneado corresponde ao projeto correto.',
              style: TextStyle(
                fontSize: 16,
                color: Colors.black87,
              ),
            ),
            actions: [
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('OK'),
              ),
            ],
          );
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isScientific = assessment.project.projectType == ProjectType.scientific;
    
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 5, horizontal: 0),
      child: InkWell(
        onTap: () => _scanQRCodeAndValidate(context),
        child: Padding(
          padding: const EdgeInsets.all(15),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: isScientific 
                      ? AppTheme.primaryColor(context)
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