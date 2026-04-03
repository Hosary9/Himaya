import 'package:flutter/material.dart';

class RatingScreen extends StatefulWidget {
  final String lawyerName;

  const RatingScreen({Key? key, required this.lawyerName}) : super(key: key);

  @override
  State<RatingScreen> createState() => _RatingScreenState();
}

class _RatingScreenState extends State<RatingScreen> {
  int _rating = 0;
  final TextEditingController _commentController = TextEditingController();

  final Color _primary = const Color(0xFF1A3A5C);
  final Color _gold = const Color(0xFFC9A84C);
  final Color _text = const Color(0xFF1C2B3A);
  final Color _muted = const Color(0xFF6B7C8D);

  String get _ratingLabel {
    switch (_rating) {
      case 1: return "سيئة جداً";
      case 2: return "سيئة";
      case 3: return "متوسطة";
      case 4: return "جيدة";
      case 5: return "ممتازة! 🌟";
      default: return "";
    }
  }

  void _submitRating() {
    if (_rating == 0) return;
    
    // In a real app, save to Firestore here
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: const Text('شكراً على تقييمك! ⭐'), backgroundColor: _primary),
    );
    
    Navigator.of(context).popUntil((route) => route.isFirst);
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
            TextButton(
              onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
              child: Text("تخطي", style: TextStyle(color: _muted)),
            )
          ],
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              Text(
                "كيف كانت الاستشارة؟",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: _text),
              ),
              const SizedBox(height: 32),
              CircleAvatar(
                radius: 40,
                backgroundColor: _primary,
                child: Text(
                  widget.lawyerName.substring(0, 1),
                  style: const TextStyle(fontSize: 32, color: Colors.white),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                widget.lawyerName,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _text),
              ),
              const SizedBox(height: 40),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return IconButton(
                    icon: Icon(
                      index < _rating ? Icons.star : Icons.star_border,
                      color: _gold,
                      size: 48,
                    ),
                    onPressed: () => setState(() => _rating = index + 1),
                  );
                }),
              ),
              const SizedBox(height: 16),
              Text(
                _ratingLabel,
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _gold),
              ),
              const SizedBox(height: 40),
              TextField(
                controller: _commentController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: "أضف تعليق (اختياري)\nشاركنا تجربتك مع المحامي...",
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _rating > 0 ? _submitRating : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text("إرسال التقييم", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
