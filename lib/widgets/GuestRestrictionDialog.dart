import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';

class GuestRestrictionDialog extends StatefulWidget {
  final String actionType; // 'consultation', 'contact', 'booking'

  const GuestRestrictionDialog({Key? key, required this.actionType}) : super(key: key);

  @override
  State<GuestRestrictionDialog> createState() => _GuestRestrictionDialogState();
}

class _GuestRestrictionDialogState extends State<GuestRestrictionDialog> with SingleTickerProviderStateMixin {
  late AnimationController _scaleController;
  late Animation<double> _scaleAnimation;
  late AnimationController _rotateController;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(CurvedAnimation(parent: _scaleController, curve: Curves.elasticOut));
    _scaleController.forward();

    _rotateController = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();
  }

  @override
  void dispose() {
    _scaleController.dispose();
    _rotateController.dispose();
    super.dispose();
  }

  String _getMessage() {
    switch (widget.actionType) {
      case 'consultation': return "لإرسال استشارة قانونية، يرجى تسجيل الدخول أولاً";
      case 'contact': return "للتواصل مع المحامي، يرجى إنشاء حساب أولاً";
      case 'booking': return "لحجز استشارة، يرجى تسجيل الدخول أولاً";
      default: return "هذه الخاصية متاحة للأعضاء المسجلين فقط";
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  RotationTransition(
                    turns: _rotateController,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFFC9A84C), width: 2, style: BorderStyle.solid), // Dashed not natively supported easily without custom painter, using solid for now
                      ),
                    ),
                  ),
                  const Text("🔒", style: TextStyle(fontSize: 48)),
                ],
              ),
              const SizedBox(height: 24),
              const Text("هذه الخاصية للأعضاء فقط", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1A3A5C)), textAlign: TextAlign.center),
              Container(width: 60, height: 2, color: const Color(0xFFC9A84C), margin: const EdgeInsets.symmetric(vertical: 16)),
              Text(_getMessage(), style: const TextStyle(fontSize: 14, color: Color(0xFF6B7C8D), height: 1.6), textAlign: TextAlign.center),
              const SizedBox(height: 24),
              FadeInLeft(delay: const Duration(milliseconds: 100), child: _buildBenefitItem("تواصل مع محامين معتمدين")),
              FadeInLeft(delay: const Duration(milliseconds: 200), child: _buildBenefitItem("استشارات قانونية موثوقة")),
              FadeInLeft(delay: const Duration(milliseconds: 300), child: _buildBenefitItem("حماية قانونية متكاملة")),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A3A5C), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  onPressed: () => Navigator.pushNamed(context, '/login'),
                  child: const Text("تسجيل الدخول", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFF1A3A5C)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  onPressed: () => Navigator.pushNamed(context, '/register'),
                  child: const Text("إنشاء حساب", style: TextStyle(color: Color(0xFF1A3A5C), fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("تصفح كضيف", style: TextStyle(color: Color(0xFF6B7C8D))),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: Color(0xFF2D6A4F), size: 20),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(color: Color(0xFF1C2B3A))),
        ],
      ),
    );
  }
}
