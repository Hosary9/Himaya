import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';

import '../../models/booking_model.dart';
import '../../services/booking_service.dart';
import 'BookingConfirmationScreen.dart';
import '../wallet/WalletDepositBottomSheet.dart';

class BookingBottomSheet extends StatefulWidget {
  final String lawyerId;
  final String lawyerName;
  final double consultationPrice;

  const BookingBottomSheet({
    Key? key,
    required this.lawyerId,
    required this.lawyerName,
    required this.consultationPrice,
  }) : super(key: key);

  @override
  State<BookingBottomSheet> createState() => _BookingBottomSheetState();
}

class _BookingBottomSheetState extends State<BookingBottomSheet> {
  final PageController _pageController = PageController();
  final BookingService _bookingService = BookingService();
  
  int _currentStep = 0;
  ConsultationType? _selectedType;
  String _selectedQuickDate = 'اليوم';
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  
  double _walletBalance = 0;
  bool _isLoading = false;

  // Hardcoded colors
  final Color _primary = const Color(0xFF1A3A5C);
  final Color _gold = const Color(0xFFC9A84C);
  final Color _success = const Color(0xFF2D6A4F);
  final Color _text = const Color(0xFF1C2B3A);
  final Color _muted = const Color(0xFF6B7C8D);
  final Color _border = const Color(0xFFE8E0D0);
  final Color _emergency = const Color(0xFFB03A2E);

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
    _fetchWalletBalance();
  }

  Future<void> _fetchWalletBalance() async {
    // Assuming a logged in user ID for demo
    const userId = 'current_user_id'; 
    _bookingService.watchWallet(userId).listen((wallet) {
      if (mounted) {
        setState(() {
          _walletBalance = wallet.balance;
        });
      }
    });
  }

  double get _platformFee => widget.consultationPrice * 0.15;
  double get _totalAmount => widget.consultationPrice + _platformFee;

  void _nextStep() {
    if (_currentStep < 3) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() => _currentStep++);
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() => _currentStep--);
    }
  }

  Future<void> _confirmBooking() async {
    if (_selectedType == null || _selectedDate == null || _selectedTime == null) return;

    setState(() => _isLoading = true);

    try {
      final scheduledAt = DateTime(
        _selectedDate!.year,
        _selectedDate!.month,
        _selectedDate!.day,
        _selectedTime!.hour,
        _selectedTime!.minute,
      );

      final bookingId = await _bookingService.createBooking(
        clientId: 'current_user_id',
        lawyerId: widget.lawyerId,
        type: _selectedType!,
        scheduledAt: scheduledAt,
        consultationFee: widget.consultationPrice,
      );

      if (mounted) {
        Navigator.pop(context); // Close bottom sheet
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => BookingConfirmationScreen(
              bookingId: bookingId,
              lawyerName: widget.lawyerName,
              consultationType: _selectedType!,
              scheduledAt: scheduledAt,
              totalAmount: _totalAmount,
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('حدث خطأ: ${e.toString()}'), backgroundColor: _emergency),
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
        initialChildSize: 0.92,
        maxChildSize: 0.96,
        minChildSize: 0.5,
        builder: (_, controller) {
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              children: [
                const SizedBox(height: 12),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: _border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 24),
                _buildStepIndicator(),
                const SizedBox(height: 24),
                Expanded(
                  child: PageView(
                    controller: _pageController,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      _buildStep1(),
                      _buildStep2(),
                      _buildStep3(),
                      _buildStep4(),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        children: List.generate(7, (index) {
          if (index % 2 == 0) {
            final stepIndex = index ~/ 2;
            final isActive = _currentStep == stepIndex;
            final isDone = _currentStep > stepIndex;
            
            return Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDone ? _success : (isActive ? _gold : Colors.white),
                border: Border.all(
                  color: isDone ? _success : (isActive ? _gold : _border),
                  width: 2,
                ),
              ),
              child: isDone
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : null,
            );
          } else {
            final stepIndex = index ~/ 2;
            final isDone = _currentStep > stepIndex;
            return Expanded(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                height: 2,
                color: isDone ? _success : _border,
              ),
            );
          }
        }),
      ),
    );
  }

  Widget _buildStep1() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "اختار نوع الاستشارة",
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: _text),
          ),
          Text(
            "مع المحامي ${widget.lawyerName}",
            style: TextStyle(fontSize: 16, color: _muted),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.85,
              children: [
                _buildTypeCard(ConsultationType.voice, Icons.phone, "مكالمة صوتية", "تحدث مع المحامي مباشرة"),
                _buildTypeCard(ConsultationType.video, Icons.videocam, "مكالمة فيديو", "استشارة وجهاً لوجه"),
                _buildTypeCard(ConsultationType.office, Icons.business, "زيارة المكتب", "زيارة شخصية في المكتب"),
                _buildTypeCard(ConsultationType.written, Icons.chat, "استشارة كتابية", "ارسل سؤالك واستلم رد مكتوب"),
              ],
            ),
          ),
          _buildNextButton(enabled: _selectedType != null),
        ],
      ),
    );
  }

  Widget _buildTypeCard(ConsultationType type, IconData icon, String title, String desc) {
    final isSelected = _selectedType == type;
    return GestureDetector(
      onTap: () => setState(() => _selectedType = type),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? _primary.withOpacity(0.08) : Colors.white,
          border: Border.all(
            color: isSelected ? _primary : _border,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 32, color: isSelected ? _primary : _muted),
                const SizedBox(height: 16),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? _primary : _text,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: TextStyle(fontSize: 12, color: _muted),
                ),
              ],
            ),
            if (isSelected)
              Positioned(
                top: 0,
                left: 0,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: _gold,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check, size: 12, color: Colors.white),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep2() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "متى تريد الاستشارة؟",
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: _text),
          ),
          const SizedBox(height: 24),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildQuickDateBtn("اليوم"),
                _buildQuickDateBtn("غداً"),
                _buildQuickDateBtn("هذا الأسبوع"),
                _buildQuickDateBtn("تاريخ محدد"),
              ],
            ),
          ),
          const SizedBox(height: 24),
          if (_selectedQuickDate == "تاريخ محدد")
            TableCalendar(
              firstDay: DateTime.now(),
              lastDay: DateTime.now().add(const Duration(days: 30)),
              focusedDay: _selectedDate ?? DateTime.now(),
              selectedDayPredicate: (day) => isSameDay(_selectedDate, day),
              onDaySelected: (selectedDay, focusedDay) {
                setState(() {
                  _selectedDate = selectedDay;
                  _selectedTime = null;
                });
              },
              calendarStyle: CalendarStyle(
                selectedDecoration: BoxDecoration(color: _primary, shape: BoxShape.circle),
                todayDecoration: BoxDecoration(color: _gold, shape: BoxShape.circle),
                weekendTextStyle: TextStyle(color: _emergency),
              ),
              headerStyle: const HeaderStyle(formatButtonVisible: false, titleCentered: true),
            ),
          const SizedBox(height: 24),
          Expanded(
            child: _buildTimeSlots(),
          ),
          Row(
            children: [
              TextButton(
                onPressed: _prevStep,
                child: Text("السابق", style: TextStyle(color: _muted)),
              ),
              const Spacer(),
              _buildNextButton(enabled: _selectedTime != null, isExpanded: false),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickDateBtn(String label) {
    final isSelected = _selectedQuickDate == label;
    return Padding(
      padding: const EdgeInsets.only(left: 8),
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedQuickDate = label;
            _selectedTime = null;
            if (label == "اليوم") _selectedDate = DateTime.now();
            if (label == "غداً") _selectedDate = DateTime.now().add(const Duration(days: 1));
            // simplified logic for others
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? _gold : Colors.white,
            border: Border.all(color: isSelected ? _gold : _border),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : _text,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTimeSlots() {
    if (_selectedDate == null) return const SizedBox();
    
    final dayOfWeek = _selectedDate!.weekday;
    if (dayOfWeek == DateTime.sunday) {
      return Center(
        child: Text("المحامي غير متاح يوم الأحد", style: TextStyle(color: _emergency)),
      );
    }

    List<String> slots = [];
    if (dayOfWeek == DateTime.friday) {
      slots = ["10:00 ص", "11:00 ص"];
    } else if (dayOfWeek == DateTime.saturday) {
      slots = ["10:00 ص", "12:00 م", "02:00 م"];
    } else {
      slots = ["09:00 ص", "10:00 ص", "11:00 ص", "01:00 م", "02:00 م", "04:00 م"];
    }

    final isToday = isSameDay(_selectedDate, DateTime.now());
    final currentHour = DateTime.now().hour;

    if (isToday && currentHour >= 16) {
      return Center(
        child: Text("لا توجد مواعيد متاحة اليوم، جرب غداً", style: TextStyle(color: _muted)),
      );
    }

    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 2.5,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: slots.length,
      itemBuilder: (context, index) {
        final slot = slots[index];
        final isSelected = _selectedTime != null && _formatTimeOfDay(_selectedTime!) == slot;
        
        // Simple mock logic for past times today
        bool isPast = false;
        if (isToday) {
          int hour = int.parse(slot.split(':')[0]);
          if (slot.contains('م') && hour != 12) hour += 12;
          if (hour <= currentHour) isPast = true;
        }

        return InkWell(
          onTap: isPast ? null : () {
            setState(() {
              int hour = int.parse(slot.split(':')[0]);
              if (slot.contains('م') && hour != 12) hour += 12;
              _selectedTime = TimeOfDay(hour: hour, minute: 0);
            });
          },
          child: Container(
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: isPast ? Colors.grey.withOpacity(0.1) : (isSelected ? _primary : Colors.white),
              border: Border.all(color: isPast ? Colors.transparent : (isSelected ? _primary : _border)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              slot,
              style: TextStyle(
                color: isPast ? Colors.grey : (isSelected ? Colors.white : _text),
                decoration: isPast ? TextDecoration.lineThrough : null,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        );
      },
    );
  }

  String _formatTimeOfDay(TimeOfDay time) {
    final hour = time.hour;
    final minute = time.minute.toString().padLeft(2, '0');
    final ampm = hour >= 12 ? 'م' : 'ص';
    final displayHour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
    return '${displayHour.toString().padLeft(2, '0')}:$minute $ampm';
  }

  Widget _buildStep3() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "تفاصيل الحجز",
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: _text),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("المحامي: ${widget.lawyerName}", style: TextStyle(fontWeight: FontWeight.bold, color: _text)),
                const SizedBox(height: 8),
                Text("نوع الاستشارة: ${_selectedType?.arabicLabel ?? ''}", style: TextStyle(color: _muted)),
                const SizedBox(height: 8),
                Text("الموعد: ${DateFormat('yyyy-MM-dd').format(_selectedDate ?? DateTime.now())} الساعة ${_selectedTime != null ? _formatTimeOfDay(_selectedTime!) : ''}", style: TextStyle(color: _muted)),
                const SizedBox(height: 8),
                Text("المدة: 30 دقيقة", style: TextStyle(color: _muted)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: _gold),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("سعر الاستشارة", style: TextStyle(color: _muted)),
                    Text("${widget.consultationPrice} جنيه", style: TextStyle(color: _text)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("رسوم المنصة 15%", style: TextStyle(color: _muted)),
                    Text("$_platformFee جنيه", style: TextStyle(color: _text)),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("الإجمالي", style: TextStyle(fontWeight: FontWeight.bold, color: _primary, fontSize: 18)),
                    Text("$_totalAmount جنيه", style: TextStyle(fontWeight: FontWeight.bold, color: _primary, fontSize: 18)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Text("⚠️ يمكن الإلغاء مجاناً قبل الموعد بـ 2 ساعة", style: TextStyle(color: _muted, fontSize: 12)),
          ),
          const Spacer(),
          Row(
            children: [
              TextButton(
                onPressed: _prevStep,
                child: Text("السابق", style: TextStyle(color: _muted)),
              ),
              const Spacer(),
              _buildNextButton(enabled: true, isExpanded: false),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStep4() {
    final bool hasEnoughBalance = _walletBalance >= _totalAmount;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "تأكيد الدفع",
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: _text),
          ),
          const SizedBox(height: 24),
          if (hasEnoughBalance)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: _success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: _success),
              ),
              child: Column(
                children: [
                  Icon(_success == _success ? Icons.check_circle : Icons.check_circle, color: _success, size: 48), // Dummy check
                  const SizedBox(height: 16),
                  Text("رصيد محفظتك: $_walletBalance جنيه", style: TextStyle(fontWeight: FontWeight.bold, color: _text)),
                  const SizedBox(height: 8),
                  Text("سيتم خصم $_totalAmount جنيه", style: TextStyle(color: _text)),
                  const Divider(height: 24),
                  Text("الرصيد بعد الحجز: ${_walletBalance - _totalAmount} جنيه", style: TextStyle(color: _muted)),
                ],
              ),
            )
          else
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: _emergency.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: _emergency),
              ),
              child: Column(
                children: [
                  Icon(Icons.error_outline, color: _emergency, size: 48),
                  const SizedBox(height: 16),
                  Text("❌ رصيد غير كافٍ", style: TextStyle(fontWeight: FontWeight.bold, color: _emergency, fontSize: 18)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("رصيدك الحالي:", style: TextStyle(color: _text)),
                      Text("$_walletBalance جنيه", style: TextStyle(fontWeight: FontWeight.bold, color: _text)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("المطلوب:", style: TextStyle(color: _text)),
                      Text("$_totalAmount جنيه", style: TextStyle(fontWeight: FontWeight.bold, color: _text)),
                    ],
                  ),
                  const Divider(height: 24),
                  Text("تحتاج إضافة: ${_totalAmount - _walletBalance} جنيه على الأقل", style: TextStyle(color: _emergency, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          const Spacer(),
          Row(
            children: [
              TextButton(
                onPressed: _prevStep,
                child: Text("السابق", style: TextStyle(color: _muted)),
              ),
              const Spacer(),
              if (hasEnoughBalance)
                ElevatedButton(
                  onPressed: _isLoading ? null : _confirmBooking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _success,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text("تأكيد الحجز ✅", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                )
              else
                ElevatedButton(
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (_) => WalletDepositBottomSheet(
                        initialAmount: _totalAmount - _walletBalance,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primary,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text("إيداع رصيد الآن 💳", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildNextButton({required bool enabled, bool isExpanded = true}) {
    final btn = ElevatedButton(
      onPressed: enabled ? _nextStep : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: enabled ? _primary : _muted.withOpacity(0.3),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 32),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: const Text("التالي →", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
    );

    if (isExpanded) {
      return SizedBox(width: double.infinity, child: btn);
    }
    return btn;
  }
}
