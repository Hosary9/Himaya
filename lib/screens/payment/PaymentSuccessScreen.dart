import 'package:flutter/material.dart';
import 'dart:math';

class PaymentSuccessScreen extends StatefulWidget {
  final String lawyerName;
  final int totalAmount;

  const PaymentSuccessScreen({
    Key? key,
    required this.lawyerName,
    required this.totalAmount,
  }) : super(key: key);

  @override
  State<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends State<PaymentSuccessScreen> with TickerProviderStateMixin {
  late AnimationController _circleController;
  late Animation<double> _circleScale;
  
  late AnimationController _textController;
  late Animation<double> _textFade;
  
  late AnimationController _receiptController;
  late Animation<Offset> _receiptSlide;
  late Animation<double> _receiptFade;
  
  late AnimationController _infoController;
  late Animation<double> _infoFade;

  final String _receiptNumber = "#MCN-${Random().nextInt(900000) + 100000}";
  final String _todayDate = "${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}";

  @override
  void initState() {
    super.initState();

    _circleController = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _circleScale = CurvedAnimation(parent: _circleController, curve: Curves.elasticOut);

    _textController = AnimationController(vsync: this, duration: const Duration(milliseconds: 400));
    _textFade = CurvedAnimation(parent: _textController, curve: Curves.easeIn);

    _receiptController = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _receiptSlide = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero)
        .animate(CurvedAnimation(parent: _receiptController, curve: Curves.easeOut));
    _receiptFade = CurvedAnimation(parent: _receiptController, curve: Curves.easeIn);

    _infoController = AnimationController(vsync: this, duration: const Duration(milliseconds: 400));
    _infoFade = CurvedAnimation(parent: _infoController, curve: Curves.easeIn);

    _startAnimations();
  }

  void _startAnimations() async {
    _circleController.forward();
    await Future.delayed(const Duration(milliseconds: 600));
    _textController.forward();
    await Future.delayed(const Duration(milliseconds: 300));
    _receiptController.forward();
    await Future.delayed(const Duration(milliseconds: 300));
    _infoController.forward();
  }

  @override
  void dispose() {
    _circleController.dispose();
    _textController.dispose();
    _receiptController.dispose();
    _infoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),
                
                ScaleTransition(
                  scale: _circleScale,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: const BoxDecoration(
                      color: Color(0xFF2D6A4F),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 50,
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                FadeTransition(
                  opacity: _textFade,
                  child: const Text(
                    "تم الدفع بنجاح! 🎉",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1C2B3A),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                SlideTransition(
                  position: _receiptSlide,
                  child: FadeTransition(
                    opacity: _receiptFade,
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          _buildReceiptRow("رقم الاستشارة", _receiptNumber),
                          const Divider(height: 24, color: Color(0xFFE8E0D0)),
                          _buildReceiptRow("المحامي", widget.lawyerName),
                          const Divider(height: 24, color: Color(0xFFE8E0D0)),
                          _buildReceiptRow("المبلغ المدفوع", "${widget.totalAmount} جنيه"),
                          const Divider(height: 24, color: Color(0xFFE8E0D0)),
                          _buildReceiptRow("التاريخ", _todayDate),
                          const Divider(height: 24, color: Color(0xFFE8E0D0)),
                          _buildReceiptRow("الحالة", "✅ مدفوع"),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                FadeTransition(
                  opacity: _infoFade,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFC9A84C).withOpacity(0.15),
                      border: Border.all(color: const Color(0xFFC9A84C)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      "⏳ خدمة التواصل مع المحامي ستكون متاحة قريباً\nسنتواصل معك على رقمك المسجل فور الإطلاق",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF1C2B3A),
                        height: 1.5,
                      ),
                    ),
                  ),
                ),
                
                const Spacer(),

                FadeTransition(
                  opacity: _infoFade,
                  child: Column(
                    children: [
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1A3A5C),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                          ),
                          onPressed: () {
                            Navigator.of(context).popUntil((route) => route.isFirst);
                          },
                          child: const Text(
                            "العودة للرئيسية",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF1A3A5C)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text("قريباً ✨", textAlign: TextAlign.center),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          child: const Text(
                            "حفظ الإيصال",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1A3A5C),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFF6B7C8D), fontSize: 14),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Color(0xFF1C2B3A),
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
