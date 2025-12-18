import intentsData from '@/data/json/intents.json';
import faqData from '@/data/json/faq.json';
import collegeData from '@/data/json/clg.json';
import extData from '@/data/json/ext.json';
import failedQueriesData from '@/data/json/failed_queries_training.json';
import learnedAnswersData from '@/data/json/learned_answers.json';
import internshipsData from '@/data/json/internships.json';
import programsData from '@/data/json/programs.json';

export interface Intent {
  intent: string;
  keywords: string[];
  answer: string;
  questions: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export interface LearnedAnswerItem {
  question: string;
  answer: string;
}

export interface Program {
  id: string;
  name: string;
  degree: string;
  specialization: string;
  duration: string;
  seats: string;
  fees: string;
  eligibility: string;
  admission: string;
  coreSubjects: string[];
  specializations: string[];
  placementRate: string;
  averagePackage: string;
  highestPackage: string;
  recruiterCompanies: string[];
  internshipOpportunities: string[];
  facilities: string[];
  description: string;
}

export interface Internship {
  id: string;
  name: string;
  duration: string;
  timeline: string;
  stipend: string;
  eligibility: string;
  domains: string[];
  partnerCompanies: string[];
  benefits: string[];
  applicationProcess: string;
  description: string;
}

export interface TrainingItem {
  text: string;
  answer: string;
  type: 'learned' | 'intent' | 'program' | 'internship' | 'faq' | 'college' | 'ext' | 'failed';
  keywords: string[];
  priority: number;
}

const intents: Intent[] = (intentsData as { intents: Intent[] }).intents;
const faqs: FaqItem[] = Object.entries(faqData).map(([question, details]) => ({
  question,
  ...(details as Omit<FaqItem, 'question'>),
}));
const learnedAnswers: LearnedAnswerItem[] = learnedAnswersData as LearnedAnswerItem[];
const programs: Program[] = (programsData as { programs: Program[] }).programs;
const internships: Internship[] = (internshipsData as { internships: Internship[] }).internships;

const extractSearchableText = (obj: unknown): { text: string; answer: string }[] => {
  let results: { text: string; answer: string }[] = [];
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        results = results.concat(extractSearchableText(item));
      });
    } else {
      const textParts: string[] = [];
      let answer = '';

      if ('q' in obj && 'a' in obj) {
        const objWithQA = obj as { q: string; a: string };
        return [{ text: objWithQA.q, answer: objWithQA.a }];
      }

      const searchableKeys = ['name', 'code', 'description', 'eligibility', 'duration_years', 'overview', 'mission', 'vision', 'facilities', 'activities'];
      const currentAnswerParts: string[] = [];
      const objRecord = obj as Record<string, unknown>;

      for (const key in objRecord) {
        if (typeof objRecord[key] === 'string' || typeof objRecord[key] === 'number') {
          if (searchableKeys.includes(key)) {
            textParts.push(String(objRecord[key]));
          }
          currentAnswerParts.push(`${key}: ${objRecord[key]}`);
        }
      }

      answer = currentAnswerParts.join(', ');

      if (textParts.length > 0) {
        results.push({
          text: textParts.join(' '),
          answer: answer,
        });
      }

      Object.values(obj).forEach(value => {
        results = results.concat(extractSearchableText(value));
      });
    }
  }
  return results;
};

const collegeSearchCorpus = extractSearchableText(collegeData);
const extSearchCorpus = extractSearchableText(extData);
const failedQueriesCorpus = Object.entries(failedQueriesData).map(([question, details]) => ({
  text: `${question} ${(details as { tags: string[] }).tags.join(' ')}`,
  answer: (details as { answer: string }).answer,
}));

const formatProgramAnswer = (program: Program): string => {
  return `${program.name}\n\nDuration: ${program.duration}\nSeats: ${program.seats}\nFees: ${program.fees}/year\n\nEligibility: ${program.eligibility}\n\nAverage Package: ${program.averagePackage}\nHighest Package: ${program.highestPackage}\nPlacement Rate: ${program.placementRate}\n\nCore Subjects: ${program.coreSubjects.join(', ')}\n\nRecruiter Companies: ${program.recruiterCompanies.join(', ')}\n\nInternship Opportunities: ${program.internshipOpportunities.join(', ')}\n\nFacilities: ${program.facilities.join(', ')}\n\nDescription: ${program.description}`;
};

