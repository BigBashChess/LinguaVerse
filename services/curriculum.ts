
import { Unit, Lesson } from "../types";

export interface CourseMeta {
  id: string;
  title: string;
  flag: string;
  locked: boolean;
  category: 'LANGUAGE' | 'SPECIALIZED';
}

export const AVAILABLE_COURSES: CourseMeta[] = [
  // Languages
  { id: 'japanese', title: 'Japanese', flag: 'https://flagcdn.com/w80/jp.png', locked: false, category: 'LANGUAGE' },
  { id: 'spanish', title: 'Spanish', flag: 'https://flagcdn.com/w80/es.png', locked: false, category: 'LANGUAGE' },
  { id: 'french', title: 'French', flag: 'https://flagcdn.com/w80/fr.png', locked: false, category: 'LANGUAGE' },
  { id: 'german', title: 'German', flag: 'https://flagcdn.com/w80/de.png', locked: false, category: 'LANGUAGE' },
  { id: 'chinese', title: 'Chinese', flag: 'https://flagcdn.com/w80/cn.png', locked: false, category: 'LANGUAGE' },
  { id: 'italian', title: 'Italian', flag: 'https://flagcdn.com/w80/it.png', locked: false, category: 'LANGUAGE' },
  { id: 'portuguese', title: 'Portuguese', flag: 'https://flagcdn.com/w80/br.png', locked: false, category: 'LANGUAGE' },
  { id: 'korean', title: 'Korean', flag: 'https://flagcdn.com/w80/kr.png', locked: false, category: 'LANGUAGE' },
  { id: 'russian', title: 'Russian', flag: 'https://flagcdn.com/w80/ru.png', locked: false, category: 'LANGUAGE' },
  { id: 'hebrew', title: 'Hebrew', flag: 'https://flagcdn.com/w80/il.png', locked: false, category: 'LANGUAGE' },
  { id: 'arabic', title: 'Arabic', flag: 'https://flagcdn.com/w80/sa.png', locked: false, category: 'LANGUAGE' },
  { id: 'hindi', title: 'Hindi', flag: 'https://flagcdn.com/w80/in.png', locked: false, category: 'LANGUAGE' },
  { id: 'greek', title: 'Greek', flag: 'https://flagcdn.com/w80/gr.png', locked: false, category: 'LANGUAGE' },
  { id: 'thai', title: 'Thai', flag: 'https://flagcdn.com/w80/th.png', locked: false, category: 'LANGUAGE' },
  { id: 'khmer', title: 'Khmer', flag: 'https://flagcdn.com/w80/kh.png', locked: false, category: 'LANGUAGE' },
  { id: 'farsi', title: 'Farsi', flag: 'https://flagcdn.com/w80/ir.png', locked: false, category: 'LANGUAGE' },
  { id: 'yiddish', title: 'Yiddish', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flag_of_Yiddish_language.svg/220px-Flag_of_Yiddish_language.svg.png', locked: false, category: 'LANGUAGE' },
  
  // New Languages
  { id: 'latin', title: 'Latin', flag: 'https://flagcdn.com/w80/va.png', locked: false, category: 'LANGUAGE' },
  { id: 'georgian', title: 'Georgian', flag: 'https://flagcdn.com/w80/ge.png', locked: false, category: 'LANGUAGE' },
  { id: 'kurdish', title: 'Kurdish', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Flag_of_Kurdistan.svg/220px-Flag_of_Kurdistan.svg.png', locked: false, category: 'LANGUAGE' },

  // Specialized
  { id: 'python', title: 'Python', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/220px-Python-logo-notext.svg.png', locked: false, category: 'SPECIALIZED' },
  { id: 'precalc', title: 'College Precalculus', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Parabola_in_Cartesian_coordinate_system.svg/220px-Parabola_in_Cartesian_coordinate_system.svg.png', locked: false, category: 'SPECIALIZED' },
  { id: 'calculus', title: 'College Calculus', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Integral_Stuntz.svg/220px-Integral_Stuntz.svg.png', locked: false, category: 'SPECIALIZED' },
  { id: 'advanced_english', title: 'Advanced English', flag: 'https://flagcdn.com/w80/gb.png', locked: false, category: 'SPECIALIZED' },
];

// --- LEVEL STRUCTURES ---

const DEFAULT_LEVELS = [
  { name: 'Rookie (A1)', count: 20, color: 'neon-cyan' },
  { name: 'Explorer (A2)', count: 20, color: 'neon-green' },
  { name: 'Adventurer (B1)', count: 30, color: 'neon-purple' },
  { name: 'Expert (B2)', count: 30, color: 'neon-pink' },
  { name: 'Master (C1)', count: 20, color: 'orange-500' }
];

const JAPANESE_LEVELS = [
  { name: 'Rookie (N5)', count: 20, color: 'neon-cyan' },
  { name: 'Explorer (N4)', count: 20, color: 'neon-green' },
  { name: 'Adventurer (N3)', count: 30, color: 'neon-purple' },
  { name: 'Expert (N2)', count: 30, color: 'neon-pink' },
  { name: 'Master (N1)', count: 20, color: 'orange-500' }
];

const SPECIALIZED_LEVELS = [
    { name: 'Foundations', count: 15, color: 'neon-cyan' },
    { name: 'Core Concepts', count: 15, color: 'neon-green' },
    { name: 'Intermediate', count: 20, color: 'neon-purple' },
    { name: 'Advanced', count: 20, color: 'neon-pink' },
    { name: 'Mastery', count: 15, color: 'orange-500' }
];

const CHINESE_LEVELS = [{ name: 'Rookie (HSK 1)', count: 20, color: 'neon-cyan' }, { name: 'Explorer (HSK 2)', count: 20, color: 'neon-green' }, { name: 'Adventurer (HSK 3)', count: 30, color: 'neon-purple' }, { name: 'Expert (HSK 4)', count: 30, color: 'neon-pink' }, { name: 'Master (HSK 5-6)', count: 20, color: 'orange-500' }];
const KOREAN_LEVELS = [{ name: 'Rookie (TOPIK 1)', count: 20, color: 'neon-cyan' }, { name: 'Explorer (TOPIK 2)', count: 20, color: 'neon-green' }, { name: 'Adventurer (TOPIK 3)', count: 30, color: 'neon-purple' }, { name: 'Expert (TOPIK 4)', count: 30, color: 'neon-pink' }, { name: 'Master (TOPIK 5-6)', count: 20, color: 'orange-500' }];
const RUSSIAN_LEVELS = DEFAULT_LEVELS;
const HEBREW_LEVELS = [{ name: 'Rookie (Aleph)', count: 20, color: 'neon-cyan' }, { name: 'Explorer (Bet)', count: 20, color: 'neon-green' }, { name: 'Adventurer (Gimel)', count: 30, color: 'neon-purple' }, { name: 'Expert (Dalet)', count: 30, color: 'neon-pink' }, { name: 'Master (Hey)', count: 20, color: 'orange-500' }];
const ARABIC_LEVELS = DEFAULT_LEVELS;
const GREEK_LEVELS = DEFAULT_LEVELS;
const FARSI_LEVELS = DEFAULT_LEVELS;
const KHMER_LEVELS = DEFAULT_LEVELS;
const THAI_LEVELS = DEFAULT_LEVELS;
const HINDI_LEVELS = DEFAULT_LEVELS;
const YIDDISH_LEVELS = DEFAULT_LEVELS;
const LATIN_LEVELS = DEFAULT_LEVELS;
const GEORGIAN_LEVELS = DEFAULT_LEVELS;
const KURDISH_LEVELS = DEFAULT_LEVELS;

// --- TOPICS ---

const PYTHON_TOPICS = [
    ['Variables & Types', 'Basic Math', 'Strings', 'Booleans', 'Input/Output', 'If Statements', 'Lists', 'For Loops', 'While Loops', 'Functions', 'Scope', 'Dictionaries', 'Sets', 'Tuples', 'Error Handling'],
    ['Modules', 'File I/O', 'Classes & Objects', 'Inheritance', 'Polymorphism', 'Lambda Functions', 'List Comprehensions', 'Decorators', 'Generators', 'Iterators', 'Context Managers', 'Virtual Env', 'PIP', 'API Requests', 'JSON Handling'],
    ['Data Analysis (Pandas)', 'NumPy Basics', 'Visualization', 'Algorithms', 'Recursion', 'Sorting', 'Searching', 'Graph Theory', 'Testing (PyTest)', 'Debugging', 'AsyncIO', 'Multi-threading', 'Web Scraping', 'Flask Basics', 'Django Basics']
];

const PRECALC_TOPICS = [
    ['Real Numbers', 'Exponents', 'Radicals', 'Polynomials', 'Factoring', 'Rational Expressions', 'Linear Equations', 'Inequalities', 'Absolute Value', 'Coordinate Plane', 'Lines & Slope', 'Functions Basics', 'Domain & Range', 'Transformations', 'Composition'],
    ['Quadratic Functions', 'Polynomial Functions', 'Rational Functions', 'Exponential Functions', 'Logarithmic Functions', 'Log Properties', 'Exponential Equations', 'Unit Circle', 'Radian Measure', 'Trig Functions', 'Right Triangle Trig', 'Trig Graphs', 'Inverse Trig', 'Trig Identities', 'Solving Trig Eq'],
    ['Law of Sines/Cosines', 'Vectors', 'Dot Product', 'Complex Numbers', 'Polar Coordinates', 'Parametric Eq', 'Conic Sections', 'Systems of Eq', 'Matrices', 'Determinants', 'Sequences', 'Series', 'Binomial Theorem', 'Probability', 'Limits Intro']
];

const CALCULUS_TOPICS = [
    ['Limits Intro', 'Limit Laws', 'Continuity', 'Limits at Infinity', 'Derivative Def', 'Power Rule', 'Product Rule', 'Quotient Rule', 'Chain Rule', 'Trig Derivatives', 'Exp/Log Derivatives', 'Implicit Diff', 'Related Rates', 'Linear Approx', 'Mean Value Thm'],
    ['Maxima/Minima', 'Inc/Dec Intervals', 'Concavity', 'Curve Sketching', 'Optimization', 'Antiderivatives', 'Indefinite Integrals', 'Riemann Sums', 'Definite Integrals', 'Fund. Thm of Calc', 'Substitution Rule', 'Area Between Curves', 'Volume (Disk/Washer)', 'Volume (Shells)', 'Work/Energy'],
    ['Integration by Parts', 'Trig Integrals', 'Trig Substitution', 'Partial Fractions', 'Improper Integrals', 'Arc Length', 'Surface Area', 'Diff Equations', 'Sequences', 'Infinite Series', 'Integral Test', 'Comparison Tests', 'Ratio/Root Tests', 'Power Series', 'Taylor Series']
];

const ADV_ENGLISH_TOPICS = [
    ['Greek Roots 1', 'Latin Roots 1', 'Prefixes: Negation', 'Prefixes: Quantity', 'Suffixes: Nouns', 'Suffixes: Adjectives', 'French Loanwords', 'German Loanwords', 'Synonyms: Happy', 'Synonyms: Sad', 'Synonyms: Big', 'Synonyms: Small', 'Antonyms Basics', 'Confusing Words', 'Academic Verbs'],
    ['Archaic Diction', 'Literary Terms', 'Rhetorical Devices', 'Abstract Nouns', 'Sentiment Words', 'Description: Sound', 'Description: Light', 'Description: Texture', 'Character Traits', 'Emotion Nuances', 'Political Jargon', 'Scientific Roots', 'Medical Roots', 'Legal Latin', 'Business Idioms'],
    ['GRE High-Freq A-C', 'GRE High-Freq D-F', 'GRE High-Freq G-I', 'GRE High-Freq J-L', 'GRE High-Freq M-O', 'GRE High-Freq P-R', 'GRE High-Freq S-U', 'GRE High-Freq V-Z', 'Philosophy Terms', 'Psychology Terms', 'Art History Terms', 'Formal Logic', 'Debate Terminology', 'Shakespearean Terms', 'Modern Slang Origins']
];

const SPANISH_TOPICS = [['Hola & Adios', 'Ser vs Estar', 'Gender', 'Plurals'], ['Preterite', 'Imperfect', 'Future'], ['Subjunctive', 'Conditional', 'Literature']];
const JAPANESE_TOPICS = [['Greetings', 'Numbers', 'Colors', 'Family', 'Time', 'Food', 'Home', 'Daily Routine', 'Shopping', 'Travel Basics', 'Weather', 'Hobbies', 'School', 'Work', 'Directions', 'Body', 'Clothing', 'Animals', 'Adjectives', 'Particles 1'], ['Polite Form', 'Past Tense', 'Te-Form', 'Permission', 'Prohibitions', 'Must/Have to', 'Experiences', 'Comparisons', 'Desires', 'Potential Form', 'Volitional Form', 'Giving/Receiving', 'Conditionals', 'Transitive/Intransitive', 'Passive Voice', 'Causative', 'Respect Language', 'Humble Language', 'Conjunctions', 'Particles 2'], ['Advanced Travel', 'Tech', 'Society', 'Culture', 'Environment', 'Economy', 'Politics', 'Law', 'Science', 'History', 'Literature', 'Arts', 'Emotions', 'Abstract Concepts', 'Business Manners', 'Negotiation', 'Complaints', 'Emergency', 'Health', 'Cooking', 'Geography', 'Architecture', 'Space', 'Future', 'Tradition', 'Religion', 'Philosophy', 'Psychology', 'Education', 'Media']];

export const generateCurriculum = (courseId: string = 'japanese'): Unit[] => {
  let levels = DEFAULT_LEVELS;
  let topicsList: string[][] = [];
  
  switch (courseId) {
    case 'python': levels = SPECIALIZED_LEVELS; topicsList = PYTHON_TOPICS; break;
    case 'precalc': levels = SPECIALIZED_LEVELS; topicsList = PRECALC_TOPICS; break;
    case 'calculus': levels = SPECIALIZED_LEVELS; topicsList = CALCULUS_TOPICS; break;
    case 'advanced_english': levels = SPECIALIZED_LEVELS; topicsList = ADV_ENGLISH_TOPICS; break;
    case 'japanese': levels = JAPANESE_LEVELS; topicsList = JAPANESE_TOPICS; break;
    case 'hebrew': levels = HEBREW_LEVELS; break; 
    case 'russian': levels = RUSSIAN_LEVELS; break;
    case 'korean': levels = KOREAN_LEVELS; break;
    case 'chinese': levels = CHINESE_LEVELS; break;
    // New Languages Logic
    case 'latin': levels = LATIN_LEVELS; break;
    case 'georgian': levels = GEORGIAN_LEVELS; break;
    case 'kurdish': levels = KURDISH_LEVELS; break;
    default: levels = DEFAULT_LEVELS; topicsList = JAPANESE_TOPICS; break;
  }

  if (courseId === 'precalc') topicsList = PRECALC_TOPICS;
  if (courseId === 'calculus') topicsList = CALCULUS_TOPICS;
  if (courseId === 'python') topicsList = PYTHON_TOPICS;
  if (courseId === 'advanced_english') topicsList = ADV_ENGLISH_TOPICS;

  const units: Unit[] = [];
  let unitCounter = 1;

  for (const level of levels) {
    for (let i = 0; i < level.count; i++) {
      let topicListIndex = 0;
      const ln = level.name.toLowerCase();
      if (ln.includes('rookie') || ln.includes('start') || ln.includes('foundation') || ln.includes('basics')) topicListIndex = 0;
      else if (ln.includes('explorer') || ln.includes('core') || ln.includes('mid') || ln.includes('intermediate')) topicListIndex = 1;
      else topicListIndex = 2; 

      if (topicListIndex >= topicsList.length) topicListIndex = topicsList.length - 1;

      const specificTopic = topicsList[topicListIndex] ? topicsList[topicListIndex][i % topicsList[topicListIndex].length] : undefined;
      const topicName = specificTopic || `Topic ${i + 1}`;
      
      const unitId = `u-${courseId}-${unitCounter}`;
      
      // FIXED: Use constant lesson count to ensure IDs persist deterministically across reloads
      // If we use Math.random(), the lesson IDs change, breaking the "completedLessons" check.
      const lessonCount = 4; 
      const lessons: Lesson[] = [];

      for (let j = 0; j < lessonCount; j++) {
        lessons.push({
          id: `${unitId}-l-${j}`,
          title: `${topicName} ${j + 1}`,
          topic: `${topicName} part ${j + 1}`,
          description: `Mastering ${topicName}`,
          exercises: [], 
          color: level.color,
          icon: 'star'
        });
      }

      units.push({
        id: unitId,
        title: `Unit ${unitCounter}: ${topicName}`,
        description: level.name,
        level: level.name,
        color: level.color,
        lessons: lessons
      });

      unitCounter++;
    }
  }

  return units;
};
