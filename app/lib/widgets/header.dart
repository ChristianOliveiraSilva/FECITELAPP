import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../screens/profile_screen.dart';
import '../screens/list_screen.dart';
import '../screens/certificates_screen.dart';

class Header extends StatelessWidget {
  const Header({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return Container(
          color: themeProvider.primaryColor,
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              themeProvider.logoUrl.isNotEmpty
                  ? Image.network(
                      themeProvider.logoUrl,
                      height: 30,
                      errorBuilder: (context, error, stackTrace) {
                        return Image.asset(
                          'assets/images/fecitel-logo.png',
                          height: 30,
                        );
                      },
                    )
                  : Image.asset(
                      'assets/images/fecitel-logo.png',
                      height: 30,
                    ),
              const Spacer(),
              Consumer<AuthProvider>(
                builder: (context, authProvider, child) {
                  return PopupMenuButton<String>(
                                    icon: Icon(
                  Icons.menu,
                  color: themeProvider.fontColor,
                  size: 30,
                ),
                    onSelected: (value) {
                      if (value == 'assessments') {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(
                            builder: (context) => const ListScreen(),
                          ),
                        );
                      } else if (value == 'certificates') {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(
                            builder: (context) => const CertificatesScreen(),
                          ),
                        );
                      } else if (value == 'profile') {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(
                            builder: (context) => const ProfileScreen(),
                          ),
                        );
                      } else if (value == 'logout') {
                        _showLogoutDialog(context);
                      }
                    },
                    itemBuilder: (context) => [
                      const PopupMenuItem(
                        value: 'assessments',
                        child: Row(
                          children: [
                            Icon(Icons.assessment, color: Colors.black87),
                            SizedBox(width: 10),
                            Text(
                              'Avaliações',
                              style: TextStyle(color: Colors.black87),
                            ),
                          ],
                        ),
                      ),
                      // const PopupMenuItem(
                      //   value: 'certificates',
                      //   child: Row(
                      //     children: [
                      //       Icon(Icons.verified, color: Colors.black87),
                      //       SizedBox(width: 10),
                      //       Text(
                      //         'Certificados',
                      //         style: TextStyle(color: Colors.black87),
                      //       ),
                      //     ],
                      //   ),
                      // ),
                      const PopupMenuItem(
                        value: 'profile',
                        child: Row(
                          children: [
                            Icon(Icons.person, color: Colors.black87),
                            SizedBox(width: 10),
                            Text(
                              'Perfil',
                              style: TextStyle(color: Colors.black87),
                            ),
                          ],
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'logout',
                        child: Row(
                          children: [
                            Icon(Icons.logout, color: Colors.red),
                            SizedBox(width: 10),
                            Text(
                              'Sair',
                              style: TextStyle(color: Colors.red),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sair'),
        content: const Text('Tem certeza que deseja sair?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(
              'Cancelar',
              style: TextStyle(color: Colors.grey),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.read<AuthProvider>().logout();
            },
            child: const Text(
              'Sair',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
} 