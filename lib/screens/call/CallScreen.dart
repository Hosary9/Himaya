import 'package:flutter/material.dart';
import 'dart:async';
import '../../models/booking_model.dart';
import '../booking/RatingScreen.dart';

class CallScreen extends StatefulWidget {
  final String lawyerName;
  final ConsultationType consultationType;
  final String channelId;

  const CallScreen({
    Key? key,
    required this.lawyerName,
    required this.consultationType,
    required this.channelId,
  }) : super(key: key);

  @override
  State<CallScreen> createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  bool _isMuted = false;
  bool _isSpeakerOn = false;
  bool _isVideoOn = true;
  int _secondsElapsed = 0;
  Timer? _timer;
  bool _isConnected = false;

  final Color _primary = const Color(0xFF1A3A5C);
  final Color _emergency = const Color(0xFFB03A2E);

  @override
  void initState() {
    super.initState();
    _initAgora();
  }

  Future<void> _initAgora() async {
    // Simulate connection delay
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isConnected = true;
      });
      _startTimer();
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _secondsElapsed++;
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  void _endCall() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => RatingScreen(lawyerName: widget.lawyerName),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.black,
        body: widget.consultationType == ConsultationType.video
            ? _buildVideoCallUI()
            : _buildAudioCallUI(),
      ),
    );
  }

  Widget _buildAudioCallUI() {
    return SafeArea(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          CircleAvatar(
            radius: 60,
            backgroundColor: _primary,
            child: Text(
              widget.lawyerName.substring(0, 1),
              style: const TextStyle(fontSize: 48, color: Colors.white),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            widget.lawyerName,
            style: const TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            _isConnected ? _formatDuration(_secondsElapsed) : "جاري الاتصال...",
            style: const TextStyle(fontSize: 16, color: Colors.white70),
          ),
          const Spacer(),
          _buildControlBar(),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildVideoCallUI() {
    return Stack(
      children: [
        // Remote Video (Simulated)
        Container(
          color: Colors.grey.shade900,
          child: Center(
            child: _isConnected 
                ? const Icon(Icons.person, size: 120, color: Colors.white24)
                : const Text("جاري الاتصال...", style: TextStyle(color: Colors.white)),
          ),
        ),
        
        // Local Video (PiP)
        if (_isConnected && _isVideoOn)
          Positioned(
            bottom: 120,
            right: 20,
            child: Container(
              width: 100,
              height: 150,
              decoration: BoxDecoration(
                color: Colors.grey.shade800,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white24),
              ),
              child: const Center(child: Icon(Icons.person, color: Colors.white54)),
            ),
          ),
          
        // Top Bar
        Positioned(
          top: 50,
          left: 20,
          right: 20,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _isConnected ? _formatDuration(_secondsElapsed) : "جاري الاتصال...",
                  style: const TextStyle(color: Colors.white),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.switch_camera, color: Colors.white),
                onPressed: () {},
              )
            ],
          ),
        ),
        
        // Controls
        Positioned(
          bottom: 40,
          left: 0,
          right: 0,
          child: _buildControlBar(),
        ),
      ],
    );
  }

  Widget _buildControlBar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildControlButton(
          icon: _isMuted ? Icons.mic_off : Icons.mic,
          isActive: _isMuted,
          onPressed: () => setState(() => _isMuted = !_isMuted),
        ),
        if (widget.consultationType == ConsultationType.video)
          _buildControlButton(
            icon: _isVideoOn ? Icons.videocam : Icons.videocam_off,
            isActive: !_isVideoOn,
            onPressed: () => setState(() => _isVideoOn = !_isVideoOn),
          )
        else
          _buildControlButton(
            icon: _isSpeakerOn ? Icons.volume_up : Icons.volume_down,
            isActive: _isSpeakerOn,
            onPressed: () => setState(() => _isSpeakerOn = !_isSpeakerOn),
          ),
        _buildControlButton(
          icon: Icons.call_end,
          color: _emergency,
          iconColor: Colors.white,
          onPressed: _endCall,
        ),
      ],
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required VoidCallback onPressed,
    bool isActive = false,
    Color? color,
    Color? iconColor,
  }) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color ?? (isActive ? Colors.white : Colors.white24),
        ),
        child: Icon(
          icon,
          color: iconColor ?? (isActive ? Colors.black : Colors.white),
          size: 32,
        ),
      ),
    );
  }
}
