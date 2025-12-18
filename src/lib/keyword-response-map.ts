import intentsData from '@/data/json/intents.json';
import faqData from '@/data/json/faq.json';
import internshipsData from '@/data/json/internships.json';
import programsData from '@/data/json/programs.json';

export interface KeywordMatch {
  keyword: string;
  answer: string;
  source: 'intent' | 'faq' | 'program' | 'internship';
  confidence: number;
  relatedKeywords: string[];
}

export interface KeywordIndex {
  [keyword: string]: KeywordMatch[];
}

const buildKeywordIndex = (): KeywordIndex => {
  const index: KeywordIndex = {};

  const intents = (intentsData as { intents: Array<{ intent: string; keywords: string[]; answer: string; questions: string[] }> }).intents;
  const faqs = Object.entries(faqData).map(([question, details]) => ({
    question,
    ...(details as Record<string, unknown>),
  }));
  const programs = (programsData as { programs: Array<Record<string, unknown>> }).programs;
  const internships = (internshipsData as { internships: Array<Record<string, unknown>> }).internships;

  intents.forEach(intent => {
    intent.keywords.forEach(keyword => {
      const cleanKeyword = keyword.toLowerCase().trim();
      if (!index[cleanKeyword]) {
        index[cleanKeyword] = [];
      }
      index[cleanKeyword].push({
        keyword: cleanKeyword,
        answer: intent.answer,
        source: 'intent',
        confidence: 0.95,
        relatedKeywords: intent.keywords.map(k => k.toLowerCase()),
      });
    });
  });

  faqs.forEach((faq: Record<string, unknown>) => {
    const tags = (faq.tags as string[]) || [];
    const answer = (faq.answer as string) || '';
    tags.forEach(tag => {
      const cleanTag = tag.toLowerCase().trim();
      if (!index[cleanTag]) {
        index[cleanTag] = [];
      }
      index[cleanTag].push({
        keyword: cleanTag,
        answer,
        source: 'faq',
        confidence: 0.90,
        relatedKeywords: tags.map(t => t.toLowerCase()),
      });
    });
  });

  programs.forEach((program: Record<string, unknown>) => {
    const name = ((program.name as string) || '').toLowerCase().trim();
    const degree = ((program.degree as string) || '').toLowerCase().trim();
    const specialization = ((program.specialization as string) || '').toLowerCase().trim();
    const specializations = ((program.specializations as string[]) || []).map(s => s.toLowerCase());
    const coreSubjects = ((program.coreSubjects as string[]) || []).map(s => s.toLowerCase());

    const programKeywords = [name, degree, specialization, ...specializations, ...coreSubjects].filter(k => k.length > 0);
    const answer = formatProgramAnswer(program);

    programKeywords.forEach(keyword => {
      if (!index[keyword]) {
        index[keyword] = [];
      }
      index[keyword].push({
        keyword,
        answer,
        source: 'program',
        confidence: 0.92,
        relatedKeywords: programKeywords,
      });
    });
  });

  internships.forEach((internship: Record<string, unknown>) => {
    const name = ((internship.name as string) || '').toLowerCase().trim();
    const domains = ((internship.domains as string[]) || []).map(d => d.toLowerCase());

    const internshipKeywords = [name, ...domains].filter(k => k.length > 0);
    const answer = formatInternshipAnswer(internship);

    internshipKeywords.forEach(keyword => {
      if (!index[keyword]) {
        index[keyword] = [];
      }
      index[keyword].push({
        keyword,
        answer,
        source: 'internship',
        confidence: 0.92,
        relatedKeywords: internshipKeywords,
      });
    });
  });

  return index;
};

const formatProgramAnswer = (program: Record<string, unknown>): string => {
  const name = program.name || '';
  const duration = program.duration || '';
  const seats = program.seats || '';
  const fees = program.fees || '';
  const eligibility = program.eligibility || '';
  const averagePackage = program.averagePackage || '';
  const highestPackage = program.highestPackage || '';
  const placementRate = program.placementRate || '';
  const coreSubjects = Array.isArray(program.coreSubjects) ? (program.coreSubjects as string[]).join(', ') : '';
  const recruiterCompanies = Array.isArray(program.recruiterCompanies) ? (program.recruiterCompanies as string[]).join(', ') : '';
  const internshipOpportunities = Array.isArray(program.internshipOpportunities) ? (program.internshipOpportunities as string[]).join(', ') : '';
  const facilities = Array.isArray(program.facilities) ? (program.facilities as string[]).join(', ') : '';
  const description = program.description || '';

  return `${name}\n\nDuration: ${duration}\nSeats: ${seats}\nFees: ${fees}/year\n\nEligibility: ${eligibility}\n\nAverage Package: ${averagePackage}\nHighest Package: ${highestPackage}\nPlacement Rate: ${placementRate}\n\nCore Subjects: ${coreSubjects}\n\nRecruiter Companies: ${recruiterCompanies}\n\nInternship Opportunities: ${internshipOpportunities}\n\nFacilities: ${facilities}\n\nDescription: ${description}`;
};

