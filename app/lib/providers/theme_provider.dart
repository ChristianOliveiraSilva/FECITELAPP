import 'package:flutter/material.dart';
import '../services/event_service.dart';

class ThemeProvider extends ChangeNotifier {
  Color _primaryColor = const Color(0xFF56BA54); // Default green
  Color _fontColor = Colors.white; // Default white
  String _logoUrl = '';
  int _eventYear = 0;
  bool _isLoading = false;

  Color get primaryColor => _primaryColor;
  Color get fontColor => _fontColor;
  String get logoUrl => _logoUrl;
  int get eventYear => _eventYear;
  bool get isLoading => _isLoading;

  /// Initialize theme from SharedPreferences
  Future<void> initializeFromStorage() async {
    try {
      final colorHex = await EventService.getPrimaryColor();
      final fontColorHex = await EventService.getFontColor();
      final logoUrl = await EventService.getLogoUrl();
      final year = await EventService.getEventYear();

      _primaryColor = Color(EventService.hexToColor(colorHex));
      _fontColor = Color(EventService.hexToColor(fontColorHex));
      _logoUrl = logoUrl;
      _eventYear = year;

      notifyListeners();
    } catch (e) {
      print('Error loading theme from storage: $e');
    }
  }

  /// Fetch and update theme from API
  Future<void> refreshTheme() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Fetch from API and store in SharedPreferences
      await EventService.initializeTheme();

      // Load updated values from SharedPreferences
      await initializeFromStorage();
    } catch (e) {
      print('Error refreshing theme: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get MaterialColor from primary color for theme
  MaterialColor get primarySwatch {
    return _createMaterialColor(_primaryColor);
  }

  /// Create MaterialColor from Color
  MaterialColor _createMaterialColor(Color color) {
    List strengths = <double>[.05];
    final Map<int, Color> swatch = {};
    final int r = color.red, g = color.green, b = color.blue;

    for (int i = 1; i < 10; i++) {
      strengths.add(0.1 * i);
    }
    
    for (var strength in strengths) {
      final double ds = 0.5 - strength;
      swatch[(strength * 1000).round()] = Color.fromRGBO(
        r + ((ds < 0 ? r : (255 - r)) * ds).round(),
        g + ((ds < 0 ? g : (255 - g)) * ds).round(),
        b + ((ds < 0 ? b : (255 - b)) * ds).round(),
        1,
      );
    }
    
    return MaterialColor(color.value, swatch);
  }

  /// Get ThemeData with dynamic primary color
  ThemeData get themeData {
    return ThemeData(
      primarySwatch: primarySwatch,
      primaryColor: _primaryColor,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _primaryColor,
        brightness: Brightness.light,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: _primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: _primaryColor,
          foregroundColor: Colors.white,
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: _primaryColor,
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: _primaryColor,
      ),
    );
  }

  /// Get dark theme variant
  ThemeData get darkThemeData {
    return ThemeData(
      primarySwatch: primarySwatch,
      primaryColor: _primaryColor,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _primaryColor,
        brightness: Brightness.dark,
      ),
      brightness: Brightness.dark,
      appBarTheme: AppBarTheme(
        backgroundColor: _primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: _primaryColor,
          foregroundColor: Colors.white,
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: _primaryColor,
      ),
    );
  }
}