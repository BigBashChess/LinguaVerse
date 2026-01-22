
import React, { useState } from 'react';
import { Volume2, Play, Terminal, Calculator, BookOpen, Search, Loader2 } from 'lucide-react';
import { runPythonSimulation, generateSpeech } from '../services/gemini';

// --- DATA: MATH RULES ---
const MATH_RULES = [
    { title: 'Pythagorean Theorem', content: 'a² + b² = c²' },
    { title: 'Quadratic Formula', content: 'x = (-b ± √(b² - 4ac)) / 2a' },
    { title: 'Logarithm Definition', content: 'log_b(x) = y  ⟺  b^y = x' },
    { title: 'Euler\'s Identity', content: 'e^(iπ) + 1 = 0' },
    { title: 'Derivative: Power Rule', content: 'd/dx(x^n) = nx^(n-1)' },
    { title: 'Derivative: Product Rule', content: '(fg)\' = f\'g + fg\'' },
    { title: 'Integral: Power Rule', content: '∫x^n dx = (x^(n+1))/(n+1) + C' },
    { title: 'Fundamental Thm of Calc', content: '∫_a^b f(x)dx = F(b) - F(a)' },
    { title: 'Trig Identity', content: 'sin²(x) + cos²(x) = 1' },
    { title: 'Double Angle: Sin', content: 'sin(2x) = 2sin(x)cos(x)' }
];

// --- DATA: ENGLISH ROOTS ---
const ENGLISH_ROOTS = [
    { root: 'bene', meaning: 'Good', examples: 'Beneficial, Benevolent, Benign' },
    { root: 'mal', meaning: 'Bad', examples: 'Malicious, Malignant, Malfunction' },
    { root: 'chron', meaning: 'Time', examples: 'Chronological, Chronic, Synchronize' },
    { root: 'geo', meaning: 'Earth', examples: 'Geography, Geology, Geocentric' },
    { root: 'bio', meaning: 'Life', examples: 'Biology, Biography, Biosphere' },
    { root: 'auto', meaning: 'Self', examples: 'Automatic, Autobiography, Autonomy' },
    { root: 'path', meaning: 'Feeling', examples: 'Empathy, Pathos, Apathy' },
    { root: 'scrib/script', meaning: 'Write', examples: 'Inscribe, Describe, Manuscript' },
    { root: 'dict', meaning: 'Say', examples: 'Dictate, Predict, Verdict' },
    { root: 'ject', meaning: 'Throw', examples: 'Eject, Projectile, Reject' }
];

interface Props {
  courseId?: string;
}

