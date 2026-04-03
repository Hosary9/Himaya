import 'package:flutter/material.dart';
import '../../models/booking_model.dart';
import '../../services/booking_service.dart';

class LawyerDashboardScreen extends StatefulWidget {
  final String lawyerId;

  const LawyerDashboardScreen({Key? key, required this.lawyerId}) : super(key: key);

  @override
  State<LawyerDashboardScreen> createState() => _LawyerDashboardScreenState();
}

class _LawyerDashboardScreenState extends State<LawyerDashboardScreen> {
  final BookingService _bookingService = BookingService();
  bool _isAvailable = true;

  final Color _primary = const Color(0xFF1A3A5C);
  final Color _gold = const Color(0xFFC9A84C);
  final Color _success = const Color(0xFF2D6A4F);
  final Color _text = const Color(0xFF1C2B3A);
  final Color _muted = const Color(0xFF6B7C8D);
  final Color _emergency = const Color(0xFFB03A2E);

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F5EF),
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text("لوحة تحكم المحامي", style: TextStyle(color: _text, fontWeight: FontWeight.bold)),
          centerTitle: true,
          iconTheme: IconThemeData(color: _text),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Earnings Card
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
                    const Text("أرباحك هذا الشهر", style: TextStyle(color: Colors.white70, fontSize: 16)),
                    const SizedBox(height: 8),
                    const Text("12,500 جنيه", style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    const Text("من 25 استشارة مكتملة", style: TextStyle(color: Colors.white70, fontSize: 14)),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _gold,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text("سحب الأرباح", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Availability Toggle
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE8E0D0)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("حالة التوفر", style: TextStyle(fontWeight: FontWeight.bold, color: _text)),
                        Text(_isAvailable ? "متاح للاستشارات 🟢" : "غير متاح 🔴", style: TextStyle(color: _muted, fontSize: 12)),
                      ],
                    ),
                    Switch(
                      value: _isAvailable,
                      activeColor: _success,
                      onChanged: (val) {
                        setState(() => _isAvailable = val);
                        // Update in Firestore
                      },
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Stats Row
              Row(
                children: [
                  _buildStatCard("⭐ التقييم", "4.8"),
                  const SizedBox(width: 12),
                  _buildStatCard("✅ مكتملة", "142"),
                  const SizedBox(width: 12),
                  _buildStatCard("⏳ قادمة", "5"),
                ],
              ),
              const SizedBox(height: 32),

              Text("المواعيد القادمة", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _text)),
              const SizedBox(height: 16),
              
              StreamBuilder<List<BookingModel>>(
                stream: _bookingService.watchLawyerBookings(widget.lawyerId),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final bookings = snapshot.data?.where((b) => b.status == BookingStatus.confirmed && b.scheduledAt.isAfter(DateTime.now())).toList() ?? [];

                  if (bookings.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Text("لا توجد مواعيد قادمة", style: TextStyle(color: _muted)),
                      ),
                    );
                  }

                  return ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: bookings.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final booking = bookings[index];
                      final canStart = _bookingService.canStartCall(booking);
                      
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE8E0D0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text("العميل: ${booking.clientId}", style: TextStyle(fontWeight: FontWeight.bold, color: _text)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(color: _primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                  child: Text(booking.consultationType.arabicLabel, style: TextStyle(color: _primary, fontSize: 12)),
                                )
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text("الموعد: ${booking.scheduledAt.toString()}", style: TextStyle(color: _muted, fontSize: 12)),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: canStart ? () {} : null,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: canStart ? _success : Colors.grey.shade300,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    child: Text("بدء المكالمة", style: TextStyle(color: canStart ? Colors.white : Colors.grey.shade600)),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                TextButton(
                                  onPressed: () {},
                                  child: Text("إلغاء", style: TextStyle(color: _emergency)),
                                )
                              ],
                            )
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE8E0D0)),
        ),
        child: Column(
          children: [
            Text(title, style: TextStyle(color: _muted, fontSize: 12)),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: _text, fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
