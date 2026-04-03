import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';

class LawyerPendingScreen extends StatefulWidget {
  const LawyerPendingScreen({Key? key}) : super(key: key);

  @override
  State<LawyerPendingScreen> createState() => _LawyerPendingScreenState();
}

class _LawyerPendingScreenState extends State<LawyerPendingScreen> with SingleTickerProviderStateMixin {
  late AnimationController _rotateController;

  @override
  void initState() {
    super.initState();
    _rotateController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
  }

  @override
  void dispose() {
    _rotateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F5EF),
        body: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.only(top: 80, bottom: 60),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1A3A5C), Color(0xFF0F2540)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              child: Column(
                children: [
                  RotationTransition(
                    turns: _rotateController,
                    child: const Icon(Icons.access_time, color: Colors.white, size: 64),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "طلبك تحت المراجعة",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Container(width: 80, height: 2, color: const Color(0xFFC9A84C)),
                ],
              ),
            ),
            Transform.translate(
              offset: const Offset(0, -30),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("ماذا يحدث الآن؟", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1A3A5C))),
                      const SizedBox(height: 24),
                      FadeInLeft(delay: const Duration(milliseconds: 100), child: _buildTimelineStep("استُلمت وثائقك بنجاح", true, false)),
                      FadeInLeft(delay: const Duration(milliseconds: 300), child: _buildTimelineStep("يراجع فريقنا وثائقك", false, true)),
                      FadeInLeft(delay: const Duration(milliseconds: 500), child: _buildTimelineStep("ستصلك إشعار بالنتيجة", false, false, isLast: true)),
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child: Divider(color: Color(0xFFE8E0D0)),
                      ),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFC9A84C)),
                          borderRadius: BorderRadius.circular(12),
                          color: const Color(0xFFC9A84C).withOpacity(0.05),
                        ),
                        child: const Text(
                          "⏰ المراجعة تستغرق عادةً 24-48 ساعة\nفي حالات الضغط قد تصل لـ 72 ساعة",
                          style: TextStyle(fontSize: 13, color: Color(0xFF1C2B3A), height: 1.5),
                        ),
                      ),
                      const SizedBox(height: 16),
                      ExpansionTile(
                        title: const Text("ماذا لو لم أتلقَ رداً؟", style: TextStyle(fontSize: 14, color: Color(0xFF1A3A5C))),
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: const Text("تواصل معنا على support@mohamina.com", style: TextStyle(color: Color(0xFF6B7C8D))),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF1A3A5C)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    // Navigate to Home
                  },
                  child: const Text("العودة للرئيسية", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A3A5C))),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineStep(String title, bool isDone, bool isCurrent, {bool isLast = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDone ? const Color(0xFF2D6A4F) : (isCurrent ? const Color(0xFFC9A84C) : const Color(0xFFE8E0D0)),
                boxShadow: isCurrent ? [BoxShadow(color: const Color(0xFFC9A84C).withOpacity(0.5), blurRadius: 8)] : null,
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 30,
                color: isDone ? const Color(0xFF2D6A4F) : const Color(0xFFE8E0D0),
              ),
          ],
        ),
        const SizedBox(width: 16),
        Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isCurrent || isDone ? FontWeight.bold : FontWeight.normal,
            color: isCurrent || isDone ? const Color(0xFF1C2B3A) : const Color(0xFF6B7C8D),
          ),
        ),
      ],
    );
  }
}