export const Characters: React.FC<Props> = ({ courseId = 'japanese' }) => {
  const [pythonCode, setPythonCode] = useState("print('Hello World')\n\n# Calculate sum\na = 5\nb = 10\nprint(f'Sum: {a+b}')");
  const [pythonOutput, setPythonOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // --- PYTHON SANDBOX VIEW ---
  if (courseId === 'python') {
    const handleRun = async () => {
        setIsRunning(true);
        setPythonOutput("Initializing interpreter...");
        const result = await runPythonSimulation(pythonCode);
        setPythonOutput(result);
        setIsRunning(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                   <Terminal className="text-neon-green" /> Neural Sandbox
                </h1>
                <button 
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-6 py-2 bg-neon-green text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                   {isRunning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                   EXECUTE
                </button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-sm font-mono uppercase">Input Stream</span>
                    <textarea 
                       value={pythonCode}
                       onChange={(e) => setPythonCode(e.target.value)}
                       className="flex-1 bg-space-card border border-gray-700 rounded-xl p-4 font-mono text-neon-cyan focus:outline-none focus:border-neon-cyan/50 resize-none"
                       spellCheck={false}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-sm font-mono uppercase">Output Log</span>
                    <div className="flex-1 bg-black/50 border border-gray-800 rounded-xl p-4 font-mono text-gray-300 overflow-y-auto whitespace-pre-wrap">
                        {pythonOutput}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // --- MATH RULES VIEW ---
  if (courseId.includes('calc') || courseId.includes('math')) {
      return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 pb-32">
             <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-neon-purple/20 rounded-xl flex items-center justify-center text-neon-purple border border-neon-purple/50">
                    <Calculator size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Universal Constants</h1>
                    <p className="text-gray-400">Essential rules for calculation.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {MATH_RULES.map((rule, idx) => (
                    <div key={idx} className="glass-panel p-6 rounded-xl border-l-4 border-l-neon-purple hover:bg-white/5 transition-colors">
                        <h3 className="text-gray-400 font-bold text-sm uppercase mb-2">{rule.title}</h3>
                        <p className="font-mono text-xl text-white tracking-wide">{rule.content}</p>
                    </div>
                 ))}
             </div>
        </div>
      );
  }

  // --- ADVANCED ENGLISH VIEW ---
  if (courseId === 'advanced_english') {
     return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 pb-32">
             <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/50">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Etymology Codex</h1>
                    <p className="text-gray-400">Unlock the origins of language.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {ENGLISH_ROOTS.map((root, idx) => (
                    <div key={idx} className="glass-panel p-6 rounded-xl group hover:border-orange-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                             <h3 className="text-3xl font-bold text-orange-400 font-display">{root.root}</h3>
                             <span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded text-xs font-bold uppercase">{root.meaning}</span>
                        </div>
                        <div className="text-sm text-gray-300">
                            <span className="block text-gray-500 text-xs uppercase mb-1 font-bold">Derivatives:</span>
                            {root.examples}
                        </div>
                    </div>
                 ))}
             </div>
        </div>
     );
  }

  return (
      <LanguageMatrix courseId={courseId} />
  );
};

// --- Language Matrix Component ---
const LanguageMatrix: React.FC<{courseId: string}> = ({ courseId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loadingChar, setLoadingChar] = useState<string|null>(null);

  // --- MATRIX DATA SETS ---

  const HIRAGANA = [
    { char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' },
    { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' },
    { char: 'さ', romaji: 'sa' }, { char: 'し', romaji: 'shi' }, { char: 'す', romaji: 'su' }, { char: 'せ', romaji: 'se' }, { char: 'そ', romaji: 'so' },
    { char: 'た', romaji: 'ta' }, { char: 'ち', romaji: 'chi' }, { char: 'つ', romaji: 'tsu' }, { char: 'て', romaji: 'te' }, { char: 'と', romaji: 'to' },
    { char: 'な', romaji: 'na' }, { char: 'に', romaji: 'ni' }, { char: 'ぬ', romaji: 'nu' }, { char: 'ね', romaji: 'ne' }, { char: 'の', romaji: 'no' },
    { char: 'は', romaji: 'ha' }, { char: 'ひ', romaji: 'hi' }, { char: 'ふ', romaji: 'fu' }, { char: 'へ', romaji: 'he' }, { char: 'ほ', romaji: 'ho' },
    { char: 'ま', romaji: 'ma' }, { char: 'み', romaji: 'mi' }, { char: 'む', romaji: 'mu' }, { char: 'め', romaji: 'me' }, { char: 'も', romaji: 'mo' },
    { char: 'や', romaji: 'ya' }, { char: 'ゆ', romaji: 'yu' }, { char: 'よ', romaji: 'yo' },
    { char: 'ら', romaji: 'ra' }, { char: 'り', romaji: 'ri' }, { char: 'る', romaji: 'ru' }, { char: 'れ', romaji: 're' }, { char: 'ろ', romaji: 'ro' },
    { char: 'わ', romaji: 'wa' }, { char: 'を', romaji: 'wo' }, { char: 'ん', romaji: 'n' }
  ];

  const KATAKANA = [
    { char: 'ア', romaji: 'a' }, { char: 'イ', romaji: 'i' }, { char: 'ウ', romaji: 'u' }, { char: 'エ', romaji: 'e' }, { char: 'オ', romaji: 'o' },
    { char: 'カ', romaji: 'ka' }, { char: 'キ', romaji: 'ki' }, { char: 'ク', romaji: 'ku' }, { char: 'ケ', romaji: 'ke' }, { char: 'コ', romaji: 'ko' },
    { char: 'サ', romaji: 'sa' }, { char: 'シ', romaji: 'shi' }, { char: 'ス', romaji: 'su' }, { char: 'セ', romaji: 'se' }, { char: 'ソ', romaji: 'so' },
    { char: 'タ', romaji: 'ta' }, { char: 'チ', romaji: 'chi' }, { char: 'ツ', romaji: 'tsu' }, { char: 'テ', romaji: 'te' }, { char: 'ト', romaji: 'to' },
    { char: 'ナ', romaji: 'na' }, { char: 'ニ', romaji: 'ni' }, { char: 'ヌ', romaji: 'nu' }, { char: 'ネ', romaji: 'ne' }, { char: 'ノ', romaji: 'no' },
    { char: 'ハ', romaji: 'ha' }, { char: 'ヒ', romaji: 'hi' }, { char: 'フ', romaji: 'fu' }, { char: 'ヘ', romaji: 'he' }, { char: 'ホ', romaji: 'ho' },
    { char: 'マ', romaji: 'ma' }, { char: 'ミ', romaji: 'mi' }, { char: 'ム', romaji: 'mu' }, { char: 'メ', romaji: 'me' }, { char: 'モ', romaji: 'mo' },
    { char: 'ヤ', romaji: 'ya' }, { char: 'ユ', romaji: 'yu' }, { char: 'ヨ', romaji: 'yo' },
    { char: 'ラ', romaji: 'ra' }, { char: 'リ', romaji: 'ri' }, { char: 'ル', romaji: 'ru' }, { char: 'レ', romaji: 're' }, { char: 'ロ', romaji: 'ro' },
    { char: 'ワ', romaji: 'wa' }, { char: 'ヲ', romaji: 'wo' }, { char: 'ン', romaji: 'n' }
  ];

  const KANJI_N5_BASICS = [
    {char:'一', romaji:'ichi'}, {char:'二', romaji:'ni'}, {char:'三', romaji:'san'}, {char:'四', romaji:'yon'},
    {char:'五', romaji:'go'}, {char:'六', romaji:'roku'}, {char:'七', romaji:'nana'}, {char:'八', romaji:'hachi'},
    {char:'九', romaji:'kyuu'}, {char:'十', romaji:'juu'}, {char:'百', romaji:'hyaku'}, {char:'千', romaji:'sen'},
    {char:'人', romaji:'hito'}, {char:'名', romaji:'na'}, {char:'日', romaji:'hi/nichi'}, {char:'本', romaji:'hon'}
  ];

  const KANJI_N5_NATURE = [
    {char:'月', romaji:'tsuki'}, {char:'火', romaji:'hi/ka'}, {char:'水', romaji:'mizu'}, {char:'木', romaji:'ki'},
    {char:'金', romaji:'kane'}, {char:'土', romaji:'tsuchi'}, {char:'山', romaji:'yama'}, {char:'川', romaji:'kawa'},
    {char:'田', romaji:'ta'}, {char:'天', romaji:'ten'}, {char:'空', romaji:'sora'}, {char:'雨', romaji:'ame'},
    {char:'花', romaji:'hana'}, {char:'草', romaji:'kusa'}, {char:'海', romaji:'umi'}, {char:'犬', romaji:'inu'}
  ];

  const GEORGIAN = [
    { char: 'ა', romaji: 'a' }, { char: 'ბ', romaji: 'b' }, { char: 'გ', romaji: 'g' }, { char: 'დ', romaji: 'd' }, { char: 'ე', romaji: 'e' },
    { char: 'ვ', romaji: 'v' }, { char: 'ზ', romaji: 'z' }, { char: 'თ', romaji: 't' }, { char: 'ი', romaji: 'i' }, { char: 'კ', romaji: 'k' },
    { char: 'ლ', romaji: 'l' }, { char: 'მ', romaji: 'm' }, { char: 'ნ', romaji: 'n' }, { char: 'ო', romaji: 'o' }, { char: 'პ', romaji: 'p' },
    { char: 'ჟ', romaji: 'zh' }, { char: 'რ', romaji: 'r' }, { char: 'ს', romaji: 's' }, { char: 'ტ', romaji: 't' }, { char: 'უ', romaji: 'u' },
    { char: 'ფ', romaji: 'p' }, { char: 'ქ', romaji: 'k' }, { char: 'ღ', romaji: 'gh' }, { char: 'ყ', romaji: 'q' }, { char: 'შ', romaji: 'sh' },
    { char: 'ჩ', romaji: 'ch' }, { char: 'ც', romaji: 'ts' }, { char: 'ძ', romaji: 'dz' }, { char: 'წ', romaji: 'ts' }, { char: 'ჭ', romaji: 'ch' },
    { char: 'ხ', romaji: 'kh' }, { char: 'ჯ', romaji: 'j' }, { char: 'ჰ', romaji: 'h' }
  ];

  const KURDISH = [
    { char: 'A', romaji: 'a' }, { char: 'B', romaji: 'b' }, { char: 'C', romaji: 'dj' }, { char: 'Ç', romaji: 'ch' }, { char: 'D', romaji: 'd' },
    { char: 'E', romaji: 'e' }, { char: 'Ê', romaji: 'é' }, { char: 'F', romaji: 'f' }, { char: 'G', romaji: 'g' }, { char: 'H', romaji: 'h' },
    { char: 'I', romaji: 'i' }, { char: 'Î', romaji: 'ee' }, { char: 'J', romaji: 'j' }, { char: 'K', romaji: 'k' }, { char: 'L', romaji: 'l' },
    { char: 'M', romaji: 'm' }, { char: 'N', romaji: 'n' }, { char: 'O', romaji: 'o' }, { char: 'P', romaji: 'p' }, { char: 'Q', romaji: 'q' },
    { char: 'R', romaji: 'r' }, { char: 'S', romaji: 's' }, { char: 'Ş', romaji: 'sh' }, { char: 'T', romaji: 't' }, { char: 'U', romaji: 'u' },
    { char: 'Û', romaji: 'uu' }, { char: 'V', romaji: 'v' }, { char: 'W', romaji: 'w' }, { char: 'X', romaji: 'kh' }, { char: 'Y', romaji: 'y' }, { char: 'Z', romaji: 'z' }
  ];

  const LATIN = [
    { char: 'A', romaji: 'a' }, { char: 'B', romaji: 'b' }, { char: 'C', romaji: 'c' }, { char: 'D', romaji: 'd' }, { char: 'E', romaji: 'e' },
    { char: 'F', romaji: 'f' }, { char: 'G', romaji: 'g' }, { char: 'H', romaji: 'h' }, { char: 'I', romaji: 'i' }, { char: 'K', romaji: 'k' },
    { char: 'L', romaji: 'l' }, { char: 'M', romaji: 'm' }, { char: 'N', romaji: 'n' }, { char: 'O', romaji: 'o' }, { char: 'P', romaji: 'p' },
    { char: 'Q', romaji: 'q' }, { char: 'R', romaji: 'r' }, { char: 'S', romaji: 's' }, { char: 'T', romaji: 't' }, { char: 'V', romaji: 'u/v' },
    { char: 'X', romaji: 'x' }, { char: 'Y', romaji: 'y' }, { char: 'Z', romaji: 'z' }
  ];

  const HEBREW_LETTERS = [
    {char:'א', romaji:'\''}, {char:'ב', romaji:'b/v'}, {char:'ג', romaji:'g'}, {char:'ד', romaji:'d'}, {char:'ה', romaji:'h'},
    {char:'ו', romaji:'v/o/u'}, {char:'ז', romaji:'z'}, {char:'ח', romaji:'kh'}, {char:'ט', romaji:'t'}, {char:'י', romaji:'y'},
    {char:'כ', romaji:'k/kh'}, {char:'ל', romaji:'l'}, {char:'מ', romaji:'m'}, {char:'נ', romaji:'n'}, {char:'ס', romaji:'s'},
    {char:'ע', romaji:'\''}, {char:'פ', romaji:'p/f'}, {char:'צ', romaji:'ts'}, {char:'ק', romaji:'q'}, {char:'ר', romaji:'r'},
    {char:'ש', romaji:'sh/s'}, {char:'ת', romaji:'t'}
  ];
  
  const HEBREW_FINAL = [
    {char:'ך', romaji:'k (final)'}, {char:'ם', romaji:'m (final)'}, {char:'ן', romaji:'n (final)'},
    {char:'ף', romaji:'p/f (final)'}, {char:'ץ', romaji:'ts (final)'}
  ];

  const HEBREW_VOWELS = [
    {char:'אַ', romaji:'a (Patach)'}, {char:'אָ', romaji:'a (Kamatz)'}, {char:'אֵ', romaji:'e (Tzeire)'}, 
    {char:'אֶ', romaji:'e (Segol)'}, {char:'אִ', romaji:'i (Hirik)'}, {char:'אֹ', romaji:'o (Cholam)'}, 
    {char:'אֻ', romaji:'u (Kubutz)'}, {char:'אְ', romaji:'(Shva)'}, {char:'וֹ', romaji:'o (H. Male)'}, {char:'וּ', romaji:'u (Shuruk)'}
  ];

  const RUSSIAN = [
    {char:'А', romaji:'a'}, {char:'Б', romaji:'b'}, {char:'В', romaji:'v'}, {char:'Г', romaji:'g'}, {char:'Д', romaji:'d'},
    {char:'Е', romaji:'ye'}, {char:'Ё', romaji:'yo'}, {char:'Ж', romaji:'zh'}, {char:'З', romaji:'z'}, {char:'И', romaji:'i'},
    {char:'Й', romaji:'y'}, {char:'К', romaji:'k'}, {char:'Л', romaji:'l'}, {char:'М', romaji:'m'}, {char:'Н', romaji:'n'},
    {char:'О', romaji:'o'}, {char:'П', romaji:'p'}, {char:'Р', romaji:'r'}, {char:'С', romaji:'s'}, {char:'Т', romaji:'t'},
    {char:'У', romaji:'u'}, {char:'Ф', romaji:'f'}, {char:'Х', romaji:'kh'}, {char:'Ц', romaji:'ts'}, {char:'Ч', romaji:'ch'},
    {char:'Ш', romaji:'sh'}, {char:'Щ', romaji:'shch'}, {char:'Ъ', romaji:'hard'}, {char:'Ы', romaji:'y'}, {char:'Ь', romaji:'soft'},
    {char:'Э', romaji:'e'}, {char:'Ю', romaji:'yu'}, {char:'Я', romaji:'ya'}
  ];

  const GREEK = [
    {char:'Α', romaji:'a'}, {char:'Β', romaji:'v'}, {char:'Γ', romaji:'g'}, {char:'Δ', romaji:'d'}, {char:'Ε', romaji:'e'},
    {char:'Ζ', romaji:'z'}, {char:'Η', romaji:'i'}, {char:'Θ', romaji:'th'}, {char:'Ι', romaji:'i'}, {char:'Κ', romaji:'k'},
    {char:'Λ', romaji:'l'}, {char:'Μ', romaji:'m'}, {char:'Ν', romaji:'n'}, {char:'Ξ', romaji:'x'}, {char:'Ο', romaji:'o'},
    {char:'Π', romaji:'p'}, {char:'Ρ', romaji:'r'}, {char:'Σ', romaji:'s'}, {char:'Τ', romaji:'t'}, {char:'Υ', romaji:'i'},
    {char:'Φ', romaji:'f'}, {char:'Χ', romaji:'ch'}, {char:'Ψ', romaji:'ps'}, {char:'Ω', romaji:'o'}
  ];

  const KOREAN_CONSONANTS = [
    {char:'ㄱ', romaji:'g/k'}, {char:'ㄴ', romaji:'n'}, {char:'ㄷ', romaji:'d/t'}, {char:'ㄹ', romaji:'r/l'}, {char:'ㅁ', romaji:'m'},
    {char:'ㅂ', romaji:'b/p'}, {char:'ㅅ', romaji:'s'}, {char:'ㅇ', romaji:'ng'}, {char:'ㅈ', romaji:'j'}, {char:'ㅊ', romaji:'ch'},
    {char:'ㅋ', romaji:'k'}, {char:'ㅌ', romaji:'t'}, {char:'ㅍ', romaji:'p'}, {char:'ㅎ', romaji:'h'},
    {char:'ㄲ', romaji:'kk'}, {char:'ㄸ', romaji:'tt'}, {char:'ㅃ', romaji:'pp'}, {char:'ㅆ', romaji:'ss'}, {char:'ㅉ', romaji:'jj'}
  ];
  
  const KOREAN_VOWELS = [
    {char:'ㅏ', romaji:'a'}, {char:'ㅑ', romaji:'ya'}, {char:'ㅓ', romaji:'eo'}, {char:'ㅕ', romaji:'yeo'}, {char:'ㅗ', romaji:'o'},
    {char:'ㅛ', romaji:'yo'}, {char:'ㅜ', romaji:'u'}, {char:'ㅠ', romaji:'yu'}, {char:'ㅡ', romaji:'eu'}, {char:'ㅣ', romaji:'i'},
    {char:'ㅐ', romaji:'ae'}, {char:'ㅒ', romaji:'yae'}, {char:'ㅔ', romaji:'e'}, {char:'ㅖ', romaji:'ye'}, {char:'ㅘ', romaji:'wa'},
    {char:'ㅙ', romaji:'wae'}, {char:'ㅚ', romaji:'oe'}, {char:'ㅝ', romaji:'wo'}, {char:'ㅞ', romaji:'we'}, {char:'ㅟ', romaji:'wi'}, {char:'ㅢ', romaji:'ui'}
  ];

  const ARABIC = [
    {char:'ا', romaji:'a'}, {char:'ب', romaji:'b'}, {char:'ت', romaji:'t'}, {char:'ث', romaji:'th'}, {char:'ج', romaji:'j'},
    {char:'ح', romaji:'7a'}, {char:'خ', romaji:'kh'}, {char:'د', romaji:'d'}, {char:'ذ', romaji:'dh'}, {char:'ر', romaji:'r'},
    {char:'ز', romaji:'z'}, {char:'س', romaji:'s'}, {char:'ش', romaji:'sh'}, {char:'ص', romaji:'S'}, {char:'ض', romaji:'D'},
    {char:'ط', romaji:'T'}, {char:'ظ', romaji:'Z'}, {char:'ع', romaji:'3a'}, {char:'غ', romaji:'gh'}, {char:'ف', romaji:'f'},
    {char:'ق', romaji:'q'}, {char:'ك', romaji:'k'}, {char:'ل', romaji:'l'}, {char:'م', romaji:'m'}, {char:'ن', romaji:'n'},
    {char:'ه', romaji:'h'}, {char:'و', romaji:'w'}, {char:'ي', romaji:'y'}
  ];

  const FARSI = [
    {char:'ا', romaji:'a'}, {char:'ب', romaji:'b'}, {char:'پ', romaji:'p'}, {char:'ت', romaji:'t'}, {char:'ث', romaji:'s'},
    {char:'ج', romaji:'j'}, {char:'چ', romaji:'ch'}, {char:'ح', romaji:'h'}, {char:'خ', romaji:'kh'}, {char:'د', romaji:'d'},
    {char:'ذ', romaji:'z'}, {char:'ر', romaji:'r'}, {char:'ز', romaji:'z'}, {char:'ژ', romaji:'zh'}, {char:'س', romaji:'s'},
    {char:'ش', romaji:'sh'}, {char:'ص', romaji:'s'}, {char:'ض', romaji:'z'}, {char:'ط', romaji:'t'}, {char:'ظ', romaji:'z'},
    {char:'ع', romaji:'\''}, {char:'غ', romaji:'gh'}, {char:'ف', romaji:'f'}, {char:'ق', romaji:'gh'}, {char:'ک', romaji:'k'},
    {char:'گ', romaji:'g'}, {char:'ل', romaji:'l'}, {char:'م', romaji:'m'}, {char:'ن', romaji:'n'}, {char:'و', romaji:'v/u'},
    {char:'ه', romaji:'h'}, {char:'ی', romaji:'y/i'}
  ];

  const HINDI_VOWELS = [
    {char:'अ', romaji:'a'}, {char:'आ', romaji:'aa'}, {char:'इ', romaji:'i'}, {char:'ई', romaji:'ee'}, {char:'उ', romaji:'u'},
    {char:'ऊ', romaji:'oo'}, {char:'ऋ', romaji:'ri'}, {char:'ए', romaji:'e'}, {char:'ऐ', romaji:'ai'}, {char:'ओ', romaji:'o'}, {char:'औ', romaji:'au'},
    {char:'अं', romaji:'ang'}, {char:'अः', romaji:'ah'}
  ];

  const HINDI_CONSONANTS = [
    {char:'क', romaji:'ka'}, {char:'ख', romaji:'kha'}, {char:'ग', romaji:'ga'}, {char:'घ', romaji:'gha'}, {char:'च', romaji:'cha'},
    {char:'छ', romaji:'chha'}, {char:'ज', romaji:'ja'}, {char:'झ', romaji:'jha'}, {char:'ट', romaji:'ta'}, {char:'ठ', romaji:'tha'},
    {char:'ड', romaji:'da'}, {char:'ढ', romaji:'dha'}, {char:'ण', romaji:'na'}, {char:'त', romaji:'ta'}, {char:'थ', romaji:'tha'},
    {char:'द', romaji:'da'}, {char:'ध', romaji:'dha'}, {char:'न', romaji:'na'}, {char:'प', romaji:'pa'}, {char:'फ', romaji:'pha'},
    {char:'ब', romaji:'ba'}, {char:'भ', romaji:'bha'}, {char:'म', romaji:'ma'}, {char:'य', romaji:'ya'}, {char:'र', romaji:'ra'},
    {char:'ल', romaji:'la'}, {char:'व', romaji:'va'}, {char:'श', romaji:'sha'}, {char:'ष', romaji:'sha'}, {char:'स', romaji:'sa'}, {char:'ह', romaji:'ha'}
  ];

  const THAI_CONSONANTS = [
    {char:'ก', romaji:'kor kai'}, {char:'ข', romaji:'khor khai'}, {char:'ฃ', romaji:'khor khuat'}, {char:'ค', romaji:'khor khwai'},
    {char:'ฅ', romaji:'khor khon'}, {char:'ฆ', romaji:'khor rakhang'}, {char:'ง', romaji:'ngor ngu'}, {char:'จ', romaji:'jor jan'},
    {char:'ฉ', romaji:'chor ching'}, {char:'ช', romaji:'chor chang'}, {char:'ซ', romaji:'sor so'}, {char:'ฌ', romaji:'chor cher'},
    {char:'ญ', romaji:'yor ying'}, {char:'ฎ', romaji:'dor chada'}, {char:'ฏ', romaji:'tor patak'}, {char:'ฐ', romaji:'thor than'},
    {char:'ฑ', romaji:'thor nangmontho'}, {char:'ฒ', romaji:'thor phuthao'}, {char:'ณ', romaji:'nor nen'}, {char:'ด', romaji:'dor dek'},
    {char:'ต', romaji:'tor tao'}, {char:'ถ', romaji:'thor thung'}, {char:'ท', romaji:'thor thahan'}, {char:'ธ', romaji:'thor thong'},
    {char:'น', romaji:'nor nu'}, {char:'บ', romaji:'bor baimai'}, {char:'ป', romaji:'por pla'}, {char:'ผ', romaji:'phor phueng'},
    {char:'ฝ', romaji:'for fa'}, {char:'พ', romaji:'phor phan'}, {char:'ฟ', romaji:'for fan'}, {char:'ภ', romaji:'phor samphao'},
    {char:'ม', romaji:'mor ma'}, {char:'ย', romaji:'yor yak'}, {char:'ร', romaji:'ror ruea'}, {char:'ล', romaji:'lor ling'},
    {char:'ว', romaji:'wor waen'}, {char:'ศ', romaji:'sor sala'}, {char:'ษ', romaji:'sor ruesi'}, {char:'ส', romaji:'sor suea'},
    {char:'ห', romaji:'hor hip'}, {char:'ฬ', romaji:'lor chula'}, {char:'อ', romaji:'or ang'}, {char:'ฮ', romaji:'hor nokhuk'}
  ];

  const THAI_VOWELS = [
    {char:'ะ', romaji:'a'}, {char:'า', romaji:'aa'}, {char:'ิ', romaji:'i'}, {char:'ี', romaji:'ii'}, {char:'ึ', romaji:'ue'},
    {char:'ื', romaji:'uee'}, {char:'ุ', romaji:'u'}, {char:'ู', romaji:'uu'}, {char:'เ', romaji:'e'}, {char:'แ', romaji:'ae'},
    {char:'โ', romaji:'o'}, {char:'ไ', romaji:'ai'}, {char:'ใ', romaji:'ai'}, {char:'ำ', romaji:'am'}
  ];
  
  const CHINESE_HSK1 = [
    {char:'你', romaji:'nǐ'}, {char:'好', romaji:'hǎo'}, {char:'我', romaji:'wǒ'}, {char:'是', romaji:'shì'}, 
    {char:'人', romaji:'rén'}, {char:'大', romaji:'dà'}, {char:'小', romaji:'xiǎo'}, {char:'他', romaji:'tā'},
    {char:'她', romaji:'tā'}, {char:'们', romaji:'men'}, {char:'不', romaji:'bù'}, {char:'在', romaji:'zài'},
    {char:'有', romaji:'yǒu'}, {char:'这', romaji:'zhè'}, {char:'那', romaji:'nà'}, {char:'个', romaji:'gè'}
  ];

  const CHINESE_HSK1_B = [
    {char:'上', romaji:'shàng'}, {char:'下', romaji:'xià'}, {char:'中', romaji:'zhōng'}, {char:'国', romaji:'guó'},
    {char:'吃', romaji:'chī'}, {char:'喝', romaji:'hē'}, {char:'茶', romaji:'chá'}, {char:'水', romaji:'shuǐ'},
    {char:'爱', romaji:'ài'}, {char:'妈', romaji:'mā'}, {char:'爸', romaji:'bà'}, {char:'家', romaji:'jiā'},
    {char:'学', romaji:'xué'}, {char:'校', romaji:'xiào'}, {char:'看', romaji:'kàn'}, {char:'书', romaji:'shū'}
  ];

  let config;
  if (courseId === 'hebrew') config = { langCode: 'he-IL', tabs: [{ name: 'Letters', type: 'grid', data: HEBREW_LETTERS }, { name: 'Final Forms', type: 'grid', data: HEBREW_FINAL }, { name: 'Vowels', type: 'grid', data: HEBREW_VOWELS }] };
  else if (courseId === 'russian') config = { langCode: 'ru-RU', tabs: [{ name: 'Cyrillic', type: 'grid', data: RUSSIAN }] };
  else if (courseId === 'greek') config = { langCode: 'el-GR', tabs: [{ name: 'Alphabet', type: 'grid', data: GREEK }] };
  else if (courseId === 'korean') config = { langCode: 'ko-KR', tabs: [{ name: 'Consonants', type: 'grid', data: KOREAN_CONSONANTS }, { name: 'Vowels', type: 'grid', data: KOREAN_VOWELS }] };
  else if (courseId === 'farsi') config = { langCode: 'fa-IR', tabs: [{ name: 'Alphabet', type: 'grid', data: FARSI }] };
  else if (courseId === 'arabic') config = { langCode: 'ar-SA', tabs: [{ name: 'Alphabet', type: 'grid', data: ARABIC }] };
  else if (courseId === 'hindi') config = { langCode: 'hi-IN', tabs: [{ name: 'Vowels', type: 'grid', data: HINDI_VOWELS }, { name: 'Consonants', type: 'grid', data: HINDI_CONSONANTS }] };
  else if (courseId === 'thai') config = { langCode: 'th-TH', tabs: [{ name: 'Consonants', type: 'grid', data: THAI_CONSONANTS }, { name: 'Vowels', type: 'grid', data: THAI_VOWELS }] };
  else if (courseId === 'chinese') config = { langCode: 'zh-CN', tabs: [{ name: 'Basics 1', type: 'grid', data: CHINESE_HSK1 }, { name: 'Basics 2', type: 'grid', data: CHINESE_HSK1_B }] };
  else if (courseId === 'spanish') config = { langCode: 'es-ES', tabs: [{ name: 'Chars', type: 'grid', data: [{char:'Ñ', romaji:'enye'},{char:'¿', romaji:'?'}, {char:'Á', romaji:'a'}, {char:'É', romaji:'e'}, {char:'Í', romaji:'i'}, {char:'Ó', romaji:'o'}, {char:'Ú', romaji:'u'}, {char:'Ü', romaji:'u'}] }] };
  else if (courseId === 'georgian') config = { langCode: 'ka-GE', tabs: [{ name: 'Mkhedruli', type: 'grid', data: GEORGIAN }] };
  else if (courseId === 'kurdish') config = { langCode: 'ku-TR', tabs: [{ name: 'Kurmanji', type: 'grid', data: KURDISH }] };
  else if (courseId === 'latin') config = { langCode: 'la', tabs: [{ name: 'Alphabet', type: 'grid', data: LATIN }] };
  else config = { langCode: 'ja-JP', tabs: [{ name: 'Hiragana', type: 'grid', data: HIRAGANA }, { name: 'Katakana', type: 'grid', data: KATAKANA }, { name: 'Kanji (Basics)', type: 'grid', data: KANJI_N5_BASICS }, { name: 'Kanji (Nature)', type: 'grid', data: KANJI_N5_NATURE }] };

  // Ensure activeTab is valid when switching languages
  const currentTab = config.tabs[activeTab] || config.tabs[0];

  const playSound = async (text: string) => {
    if (!text || loadingChar) return;

    // Use browser speech for major supported languages to reduce latency, fallback to Gemini for others or if quality preferred.
    // However, the user specifically asked to use Gemini TTS for languages that don't work.
    // 'georgian', 'kurdish', 'latin' often fail or have poor support in browsers.
    const difficultLangs = ['georgian', 'kurdish', 'latin', 'khmer', 'yiddish'];
    const shouldUseGemini = difficultLangs.some(l => courseId.includes(l));

    if (shouldUseGemini) {
        setLoadingChar(text);
        try {
            const url = await generateSpeech(text, courseId);
            if (url) {
                const audio = new Audio(url);
                audio.play();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingChar(null);
        }
    } else {
        // Fallback to browser for speed on common langs
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = config.langCode;
        window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-display font-bold text-white">Character Matrix</h1>
        <div className="flex items-center gap-2 text-neon-cyan/70 text-sm font-mono animate-pulse">
           <Volume2 size={16} />
           <span>AUDIO ENABLED</span>
        </div>
      </div>
      
      <div className="flex w-full border-b border-gray-700 mb-8 overflow-x-auto">
        {config.tabs.map((tab: any, index: number) => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(index)}
            className={`flex-1 pb-4 min-w-[100px] font-bold text-sm tracking-[0.2em] uppercase transition-all whitespace-nowrap
              ${(config.tabs[activeTab] === tab || (!config.tabs[activeTab] && index === 0))
                ? 'text-neon-cyan border-b-2 border-neon-cyan shadow-[0_4px_20px_-5px_rgba(0,240,255,0.5)]' 
                : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 md:grid-cols-5 gap-3 md:gap-4 animate-in fade-in zoom-in-95 duration-300 key={activeTab}">
            {(currentTab.data as any[]).map((item, idx) => (
                <button 
                    key={idx} 
                    onClick={() => playSound(item.char)}
                    disabled={loadingChar !== null && loadingChar === item.char}
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center border border-gray-800 bg-space-card/50 backdrop-blur-sm relative group hover:border-neon-purple hover:bg-neon-purple/10 hover:scale-105 cursor-pointer transition-all btn-push disabled:opacity-50"
                >
                    {loadingChar === item.char ? (
                        <Loader2 className="animate-spin text-neon-cyan" />
                    ) : (
                        <>
                            <span className="text-3xl md:text-4xl font-display font-bold text-gray-200 group-hover:text-white">{item.char}</span>
                            <span className="text-xs md:text-sm text-neon-cyan-dim font-bold mt-2 font-mono">{item.romaji}</span>
                        </>
                    )}
                </button>
            ))}
      </div>
    </div>
  );
};
