/**
 * AI Prompt Builder
 * Builds prompts for AI chat based on user message and context data
 */

export interface CourseData {
  id: number;
  course_name: string;
  course_code: string;
  description?: string;
  tuition_fee?: number;
  total_hours?: number;
  duration_hours?: number;
  status?: string;
  language?: string;
  level?: string;
  prerequisites?: string;
  learning_objectives?: string;
}

export interface ScheduleData {
  id: number;
  class_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  room_name?: string;
  note?: string;
  status?: string;
}

export interface AIContext {
  courses: CourseData[];
  schedules: ScheduleData[];
  userMessage: string;
  intent?: string;
}

export class AIPromptBuilder {
  /**
   * Build system prompt for public AI chat
   */
  static buildSystemPrompt(): string {
    return `You are a friendly and professional course consultant for a foreign language center.

Your role:
- Help guests learn about available courses
- Provide information about tuition fees
- Answer questions about class schedules
- Recommend suitable courses based on user needs

Important rules:
1. ONLY use the course data provided to you - do NOT make up courses or information
2. If you don't have information, politely say you don't have that information
3. Keep answers short, clear, and friendly
4. Always recommend courses when appropriate
5. Use Vietnamese language to communicate with users
6. Format course information clearly (name, price, duration, etc.)

Be helpful, professional, and encouraging.`;
  }

  /**
   * Format course data for prompt
   */
  static formatCoursesData(courses: CourseData[]): string {
    if (!courses || courses.length === 0) {
      return 'No courses available.';
    }

    let formatted = 'Available Courses:\n\n';
    courses.forEach((course, index) => {
      formatted += `${index + 1}. ${course.course_name} (${course.course_code})\n`;
      if (course.description) {
        formatted += `   Description: ${course.description}\n`;
      }
      if (course.tuition_fee) {
        formatted += `   Tuition Fee: ${course.tuition_fee.toLocaleString('vi-VN')} VND\n`;
      }
      if (course.total_hours || course.duration_hours) {
        const hours = course.total_hours || course.duration_hours || 0;
        formatted += `   Duration: ${hours} hours\n`;
      }
      if (course.level) {
        formatted += `   Level: ${course.level}\n`;
      }
      if (course.language) {
        formatted += `   Language: ${course.language}\n`;
      }
      if (course.status) {
        formatted += `   Status: ${course.status}\n`;
      }
      formatted += '\n';
    });

    return formatted;
  }

  /**
   * Format schedule data for prompt
   */
  static formatSchedulesData(schedules: ScheduleData[]): string {
    if (!schedules || schedules.length === 0) {
      return 'No schedule information available.';
    }

    const dayNames: { [key: number]: string } = {
      1: 'Thứ 2',
      2: 'Thứ 3',
      3: 'Thứ 4',
      4: 'Thứ 5',
      5: 'Thứ 6',
      6: 'Thứ 7',
      7: 'Chủ Nhật'
    };

    let formatted = 'Class Schedules:\n\n';
    schedules.forEach((schedule, index) => {
      const dayName = dayNames[schedule.day_of_week] || `Thứ ${schedule.day_of_week}`;
      formatted += `${index + 1}. ${dayName}: ${schedule.start_time} - ${schedule.end_time}\n`;
      if (schedule.room_name) {
        formatted += `   Room: ${schedule.room_name}\n`;
      }
      if (schedule.start_date && schedule.end_date) {
        formatted += `   Period: ${schedule.start_date} to ${schedule.end_date}\n`;
      }
      if (schedule.note) {
        formatted += `   Note: ${schedule.note}\n`;
      }
      formatted += '\n';
    });

    return formatted;
  }

  /**
   * Build complete prompt for AI
   */
  static buildPrompt(context: AIContext): string {
    const systemPrompt = this.buildSystemPrompt();
    const coursesData = this.formatCoursesData(context.courses);
    const schedulesData = this.formatSchedulesData(context.schedules);

    let prompt = `${systemPrompt}\n\n`;
    prompt += `=== COURSE DATA ===\n${coursesData}\n\n`;
    prompt += `=== SCHEDULE DATA ===\n${schedulesData}\n\n`;
    
    if (context.intent) {
      prompt += `User Intent: ${context.intent}\n\n`;
    }
    
    prompt += `User Question: ${context.userMessage}\n\n`;
    prompt += `Please provide a helpful response based on the course and schedule data above.`;

    return prompt;
  }
}
