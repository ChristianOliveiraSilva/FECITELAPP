import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class EventService {
  static const String _primaryColorKey = 'app_primary_color';
  static const String _fontColorKey = 'app_font_color';
  static const String _logoUrlKey = 'app_logo_url';
  static const String _eventYearKey = 'event_year';
  static const String _defaultColor = '#56BA54';
  static const String _defaultFontColor = '#FFFFFF';

  /// Fetch current year event data from API
  static Future<Map<String, dynamic>?> getCurrentYearEvent() async {
    try {
      final response = await ApiService.get('/events/current-year/');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['status'] == true && data['data'] != null) {
          return data['data'];
        }
      }
      
      return null;
    } catch (e) {
      print('Error fetching current year event: $e');
      return null;
    }
  }

  /// Initialize app theme by fetching event data and storing in SharedPreferences
  static Future<void> initializeTheme() async {
    try {
      final eventData = await getCurrentYearEvent();
      
      if (eventData != null) {
        await _storeEventData(eventData);
      } else {
        // Fallback to default values if API fails
        await _storeDefaultValues();
      }
    } catch (e) {
      print('Error initializing theme: $e');
      // Fallback to default values
      await _storeDefaultValues();
    }
  }

  /// Store event data in SharedPreferences
  static Future<void> _storeEventData(Map<String, dynamic> eventData) async {
    final prefs = await SharedPreferences.getInstance();
    
    final primaryColor = eventData['app_primary_color'] ?? _defaultColor;
    final fontColor = eventData['app_font_color'] ?? _defaultFontColor;
    final logoUrl = eventData['app_logo_url'] ?? '';
    final year = eventData['year'] ?? DateTime.now().year;
    
    await prefs.setString(_primaryColorKey, primaryColor);
    await prefs.setString(_fontColorKey, fontColor);
    await prefs.setString(_logoUrlKey, logoUrl);
    await prefs.setInt(_eventYearKey, year);
    
    print('Theme initialized: Color=$primaryColor, FontColor=$fontColor, Year=$year');
  }

  /// Store default values in SharedPreferences
  static Future<void> _storeDefaultValues() async {
    final prefs = await SharedPreferences.getInstance();
    
    await prefs.setString(_primaryColorKey, _defaultColor);
    await prefs.setString(_fontColorKey, _defaultFontColor);
    await prefs.setString(_logoUrlKey, '');
    await prefs.setInt(_eventYearKey, DateTime.now().year);
    
    print('Theme initialized with default values');
  }

  /// Get primary color from SharedPreferences
  static Future<String> getPrimaryColor() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_primaryColorKey) ?? _defaultColor;
  }

  /// Get font color from SharedPreferences
  static Future<String> getFontColor() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_fontColorKey) ?? _defaultFontColor;
  }

  /// Get logo URL from SharedPreferences
  static Future<String> getLogoUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_logoUrlKey) ?? '';
  }

  /// Get event year from SharedPreferences
  static Future<int> getEventYear() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_eventYearKey) ?? DateTime.now().year;
  }

  static int hexToColor(String hexColor) {
    hexColor = hexColor.replaceAll('#', '');
    
    if (hexColor.length == 6) {
      hexColor = 'FF$hexColor';
    }
    
    return int.parse(hexColor, radix: 16);
  }

  static Future<void> refreshTheme() async {
    await initializeTheme();
  }
}