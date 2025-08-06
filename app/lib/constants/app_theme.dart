import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';

/// Helper class to easily access theme colors throughout the app
class AppTheme {
  /// Get the primary color from ThemeProvider
  static Color primaryColor(BuildContext context) {
    return context.watch<ThemeProvider>().primaryColor;
  }

  /// Get the logo URL from ThemeProvider
  static String logoUrl(BuildContext context) {
    return context.watch<ThemeProvider>().logoUrl;
  }

  /// Get the event year from ThemeProvider
  static int eventYear(BuildContext context) {
    return context.watch<ThemeProvider>().eventYear;
  }

  /// Create a widget that uses the primary color
  static Widget coloredContainer({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? borderRadius,
    required BuildContext context,
  }) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, _) {
        return Container(
          padding: padding,
          margin: margin,
          decoration: BoxDecoration(
            color: themeProvider.primaryColor,
            borderRadius: borderRadius != null 
              ? BorderRadius.circular(borderRadius) 
              : null,
          ),
          child: child,
        );
      },
    );
  }

  /// Create an ElevatedButton with primary color
  static Widget primaryButton({
    required String text,
    required VoidCallback onPressed,
    required BuildContext context,
    bool isLoading = false,
    IconData? icon,
  }) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, _) {
        return ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: themeProvider.primaryColor,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (icon != null) ...[
                      Icon(icon, size: 18),
                      const SizedBox(width: 8),
                    ],
                    Text(text),
                  ],
                ),
        );
      },
    );
  }

  /// Create a logo widget that uses the dynamic logo URL
  static Widget logo({
    required BuildContext context,
    double height = 40,
    String fallbackAsset = 'assets/images/fecitel-logo.png',
  }) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, _) {
        if (themeProvider.logoUrl.isNotEmpty) {
          return Image.network(
            themeProvider.logoUrl,
            height: height,
            errorBuilder: (context, error, stackTrace) {
              return Image.asset(
                fallbackAsset,
                height: height,
              );
            },
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return SizedBox(
                height: height,
                child: const Center(
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              );
            },
          );
        } else {
          return Image.asset(
            fallbackAsset,
            height: height,
          );
        }
      },
    );
  }

  /// Get a lighter shade of the primary color
  static Color primaryColorLight(BuildContext context, [double factor = 0.1]) {
    final primaryColor = AppTheme.primaryColor(context);
    return Color.lerp(primaryColor, Colors.white, factor) ?? primaryColor;
  }

  /// Get a darker shade of the primary color
  static Color primaryColorDark(BuildContext context, [double factor = 0.1]) {
    final primaryColor = AppTheme.primaryColor(context);
    return Color.lerp(primaryColor, Colors.black, factor) ?? primaryColor;
  }
}