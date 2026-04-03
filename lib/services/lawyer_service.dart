import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import '../models/lawyer_model.dart';

class LawyerService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  Future<List<LawyerModel>> getVerifiedLawyers({
    String? governorate,
    String? specialization,
    String? sortBy,
  }) async {
    try {
      Query query = _firestore
          .collection('lawyers')
          .where('verificationStatus', isEqualTo: 'verified')
          .where('isAvailable', isEqualTo: true);

      if (governorate != null && governorate.isNotEmpty) {
        query = query.where('governorate', isEqualTo: governorate);
      }
      if (specialization != null && specialization.isNotEmpty) {
        query = query.where('specializations', arrayContains: specialization);
      }

      if (sortBy == 'rating') {
        query = query.orderBy('rating', descending: true);
      } else if (sortBy == 'price_asc') {
        query = query.orderBy('consultationPrice', descending: false);
      } else if (sortBy == 'price_desc') {
        query = query.orderBy('consultationPrice', descending: true);
      } else if (sortBy == 'newest') {
        query = query.orderBy('verifiedAt', descending: true);
      }

      final snapshot = await query.get();
      return snapshot.docs
          .map((doc) => LawyerModel.fromMap(doc.data() as Map<String, dynamic>, doc.id))
          .toList();
    } catch (e) {
      throw Exception('حدث خطأ أثناء جلب المحامين: $e');
    }
  }

  Future<LawyerModel?> getPublicLawyerProfile(String uid) async {
    try {
      final doc = await _firestore.collection('lawyers').doc(uid).get();
      if (doc.exists && doc.data()!['verificationStatus'] == 'verified') {
        return LawyerModel.fromMap(doc.data()!, doc.id);
      }
      return null;
    } catch (e) {
      throw Exception('حدث خطأ أثناء جلب ملف المحامي: $e');
    }
  }

  Stream<LawyerModel?> watchOwnProfile(String uid) {
    return _firestore.collection('lawyers').doc(uid).snapshots().map((doc) {
      if (doc.exists) {
        return LawyerModel.fromMap(doc.data()!, doc.id);
      }
      return null;
    });
  }

  Future<void> submitVerificationRequest({
    required LawyerModel data,
    required Map<String, File> documents,
    required Function(double) onProgress,
  }) async {
    try {
      Map<String, String> uploadedUrls = {};
      int totalFiles = documents.length;
      int uploadedFiles = 0;

      for (var entry in documents.entries) {
        String docType = entry.key;
        File file = entry.value;
        String filename = '${DateTime.now().millisecondsSinceEpoch}_${file.path.split('/').last}';
        Reference ref = _storage.ref().child('lawyers/${data.uid}/documents/$docType/$filename');

        UploadTask uploadTask = ref.putFile(file);

        uploadTask.snapshotEvents.listen((TaskSnapshot snapshot) {
          double progress = (uploadedFiles + (snapshot.bytesTransferred / snapshot.totalBytes)) / totalFiles;
          onProgress(progress);
        });

        TaskSnapshot completedTask = await uploadTask;
        String downloadUrl = await completedTask.ref.getDownloadURL();
        uploadedUrls[docType] = downloadUrl;
        uploadedFiles++;
      }

      LawyerDocuments lawyerDocs = LawyerDocuments(
        barAssociationIdUrl: uploadedUrls['barAssociationId'],
        nationalIdUrl: uploadedUrls['nationalId'],
        profilePhotoUrl: uploadedUrls['profilePhoto'],
        lawDegreeUrl: uploadedUrls['lawDegree'],
        experienceCertUrl: uploadedUrls['experienceCert'],
      );

      LawyerModel finalData = LawyerModel(
        uid: data.uid,
        name: data.name,
        phone: data.phone,
        email: data.email,
        governorate: data.governorate,
        specializations: data.specializations,
        experienceRange: data.experienceRange,
        about: data.about,
        consultationPrice: data.consultationPrice < 500 ? 500 : data.consultationPrice,
        documents: lawyerDocs,
        createdAt: DateTime.now(),
        verificationStatus: VerificationStatus.pending,
      );

      await _firestore.collection('lawyers').doc(data.uid).set(finalData.toMap());

      await _firestore.collection('verification_requests').add({
        'lawyerId': data.uid,
        'status': 'pending',
        'submittedAt': FieldValue.serverTimestamp(),
        'requiredDocsUploaded': true,
      });

      await _firestore.collection('users').doc(data.uid).update({'role': 'lawyer'});
    } catch (e) {
      throw Exception('حدث خطأ أثناء إرسال طلب التحقق: $e');
    }
  }

  Future<void> approveLawyer(String uid) async {
    try {
      await _firestore.collection('lawyers').doc(uid).update({
        'verificationStatus': 'verified',
        'verifiedAt': FieldValue.serverTimestamp(),
      });

      final requests = await _firestore
          .collection('verification_requests')
          .where('lawyerId', isEqualTo: uid)
          .where('status', isEqualTo: 'pending')
          .get();
      for (var doc in requests.docs) {
        await doc.reference.update({
          'status': 'approved',
          'reviewedBy': 'admin', // Ideally pass adminUid here
          'reviewedAt': FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      throw Exception('حدث خطأ أثناء اعتماد المحامي: $e');
    }
  }

  Future<void> rejectLawyer(String uid, String reason) async {
    try {
      await _firestore.collection('lawyers').doc(uid).update({
        'verificationStatus': 'rejected',
        'rejectionReason': reason,
      });

      final requests = await _firestore
          .collection('verification_requests')
          .where('lawyerId', isEqualTo: uid)
          .where('status', isEqualTo: 'pending')
          .get();
      for (var doc in requests.docs) {
        await doc.reference.update({
          'status': 'rejected',
          'adminNotes': reason,
          'reviewedAt': FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      throw Exception('حدث خطأ أثناء رفض المحامي: $e');
    }
  }

  Future<void> suspendLawyer(String uid, String reason) async {
    try {
      await _firestore.collection('lawyers').doc(uid).update({
        'verificationStatus': 'suspended',
        'suspensionReason': reason,
      });
    } catch (e) {
      throw Exception('حدث خطأ أثناء تعليق حساب المحامي: $e');
    }
  }

  Future<void> saveAdminNote(String requestId, String note) async {
    try {
      await _firestore.collection('verification_requests').doc(requestId).update({
        'adminNotes': note,
      });
    } catch (e) {
      throw Exception('حدث خطأ أثناء حفظ الملاحظة: $e');
    }
  }

  Future<void> markBarIdVerified(String uid, bool verified) async {
    try {
      await _firestore.collection('lawyers').doc(uid).update({
        'documents.barIdVerified': verified,
      });
    } catch (e) {
      throw Exception('حدث خطأ أثناء تحديث حالة التحقق: $e');
    }
  }

  Stream<VerificationStatus> watchVerificationStatus(String uid) {
    return _firestore.collection('lawyers').doc(uid).snapshots().map((doc) {
      if (doc.exists) {
        String status = doc.data()!['verificationStatus'] ?? 'pending';
        return VerificationStatus.values.firstWhere(
          (e) => e.toString() == 'VerificationStatus.$status',
          orElse: () => VerificationStatus.pending,
        );
      }
      return VerificationStatus.pending;
    });
  }

  Stream<Map<String, int>> watchAdminStats() {
    return _firestore.collection('lawyers').snapshots().map((snapshot) {
      int pending = 0;
      int verified = 0;
      int rejected = 0;
      int suspended = 0;

      for (var doc in snapshot.docs) {
        String status = doc.data()['verificationStatus'] ?? 'pending';
        if (status == 'pending') pending++;
        else if (status == 'verified') verified++;
        else if (status == 'rejected') rejected++;
        else if (status == 'suspended') suspended++;
      }

      return {
        'pending': pending,
        'verified': verified,
        'rejected': rejected,
        'suspended': suspended,
      };
    });
  }

  VerificationBadge calculateBadge(LawyerModel lawyer) {
    if (!lawyer.isVerified) return VerificationBadge.none;
    if (lawyer.reviewCount >= 25 && lawyer.rating >= 4.5) return VerificationBadge.gold;
    if (lawyer.reviewCount >= 10 && lawyer.rating >= 4.0) return VerificationBadge.silver;
    return VerificationBadge.bronze;
  }
}
