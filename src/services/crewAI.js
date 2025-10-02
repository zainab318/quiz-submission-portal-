import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled by a backend
});

// CrewAI-inspired agent system for quiz generation
class QuizAgent {
  constructor(role, goal, backstory) {
    this.role = role;
    this.goal = goal;
    this.backstory = backstory;
  }

  async execute(task, context = {}) {
    const prompt = this.buildPrompt(task, context);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a ${this.role}. ${this.backstory} Your goal is: ${this.goal}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error(`Error in ${this.role}:`, error);
      throw error;
    }
  }

  buildPrompt(task, context) {
    return `${task}\n\nContext: ${JSON.stringify(context, null, 2)}`;
  }
}

// Specialized agents for quiz creation
class QuestionGeneratorAgent extends QuizAgent {
  constructor() {
    super(
      "Quiz Question Generator",
      "Generate high-quality, educational quiz questions",
      "You are an expert educator with deep knowledge across multiple subjects. You create engaging, accurate, and appropriately challenging questions that test understanding rather than just memorization."
    );
  }

  buildPrompt(task, context) {
    const { subject, difficulty, numberOfQuestions, questionType = 'multiple-choice' } = context;
    
    return `Generate ${numberOfQuestions} ${difficulty} level ${questionType} questions about ${subject}.

Requirements:
- Each question should test understanding, not just memorization
- Provide 4 answer choices (A, B, C, D) for multiple choice questions
- Mark the correct answer clearly
- Include a brief explanation for the correct answer
- Questions should be appropriate for ${difficulty} difficulty level
- Vary the topics within ${subject} to provide comprehensive coverage

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this is correct",
    "topic": "Specific topic within the subject",
    "difficulty": "${difficulty}"
  }
]

Subject: ${subject}
Difficulty: ${difficulty}
Number of questions: ${numberOfQuestions}`;
  }
}

class QuizReviewerAgent extends QuizAgent {
  constructor() {
    super(
      "Quiz Quality Reviewer",
      "Review and improve quiz questions for accuracy and educational value",
      "You are a meticulous educational content reviewer with expertise in pedagogy and subject matter accuracy. You ensure questions are clear, accurate, and educationally sound."
    );
  }

  buildPrompt(task, context) {
    const { questions, subject, difficulty } = context;
    
    return `Review these ${subject} quiz questions for ${difficulty} difficulty level and improve them if needed.

Check for:
1. Accuracy of content and correct answers
2. Clarity of question wording
3. Appropriate difficulty level
4. Educational value
5. Balanced coverage of topics
6. Clear and helpful explanations

Questions to review:
${JSON.stringify(questions, null, 2)}

Return the improved questions in the same JSON format, making any necessary corrections or improvements.`;
  }
}

class QuizCrew {
  constructor() {
    this.questionGenerator = new QuestionGeneratorAgent();
    this.reviewer = new QuizReviewerAgent();
  }

  async generateQuiz(subject, difficulty = 'medium', numberOfQuestions = 10) {
    try {
      console.log(`Generating ${numberOfQuestions} ${difficulty} questions for ${subject}...`);
      
      // Step 1: Generate initial questions
      const generatedContent = await this.questionGenerator.execute(
        "Generate quiz questions based on the provided specifications",
        { subject, difficulty, numberOfQuestions }
      );

      // Parse the generated content
      let questions;
      try {
        // Extract JSON from the response if it's wrapped in other text
        const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : generatedContent;
        questions = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing generated questions:', parseError);
        // Fallback to sample questions if parsing fails
        questions = this.getFallbackQuestions(subject, difficulty, numberOfQuestions);
      }

      // Step 2: Review and improve questions
      const reviewedContent = await this.reviewer.execute(
        "Review and improve these quiz questions",
        { questions, subject, difficulty }
      );

      let finalQuestions;
      try {
        const jsonMatch = reviewedContent.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : reviewedContent;
        finalQuestions = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing reviewed questions, using original:', parseError);
        finalQuestions = questions;
      }

      // Ensure we have the right number of questions
      if (finalQuestions.length !== numberOfQuestions) {
        finalQuestions = finalQuestions.slice(0, numberOfQuestions);
        if (finalQuestions.length < numberOfQuestions) {
          // Pad with fallback questions if needed
          const fallbackQuestions = this.getFallbackQuestions(subject, difficulty, numberOfQuestions - finalQuestions.length);
          finalQuestions = [...finalQuestions, ...fallbackQuestions];
        }
      }

      return {
        subject,
        difficulty,
        totalQuestions: finalQuestions.length,
        questions: finalQuestions,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error generating quiz:', error);
      // Return fallback quiz on error
      return {
        subject,
        difficulty,
        totalQuestions: numberOfQuestions,
        questions: this.getFallbackQuestions(subject, difficulty, numberOfQuestions),
        generatedAt: new Date().toISOString(),
        error: 'Generated using fallback questions due to API error'
      };
    }
  }

  getFallbackQuestions(subject, difficulty, count) {
    const fallbackQuestions = {
      mathematics: [
        {
          question: "What is the result of 15 + 27?",
          options: ["A) 42", "B) 41", "C) 43", "D) 40"],
          correctAnswer: "A",
          explanation: "15 + 27 = 42",
          topic: "Basic Arithmetic",
          difficulty: difficulty
        },
        {
          question: "What is the square root of 64?",
          options: ["A) 6", "B) 8", "C) 7", "D) 9"],
          correctAnswer: "B",
          explanation: "8 × 8 = 64, so √64 = 8",
          topic: "Square Roots",
          difficulty: difficulty
        }
      ],
      science: [
        {
          question: "What is the chemical symbol for water?",
          options: ["A) H2O", "B) CO2", "C) NaCl", "D) O2"],
          correctAnswer: "A",
          explanation: "Water consists of two hydrogen atoms and one oxygen atom (H2O)",
          topic: "Chemistry",
          difficulty: difficulty
        },
        {
          question: "What planet is closest to the Sun?",
          options: ["A) Venus", "B) Earth", "C) Mercury", "D) Mars"],
          correctAnswer: "C",
          explanation: "Mercury is the innermost planet in our solar system",
          topic: "Astronomy",
          difficulty: difficulty
        }
      ],
      history: [
        {
          question: "In which year did World War II end?",
          options: ["A) 1944", "B) 1945", "C) 1946", "D) 1943"],
          correctAnswer: "B",
          explanation: "World War II ended in 1945 with the surrender of Japan",
          topic: "World War II",
          difficulty: difficulty
        }
      ]
    };

    const subjectQuestions = fallbackQuestions[subject] || fallbackQuestions.mathematics;
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      questions.push(subjectQuestions[i % subjectQuestions.length]);
    }
    
    return questions;
  }
}

// Export singleton instance
export const quizCrew = new QuizCrew();
export default quizCrew;
