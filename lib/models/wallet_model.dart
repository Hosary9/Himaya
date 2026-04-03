import 'package:cloud_firestore/cloud_firestore.dart';

class WalletModel {
  final String uid;
  final double balance;
  final String currency;
  final double totalDeposited;
  final double totalSpent;
  final DateTime lastUpdated;

  WalletModel({
    required this.uid,
    required this.balance,
    required this.currency,
    required this.totalDeposited,
    required this.totalSpent,
    required this.lastUpdated,
  });

  factory WalletModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return WalletModel(
      uid: doc.id,
      balance: (data['balance'] ?? 0).toDouble(),
      currency: data['currency'] ?? 'EGP',
      totalDeposited: (data['totalDeposited'] ?? 0).toDouble(),
      totalSpent: (data['totalSpent'] ?? 0).toDouble(),
      lastUpdated: data['lastUpdated'] != null 
          ? (data['lastUpdated'] as Timestamp).toDate() 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'balance': balance,
      'currency': currency,
      'totalDeposited': totalDeposited,
      'totalSpent': totalSpent,
      'lastUpdated': Timestamp.fromDate(lastUpdated),
    };
  }
}

enum TransactionType {
  deposit,
  payment,
  refund,
  earning
}

TransactionType _transactionTypeFromString(String value) {
  switch (value) {
    case 'deposit':
      return TransactionType.deposit;
    case 'payment':
      return TransactionType.payment;
    case 'refund':
      return TransactionType.refund;
    case 'earning':
      return TransactionType.earning;
    default:
      return TransactionType.deposit;
  }
}

String _transactionTypeToString(TransactionType type) {
  switch (type) {
    case TransactionType.deposit:
      return 'deposit';
    case TransactionType.payment:
      return 'payment';
    case TransactionType.refund:
      return 'refund';
    case TransactionType.earning:
      return 'earning';
  }
}

class TransactionModel {
  final String transactionId;
  final String userId;
  final TransactionType type;
  final double amount;
  final double balanceBefore;
  final double balanceAfter;
  final String? bookingId;
  final String description;
  final String status;
  final DateTime createdAt;

  TransactionModel({
    required this.transactionId,
    required this.userId,
    required this.type,
    required this.amount,
    required this.balanceBefore,
    required this.balanceAfter,
    this.bookingId,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  String get arabicDescription {
    switch (type) {
      case TransactionType.deposit:
        return "إيداع رصيد";
      case TransactionType.payment:
        return "دفع استشارة";
      case TransactionType.refund:
        return "استرداد رصيد";
      case TransactionType.earning:
        return "أرباح استشارة";
    }
  }

  factory TransactionModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return TransactionModel(
      transactionId: doc.id,
      userId: data['userId'] ?? '',
      type: _transactionTypeFromString(data['type'] ?? 'deposit'),
      amount: (data['amount'] ?? 0).toDouble(),
      balanceBefore: (data['balanceBefore'] ?? 0).toDouble(),
      balanceAfter: (data['balanceAfter'] ?? 0).toDouble(),
      bookingId: data['bookingId'],
      description: data['description'] ?? '',
      status: data['status'] ?? 'completed',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'type': _transactionTypeToString(type),
      'amount': amount,
      'balanceBefore': balanceBefore,
      'balanceAfter': balanceAfter,
      'bookingId': bookingId,
      'description': description,
      'status': status,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
