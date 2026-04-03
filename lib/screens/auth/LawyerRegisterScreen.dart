import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import '../../models/lawyer_model.dart';
import '../../services/lawyer_service.dart';

class LawyerRegisterScreen extends StatefulWidget {
  final Map<String, dynamic>? initialData;
  final int initialStep;

  const LawyerRegisterScreen({Key? key, this.initialData, this.initialStep = 0}) : super(key: key);

  @override
  State<LawyerRegisterScreen> createState() => _LawyerRegisterScreenState();
}

class _LawyerRegisterScreenState extends State<LawyerRegisterScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isLoading = false;
  final _formKey = GlobalKey<FormState>();

  // Step 1 Controllers
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _aboutController = TextEditingController();

  String? _selectedGovernorate;
  String? _selectedExperience;
  List<String> _selectedSpecializations = [];

  // Step 2 Documents
  File? _barIdFile;
  File? _nationalIdFile;
  File? _degreeFile;
  File? _experienceFile;

  final List<String> _governorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة',
    'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا',
    'القليوبية', 'السويس', 'أسيوط', 'كفر الشيخ', 'دمياط',
    'الشرقية', 'بني سويف', 'أسوان', 'قنا', 'سوهاج',
    'الأقصر', 'مطروح', 'البحر الأحمر', 'شمال سيناء',
    'جنوب سيناء', 'الوادي الجديد', 'بورسعيد'
  ];

  final List<String> _specializationsList = [
    '⚖️ قانون جنائي', '👨👩👧 قانون الأسرة', '💼 قانون عمالي',
    '🏠 قانون عقاري', '🤝 قانون تجاري', '📋 قانون مدني',
    '🏦 قانون اقتصادي', '🌍 قانون دولي'
  ];

  final List<String> _experienceList = [
    'أقل من سنة', '1-3 سنوات', '3-5 سنوات', '5-10 سنوات', 'أكثر من 10 سنوات'
  ];

  @override
  void initState() {
    super.initState();
    _currentStep = widget.initialStep;
    if (widget.initialStep == 1) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _pageController.jumpToPage(1);
      });
    }
    if (widget.initialData != null) {
      _nameController.text = widget.initialData!['name'] ?? '';
      _phoneController.text = widget.initialData!['phone'] ?? '';
      _emailController.text = widget.initialData!['email'] ?? '';
      _priceController.text = (widget.initialData!['consultationPrice'] ?? '').toString();
      _aboutController.text = widget.initialData!['about'] ?? '';
      _selectedGovernorate = widget.initialData!['governorate'];
      _selectedExperience = widget.initialData!['experienceRange'];
      _selectedSpecializations = List<String>.from(widget.initialData!['specializations'] ?? []);
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _priceController.dispose();
    _aboutController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_formKey.currentState!.validate()) {
      if (_selectedSpecializations.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('الرجاء اختيار تخصص واحد على الأقل')),
        );
        return;
      }
      if (_selectedGovernorate == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('الرجاء اختيار المحافظة')),
        );
        return;
      }
      if (_selectedExperience == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('الرجاء اختيار سنوات الخبرة')),
        );
        return;
      }

      int price = int.tryParse(_priceController.text) ?? 0;
      if (price < 500) {
        setState(() {
          _priceController.text = '500';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم تعديل السعر للحد الأدنى (500 جنيه)')),
        );
        return;
      }

      FocusScope.of(context).unfocus();
      _pageController.animateToPage(1, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
      setState(() {
        _currentStep = 1;
      });
    }
  }

  Future<void> _pickFile(int type) async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    );

    if (result != null) {
      File file = File(result.files.single.path!);
      int sizeInBytes = file.lengthSync();
      double sizeInMb = sizeInBytes / (1024 * 1024);
      if (sizeInMb > 5) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('حجم الملف يجب أن لا يتجاوز 5 ميجا')),
        );
        return;
      }

      setState(() {
        if (type == 1) _barIdFile = file;
        else if (type == 2) _nationalIdFile = file;
        else if (type == 3) _degreeFile = file;
        else if (type == 4) _experienceFile = file;
      });
    }
  }

  Future<void> _submit() async {
    if (_barIdFile == null || _nationalIdFile == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw Exception('المستخدم غير مسجل الدخول');

      Map<String, File> docs = {
        'barAssociationId': _barIdFile!,
        'nationalId': _nationalIdFile!,
      };
      if (_degreeFile != null) docs['lawDegree'] = _degreeFile!;
      if (_experienceFile != null) docs['experienceCert'] = _experienceFile!;

      LawyerModel data = LawyerModel(
        uid: user.uid,
        name: _nameController.text,
        phone: _phoneController.text,
        email: _emailController.text,
        governorate: _selectedGovernorate!,
        specializations: _selectedSpecializations,
        experienceRange: _selectedExperience!,
        about: _aboutController.text,
        consultationPrice: int.parse(_priceController.text),
        documents: LawyerDocuments(), // Will be updated in service
        createdAt: DateTime.now(),
      );

      await LawyerService().submitVerificationRequest(
        data: data,
        documents: docs,
        onProgress: (progress) {
          // Can show progress if needed
        },
      );

      // Assuming routing handles the redirect based on role and status
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F5EF),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: const Text("تسجيل محامي", style: TextStyle(color: Color(0xFF1C2B3A), fontWeight: FontWeight.bold)),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Color(0xFF1C2B3A)),
            onPressed: () {
              if (_currentStep == 1) {
                _pageController.animateToPage(0, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
                setState(() => _currentStep = 0);
              } else {
                Navigator.pop(context);
              }
            },
          ),
        ),
        body: Column(
          children: [
            _buildStepIndicator(),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildStep1(),
                  _buildStep2(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 32),
      child: Row(
        children: [
          _buildStepCircle(0, "المعلومات الأساسية"),
          Expanded(
            child: Container(
              height: 2,
              color: _currentStep >= 1 ? const Color(0xFF2D6A4F) : const Color(0xFFE8E0D0),
            ),
          ),
          _buildStepCircle(1, "وثائق التحقق"),
        ],
      ),
    );
  }

  Widget _buildStepCircle(int step, String label) {
    bool isActive = _currentStep == step;
    bool isDone = _currentStep > step;

    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDone ? const Color(0xFF2D6A4F) : (isActive ? const Color(0xFFC9A84C) : Colors.white),
            border: Border.all(
              color: isDone ? const Color(0xFF2D6A4F) : (isActive ? const Color(0xFFC9A84C) : const Color(0xFFE8E0D0)),
              width: 2,
            ),
            boxShadow: isActive ? [
              BoxShadow(color: const Color(0xFFC9A84C).withOpacity(0.4), blurRadius: 8, spreadRadius: 2)
            ] : null,
          ),
          child: Center(
            child: isDone
                ? const Icon(Icons.check, color: Colors.white, size: 16)
                : Text(
                    "${step + 1}",
                    style: TextStyle(
                      color: isActive ? Colors.white : const Color(0xFF6B7C8D),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isActive || isDone ? const Color(0xFF1C2B3A) : const Color(0xFF6B7C8D),
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildStep1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FadeInLeft(delay: const Duration(milliseconds: 100), child: _buildTextField("الاسم الكامل *", _nameController, validator: (v) => v!.length < 3 ? 'الاسم قصير جداً' : null)),
            const SizedBox(height: 16),
            FadeInLeft(delay: const Duration(milliseconds: 200), child: _buildTextField("رقم الهاتف *", _phoneController, keyboardType: TextInputType.phone, validator: (v) => v!.length != 11 ? 'رقم هاتف غير صحيح' : null)),
            const SizedBox(height: 16),
            FadeInLeft(delay: const Duration(milliseconds: 300), child: _buildTextField("البريد الإلكتروني *", _emailController, keyboardType: TextInputType.emailAddress, validator: (v) => !v!.contains('@') ? 'بريد غير صحيح' : null)),
            const SizedBox(height: 16),
            FadeInLeft(delay: const Duration(milliseconds: 400), child: _buildDropdown("المحافظة *", _governorates, _selectedGovernorate, (v) => setState(() => _selectedGovernorate = v))),
            const SizedBox(height: 16),
            FadeInLeft(delay: const Duration(milliseconds: 500), child: _buildSpecializations()),
            const SizedBox(height: 16),
            FadeInLeft(delay: const Duration(milliseconds: 600), child: _buildDropdown("سنوات الخبرة *", _experienceList, _selectedExperience, (v) => setState(() => _selectedExperience = v))),
            const SizedBox(height: 16),
            FadeInLeft(delay: const Duration(milliseconds: 700), child: _buildPriceField()),
            const SizedBox(height: 16),
            FadeInLeft(delay: const Duration(milliseconds: 800), child: _buildAboutField()),
            const SizedBox(height: 32),
            FadeInLeft(
              delay: const Duration(milliseconds: 900),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A3A5C),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: _nextStep,
                  child: const Text("التالي →", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, {TextInputType? keyboardType, String? Function(String?)? validator}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF1C2B3A), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE8E0D0))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE8E0D0))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1A3A5C))),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown(String label, List<String> items, String? selectedValue, Function(String?) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF1C2B3A), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: selectedValue,
          items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          onChanged: onChanged,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE8E0D0))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE8E0D0))),
          ),
        ),
      ],
    );
  }

  Widget _buildSpecializations() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("التخصصات *", style: TextStyle(fontSize: 14, color: Color(0xFF1C2B3A), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _specializationsList.map((spec) {
            bool isSelected = _selectedSpecializations.contains(spec);
            return FilterChip(
              label: Text(spec, style: TextStyle(color: isSelected ? Colors.white : const Color(0xFF6B7C8D), fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
              selected: isSelected,
              onSelected: (bool selected) {
                setState(() {
                  if (selected) _selectedSpecializations.add(spec);
                  else _selectedSpecializations.remove(spec);
                });
              },
              backgroundColor: Colors.white,
              selectedColor: const Color(0xFF1A3A5C),
              checkmarkColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: isSelected ? const Color(0xFF1A3A5C) : const Color(0xFFE8E0D0)),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPriceField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("سعر الاستشارة *", style: TextStyle(fontSize: 14, color: Color(0xFF1C2B3A), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextFormField(
          controller: _priceController,
          keyboardType: TextInputType.number,
          validator: (v) => (int.tryParse(v ?? '') ?? 0) < 500 ? 'الحد الأدنى 500' : null,
          decoration: InputDecoration(
            prefixText: "جنيه  ",
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE8E0D0))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE8E0D0))),
          ),
        ),
        const SizedBox(height: 4),
        const Text("* الحد الأدنى للاستشارة 500 جنيه", style: TextStyle(fontSize: 11, color: Color(0xFFC9A84C))),
      ],
    );
  }

  Widget _buildAboutField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("نبذة عن نفسك *", style: TextStyle(fontSize: 14, color: Color(0xFF1C2B3A), fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextFormField(
          controller: _aboutController,
          maxLines: 5,
          minLines: 3,
          onChanged: (v) => setState(() {}),
          validator: (v) => v!.length < 50 ? 'يجب أن لا تقل عن 50 حرف' : null,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE8E0D0))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE8E0D0))),
          ),
        ),
        const SizedBox(height: 4),
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
            "${_aboutController.text.length}/50",
            style: TextStyle(
              fontSize: 12,
              color: _aboutController.text.length >= 50 ? const Color(0xFFC9A84C) : const Color(0xFF6B7C8D),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    bool canSubmit = _barIdFile != null && _nationalIdFile != null;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("ارفع وثائق التحقق", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1A3A5C))),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFFC9A84C)),
              borderRadius: BorderRadius.circular(12),
              color: const Color(0xFFC9A84C).withOpacity(0.05),
            ),
            child: const Row(
              children: [
                Icon(Icons.lock, color: Color(0xFFC9A84C), size: 20),
                SizedBox(width: 8),
                Expanded(child: Text("🔒 وثائقك مشفرة بـ AES-256 ولن تُستخدم إلا للتحقق من هويتك", style: TextStyle(fontSize: 12, color: Color(0xFF1C2B3A)))),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildUploadCard("📋 كارنيه نقابة المحامين *", "الصورة الأمامية للكارنيه واضحة", _barIdFile, () => _pickFile(1)),
          const SizedBox(height: 16),
          _buildUploadCard("🪪 بطاقة الرقم القومي *", "الوجهان الأمامي والخلفي في صورة واحدة", _nationalIdFile, () => _pickFile(2)),
          const SizedBox(height: 24),
          const Text("وثائق إضافية (اختياري)", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1C2B3A))),
          const SizedBox(height: 16),
          _buildUploadCard("🎓 شهادة الليسانس", "صورة واضحة للشهادة", _degreeFile, () => _pickFile(3)),
          const SizedBox(height: 16),
          _buildUploadCard("📜 شهادات خبرة", "أي شهادات إضافية", _experienceFile, () => _pickFile(4)),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: canSubmit ? const Color(0xFF2D6A4F) : Colors.grey,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: canSubmit && !_isLoading ? _submit : null,
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text("إرسال طلب التحقق 🚀", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUploadCard(String title, String subtitle, File? file, VoidCallback onTap) {
    bool isUploaded = file != null;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isUploaded ? const Color(0xFF2D6A4F).withOpacity(0.08) : const Color(0xFFC9A84C).withOpacity(0.05),
          border: Border.all(
            color: isUploaded ? const Color(0xFF2D6A4F) : const Color(0xFFC9A84C),
            width: 2,
            style: isUploaded ? BorderStyle.solid : BorderStyle.solid, // Should be dashed for empty, but solid is fine for now
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(isUploaded ? Icons.check_circle : Icons.upload_file, color: isUploaded ? const Color(0xFF2D6A4F) : const Color(0xFFC9A84C), size: 32),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isUploaded ? const Color(0xFF2D6A4F) : const Color(0xFF1C2B3A))),
                  const SizedBox(height: 4),
                  Text(isUploaded ? file.path.split('/').last : subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF6B7C8D)), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            if (isUploaded)
              IconButton(
                icon: const Icon(Icons.delete, color: Color(0xFFB03A2E)),
                onPressed: onTap,
              ),
          ],
        ),
      ),
    );
  }
}