const formatInternshipAnswer = (internship: Internship): string => {
  return `${internship.name}\n\nDuration: ${internship.duration}\nTimeline: ${internship.timeline}\nStipend: ${internship.stipend}\n\nEligibility: ${internship.eligibility}\n\nDomains: ${internship.domains.join(', ')}\n\nPartner Companies: ${internship.partnerCompanies.join(', ')}\n\nBenefits: ${internship.benefits.join(', ')}\n\nApplication Process: ${internship.applicationProcess}\n\nDescription: ${internship.description}`;
};

export const buildTrainingCorpus = (): TrainingItem[] => {
  const corpus: TrainingItem[] = [];

  learnedAnswers.forEach(item => {
    corpus.push({
      text: item.question.toLowerCase(),
      answer: item.answer,
      type: 'learned',
      keywords: item.question.toLowerCase().split(/\s+/),
      priority: 10,
    });
  });

  intents.forEach(intent => {
    corpus.push({
      text: `${intent.intent} ${intent.keywords.join(' ')} ${intent.questions.join(' ')}`.toLowerCase(),
      answer: intent.answer,
      type: 'intent',
      keywords: intent.keywords.map(k => k.toLowerCase()),
      priority: 8,
    });
  });

  programs.forEach(program => {
    const keywords = [
      program.name.toLowerCase(),
      program.degree.toLowerCase(),
      program.specialization.toLowerCase(),
      ...program.specializations.map(s => s.toLowerCase()),
      ...program.coreSubjects.map(s => s.toLowerCase()),
    ];
    corpus.push({
      text: `${program.name} ${program.degree} ${program.specialization} ${program.specializations.join(' ')} ${program.coreSubjects.join(' ')}`.toLowerCase(),
      answer: formatProgramAnswer(program),
      type: 'program',
      keywords: [...new Set(keywords)],
      priority: 9,
    });
  });

  internships.forEach(internship => {
    const keywords = [
      internship.name.toLowerCase(),
      ...internship.domains.map(d => d.toLowerCase()),
    ];
    corpus.push({
      text: `${internship.name} ${internship.domains.join(' ')}`.toLowerCase(),
      answer: formatInternshipAnswer(internship),
      type: 'internship',
      keywords: [...new Set(keywords)],
      priority: 9,
    });
  });

  faqs.forEach(faq => {
    corpus.push({
      text: `${faq.question} ${faq.tags.join(' ')}`.toLowerCase(),
      answer: faq.answer,
      type: 'faq',
      keywords: faq.tags.map(t => t.toLowerCase()),
      priority: 6,
    });
  });

  collegeSearchCorpus.forEach(item => {
    corpus.push({
      text: item.text.toLowerCase(),
      answer: item.answer,
      type: 'college',
      keywords: item.text.toLowerCase().split(/\s+/),
      priority: 5,
    });
  });

  extSearchCorpus.forEach(item => {
    corpus.push({
      text: item.text.toLowerCase(),
      answer: item.answer,
      type: 'ext',
      keywords: item.text.toLowerCase().split(/\s+/),
      priority: 5,
    });
  });

  failedQueriesCorpus.forEach(item => {
    corpus.push({
      text: item.text.toLowerCase(),
      answer: item.answer,
      type: 'failed',
      keywords: item.text.toLowerCase().split(/\s+/),
      priority: 7,
    });
  });

  return corpus;
};

export const calculateRelevanceScore = (query: string, item: TrainingItem): number => {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

  let score = 0;

  queryWords.forEach(word => {
    if (item.text.includes(word)) {
      score += 2;
    }
    if (item.keywords.includes(word)) {
      score += 3;
    }
    item.keywords.forEach(keyword => {
      if (keyword.includes(word) && word.length > 2) {
        score += 1.5;
      }
    });
  });

  score += item.priority * 0.5;

  const textWords = item.text.split(/\s+/).length;
  score = score / (1 + Math.log(textWords));

  return score;
};

export const findBestTrainingMatches = (query: string, corpus: TrainingItem[], limit: number = 5) => {
  const scored = corpus
    .map(item => ({
      item,
      score: calculateRelevanceScore(query, item),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
};

export const getTrainingData = () => ({
  intents,
  faqs,
  learnedAnswers,
  programs,
  internships,
  collegeData,
  extData,
  failedQueriesData,
});
