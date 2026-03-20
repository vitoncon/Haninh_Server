import axios from 'axios';
import db from '../db/config.db';

let cachedCoursesInfo: string | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 giờ

async function getCoursesInfoFromDB(): Promise<string> {
  const now = Date.now();
  if (cachedCoursesInfo && (now - lastCacheTime < CACHE_TTL)) {
    return cachedCoursesInfo;
  }

  let info = "Hiện tại trung tâm chưa có thông tin khóa học cụ thể.";
  try {
    const courses = await db('courses')
      .where('is_deleted', 0)
      .andWhere('status', 'Đang hoạt động')
      .select('course_name', 'language', 'level', 'tuition_fee', 'duration_weeks', 'total_hours', 'description');

    if (courses && courses.length > 0) {
      info = courses.map((c: any, index: number) => {
        return `${index + 1}. Khóa: ${c.course_name || ''}
- Ngôn ngữ: ${c.language || ''}
- Trình độ: ${c.level || ''}
- Thời lượng: ${c.duration_weeks || 0} tuần (${c.total_hours || 0} giờ)
- Học phí: ${c.tuition_fee ? Number(c.tuition_fee).toLocaleString('vi-VN') + ' VNĐ' : 'Liên hệ'}
- Mô tả: ${c.description || ''}`;
      }).join('\n\n');
    }
  } catch (error) {
    console.error('Error fetching courses for AI context:', error);
  }

  cachedCoursesInfo = info;
  lastCacheTime = now;
  return info;
}

export interface ChatMessage {
  role: string;
  content: string;
}

/**
 * Hàm hỗ trợ detect intent đơn giản (Rule-based)
 * @param question Câu hỏi người dùng
 * @param hasHistory Lịch sử chat đã có chưa
 */
function detectIntent(question: string, hasHistory: boolean): 'greeting' | 'out_of_scope' | 'consultation' {
  const lower = question.toLowerCase();
  
  // 1. Phân tích Greeting (chỉ khi mới bắt đầu chat)
  if (!hasHistory) {
    const greetingWords = ['chào', 'hello', 'hi', 'alo', 'chao', 'xin chào'];
    const words = lower.split(/[\s,.'?!]+/);
    const isGreetingOnly = words.length <= 4 && greetingWords.some(w => words.includes(w));
    if (isGreetingOnly) return 'greeting';
  }

  // 2. Phân tích Out-of-scope (Lạc đề)
  const outOfScopeKeywords = ['thời tiết', 'chính trị', 'tổng thống', 'nấu ăn', 'game', 'bóng đá', 'code', 'lập trình'];
  if (outOfScopeKeywords.some(w => lower.includes(w))) {
    return 'out_of_scope';
  }

  // Mặc định xem như là hỏi về trung tâm/khóa học (Consultation)
  return 'consultation';
}

/**
 * Đề xuất Logic tóm tắt hội thoại (Conversation Summary - Tối ưu Token)
 * (Lưu ý: Bạn có thể gọi hàm này bằng 1 Background Job nếu mảng lịch sử quá dài để rút gọn token)
 */
export async function summarizeConversation(history: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || history.length === 0) return "";

  const conversationText = history.map(m => `${m.role}: ${m.content}`).join('\n');
  const prompt = `Bạn là trợ lý hệ thống. Hãy tóm tắt NHƯ CẦU CỐT LÕI của người dùng trong đoạn hội thoại sau thành đúng 1-2 câu để làm bối cảnh nhớ cho AI tư vấn sau này:\n\n${conversationText}`;

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'deepseek/deepseek-chat',
      messages: [{ role: 'user', content: prompt }]
    }, { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
    return response.data?.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Summary error:", error);
    return "";
  }
}

async function askAI(question: string, history: ChatMessage[] = []): Promise<string> {
  if (!question || !question.trim()) {
    throw new Error('Question is required and must be a non-empty string.');
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  // Giới hạn context: Lấy tối đa 6 tin nhắn gần nhất
  const recentHistory = history.slice(-6).map(m => ({
    role: m.role === 'bot' || m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));

  const intent = detectIntent(question, recentHistory.length > 0);
  
  let systemPrompt = `Bạn là AI tư vấn (tên là Trợ lý Hà Ninh) của Trung tâm Ngoại ngữ Hà Ninh.\nQuy tắc: Luôn trả lời bằng tiếng Việt, thân thiện, ngắn gọn, lịch sự.\n\n`;

  // Xây dựng bối cảnh (Context) tùy theo ý định (Intent)
  if (intent === 'greeting') {
    // Không móc Data Base => Tiết kiệm token & DB I/O
    systemPrompt += `HÀNH ĐỘNG: Người dùng đang chào hỏi. Bạn hãy chào lại, giới thiệu ngắn gọn rằng trung tâm đào tạo Tiếng Anh, Tiếng Trung, Tiếng Hàn và bạn có thể tư vấn khóa học cho họ.`;
  } 
  else if (intent === 'out_of_scope') {
    // Không móc Data Base => Tiết kiệm token
    systemPrompt += `HÀNH ĐỘNG: Người dùng đang hỏi câu hỏi lạc đề (chính trị, giải trí, v.v.). Bạn hãy lịch sự từ chối trả lời và khéo léo thông báo bạn chỉ tư vấn về các khóa học ngoại ngữ tại Hà Ninh.`;
  } 
  else {
    // Consultation -> Lấy dữ liệu (Data Retrieval)
    const coursesInfo = await getCoursesInfoFromDB();
    systemPrompt += `Thông tin trung tâm:
- Trung tâm đào tạo: Tiếng Anh, Tiếng Trung, Tiếng Hàn.
- Đối tượng học viên: thiếu nhi, thiếu niên, người đi làm.

Danh sách các khóa học đang hoạt động (Data Từ Hệ Thống):
${coursesInfo}

Quy định tư vấn:
1. Trả lời đúng trọng tâm câu hỏi.
2. Nếu người dùng hỏi khóa học ngôn ngữ nào/ trình độ nào -> giới thiệu các khóa học phù hợp trong danh sách.
3. Nếu người dùng hỏi học phí -> báo giá chuẩn từ danh sách.
4. Nếu người dùng muốn đăng ký -> hướng dẫn họ dùng chức năng "Xem khóa học" trên web để lại thông tin.
5. KHÔNG BAO GIỜ tự bịa thông tin hay giá tiền ngoài danh sách.`;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
    { role: 'user', content: question.trim() },
  ];

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'deepseek/deepseek-chat',
      messages: messages,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const choices = response?.data?.choices;
  if (!choices || !Array.isArray(choices) || choices.length === 0) {
    throw new Error('AI response is empty or malformed.');
  }

  const answer = choices[0]?.message?.content;
  if (!answer || !String(answer).trim()) {
    throw new Error('AI returned an empty answer.');
  }

  return String(answer).trim();
}

export class AIService {
  static async publicChat(question: string, history: ChatMessage[] = []): Promise<string> {
    return askAI(question, history);
  }

  static async studentChat(question: string, userId?: string, history: ChatMessage[] = []): Promise<string> {
    const prompt = userId ? `Học viên ${userId}: ${question}` : question;
    return askAI(prompt, history);
  }
}