import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/projects_provider.dart';
import 'providers/theme_provider.dart';
import 'services/event_service.dart';
import 'screens/login_screen.dart';
import 'screens/list_screen.dart';
import 'constants/environment.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  EnvironmentConfig.setEnvironment(Environment.production);
  
  // Initialize theme from API on app start
  await EventService.initializeTheme();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProjectsProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            title: 'Fecitel App',
            debugShowCheckedModeBanner: false,
            theme: themeProvider.themeData,
            darkTheme: themeProvider.darkThemeData,
            home: const AppInitializer(),
          );
        },
      ),
    );
  }
}

class AppInitializer extends StatefulWidget {
  const AppInitializer({super.key});

  @override
  State<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends State<AppInitializer> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Initialize theme from stored preferences
    await context.read<ThemeProvider>().initializeFromStorage();
    
    // Load stored auth
    await context.read<AuthProvider>().loadStoredAuth();
    
    // Refresh theme from API in background
    context.read<ThemeProvider>().refreshTheme();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<ThemeProvider, AuthProvider>(
      builder: (context, themeProvider, authProvider, child) {
        return AnnotatedRegion<SystemUiOverlayStyle>(
          value: SystemUiOverlayStyle(
            statusBarColor: themeProvider.primaryColor,
            statusBarIconBrightness: themeProvider.fontColor.computeLuminance() > 0.5 ? Brightness.dark : Brightness.light,
            statusBarBrightness: Brightness.dark,
          ),
          child: authProvider.isAuthenticated 
            ? const ListScreen() 
            : const LoginScreen(),
        );
      },
    );
  }
}
