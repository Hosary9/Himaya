import 'package:cloud_firestore/cloud_firestore.dart';

enum BookingStatus {
  pendingPayment,
  confirmed,
  active,
  completed,
  cancelled,
  refunded
}

enum PaymentStatus {
  unpaid,
  paid,
  refunded
}

enum ConsultationType {
  voice,
  video,
  office,
  written
}

extension ConsultationTypeExtension on ConsultationType {
  String get arabicLabel {
    switch (this) {
      case ConsultationType.voice:
        return 'مكالمة صوتية';
      case ConsultationType.video:
        return 'مكالمة فيديو';
      case ConsultationType.office:
        return 'زيارة في المكتب';
      case ConsultationType.written:
        return 'استشارة كتابية';
    }
  }

  String get stringValue {
    switch (this) {
      case ConsultationType.voice:
        return 'voice';
      case ConsultationType.video:
        return 'video';
      case ConsultationType.office:
        return 'office';
      case ConsultationType.written:
        return 'written';
    }
  }
}

ConsultationType _consultationTypeFromString(String value) {
  switch (value) {
    case 'voice':
      return ConsultationType.voice;
    case 'video':
      return ConsultationType.video;
    case 'office':
      return ConsultationType.office;
    case 'written':
      return ConsultationType.written;
    default:
      return ConsultationType.voice;
  }
}

BookingStatus _bookingStatusFromString(String value) {
  switch (value) {
    case 'pending_payment':
      return BookingStatus.pendingPayment;
    case 'confirmed':
      return BookingStatus.confirmed;
    case 'active':
      return BookingStatus.active;
    case 'completed':
      return BookingStatus.completed;
    case 'cancelled':
      return BookingStatus.cancelled;
    case 'refunded':
      return BookingStatus.refunded;
    default:
      return BookingStatus.pendingPayment;
  }
}

String _bookingStatusToString(BookingStatus status) {
  switch (status) {
    case BookingStatus.pendingPayment:
      return 'pending_payment';
    case BookingStatus.confirmed:
      return 'confirmed';
    case BookingStatus.active:
      return 'active';
    case BookingStatus.completed:
      return 'completed';
    case BookingStatus.cancelled:
      return 'cancelled';
    case BookingStatus.refunded:
      return 'refunded';
  }
}

PaymentStatus _paymentStatusFromString(String value) {
  switch (value) {
    case 'unpaid':
      return PaymentStatus.unpaid;
    case 'paid':
      return PaymentStatus.paid;
    case 'refunded':
      return PaymentStatus.refunded;
    default:
      return PaymentStatus.unpaid;
  }
}

String _paymentStatusToString(PaymentStatus status) {
  switch (status) {
    case PaymentStatus.unpaid:
      return 'unpaid';
    case PaymentStatus.paid:
      return 'paid';
    case PaymentStatus.refunded:
      return 'refunded';
  }
}

class BookingModel {
  final String bookingId;
  final String clientId;
  final String lawyerId;
  final ConsultationType consultationType;
  final DateTime scheduledAt;
  final int durationMinutes;
  final double consultationFee;
  final double platformFee;
  final double totalAmount;
  final BookingStatus status;
  final PaymentStatus paymentStatus;
  final String walletTransactionId;
  final String? cancelledBy;
  final String cancellationReason;
  final String agoraChannelId;
  final DateTime createdAt;
  final DateTime? completedAt;

  BookingModel({
    required this.bookingId,
    required this.clientId,
    required this.lawyerId,
    required this.consultationType,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.consultationFee,
    required this.platformFee,
    required this.totalAmount,
    required this.status,
    required this.paymentStatus,
    required this.walletTransactionId,
    this.cancelledBy,
    required this.cancellationReason,
    required this.agoraChannelId,
    required this.createdAt,
    this.completedAt,
  });

  factory BookingModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return BookingModel(
      bookingId: doc.id,
      clientId: data['clientId'] ?? '',
      lawyerId: data['lawyerId'] ?? '',
      consultationType: _consultationTypeFromString(data['consultationType'] ?? 'voice'),
      scheduledAt: (data['scheduledAt'] as Timestamp).toDate(),
      durationMinutes: data['durationMinutes'] ?? 30,
      consultationFee: (data['consultationFee'] ?? 0).toDouble(),
      platformFee: (data['platformFee'] ?? 0).toDouble(),
      totalAmount: (data['totalAmount'] ?? 0).toDouble(),
      status: _bookingStatusFromString(data['status'] ?? 'pending_payment'),
      paymentStatus: _paymentStatusFromString(data['paymentStatus'] ?? 'unpaid'),
      walletTransactionId: data['walletTransactionId'] ?? '',
      cancelledBy: data['cancelledBy'],
      cancellationReason: data['cancellationReason'] ?? '',
      agoraChannelId: data['agoraChannelId'] ?? '',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      completedAt: data['completedAt'] != null ? (data['completedAt'] as Timestamp).toDate() : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'clientId': clientId,
      'lawyerId': lawyerId,
      'consultationType': consultationType.stringValue,
      'scheduledAt': Timestamp.fromDate(scheduledAt),
      'durationMinutes': durationMinutes,
      'consultationFee': consultationFee,
      'platformFee': platformFee,
      'totalAmount': totalAmount,
      'status': _bookingStatusToString(status),
      'paymentStatus': _paymentStatusToString(paymentStatus),
      'walletTransactionId': walletTransactionId,
      'cancelledBy': cancelledBy,
      'cancellationReason': cancellationReason,
      'agoraChannelId': agoraChannelId,
      'createdAt': Timestamp.fromDate(createdAt),
      'completedAt': completedAt != null ? Timestamp.fromDate(completedAt!) : null,
    };
  }

  bool get isCallable {
    if (status != BookingStatus.confirmed) return false;
    final now = DateTime.now();
    final diff = scheduledAt.difference(now);
    return diff.inMinutes <= 10 && diff.inMinutes >= -durationMinutes;
  }

  bool get canCancel {
    if (status != BookingStatus.confirmed) return false;
    final now = DateTime.now();
    final diff = scheduledAt.difference(now);
    return diff.inMinutes > 30;
  }

  BookingModel copyWith({
    String? bookingId,
    String? clientId,
    String? lawyerId,
    ConsultationType? consultationType,
    DateTime? scheduledAt,
    int? durationMinutes,
    double? consultationFee,
    double? platformFee,
    double? totalAmount,
    BookingStatus? status,
    PaymentStatus? paymentStatus,
    String? walletTransactionId,
    String? cancelledBy,
    String? cancellationReason,
    String? agoraChannelId,
    DateTime? createdAt,
    DateTime? completedAt,
  }) {
    return BookingModel(
      bookingId: bookingId ?? this.bookingId,
      clientId: clientId ?? this.clientId,
      lawyerId: lawyerId ?? this.lawyerId,
      consultationType: consultationType ?? this.consultationType,
      scheduledAt: scheduledAt ?? this.scheduledAt,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      consultationFee: consultationFee ?? this.consultationFee,
      platformFee: platformFee ?? this.platformFee,
      totalAmount: totalAmount ?? this.totalAmount,
      status: status ?? this.status,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      walletTransactionId: walletTransactionId ?? this.walletTransactionId,
      cancelledBy: cancelledBy ?? this.cancelledBy,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      agoraChannelId: agoraChannelId ?? this.agoraChannelId,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt ?? this.completedAt,
    );
  }
}
