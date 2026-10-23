// Danh mục dùng chung cho máy chủ và giao diện

export const REPORT_TYPES = {
  violence: { label: 'Đánh nhau, tụ tập gây rối', severity: 'high' },
  bullying: { label: 'Bắt nạt, cô lập bạn bè', severity: 'high' },
  cyber: { label: 'Bắt nạt, bôi nhọ trên mạng', severity: 'medium' },
  smoking: { label: 'Hút thuốc lá, thuốc lá điện tử', severity: 'medium' },
  drugs: { label: 'Nghi vấn chất cấm, đồ ăn lạ', severity: 'critical' },
  weapon: { label: 'Mang hung khí, vật nguy hiểm', severity: 'critical' },
  traffic: { label: 'Vi phạm an toàn giao thông', severity: 'medium' },
  other: { label: 'Hành vi vi phạm khác', severity: 'low' },
};

export const REPORT_STATUS = {
  pending: { label: 'Chờ tiếp nhận', tone: 'neutral' },
  verifying: { label: 'Đang xác minh', tone: 'warning' },
  reminded: { label: 'Đã nhắc nhở', tone: 'info' },
  disciplined: { label: 'Đã kỷ luật', tone: 'danger' },
  recorded: { label: 'Đã lập biên bản', tone: 'danger' },
  resolved: { label: 'Đã xử lý', tone: 'success' },
  archived: { label: 'Lưu hồ sơ', tone: 'neutral' },
};

export const SEVERITY = {
  low: { label: 'Thấp', tone: 'neutral' },
  medium: { label: 'Trung bình', tone: 'warning' },
  high: { label: 'Cao', tone: 'danger' },
  critical: { label: 'Nghiêm trọng', tone: 'critical' },
};

export const RECORD_TYPES = {
  late: 'Đi học muộn',
  skip: 'Trốn học, bỏ tiết',
  uniform: 'Sai đồng phục, tác phong',
  fight: 'Đánh nhau, gây gổ',
  smoking: 'Sử dụng thuốc lá điện tử',
  traffic: 'Vi phạm giao thông',
  phone: 'Dùng điện thoại sai quy định',
  cheating: 'Gian lận trong kiểm tra',
  property: 'Làm hư hỏng tài sản',
  other: 'Vi phạm khác',
};

export const PENALTIES = ['Nhắc nhở', 'Phê bình trước lớp', 'Viết bản tự kiểm điểm', 'Mời phụ huynh làm việc', 'Trừ điểm rèn luyện', 'Chuyển Hội đồng kỷ luật'];

export const MOODS = {
  joyful: { label: 'Vui vẻ', tone: '#f4a62a', advice: 'Tuyệt vời! Hãy lan tỏa năng lượng tích cực: gửi một lời cảm ơn tới bạn bè hoặc thầy cô hôm nay nhé.' },
  calm: { label: 'Bình thường', tone: '#3aa981', advice: 'Một ngày ổn định là nền tảng tốt. Dành 10 phút đi bộ hoặc nghe nhạc để giữ tinh thần thoải mái.' },
  stressed: { label: 'Căng thẳng', tone: '#e8743d', advice: 'Thử bài thở 4-7-8 ngay bên dưới, rồi chia nhỏ việc cần làm thành từng bước 25 phút.' },
  sad: { label: 'Buồn bã', tone: '#5b7fe0', advice: 'Cảm xúc buồn là bình thường. Hãy kể với một người bạn tin tưởng, hoặc nhắn ẩn danh cho chuyên viên tâm lý.' },
  anxious: { label: 'Lo lắng', tone: '#8f6ae0', advice: 'Viết ra điều khiến bạn lo và một việc nhỏ bạn có thể làm ngay. Kỹ thuật 5-4-3-2-1 giúp bạn quay về hiện tại.' },
  exhausted: { label: 'Kiệt sức', tone: '#d0566c', advice: 'Cơ thể đang cần nghỉ ngơi. Ưu tiên ngủ đủ 8 tiếng, uống đủ nước và tạm gác các việc chưa gấp.' },
};

export const QUIZ_TOPICS = {
  violence: { label: 'Phòng chống bạo lực học đường', short: 'Bạo lực học đường' },
  cyber: { label: 'An ninh mạng & lừa đảo', short: 'An ninh mạng' },
  law: { label: 'Pháp luật học đường', short: 'Pháp luật' },
  skills: { label: 'Kỹ năng ứng phó', short: 'Kỹ năng' },
  traffic: { label: 'An toàn giao thông', short: 'Giao thông' },
};

export const NEWS_CATEGORIES = {
  violence: 'Bạo lực học đường', scam: 'Cảnh giác lừa đảo', drugs: 'Phòng chống ma túy', explosive: 'Cảnh báo vật liệu nổ',
  law: 'Giáo dục pháp luật', traffic: 'An toàn giao thông', wellbeing: 'Sức khỏe tinh thần', school: 'Tin nhà trường',
};

export const MODULES = {
  report: 'Tố giác vi phạm', counseling: 'Tư vấn tâm lý', quiz: 'Đấu trường trắc nghiệm',
  survey: 'Khảo sát', schoolChat: 'Chat chung toàn trường', teacherChat: 'Chat với giáo viên', scam: 'Tra cứu lừa đảo AI', aiChat: 'Trợ lý AI',
};
