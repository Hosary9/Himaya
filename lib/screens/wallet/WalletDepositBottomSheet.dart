import 'package:flutter/material.dart';
import '../../services/booking_service.dart';

class WalletDepositBottomSheet extends StatefulWidget {
  final double? initialAmount;
  final VoidCallback? onDepositSuccess;

  const WalletDepositBottomSheet({Key? key, this.initialAmount, this.onDepositSuccess}) : super(key: key);

  @override
  State<WalletDepositBottomSheet> createState() => _WalletDepositBottomSheetState();
}

class _WalletDepositBottomSheetState extends State<WalletDepositBottomSheet> {
  final TextEditingController _amountController = TextEditingController();
  final BookingService _bookingService = BookingService();
  
  String _selectedMethod = 'card';
  bool _isLoading = false;

  final Color _primary = const Color(0xFF1A3A5C);
  final Color _gold = const Color(0xFFC9A84C);
  final Color _success = const Color(0xFF2D6A4F);
  final Color _text = const Color(0xFF1C2B3A);
  final Color _muted = const Color(0xFF6B7C8D);
  final Color _border = const Color(0xFFE8E0D0);

  @override
  void initState() {
    super.initState();
    if (widget.initialAmount != null) {
      _amountController.text = widget.initialAmount.toString();
    }
  }

  Future<void> _processDeposit() async {
    final amountText = _amountController.text;
    if (amountText.isEmpty) return;
    
    final amount = double.tryParse(amountText);
    if (amount == null || amount < 50) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('الحد الأدنى للإيداع 50 جنيه')),
      );
      return;
    }

    setState(() => _isLoading = true);

    // Simulate processing
    await Future.delayed(const Duration(seconds: 2));

    try {
      await _bookingService.depositToWallet('current_user_id', amount);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('✅ تم إيداع $amount جنيه في محفظتك'), backgroundColor: _success),
        );
        if (widget.onDepositSuccess != null) {
          widget.onDepositSuccess!();
        } else {
          Navigator.pop(context);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('حدث خطأ: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (_, controller) {
          return Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: ListView(
              controller: controller,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(color: _border, borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 24),
                Text("إيداع رصيد في محفظتك", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: _text)),
                const SizedBox(height: 24),
                
                // Amount Input
                TextField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: _primary),
                  decoration: InputDecoration(
                    suffixText: "جنيه",
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: _primary, width: 2)),
                  ),
                ),
                const SizedBox(height: 16),
                
                // Quick Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [50, 100, 200, 500, 1000].map((amount) => Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: ActionChip(
                        label: Text("$amount"),
                        onPressed: () => setState(() => _amountController.text = amount.toString()),
                        backgroundColor: Colors.white,
                        side: BorderSide(color: _border),
                      ),
                    )).toList(),
                  ),
                ),
                const SizedBox(height: 32),

                // Payment Methods
                Text("طريقة الدفع", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _text)),
                const SizedBox(height: 16),
                _buildMethodCard('card', 'بطاقة بنكية (Visa/Mastercard)', Icons.credit_card),
                const SizedBox(height: 8),
                _buildMethodCard('wallet', 'محفظة إلكترونية (فودافون كاش / اورنج كاش)', Icons.phone_android),
                const SizedBox(height: 8),
                _buildMethodCard('bank', 'تحويل بنكي', Icons.account_balance),
                
                const SizedBox(height: 24),
                
                // Dynamic Fields based on method
                AnimatedSize(
                  duration: const Duration(milliseconds: 300),
                  child: _selectedMethod == 'card' 
                    ? Column(
                        children: [
                          TextField(decoration: InputDecoration(hintText: "رقم البطاقة", border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)))),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(child: TextField(decoration: InputDecoration(hintText: "MM/YY", border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))))),
                              const SizedBox(width: 12),
                              Expanded(child: TextField(decoration: InputDecoration(hintText: "CVV", border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))))),
                            ],
                          )
                        ],
                      )
                    : _selectedMethod == 'wallet'
                      ? Column(
                          children: [
                            TextField(decoration: InputDecoration(hintText: "رقم الموبايل", border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)))),
                            const SizedBox(height: 8),
                            Text("ستصلك رسالة للتأكيد على رقمك", style: TextStyle(color: _muted, fontSize: 12)),
                          ],
                        )
                      : Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(12)),
                          child: const Text("البنك الأهلي المصري\nرقم الحساب: 1234567890123456\nالاسم: منصة محامينا"),
                        ),
                ),
                
                const SizedBox(height: 32),
                
                ElevatedButton(
                  onPressed: _isLoading ? null : _processDeposit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text("إيداع ${_amountController.text.isNotEmpty ? _amountController.text : '0'} جنيه →", style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMethodCard(String id, String title, IconData icon) {
    final isSelected = _selectedMethod == id;
    return InkWell(
      onTap: () => setState(() => _selectedMethod = id),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? _primary.withOpacity(0.05) : Colors.white,
          border: Border.all(color: isSelected ? _primary : _border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? _primary : _muted),
            const SizedBox(width: 16),
            Expanded(child: Text(title, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, color: _text))),
            if (isSelected) Icon(Icons.check_circle, color: _primary),
          ],
        ),
      ),
    );
  }
}
