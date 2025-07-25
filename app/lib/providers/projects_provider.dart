import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/assessment.dart';
import '../services/api_service.dart';

class ProjectsProvider extends ChangeNotifier {
  Map<int, List<Assessment>> _projects = {};
  bool _isLoading = false;
  String? _error;

  Map<int, List<Assessment>> get projects => _projects;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadProjects() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get('/assessments');
      final data = jsonDecode(response.body);
      
      if (data['status'] == true) {
        final List<dynamic> assessmentsData = data['data'];
        final Map<int, List<Assessment>> groupedByType = {};

        for (final assessmentData in assessmentsData) {
          final assessment = Assessment.fromJson(assessmentData);
          final projectType = assessment.project.projectType;

          if (!groupedByType.containsKey(projectType)) {
            groupedByType[projectType] = [];
          }

          groupedByType[projectType]!.add(assessment);
        }

        _projects = groupedByType;
      } else {
        _error = data['message'] ?? 'Erro ao carregar projetos';
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