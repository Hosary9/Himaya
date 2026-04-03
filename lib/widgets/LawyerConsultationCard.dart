import 'package:flutter/material.dart';
import 'dart:math';
import '../screens/payment/ConsultationPaymentScreen.dart';
import '../screens/booking/BookingBottomSheet.dart';
import 'ComingSoonDialog.dart';

class LawyerConsultationCard extends StatelessWidget {
  final String? lawyerId;
  final String lawyerName;
  final String specialty;
  final int price;
  final double rating;
  final int reviewCount;

  const LawyerConsultationCard({
    Key? key,
    this.lawyerId,
    required this.lawyerName,
    required this.specialty,
    required this.price,
    required this.rating,
    required this.reviewCount,
  }) : super(key: key);

  String _getInitials(String name) {
    List<String> parts = name.split(' ');
    if (parts.length > 1) {
      return '${parts[0][0]}${parts[1][0]}';
    }
    return name.isNotEmpty ? name[0] : '?';
  }

  @override
  Widget build(BuildContext context) {
    final int enforcedPrice = max(price, 500);

    return Container(
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
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: const Color(0xFF1A3A5C),
                child: Text(
                  _getInitials(lawyerName),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lawyerName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1C2B3A),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      specialty,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF6B7C8D),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Color(0xFFC9A84C), size: 16),
                        const SizedBox(width: 4),
                        Text(
                          rating.toString(),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1C2B3A),
                          ),
                        ),
                        Text(
                          " ($reviewCount)",
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF6B7C8D),
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFC9A84C).withOpacity(0.2),
                            border: Border.all(color: const Color(0xFFC9A84C)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            "$enforcedPrice جنيه / 30 دقيقة",
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1C2B3A),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 40,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2D6A4F),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                elevation: 0,
              ),
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => BookingBottomSheet(
                    lawyerId: lawyerId ?? 'mock_lawyer_id',
                    lawyerName: lawyerName,
                    consultationPrice: enforcedPrice.toDouble(),
                  ),
                );
              },
              child: const Text(
                "احجز استشارة →",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
