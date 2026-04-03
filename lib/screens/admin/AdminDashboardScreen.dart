import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../services/lawyer_service.dart';
import '../../widgets/admin/LawyerVerificationCard.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({Key? key}) : super(key: key);

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final LawyerService _lawyerService = LawyerService();

  @override
  void initState() {
    super.initState();
    _checkAdminAccess();
  }

  Future<void> _checkAdminAccess() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }
    final doc = await FirebaseFirestore.instance.collection('users').doc(user.uid).get();
    if (doc.data()?['role'] != 'admin') {
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: DefaultTabController(
        length: 3,
        child: Scaffold(
          backgroundColor: const Color(0xFFF8F5EF),
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            title: const Text("لوحة تحكم محامينا", style: TextStyle(color: Color(0xFF1C2B3A), fontWeight: FontWeight.bold)),
            leading: const Padding(
              padding: EdgeInsets.all(8.0),
              child: CircleAvatar(backgroundColor: Color(0xFF1A3A5C), child: Icon(Icons.admin_panel_settings, color: Colors.white)),
            ),
            actions: [
              IconButton(icon: const Icon(Icons.notifications, color: Color(0xFF1C2B3A)), onPressed: () {}),
              IconButton(icon: const Icon(Icons.settings, color: Color(0xFF1C2B3A)), onPressed: () {}),
            ],
            bottom: const TabBar(
              labelColor: Color(0xFF1A3A5C),
              unselectedLabelColor: Color(0xFF6B7C8D),
              indicatorColor: Color(0xFFC9A84C),
              tabs: [
                Tab(text: "⏳ معلقة"),
                Tab(text: "✅ معتمدون"),
                Tab(text: "❌ مرفوضون/موقوفون"),
              ],
            ),
          ),
          body: Column(
            children: [
              _buildTopStats(),
              Expanded(
                child: TabBarView(
                  children: [
                    _buildPendingTab(),
                    _buildVerifiedTab(),
                    _buildRejectedTab(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopStats() {
    return StreamBuilder<Map<String, int>>(
      stream: _lawyerService.watchAdminStats(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const SizedBox(height: 100, child: Center(child: CircularProgressIndicator()));
        final stats = snapshot.data!;
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 2,
            children: [
              _buildStatCard("طلبات معلقة", stats['pending'] ?? 0, Colors.orange),
              _buildStatCard("محامون معتمدون", stats['verified'] ?? 0, const Color(0xFF2D6A4F)),
              _buildStatCard("استشارات اليوم", 0, const Color(0xFF1A3A5C)), // Placeholder
              _buildStatCard("متوسط التقييم", 0, const Color(0xFFC9A84C), isDouble: true), // Placeholder
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String title, num value, Color color, {bool isDouble = false}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: const TextStyle(fontSize: 12, color: Color(0xFF6B7C8D))),
          const SizedBox(height: 4),
          Text(
            isDouble ? value.toStringAsFixed(1) : value.toString(),
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingTab() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('verification_requests').where('status', isEqualTo: 'pending').orderBy('submittedAt', descending: true).snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return const Center(child: Text("لا توجد طلبات معلقة 🎉", style: TextStyle(fontSize: 18, color: Color(0xFF6B7C8D))));
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: snapshot.data!.docs.length,
          itemBuilder: (context, index) {
            final request = snapshot.data!.docs[index];
            return LawyerVerificationCard(requestId: request.id, lawyerId: request['lawyerId']);
          },
        );
      },
    );
  }

  Widget _buildVerifiedTab() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('lawyers').where('verificationStatus', isEqualTo: 'verified').snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) return const Center(child: Text("لا يوجد محامون معتمدون"));
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: snapshot.data!.docs.length,
          itemBuilder: (context, index) {
            final lawyer = snapshot.data!.docs[index];
            return Card(
              child: ListTile(
                title: Text(lawyer['name']),
                subtitle: Text(lawyer['specializations'].join(', ')),
                trailing: TextButton(
                  onPressed: () {
                    // Show suspend dialog
                  },
                  child: const Text("تعليق مؤقت 🚫", style: TextStyle(color: Color(0xFFB03A2E))),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildRejectedTab() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance.collection('lawyers').where('verificationStatus', whereIn: ['rejected', 'suspended']).snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) return const Center(child: Text("لا يوجد محامون مرفوضون أو موقوفون"));
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: snapshot.data!.docs.length,
          itemBuilder: (context, index) {
            final lawyer = snapshot.data!.docs[index];
            return Card(
              child: ListTile(
                title: Text(lawyer['name']),
                subtitle: Text(lawyer['verificationStatus'] == 'rejected' ? lawyer['rejectionReason'] ?? '' : lawyer['suspensionReason'] ?? ''),
                trailing: TextButton(
                  onPressed: () {
                    // Re-review
                  },
                  child: const Text("إعادة المراجعة"),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
