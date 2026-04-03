import 'package:cloud_firestore/cloud_firestore.dart';

enum VerificationStatus { pending, verified, rejected, suspended }

enum VerificationBadge {
  none,
  bronze,
  silver,
  gold,
}

class LawyerDocuments {
  final String? barAssociationIdUrl;
  final String? nationalIdUrl;
  final String? profilePhotoUrl;
  final String? lawDegreeUrl;
  final String? experienceCertUrl;
  final bool barIdVerified;
  final bool nationalIdVerified;

  LawyerDocuments({
    this.barAssociationIdUrl,
    this.nationalIdUrl,
    this.profilePhotoUrl,
    this.lawDegreeUrl,
    this.experienceCertUrl,
    this.barIdVerified = false,
    this.nationalIdVerified = false,
  });

  factory LawyerDocuments.fromMap(Map<String, dynamic> map) {
    return LawyerDocuments(
      barAssociationIdUrl: map['barAssociationIdUrl'],
      nationalIdUrl: map['nationalIdUrl'],
      profilePhotoUrl: map['profilePhotoUrl'],
      lawDegreeUrl: map['lawDegreeUrl'],
      experienceCertUrl: map['experienceCertUrl'],
      barIdVerified: map['barIdVerified'] ?? false,
      nationalIdVerified: map['nationalIdVerified'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'barAssociationIdUrl': barAssociationIdUrl,
      'nationalIdUrl': nationalIdUrl,
      'profilePhotoUrl': profilePhotoUrl,
      'lawDegreeUrl': lawDegreeUrl,
      'experienceCertUrl': experienceCertUrl,
      'barIdVerified': barIdVerified,
      'nationalIdVerified': nationalIdVerified,
    };
  }
}

class LawyerModel {
  final String uid;
  final String name;
  final String phone;
  final String email;
  final String governorate;
  final List<String> specializations;
  final String experienceRange;
  final String about;
  final int consultationPrice;
  final bool isAvailable;
  final double rating;
  final int reviewCount;
  final int completedConsultations;
  final VerificationStatus verificationStatus;
  final String? rejectionReason;
  final String? suspensionReason;
  final LawyerDocuments documents;
  final VerificationBadge badge;
  final DateTime createdAt;
  final DateTime? verifiedAt;

  LawyerModel({
    required this.uid,
    required this.name,
    required this.phone,
    required this.email,
    required this.governorate,
    required this.specializations,
    required this.experienceRange,
    required this.about,
    required this.consultationPrice,
    this.isAvailable = true,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.completedConsultations = 0,
    this.verificationStatus = VerificationStatus.pending,
    this.rejectionReason,
    this.suspensionReason,
    required this.documents,
    this.badge = VerificationBadge.none,
    required this.createdAt,
    this.verifiedAt,
  });

  bool get isVerified => verificationStatus == VerificationStatus.verified;
  bool get isPending => verificationStatus == VerificationStatus.pending;
  bool get canReceiveClients => isVerified && isAvailable;

  factory LawyerModel.fromMap(Map<String, dynamic> map, String documentId) {
    return LawyerModel(
      uid: documentId,
      name: map['name'] ?? '',
      phone: map['phone'] ?? '',
      email: map['email'] ?? '',
      governorate: map['governorate'] ?? '',
      specializations: List<String>.from(map['specializations'] ?? []),
      experienceRange: map['experienceRange'] ?? '',
      about: map['about'] ?? '',
      consultationPrice: map['consultationPrice'] ?? 500,
      isAvailable: map['isAvailable'] ?? true,
      rating: (map['rating'] ?? 0.0).toDouble(),
      reviewCount: map['reviewCount'] ?? 0,
      completedConsultations: map['completedConsultations'] ?? 0,
      verificationStatus: VerificationStatus.values.firstWhere(
        (e) => e.toString() == 'VerificationStatus.${map['verificationStatus']}',
        orElse: () => VerificationStatus.pending,
      ),
      rejectionReason: map['rejectionReason'],
      suspensionReason: map['suspensionReason'],
      documents: LawyerDocuments.fromMap(map['documents'] ?? {}),
      badge: VerificationBadge.values.firstWhere(
        (e) => e.toString() == 'VerificationBadge.${map['badge']}',
        orElse: () => VerificationBadge.none,
      ),
      createdAt: map['createdAt'] != null ? (map['createdAt'] as Timestamp).toDate() : DateTime.now(),
      verifiedAt: map['verifiedAt'] != null ? (map['verifiedAt'] as Timestamp).toDate() : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'phone': phone,
      'email': email,
      'governorate': governorate,
      'specializations': specializations,
      'experienceRange': experienceRange,
      'about': about,
      'consultationPrice': consultationPrice,
      'isAvailable': isAvailable,
      'rating': rating,
      'reviewCount': reviewCount,
      'completedConsultations': completedConsultations,
      'verificationStatus': verificationStatus.toString().split('.').last,
      'rejectionReason': rejectionReason,
      'suspensionReason': suspensionReason,
      'documents': documents.toMap(),
      'badge': badge.toString().split('.').last,
      'createdAt': Timestamp.fromDate(createdAt),
      'verifiedAt': verifiedAt != null ? Timestamp.fromDate(verifiedAt!) : null,
    };
  }
}
