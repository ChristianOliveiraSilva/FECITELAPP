import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/header.dart';

class CertificatesScreen extends StatelessWidget {
  const CertificatesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Column(
          children: [
            const Header(),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Certificados',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Acesse seus certificados de avaliação por ano',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Expanded(
                      child: ListView(
                        children: [
                          _buildCertificateCard(context, 2024, 'Certificado de Avaliador 2024', 'Avaliador de Projetos Técnicos e Científicos'),
                          _buildCertificateCard(context, 2023, 'Certificado de Avaliador 2023', 'Avaliador de Projetos Técnicos e Científicos'),
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
    );
  }

  Widget _buildCertificateCard(BuildContext context, int year, String title, String description) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF56BA54).withOpacity(0.1),
            const Color(0xFF4CAF50).withOpacity(0.05),
          ],
        ),
        border: Border.all(
          color: const Color(0xFF56BA54).withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            _showCertificateDetails(context, year, title);
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: const Color(0xFF56BA54),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.verified,
                    color: Colors.white,
                    size: 30,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF56BA54),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              year.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(
                            Icons.calendar_today,
                            color: Color(0xFF56BA54),
                            size: 16,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        description,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  children: [
                    IconButton(
                      onPressed: () => _openCertificate(context, year),
                      icon: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF56BA54),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.open_in_new,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                    const Text(
                      'Abrir',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF56BA54),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showCertificateDetails(BuildContext context, int year, String title) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(
              Icons.verified,
              color: Color(0xFF56BA54),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Ano: $year'),
              const SizedBox(height: 8),
              const Text('Tipo: Avaliador de Projetos'),
              const SizedBox(height: 8),
              const Text('Status: Válido'),
              const SizedBox(height: 8),
              const Text('Emitido por: Fecitel'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Fechar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _openCertificate(context, year);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF56BA54),
              foregroundColor: Colors.white,
            ),
            child: const Text('Abrir'),
          ),
        ],
      ),
    );
  }

  void _openCertificate(BuildContext context, int year) async {
    // URL do certificado (você pode ajustar conforme necessário)
    final String certificateUrl = 'https://fecitel.ifms.edu.br/certificados/$year';
    
    try {
      final Uri url = Uri.parse(certificateUrl);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(
                  Icons.open_in_new,
                  color: Colors.white,
                ),
                const SizedBox(width: 8),
                Text('Abrindo certificado $year no navegador...'),
              ],
            ),
            backgroundColor: const Color(0xFF56BA54),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      } else {
        throw 'Não foi possível abrir o certificado';
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(
                Icons.error,
                color: Colors.white,
              ),
              const SizedBox(width: 8),
              Text('Erro ao abrir certificado: $e'),
            ],
          ),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    }
  }
} 