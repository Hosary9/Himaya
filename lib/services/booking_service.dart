import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/booking_model.dart';
import '../models/wallet_model.dart';

class BookingService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

  Future<String> createBooking({
    required String clientId,
    required String lawyerId,
    required ConsultationType type,
    required DateTime scheduledAt,
    required double consultationFee,
  }) async {
    final double platformFee = consultationFee * 0.15;
    final double totalAmount = consultationFee + platformFee;
    
    final bookingId = _uuid.v4();
    final transactionId = _uuid.v4();
    final agoraChannelId = _uuid.v4();

    final batch = _firestore.batch();

    // 1. Get Wallet Ref
    final walletRef = _firestore.collection('wallet').doc(clientId);
    
    return await _firestore.runTransaction((transaction) async {
      final walletSnapshot = await transaction.get(walletRef);
      
      if (!walletSnapshot.exists) {
        throw Exception('Wallet not found');
      }

      final currentBalance = (walletSnapshot.data()?['balance'] ?? 0).toDouble();
      final totalSpent = (walletSnapshot.data()?['totalSpent'] ?? 0).toDouble();

      if (currentBalance < totalAmount) {
        throw Exception('Insufficient balance');
      }

      final newBalance = currentBalance - totalAmount;

      // 2. Update Wallet
      transaction.update(walletRef, {
        'balance': newBalance,
        'totalSpent': totalSpent + totalAmount,
        'lastUpdated': FieldValue.serverTimestamp(),
      });

      // 3. Create Transaction Record
      final transactionRef = _firestore.collection('transactions').doc(transactionId);
      final transactionModel = TransactionModel(
        transactionId: transactionId,
        userId: clientId,
        type: TransactionType.payment,
        amount: totalAmount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        bookingId: bookingId,
        description: 'دفع استشارة',
        status: 'completed',
        createdAt: DateTime.now(),
      );
      transaction.set(transactionRef, transactionModel.toMap());

      // 4. Create Booking Document
      final bookingRef = _firestore.collection('bookings').doc(bookingId);
      final bookingModel = BookingModel(
        bookingId: bookingId,
        clientId: clientId,
        lawyerId: lawyerId,
        consultationType: type,
        scheduledAt: scheduledAt,
        durationMinutes: 30,
        consultationFee: consultationFee,
        platformFee: platformFee,
        totalAmount: totalAmount,
        status: BookingStatus.confirmed,
        paymentStatus: PaymentStatus.paid,
        walletTransactionId: transactionId,
        cancellationReason: '',
        agoraChannelId: agoraChannelId,
        createdAt: DateTime.now(),
      );
      transaction.set(bookingRef, bookingModel.toMap());

      return bookingId;
    });
  }

  Future<void> cancelBooking(String bookingId, String cancelledBy) async {
    return await _firestore.runTransaction((transaction) async {
      final bookingRef = _firestore.collection('bookings').doc(bookingId);
      final bookingSnapshot = await transaction.get(bookingRef);

      if (!bookingSnapshot.exists) {
        throw Exception('Booking not found');
      }

      final booking = BookingModel.fromFirestore(bookingSnapshot);
      if (booking.status != BookingStatus.confirmed) {
        throw Exception('Booking cannot be cancelled');
      }

      double refundAmount = 0;
      final timeUntilAppointment = booking.scheduledAt.difference(DateTime.now());

      if (cancelledBy == 'lawyer') {
        refundAmount = booking.totalAmount;
      } else if (cancelledBy == 'client') {
        if (timeUntilAppointment.inHours >= 2) {
          refundAmount = booking.totalAmount;
        } else if (timeUntilAppointment.inHours > 0 || timeUntilAppointment.inMinutes > 0) {
          refundAmount = booking.totalAmount * 0.5;
        } else {
          refundAmount = 0; // No show or past
        }
      }

      // Update Booking
      transaction.update(bookingRef, {
        'status': 'cancelled',
        'cancelledBy': cancelledBy,
        'cancellationReason': 'Cancelled by $cancelledBy',
        'paymentStatus': refundAmount > 0 ? 'refunded' : booking.paymentStatus.toString().split('.').last,
      });

      if (refundAmount > 0) {
        final walletRef = _firestore.collection('wallet').doc(booking.clientId);
        final walletSnapshot = await transaction.get(walletRef);
        
        if (walletSnapshot.exists) {
          final currentBalance = (walletSnapshot.data()?['balance'] ?? 0).toDouble();
          final newBalance = currentBalance + refundAmount;

          transaction.update(walletRef, {
            'balance': newBalance,
            'lastUpdated': FieldValue.serverTimestamp(),
          });

          final transactionId = _uuid.v4();
          final transactionRef = _firestore.collection('transactions').doc(transactionId);
          final transactionModel = TransactionModel(
            transactionId: transactionId,
            userId: booking.clientId,
            type: TransactionType.refund,
            amount: refundAmount,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            bookingId: bookingId,
            description: 'استرداد رصيد',
            status: 'completed',
            createdAt: DateTime.now(),
          );
          transaction.set(transactionRef, transactionModel.toMap());
        }
      }
    });
  }

  Stream<List<BookingModel>> watchClientBookings(String clientId) {
    return _firestore
        .collection('bookings')
        .where('clientId', isEqualTo: clientId)
        .orderBy('scheduledAt', descending: false)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => BookingModel.fromFirestore(doc))
            .toList());
  }

  Stream<List<BookingModel>> watchLawyerBookings(String lawyerId) {
    return _firestore
        .collection('bookings')
        .where('lawyerId', isEqualTo: lawyerId)
        .orderBy('scheduledAt', descending: false)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => BookingModel.fromFirestore(doc))
            .toList());
  }

  Stream<WalletModel> watchWallet(String userId) {
    return _firestore
        .collection('wallet')
        .doc(userId)
        .snapshots()
        .map((doc) => doc.exists 
            ? WalletModel.fromFirestore(doc) 
            : WalletModel(
                uid: userId, 
                balance: 0, 
                currency: 'EGP', 
                totalDeposited: 0, 
                totalSpent: 0, 
                lastUpdated: DateTime.now()
              ));
  }

  Future<void> depositToWallet(String userId, double amount) async {
    final walletRef = _firestore.collection('wallet').doc(userId);
    
    await _firestore.runTransaction((transaction) async {
      final walletSnapshot = await transaction.get(walletRef);
      
      double currentBalance = 0;
      double totalDeposited = 0;

      if (walletSnapshot.exists) {
        currentBalance = (walletSnapshot.data()?['balance'] ?? 0).toDouble();
        totalDeposited = (walletSnapshot.data()?['totalDeposited'] ?? 0).toDouble();
      }

      final newBalance = currentBalance + amount;

      if (walletSnapshot.exists) {
        transaction.update(walletRef, {
          'balance': newBalance,
          'totalDeposited': totalDeposited + amount,
          'lastUpdated': FieldValue.serverTimestamp(),
        });
      } else {
        transaction.set(walletRef, {
          'uid': userId,
          'balance': newBalance,
          'currency': 'EGP',
          'totalDeposited': amount,
          'totalSpent': 0.0,
          'lastUpdated': FieldValue.serverTimestamp(),
        });
      }

      final transactionId = _uuid.v4();
      final transactionRef = _firestore.collection('transactions').doc(transactionId);
      final transactionModel = TransactionModel(
        transactionId: transactionId,
        userId: userId,
        type: TransactionType.deposit,
        amount: amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        description: 'إيداع رصيد',
        status: 'completed',
        createdAt: DateTime.now(),
      );
      transaction.set(transactionRef, transactionModel.toMap());
    });
  }

  bool canStartCall(BookingModel booking) {
    final diff = booking.scheduledAt.difference(DateTime.now());
    return diff.inMinutes <= 10 && booking.status == BookingStatus.confirmed;
  }

  Future<Map<String, String>?> getLawyerContactInfo(String lawyerId, String clientId) async {
    final query = await _firestore
        .collection('bookings')
        .where('lawyerId', isEqualTo: lawyerId)
        .where('clientId', isEqualTo: clientId)
        .where('status', whereIn: ['confirmed', 'active'])
        .limit(1)
        .get();

    if (query.docs.isNotEmpty) {
      final lawyerDoc = await _firestore.collection('lawyers').doc(lawyerId).get();
      if (lawyerDoc.exists) {
        return {
          'phone': lawyerDoc.data()?['phone'] ?? '',
          'email': lawyerDoc.data()?['email'] ?? '',
        };
      }
    }
    return null;
  }
}
