import 'package:flutter/material.dart';
import '../../models/wallet_model.dart';
import '../../services/booking_service.dart';
import 'WalletDepositBottomSheet.dart';
import 'package:intl/intl.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({Key? key}) : super(key: key);

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  final BookingService _bookingService = BookingService();
  final String currentUserId = 'current_user_id'; // Mock user ID

  final Color _primary = const Color(0xFF1A3A5C);
  final Color _gold = const Color(0xFFC9A84C);
  final Color _success = const Color(0xFF2D6A4F);
  final Color _text = const Color(0xFF1C2B3A);
  final Color _muted = const Color(0xFF6B7C8D);
  final Color _emergency = const Color(0xFFB03A2E);

  void _showDepositSheet([double? amount]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => WalletDepositBottomSheet(initialAmount: amount),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F5EF),
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text("المحفظة", style: TextStyle(color: _text, fontWeight: FontWeight.bold)),
          centerTitle: true,
          iconTheme: IconThemeData(color: _text),
        ),
        body: StreamBuilder<WalletModel>(
          stream: _bookingService.watchWallet(currentUserId),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            final balance = snapshot.data?.balance ?? 0.0;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Balance Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1A3A5C), Color(0xFF0F2540)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(color: _primary.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "رصيدك الحالي",
                          style: TextStyle(color: Colors.white70, fontSize: 16),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "$balance جنيه",
                          style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _showDepositSheet(),
                                icon: const Icon(Icons.add_card, color: Colors.white),
                                label: const Text("إيداع رصيد", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _gold,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  // Scroll to transactions
                                },
                                icon: const Icon(Icons.bar_chart, color: Colors.white),
                                label: const Text("السجل", style: TextStyle(color: Colors.white)),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.white54),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Quick Deposit
                  Text("إيداع سريع", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _text)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildQuickDepositBtn(50),
                      _buildQuickDepositBtn(100),
                      _buildQuickDepositBtn(200),
                      _buildQuickDepositBtn(500),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Transactions List
                  Text("سجل المعاملات", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _text)),
                  const SizedBox(height: 16),
                  _buildTransactionsList(),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildQuickDepositBtn(double amount) {
    return InkWell(
      onTap: () => _showDepositSheet(amount),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE8E0D0)),
        ),
        child: Text(
          "$amount",
          style: TextStyle(color: _primary, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildTransactionsList() {
    // In a real app, use StreamBuilder on transactions collection
    // For now, returning a static empty state or mock data
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          children: [
            Icon(Icons.receipt_long, size: 64, color: _muted.withOpacity(0.3)),
            const SizedBox(height: 16),
            Text("لا توجد معاملات بعد 💳", style: TextStyle(color: _muted)),
          ],
        ),
      ),
    );
  }
}
