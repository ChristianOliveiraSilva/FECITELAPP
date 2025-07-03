import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/assessment.dart';
import '../services/api_service.dart';

class ProjectsProvider extends ChangeNotifier {
  Map<String, List<Assessment>> _projects = {};
  bool _isLoading = false;
  String? _error;

  Map<String, List<Assessment>> get projects => _projects;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadProjects() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get('/assessments');
      
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final Map<String, List<Assessment>> groupedByCategory = {};

        for (final assessmentData in data) {
          final assessment = Assessment.fromJson(assessmentData);
          final categoryName = assessment.project.category.name;

          if (!groupedByCategory.containsKey(categoryName)) {
            groupedByCategory[categoryName] = [];
          }

          groupedByCategory[categoryName]!.add(assessment);
        }

        _projects = groupedByCategory;
      } else {
        _error = 'Erro ao carregar projetos';
      }
    } catch (e) {
      _error = 'Erro de conexão';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
} 