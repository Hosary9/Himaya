import 'package:flutter/material.dart';
import 'dart:math';
import 'PaymentSuccessScreen.dart';

class ConsultationPaymentScreen extends StatefulWidget {
  final String lawyerName;
  final String specialty;
  final int price;

  const ConsultationPaymentScreen({
    Key? key,
    required this.lawyerName,
    required this.specialty,
    required this.price,
  }) : super(key: key);

  @override
  State<ConsultationPaymentScreen> createState() => _ConsultationPaymentScreenState();
}

class _ConsultationPaymentScreenState extends State<ConsultationPaymentScreen> {
  int _selectedMethod = 0; // 0: Card, 1: Wallet, 2: Bank
  bool _isLoading = false;

  late int consultationPrice;
  late int vat;
  late int total;

  @override
  void initState() {
    super.initState();
    consultationPrice = max(widget.price, 500);
    vat = (consultationPrice * 0.15).round();
    total = consultationPrice + vat;
  }

  void _handlePayment() async {
    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;
    setState(() {
      _isLoading = false;
    });

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => PaymentSuccessScreen(
          lawyerName: widget.lawyerName,
          totalAmount: total,
        ),
      ),
    );
  }

  String _getInitials(String name) {
    List<String> parts = name.split(' ');
    if (parts.length > 1) {
      return '${parts[0][0]}${parts[1][0]}';
    }
    return name.isNotEmpty ? name[0] : '?';
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F5EF),
        appBar: AppBar(
          title: const Text(
            "حجز استشارة قانونية",
            style: TextStyle(color: Color(0xFF1C2B3A), fontWeight: FontWeight.bold),
          ),
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Color(0xFF1C2B3A)),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: const Color(0xFF1A3A5C),
                      child: Text(
                        _getInitials(widget.lawyerName),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.lawyerName,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1C2B3A),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.specialty,
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFF6B7C8D),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFC9A84C).withOpacity(0.2),
                        border: Border.all(color: const Color(0xFFC9A84C)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        "$consultationPrice جنيه / 30 دقيقة",
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1C2B3A),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "* الحد الأدنى للاستشارة 500 جنيه",
                style: TextStyle(fontSize: 11, color: Color(0xFF6B7C8D)),
              ),
              const SizedBox(height: 24),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("رسوم الاستشارة", style: TextStyle(color: Color(0xFF6B7C8D))),
                        Text("$consultationPrice جنيه", style: const TextStyle(color: Color(0xFF1C2B3A))),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("ضريبة القيمة المضافة", style: TextStyle(color: Color(0xFF6B7C8D))),
                        Text("$vat جنيه", style: const TextStyle(color: Color(0xFF1C2B3A))),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(color: Color(0xFFE8E0D0)),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "الإجمالي",
                          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1C2B3A)),
                        ),
                        Text(
                          "$total جنيه",
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFC9A84C),
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text(
                "اختار طريقة الدفع",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1C2B3A),
                ),
              ),
              const SizedBox(height: 12),

              _buildPaymentMethodCard(0, "💳 بطاقة بنكية (Visa / Mastercard)"),
              const SizedBox(height: 8),
              _buildPaymentMethodCard(1, "📱 محفظة إلكترونية (فودافون كاش / اورنج كاش)"),
              const SizedBox(height: 8),
              _buildPaymentMethodCard(2, "🏦 تحويل بنكي"),
              
              const SizedBox(height: 16),
              
              if (_selectedMethod == 0) _buildCardForm(),
              if (_selectedMethod == 1) _buildWalletForm(),
              if (_selectedMethod == 2) _buildBankInfo(),

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2D6A4F),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  onPressed: _isLoading ? null : _handlePayment,
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          "ادفع $total جنيه والتواصل مع المحامي →",
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  "🔒 الدفع مشفر وآمن — لن يتم حفظ بيانات بطاقتك",
                  style: TextStyle(fontSize: 11, color: Color(0xFF6B7C8D)),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentMethodCard(int index, String title) {
    bool isSelected = _selectedMethod == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1A3A5C).withOpacity(0.08) : Colors.white,
          border: Border.all(
            color: isSelected ? const Color(0xFF1A3A5C) : const Color(0xFFE8E0D0),
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? const Color(0xFF1A3A5C) : const Color(0xFFE8E0D0),
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: Color(0xFF1A3A5C),
                          shape: BoxShape.circle,
                        ),
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: const Color(0xFF1C2B3A),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardForm() {
    return Column(
      children: [
        _buildTextField("رقم البطاقة", hint: "1234 5678 9012 3456", keyboardType: TextInputType.number),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildTextField("تاريخ الانتهاء", hint: "MM/YY")),
            const SizedBox(width: 12),
            Expanded(child: _buildTextField("CVV", hint: "***", obscureText: true, keyboardType: TextInputType.number)),
          ],
        ),
      ],
    );
  }

  Widget _buildWalletForm() {
    return _buildTextField("رقم المحفظة", hint: "01X XXXX XXXX", keyboardType: TextInputType.phone);
  }

  Widget _buildBankInfo() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F5EF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE8E0D0)),
      ),
      child: const Text(
        "حساب البنك الأهلي المصري\nرقم الحساب: XXXX-XXXX-XXXX\nاسم الحساب: محامينا للخدمات القانونية\n⚠️ أرسل إيصال التحويل على الواتساب بعد الدفع",
        style: TextStyle(
          fontSize: 13,
          color: Color(0xFF1C2B3A),
          height: 1.6,
        ),
        textAlign: TextAlign.right,
      ),
    );
  }

  Widget _buildTextField(String label, {String? hint, bool obscureText = false, TextInputType? keyboardType}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: Color(0xFF6B7C8D)),
        ),
        const SizedBox(height: 6),
        TextField(
          obscureText: obscureText,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFFE8E0D0)),
            filled: true,
            fillColor: Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE8E0D0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF1A3A5C)),
            ),
          ),
        ),
      ],
    );
  }
}
