import 'package:flutter/material.dart';

class ComingSoonDialog extends StatefulWidget {
  const ComingSoonDialog({Key? key}) : super(key: key);

  @override
  State<ComingSoonDialog> createState() => _ComingSoonDialogState();
}

class _ComingSoonDialogState extends State<ComingSoonDialog> with TickerProviderStateMixin {
  late AnimationController _scaleController;
  late Animation<double> _scaleAnimation;
  late AnimationController _rotateController;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.elasticOut),
    );
    _scaleController.forward();

    _rotateController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _scaleController.dispose();
    _rotateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(28.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RotationTransition(
                turns: Tween(begin: -0.05, end: 0.05).animate(_rotateController),
                child: const Text(
                  '🚧',
                  style: TextStyle(fontSize: 48),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                "قريباً إن شاء الله! 🎉",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A3A5C),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                "خدمة التواصل مع المحامين تحت الإعداد حالياً\nهنبلغك فور إطلاقها رسمياً",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF6B7C8D),
                  height: 1.6,
                ),
              ),
              Container(
                width: 60,
                height: 2,
                color: const Color(0xFFC9A84C),
                margin: const EdgeInsets.symmetric(vertical: 16),
              ),
              const Text(
                "⏳ المشروع في مراحله الأخيرة",
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xFFC9A84C),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A3A5C),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    "حسناً، هستنى! 👍",
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
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
