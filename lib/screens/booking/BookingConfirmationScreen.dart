import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import '../../models/booking_model.dart';
import '../call/CallScreen.dart';

class BookingConfirmationScreen extends StatefulWidget {
  final String bookingId;
  final String lawyerName;
  final ConsultationType consultationType;
  final DateTime scheduledAt;
  final double totalAmount;

  const BookingConfirmationScreen({
    Key? key,
    required this.bookingId,
    required this.lawyerName,
    required this.consultationType,
    required this.scheduledAt,
    required this.totalAmount,
  }) : super(key: key);

  @override
  State<BookingConfirmationScreen> createState() => _BookingConfirmationScreenState();
}

class _BookingConfirmationScreenState extends State<BookingConfirmationScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  Timer? _timer;
  String _countdown = '';
  bool _canStartCall = false;

  final Color _primary = const Color(0xFF1A3A5C);
  final Color _success = const Color(0xFF2D6A4F);
  final Color _text = const Color(0xFF1C2B3A);
  final Color _muted = const Color(0xFF6B7C8D);
  final Color _emergency = const Color(0xFFB03A2E);

  @override
  void initState() {
    super.initState();
    
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    
    _scaleAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animController, curve: const Interval(0.0, 0.5, curve: Curves.elasticOut))
    );
    
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animController, curve: const Interval(0.4, 0.8, curve: Curves.easeIn))
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero).animate(
      CurvedAnimation(parent: _animController, curve: const Interval(0.5, 1.0, curve: Curves.easeOutCubic))
    );

    _animController.forward();
    
    _updateCountdown();
    _timer = Timer.periodic(const Duration(minutes: 1), (_) => _updateCountdown());
  }

  @override
  void dispose() {
    _animController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _updateCountdown() {
    final now = DateTime.now();
    final diff = widget.scheduledAt.difference(now);
    
    if (diff.isNegative) {
      setState(() {
        _countdown = 'حان موعد الاستشارة';
        _canStartCall = true;
      });
    } else if (diff.inDays == 0) {
      setState(() {
        _countdown = 'الاستشارة بعد ${diff.inHours} ساعة و ${diff.inMinutes % 60} دقيقة';
        _canStartCall = diff.inMinutes <= 10;
      });
    } else {
      setState(() {
        _countdown = 'الاستشارة بعد ${diff.inDays} يوم';
        _canStartCall = false;
      });
    }
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
          automaticallyImplyLeading: false,
          actions: [
            IconButton(
              icon: Icon(Icons.close, color: _text),
              onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
            )
          ],
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const SizedBox(height: 20),
              ScaleTransition(
                scale: _scaleAnimation,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: _success.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.check_circle, color: _success, size: 64),
                ),
              ),
              const SizedBox(height: 24),
              FadeTransition(
                opacity: _fadeAnimation,
                child: Text(
                  "تم الحجز بنجاح! 🎉",
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: _text),
                ),
              ),
              const SizedBox(height: 32),
              SlideTransition(
                position: _slideAnimation,
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, 5)),
                      ],
                    ),
                    child: Column(
                      children: [
                        _buildRow("رقم الحجز", "#MCN-${widget.bookingId.substring(0, 6).toUpperCase()}"),
                        const Divider(height: 24),
                        _buildRow("المحامي", widget.lawyerName),
                        const SizedBox(height: 12),
                        _buildRow("النوع", widget.consultationType.arabicLabel),
                        const SizedBox(height: 12),
                        _buildRow("الموعد", DateFormat('EEEE، d MMMM yyyy - hh:mm a', 'ar').format(widget.scheduledAt)),
                        const SizedBox(height: 12),
                        _buildRow("المدة", "30 دقيقة"),
                        const SizedBox(height: 12),
                        _buildRow("المبلغ المدفوع", "${widget.totalAmount} جنيه"),
                        const Divider(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text("الحالة", style: TextStyle(color: _muted)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              decoration: BoxDecoration(color: _success.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                              child: Text("✅ مؤكد", style: TextStyle(color: _success, fontWeight: FontWeight.bold)),
                            )
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              FadeTransition(
                opacity: _fadeAnimation,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
                  decoration: BoxDecoration(
                    color: _primary.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(_countdown, style: TextStyle(color: _primary, fontWeight: FontWeight.bold)),
                ),
              ),
              const Spacer(),
              FadeTransition(
                opacity: _fadeAnimation,
                child: Column(
                  children: [
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _canStartCall ? () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CallScreen(
                                lawyerName: widget.lawyerName,
                                consultationType: widget.consultationType,
                                channelId: widget.bookingId, // Using bookingId as channel for demo
                              ),
                            ),
                          );
                        } : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _canStartCall ? _success : Colors.grey.shade300,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          _canStartCall ? "بدء المكالمة" : "يمكن بدء المكالمة قبل الموعد بـ 10 دقائق",
                          style: TextStyle(color: _canStartCall ? Colors.white : Colors.grey.shade600, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextButton(
                      onPressed: () {
                        // Show cancel dialog
                      },
                      child: Text("إلغاء الحجز", style: TextStyle(color: _emergency)),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        OutlinedButton(
                          onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                          child: const Text("العودة للرئيسية"),
                        ),
                        const SizedBox(width: 16),
                        OutlinedButton(
                          onPressed: () {
                            // Share logic
                          },
                          child: const Text("مشاركة الموعد"),
                        ),
                      ],
                    )
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(flex: 2, child: Text(label, style: TextStyle(color: _muted))),
        Expanded(flex: 3, child: Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: _text), textAlign: TextAlign.left)),
      ],
    );
  }
}
