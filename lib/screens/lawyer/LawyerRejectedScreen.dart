import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../auth/LawyerRegisterScreen.dart';

class LawyerRejectedScreen extends StatelessWidget {
  final String rejectionReason;
  final Map<String, dynamic> step1Data;

  const LawyerRejectedScreen({
    Key? key,
    required this.rejectionReason,
    required this.step1Data,
  }) : super(key: key);

  String _getAdvice() {
    if (rejectionReason.contains('وثائق غير واضحة')) {
      return "ارفع صوراً في إضاءة جيدة وبدقة عالية";
    } else if (rejectionReason.contains('كارنيه منتهي')) {
      return "جدد كارنيهك من نقابة المحامين أولاً";
    } else if (rejectionReason.contains('بيانات غير مكتملة')) {
      return "تأكد من إكمال جميع الحقول المطلوبة";
    }
    return "تأكد من مطابقة جميع الوثائق للمتطلبات";
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F5EF),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),
                BounceInDown(
                  child: const Icon(Icons.cancel, color: Color(0xFFB03A2E), size: 80),
                ),
                const SizedBox(height: 24),
                const Text(
                  "عذراً، لم يتم اعتماد طلبك",
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFFB03A2E)),
                ),
                const SizedBox(height: 32),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFB03A2E).withOpacity(0.1),
                    border: Border.all(color: const Color(0xFFB03A2E)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("سبب الرفض:", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFB03A2E))),
                      const SizedBox(height: 8),
                      Text(rejectionReason, style: const TextStyle(color: Color(0xFF1C2B3A))),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("كيف أُصلح ذلك؟", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A3A5C))),
                      const SizedBox(height: 8),
                      Text(_getAdvice(), style: const TextStyle(color: Color(0xFF6B7C8D))),
                    ],
                  ),
                ),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1A3A5C),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) => LawyerRegisterScreen(
                            initialData: step1Data,
                            initialStep: 1,
                          ),
                        ),
                      );
                    },
                    child: const Text("إعادة التقديم", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