const formatInternshipAnswer = (internship: Record<string, unknown>): string => {
  const name = internship.name || '';
  const duration = internship.duration || '';
  const timeline = internship.timeline || '';
  const stipend = internship.stipend || '';
  const eligibility = internship.eligibility || '';
  const domains = Array.isArray(internship.domains) ? (internship.domains as string[]).join(', ') : '';
  const partnerCompanies = Array.isArray(internship.partnerCompanies) ? (internship.partnerCompanies as string[]).join(', ') : '';
  const benefits = Array.isArray(internship.benefits) ? (internship.benefits as string[]).join(', ') : '';
  const applicationProcess = internship.applicationProcess || '';
  const description = internship.description || '';

  return `${name}\n\nDuration: ${duration}\nTimeline: ${timeline}\nStipend: ${stipend}\n\nEligibility: ${eligibility}\n\nDomains: ${domains}\n\nPartner Companies: ${partnerCompanies}\n\nBenefits: ${benefits}\n\nApplication Process: ${applicationProcess}\n\nDescription: ${description}`;
};

let keywordIndex: KeywordIndex | null = null;

export const getKeywordIndex = (): KeywordIndex => {
  if (!keywordIndex) {
    keywordIndex = buildKeywordIndex();
  }
  return keywordIndex;
};

export const findByKeyword = (query: string): KeywordMatch | null => {
  const index = getKeywordIndex();
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

  const matches: Array<{ match: KeywordMatch; score: number }> = [];

  queryWords.forEach(word => {
    const directMatch = index[word];
    if (directMatch) {
      directMatch.forEach(match => {
        const existingMatch = matches.find(m => m.match.answer === match.answer);
        if (existingMatch) {
          existingMatch.score += match.confidence;
        } else {
          matches.push({ match, score: match.confidence });
        }
      });
    }

    Object.keys(index).forEach(indexedKeyword => {
      if (indexedKeyword.includes(word) && !index[word]) {
        index[indexedKeyword].forEach(match => {
          const existingMatch = matches.find(m => m.match.answer === match.answer);
          if (existingMatch) {
            existingMatch.score += match.confidence * 0.7;
          } else {
            matches.push({ match, score: match.confidence * 0.7 });
          }
        });
      }
    });
  });

  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => b.score - a.score);
  return matches[0].match;
};

export const findAllByKeywords = (query: string, limit: number = 5): KeywordMatch[] => {
  const index = getKeywordIndex();
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

  const matchMap = new Map<string, { match: KeywordMatch; score: number }>();

  queryWords.forEach(word => {
    const directMatch = index[word];
    if (directMatch) {
      directMatch.forEach(match => {
        const key = match.answer;
        const existing = matchMap.get(key);
        if (existing) {
          existing.score += match.confidence;
        } else {
          matchMap.set(key, { match, score: match.confidence });
        }
      });
    }

    Object.keys(index).forEach(indexedKeyword => {
      if ((indexedKeyword.includes(word) || word.includes(indexedKeyword)) && !index[word]) {
        index[indexedKeyword].forEach(match => {
          const key = match.answer;
          const existing = matchMap.get(key);
          const score = indexedKeyword === word ? match.confidence : match.confidence * 0.6;
          if (existing) {
            existing.score += score;
          } else {
            matchMap.set(key, { match, score });
          }
        });
      }
    });
  });

  const matches = Array.from(matchMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.match);

  return matches;
};

export const getKeywordStats = () => {
  const index = getKeywordIndex();
  const stats = {
    totalKeywords: Object.keys(index).length,
    bySource: {
      intent: 0,
      faq: 0,
      program: 0,
      internship: 0,
    },
    sampleKeywords: Object.keys(index).slice(0, 20),
  };

  Object.values(index).forEach(matches => {
    matches.forEach(match => {
      stats.bySource[match.source]++;
    });
  });

  return stats;
};
