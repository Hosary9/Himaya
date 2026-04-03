import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/lawyer_model.dart';
import '../../services/lawyer_service.dart';
import 'DocumentViewerScreen.dart';

class LawyerVerificationCard extends StatefulWidget {
  final String requestId;
  final String lawyerId;

  const LawyerVerificationCard({Key? key, required this.requestId, required this.lawyerId}) : super(key: key);

  @override
  State<LawyerVerificationCard> createState() => _LawyerVerificationCardState();
}

class _LawyerVerificationCardState extends State<LawyerVerificationCard> {
  bool _isExpanded = false;
  final LawyerService _lawyerService = LawyerService();
  final TextEditingController _noteController = TextEditingController();

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  void _showApproveDialog(LawyerModel lawyer) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("تأكيد الاعتماد ✅"),
        content: Text("هل تريد اعتماد المحامي ${lawyer.name} رسمياً؟\nسيظهر في نتائج البحث فور الاعتماد"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("إلغاء")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2D6A4F)),
            onPressed: () async {
              Navigator.pop(context);
              await _lawyerService.approveLawyer(lawyer.uid);
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("✅ تم اعتماد المحامي ${lawyer.name} بنجاح")));
            },
            child: const Text("تأكيد الاعتماد ✅", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showRejectSheet(LawyerModel lawyer) {
    String? selectedReason;
    final TextEditingController otherReasonController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return DraggableScrollableSheet(
              initialChildSize: 0.5,
              maxChildSize: 0.8,
              expand: false,
              builder: (_, controller) {
                return Container(
                  padding: const EdgeInsets.all(24),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("سبب رفض طلب ${lawyer.name}", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      Expanded(
                        child: ListView(
                          controller: controller,
                          children: [
                            "وثائق غير واضحة أو منخفضة الجودة",
                            "كارنيه النقابة منتهي الصلاحية",
                            "بيانات شخصية غير مكتملة",
                            "لا ينتمي لنقابة المحامين المصرية",
                            "وثائق مزورة أو مشبوهة",
                            "سبب آخر"
                          ].map((reason) {
                            return RadioListTile<String>(
                              title: Text(reason),
                              value: reason,
                              groupValue: selectedReason,
                              onChanged: (val) {
                                setSheetState(() => selectedReason = val);
                              },
                            );
                          }).toList(),
                          if (selectedReason == "سبب آخر")
                            Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: TextField(
                                controller: otherReasonController,
                                decoration: const InputDecoration(hintText: "اكتب السبب هنا...", border: OutlineInputBorder()),
                              ),
                            ),
                        ]),
                      ),
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB03A2E)),
                          onPressed: selectedReason == null ? null : () async {
                            String finalReason = selectedReason == "سبب آخر" ? otherReasonController.text : selectedReason!;
                            Navigator.pop(context);
                            await _lawyerService.rejectLawyer(lawyer.uid, finalReason);
                          },
                          child: const Text("تأكيد الرفض", style: TextStyle(color: Colors.white)),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<DocumentSnapshot>(
      stream: FirebaseFirestore.instance.collection('lawyers').doc(widget.lawyerId).snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const SizedBox();
        final lawyer = LawyerModel.fromMap(snapshot.data!.data() as Map<String, dynamic>, snapshot.data!.id);

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: InkWell(
            onTap: () => setState(() => _isExpanded = !_isExpanded),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: const Color(0xFF1A3A5C),
                        child: Text(lawyer.name[0], style: const TextStyle(color: Colors.white)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(lawyer.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Text(lawyer.governorate, style: const TextStyle(color: Color(0xFF6B7C8D))),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.orange.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                        child: const Text("⏳ قيد المراجعة", style: TextStyle(color: Colors.orange, fontSize: 12)),
                      ),
                    ],
                  ),
                  AnimatedSize(
                    duration: const Duration(milliseconds: 300),
                    child: _isExpanded ? _buildExpandedContent(lawyer) : const SizedBox(),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildExpandedContent(LawyerModel lawyer) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(height: 32),
        const Text("معلومات المحامي", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A3A5C))),
        const SizedBox(height: 8),
        Text("الهاتف: ${lawyer.phone}"),
        Text("البريد: ${lawyer.email}"),
        Text("الخبرة: ${lawyer.experienceRange}"),
        Text("السعر: ${lawyer.consultationPrice} جنيه"),
        const SizedBox(height: 8),
        Text("نبذة: ${lawyer.about}", style: const TextStyle(color: Color(0xFF6B7C8D))),
        const Divider(height: 32),
        const Text("الوثائق المرفوعة", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A3A5C))),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              if (lawyer.documents.barAssociationIdUrl != null) _buildDocCard("كارنيه النقابة", lawyer.documents.barAssociationIdUrl!),
              if (lawyer.documents.nationalIdUrl != null) _buildDocCard("الرقم القومي", lawyer.documents.nationalIdUrl!),
              if (lawyer.documents.lawDegreeUrl != null) _buildDocCard("الشهادة", lawyer.documents.lawDegreeUrl!),
            ],
          ),
        ),
        const Divider(height: 32),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(border: Border.all(color: const Color(0xFFC9A84C)), borderRadius: BorderRadius.circular(8)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("تم التحقق من النقابة؟"),
              Switch(
                value: lawyer.documents.barIdVerified,
                onChanged: (val) => _lawyerService.markBarIdVerified(lawyer.uid, val),
                activeColor: const Color(0xFFC9A84C),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _noteController,
          decoration: const InputDecoration(hintText: "ملاحظات الإدارة...", border: OutlineInputBorder()),
          maxLines: 2,
        ),
        TextButton(onPressed: () => _lawyerService.saveAdminNote(widget.requestId, _noteController.text), child: const Text("حفظ الملاحظة")),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2D6A4F)),
                onPressed: () => _showApproveDialog(lawyer),
                child: const Text("✅ اعتماد", style: TextStyle(color: Colors.white)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB03A2E)),
                onPressed: () => _showRejectSheet(lawyer),
                child: const Text("❌ رفض", style: TextStyle(color: Colors.white)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDocCard(String title, String url) {
    return Container(
      margin: const EdgeInsets.only(left: 8),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(border: Border.all(color: const Color(0xFFE8E0D0)), borderRadius: BorderRadius.circular(8)),
      child: Column(
        children: [
          Text(title, style: const TextStyle(fontSize: 12)),
          TextButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => DocumentViewerScreen(url: url, title: title))),
            child: const Text("عرض"),
          ),
        ],
      ),
    );
  }
}
