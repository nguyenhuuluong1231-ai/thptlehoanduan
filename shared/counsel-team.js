// Danh sách Tổ tâm lý học đường (thành viên, lịch trực, lĩnh vực hỗ trợ).
// Thành viên có tài khoản giáo viên (userId) thì học sinh nhắn tin trực tiếp được trong mục “Chat với giáo viên”.
export const TEAM_ROLES = ['Tổ trưởng', 'Thành viên', 'Chuyên viên tâm lý', 'Giáo viên kiêm nhiệm', 'Nhân viên y tế', 'Cộng tác viên'];

// Năm học hiện tại (dùng làm giá trị mặc định cho trường "schoolYear" của từng thành viên tổ tư vấn,
// và để lọc/nhóm theo năm học trong Cổng Giáo viên). Năm học mới tính từ tháng 8.
export const CURRENT_SCHOOL_YEAR = (() => {
  const now = new Date();
  const y = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${y}-${y + 1}`;
})();

export function defaultCounselTeam(users = []) {
  const find = (id) => (users.some(u => u.id === id) ? id : '');
  const t = new Date().toISOString();
  return [
    // ================= NĂM HỌC 2026-2027 (13 thành viên) =================
    {
      id: 'TL1', name: 'Nguyễn Văn Tèo', title: 'Phó hiệu trưởng', role: 'Tổ trưởng',
      userId: '', phone: '', email: 'teo.nv@lehoan.edu.vn',
      room: 'Phòng Phó Hiệu trưởng · Tầng 2 dãy A', days: [1, 2, 3, 4, 5, 6], hours: '07:00-11:00',
      topics: ['Chỉ đạo chung', 'Bảo vệ học sinh', 'Can thiệp khẩn cấp'],
      bio: 'Phụ trách chung công tác tư vấn tâm lý và an toàn học đường tại Trường THPT Lê Hoàn.',
      avatar: null, certificate: null, order: 1, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL2', name: 'Lê Trung Thành', title: 'Bí thư Đoàn trường', role: 'Thành viên',
      userId: '', phone: '', email: 'thanh.lt@lehoan.edu.vn',
      room: 'Văn phòng Đoàn · Tầng 2 dãy A', days: [1, 2, 3, 4, 5, 6], hours: '07:00-11:00',
      topics: ['Áp lực học tập', 'Định hướng nghề nghiệp', 'Kỹ năng sống'],
      bio: 'Luôn sẵn sàng lắng nghe và đồng hành cùng đoàn viên, học sinh. Mọi chia sẻ đều được giữ bí mật.',
      avatar: null, certificate: null, order: 2, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL3', name: 'Hồ Hữu Thế', title: 'Phó Bí thư Đoàn trường', role: 'Thành viên',
      userId: '', phone: '', email: 'the.hh@lehoan.edu.vn',
      room: 'Văn phòng Đoàn · Tầng 2 dãy A', days: [3, 6], hours: '07:30-10:30',
      topics: ['Bắt nạt học đường', 'An toàn mạng xã hội', 'Kỹ năng sống'],
      bio: 'Hỗ trợ các em xử lý bắt nạt, rắc rối trên mạng xã hội và rèn kỹ năng ứng phó.',
      avatar: null, certificate: null, order: 3, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL4', name: 'Trần Thị Thủy Tâm', title: 'Nhân viên y tế', role: 'Thành viên',
      userId: '', phone: '', email: 'tam.ttt@lehoan.edu.vn',
      room: 'Phòng Y tế · Tầng 1 dãy C', days: [1, 2, 3, 4, 5, 6], hours: '07:00-17:00',
      topics: ['Sức khỏe thể chất', 'Giấc ngủ', 'Chăm sóc sức khỏe'],
      bio: 'Chăm sóc sức khỏe ban đầu, hướng dẫn thư giãn và phối hợp tư vấn tâm lý học đường.',
      avatar: null, certificate: null, order: 4, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL5', name: 'Huỳnh Thị Thúy Lâm', title: 'Tổ trưởng VP', role: 'Thành viên',
      userId: '', phone: '', email: 'lam.htt@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [2, 4], hours: '14:00-16:30',
      topics: ['Quan hệ bạn bè', 'Gia đình', 'Giới tính & tuổi dậy thì'],
      bio: 'Đồng hành cùng các em trong những câu chuyện về bạn bè, gia đình và tuổi mới lớn.',
      avatar: null, certificate: null, order: 5, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL6', name: 'Hoàng Thị Mai Hằng', title: 'Giáo viên', role: 'Thành viên',
      userId: find('GV2024101'), phone: '0913 222 444', email: 'hang.htm@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [1, 3, 5], hours: '09:00-11:00',
      topics: ['Áp lực học tập', 'Gia đình', 'Định hướng nghề nghiệp'],
      bio: 'Luôn sẵn sàng lắng nghe và đồng hành cùng các em qua chat hoặc gặp trực tiếp tại phòng tham vấn.',
      avatar: null, certificate: 'uploads/certificate-mvfqjrik-dab4f8b0.jpg', order: 6, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL7', name: 'Phạm Thị Tiến Quỳnh', title: 'Giáo viên', role: 'Thành viên',
      userId: find('GV2024102'), phone: '0913 555 777', email: 'quynh.ptt@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [2, 4, 6], hours: '08:00-11:00',
      topics: ['Căng thẳng mùa thi', 'Phương pháp học tập', 'Tâm lý lứa tuổi'],
      bio: 'Lắng nghe, chia sẻ và hỗ trợ học sinh tháo gỡ khó khăn trong học tập và cuộc sống. Có thể nhắn tin trực tiếp.',
      avatar: null, certificate: 'uploads/certificate-mvfqjrin-9c2c572c.jpg', order: 7, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL8', name: 'Võ Thị Sen', title: 'GVCN 12C2', role: 'Thành viên',
      userId: '', phone: '', email: 'sen.vt@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [2, 5], hours: '08:00-10:30',
      topics: ['Kỹ năng sống', 'An toàn mạng xã hội', 'Quan hệ bạn bè'],
      bio: 'Hỗ trợ học sinh rèn kỹ năng ứng phó và giải quyết các vướng mắc trong học tập, sinh hoạt lớp.',
      avatar: null, certificate: null, order: 8, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL9', name: 'Nguyễn Thị Duyền', title: 'TTCM Ngữ Văn', role: 'Thành viên',
      userId: '', phone: '', email: 'duyen.nt@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [5], hours: '08:00-11:00',
      topics: ['Tâm lý tuổi mới lớn', 'Giao tiếp ứng xử', 'Gia đình'],
      bio: 'Lắng nghe, thấu hiểu và đồng hành cùng học sinh vượt qua áp lực tâm lý.',
      avatar: null, certificate: null, order: 9, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL10', name: 'Nguyễn Thị Thành', title: 'BĐDCMHS', role: 'Thành viên',
      userId: '', phone: '', email: '',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [4], hours: '08:00-11:00',
      topics: ['Kết nối gia đình', 'Đồng hành cùng con', 'Chia sẻ phụ huynh'],
      bio: 'Cầu nối giữa phụ huynh và nhà trường trong việc lắng nghe, thấu hiểu và hỗ trợ học sinh.',
      avatar: null, certificate: null, order: 10, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL11', name: 'Lê Minh Phương', title: 'Học sinh lớp 12C1', role: 'Thành viên',
      userId: '', phone: '', email: '',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [2, 4, 6], hours: '09:00-10:30',
      topics: ['Bạn giúp bạn', 'Chia sẻ đồng trang lứa', 'Hòa nhập tập thể'],
      bio: 'Thành viên học sinh trong Tổ tư vấn — cầu nối gần gũi để các bạn dễ dàng sẻ chia tâm tư.',
      avatar: null, certificate: null, order: 11, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL12', name: 'Hồ Thị Ngọc Thu', title: 'GVCN 10B4', role: 'Thành viên',
      userId: '', phone: '', email: 'thu.htn@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [3, 5], hours: '08:00-10:30',
      topics: ['Hòa nhập đầu cấp', 'Kỹ năng sống', 'Quan hệ bạn bè'],
      bio: 'Đồng hành cùng học sinh khối 10 hòa nhập môi trường THPT và rèn luyện kỹ năng sống.',
      avatar: null, certificate: null, order: 12, active: true, schoolYear: '2026-2027', updatedAt: t,
    },
    {
      id: 'TL13', name: 'Trần Thị Thu Hằng', title: 'GVCN 12C5', role: 'Thành viên',
      userId: '', phone: '', email: 'hang.ttt@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [2, 6], hours: '08:00-10:30',
      topics: ['Định hướng nghề nghiệp', 'Áp lực thi cử', 'Tâm lý cuối cấp'],
      bio: 'Hỗ trợ học sinh cuối cấp giải tỏa áp lực thi tốt nghiệp và định hướng chọn trường, chọn nghề.',
      avatar: null, certificate: null, order: 13, active: true, schoolYear: '2026-2027', updatedAt: t,
    },

    // ================= NĂM HỌC 2025-2026 (11 thành viên) =================
    {
      id: 'TLY1', name: 'Võ Thị Lệ', title: 'Phó hiệu trưởng', role: 'Tổ trưởng',
      userId: '', phone: '', email: 'le.vt@lehoan.edu.vn',
      room: 'Phòng Phó Hiệu trưởng · Tầng 2 dãy A', days: [1, 2, 3, 4, 5, 6], hours: '07:00-11:00',
      topics: ['Chỉ đạo chung', 'Bảo vệ học sinh', 'Định hướng học đường'],
      bio: 'Phụ trách chung hoạt động Tổ tư vấn tâm lý học đường năm học 2025–2026.',
      avatar: null, certificate: null, order: 1, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY2', name: 'Lê Trung Thành', title: 'Bí thư Đoàn trường', role: 'Thành viên',
      userId: '', phone: '', email: 'thanh.lt@lehoan.edu.vn',
      room: 'Văn phòng Đoàn · Tầng 2 dãy A', days: [1, 2, 3, 4, 5, 6], hours: '07:00-11:00',
      topics: ['Áp lực học tập', 'Định hướng nghề nghiệp', 'Kỹ năng sống'],
      bio: 'Luôn sẵn sàng lắng nghe và đồng hành cùng đoàn viên, học sinh. Mọi chia sẻ đều được giữ bí mật.',
      avatar: null, certificate: null, order: 2, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY3', name: 'Nguyễn Tuấn Vũ', title: 'Ban ĐDCMHS', role: 'Thành viên',
      userId: '', phone: '', email: '',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [4], hours: '08:00-11:00',
      topics: ['Kết nối gia đình', 'Đồng hành cùng con', 'Chia sẻ phụ huynh'],
      bio: 'Đại diện cha mẹ học sinh phối hợp cùng nhà trường hỗ trợ tâm lý và đời sống học đường.',
      avatar: null, certificate: null, order: 3, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY4', name: 'Trần Thị Thủy Tâm', title: 'Nhân viên y tế', role: 'Thành viên',
      userId: '', phone: '', email: 'tam.ttt@lehoan.edu.vn',
      room: 'Phòng Y tế · Tầng 1 dãy C', days: [1, 2, 3, 4, 5, 6], hours: '07:00-17:00',
      topics: ['Sức khỏe thể chất', 'Giấc ngủ', 'Chăm sóc sức khỏe'],
      bio: 'Chăm sóc sức khỏe ban đầu, hướng dẫn thư giãn và phối hợp tư vấn tâm lý học đường.',
      avatar: null, certificate: null, order: 4, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY5', name: 'Huỳnh Thị Thúy Lâm', title: 'Tổ trưởng', role: 'Thành viên',
      userId: '', phone: '', email: 'lam.htt@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [2, 4], hours: '14:00-16:30',
      topics: ['Quan hệ bạn bè', 'Gia đình', 'Giới tính & tuổi dậy thì'],
      bio: 'Đồng hành cùng các em trong những câu chuyện về bạn bè, gia đình và tuổi mới lớn.',
      avatar: null, certificate: null, order: 5, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY6', name: 'Hoàng Thị Mai Hằng', title: 'Giáo Viên', role: 'Thành viên',
      userId: find('GV2024101'), phone: '0913 222 444', email: 'hang.htm@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [1, 3, 5], hours: '09:00-11:00',
      topics: ['Áp lực học tập', 'Gia đình', 'Định hướng nghề nghiệp'],
      bio: 'Luôn sẵn sàng lắng nghe và đồng hành cùng các em qua chat hoặc gặp trực tiếp tại phòng tham vấn.',
      avatar: null, certificate: 'uploads/certificate-mvfqjrik-dab4f8b0.jpg', order: 6, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY7', name: 'Phạm Thị Tiến Quỳnh', title: 'GVCN 10A4', role: 'Thành viên',
      userId: find('GV2024102'), phone: '0913 555 777', email: 'quynh.ptt@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [2, 4, 6], hours: '08:00-11:00',
      topics: ['Căng thẳng mùa thi', 'Phương pháp học tập', 'Tâm lý lứa tuổi'],
      bio: 'Lắng nghe, chia sẻ và hỗ trợ học sinh tháo gỡ khó khăn trong học tập và cuộc sống. Có thể nhắn tin trực tiếp.',
      avatar: null, certificate: 'uploads/certificate-mvfqjrin-9c2c572c.jpg', order: 7, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY8', name: 'Võ Thị Sen', title: 'GVCN 10A2', role: 'Thành viên',
      userId: '', phone: '', email: 'sen.vt@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [2, 5], hours: '08:00-10:30',
      topics: ['Kỹ năng sống', 'An toàn mạng xã hội', 'Quan hệ bạn bè'],
      bio: 'Hỗ trợ học sinh rèn kỹ năng ứng phó và giải quyết các vướng mắc trong học tập, sinh hoạt lớp.',
      avatar: null, certificate: null, order: 8, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY9', name: 'Nguyễn Thị Duyền', title: 'TTCM Ngữ Văn', role: 'Thành viên',
      userId: '', phone: '', email: 'duyen.nt@lehoan.edu.vn',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [5], hours: '08:00-11:00',
      topics: ['Tâm lý tuổi mới lớn', 'Giao tiếp ứng xử', 'Gia đình'],
      bio: 'Lắng nghe, thấu hiểu và đồng hành cùng học sinh vượt qua áp lực tâm lý.',
      avatar: null, certificate: null, order: 9, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY10', name: 'Phạm Thành Đạt', title: 'Học sinh lớp 12B2', role: 'Thành viên',
      userId: '', phone: '', email: '',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [3, 6], hours: '09:00-10:30',
      topics: ['Bạn giúp bạn', 'An toàn mạng xã hội', 'Kỹ năng sống'],
      bio: 'Thành viên học sinh hỗ trợ kết nối, lắng nghe và sẻ chia cùng các bạn trong trường.',
      avatar: null, certificate: null, order: 10, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
    {
      id: 'TLY11', name: 'Lê Minh Phương', title: 'Học sinh lớp 11C1', role: 'Thành viên',
      userId: '', phone: '', email: '',
      room: 'Phòng Tham vấn · Tầng 1 dãy B', days: [2, 4, 6], hours: '09:00-10:30',
      topics: ['Bạn giúp bạn', 'Chia sẻ đồng trang lứa', 'Hòa nhập tập thể'],
      bio: 'Thành viên học sinh trong Tổ tư vấn — cầu nối gần gũi để các bạn dễ dàng sẻ chia tâm tư.',
      avatar: null, certificate: null, order: 11, active: true, schoolYear: '2025-2026', updatedAt: t,
    },
  ];
}

const normTeacherName = (s) => String(s || '').replace(/^(ThS\.|TS\.|Thầy|Cô|PGS\.)\s*/i, '').trim().toLowerCase();

/** Kiểm tra một tài khoản giáo viên / quản trị có thuộc Tổ tâm lý học đường hay không. */
export function isCounselTeamTeacher(data, user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;
  if (user.counselor) return true;
  const team = Array.isArray(data?.counselTeam) ? data.counselTeam : [];
  const uName = normTeacherName(user.name);
  const uEmail = String(user.email || '').trim().toLowerCase();
  return team.some(m => m.active !== false && (
    (m.userId && m.userId === user.id) ||
    (uName && normTeacherName(m.name) === uName) ||
    (uEmail && m.email && String(m.email).trim().toLowerCase() === uEmail)
  ));
}
