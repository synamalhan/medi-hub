import { create } from 'zustand';
import { PatientCase, Flashcard, Deadline, Mnemonic, StudySession } from '../types';
import { supabase } from '../lib/supabase';
import { generatePatientCase } from '../lib/patientGenerator';
import { addDays } from 'date-fns';
import { useAuthStore } from '../stores/authStore'; // Adjust path if needed

interface DataState {
  patientCases: PatientCase[];
  flashcards: Flashcard[];
  deadlines: Deadline[];
  mnemonics: Mnemonic[];
  studySessions: StudySession[];
  
  // Patient Simulator
  currentCase: PatientCase | null;
  generateNewCase: () => void;
  submitDiagnosis: (diagnosis: string) => Promise<boolean>;
  
  // Flashcards
  addFlashcard: (card: Omit<Flashcard, 'id' | 'createdAt'>) => Promise<void>;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  getFlashcardsForReview: () => Flashcard[];
  loadFlashcards: () => Promise<void>;
  
  // Deadlines
  addDeadline: (deadline: Omit<Deadline, 'id' | 'createdAt'>) => Promise<void>;
  updateDeadline: (id: string, updates: Partial<Deadline>) => Promise<void>;
  deleteDeadline: (id: string) => Promise<void>;
  loadDeadlines: () => Promise<void>;
  
  // Mnemonics
  addMnemonic: (mnemonic: Omit<Mnemonic, 'id' | 'createdAt'>) => Promise<void>;
  generateMnemonic: (term: string) => string;
  loadMnemonics: () => Promise<void>;
  
  // Study Sessions
  startStudySession: (type: StudySession['type']) => Promise<string>;
  endStudySession: (id: string, correct: number, incorrect: number) => Promise<void>;
  
  // Data loading
  loadAllData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  patientCases: [],
  flashcards: [],
  deadlines: [],
  mnemonics: [],
  studySessions: [],
  currentCase: null,

  generateNewCase: () => {
    const newCase = generatePatientCase();
    set({ currentCase: newCase });
  },

  submitDiagnosis: async (diagnosis: string) => {
  const currentCase = get().currentCase;
  if (!currentCase) {
    console.warn('No current case found.');
    return false;
  }

  const isCorrect =
    diagnosis.toLowerCase().includes(currentCase.diagnosis.condition.toLowerCase()) ||
    currentCase.diagnosis.condition.toLowerCase().includes(diagnosis.toLowerCase());

  console.log('Submitting diagnosis...');
  console.log('Diagnosis:', diagnosis);
  console.log('Expected:', currentCase.diagnosis.condition);
  console.log('Is correct:', isCorrect);

  try {
    const { user } = useAuthStore.getState(); // ✅ Use store directly
    if (!user) {
      console.error('No logged-in user found from auth store.');
      return false;
    }

    const insertPayload = {
      user_id: user.id,
      case_data: currentCase,
      diagnosis_submitted: diagnosis,
      is_correct: isCorrect,
      completed_at: new Date().toISOString(),
    };

    console.log('Insert payload:', insertPayload);

    const { error: insertError, data } = await supabase
      .from('patient_cases')
      .insert([insertPayload]);

    if (insertError) {
      console.error('Error inserting diagnosis:', insertError);
    } else {
      console.log('Diagnosis successfully saved to patient_cases:', data);
    }

    return isCorrect;
  } catch (err) {
    console.error('Unexpected error during submitDiagnosis:', err);
    return false;
  }
},


  addFlashcard: async (card) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          user_id: user.id,
          front: card.front,
          back: card.back,
          tags: card.tags,
          difficulty: card.difficulty || 1,
          last_reviewed: new Date().toISOString(),
          next_review: addDays(new Date(), 1).toISOString(),
          correct_count: 0,
          incorrect_count: 0,
        })
        .select()
        .single();

      if (!error && data) {
        const newCard: Flashcard = {
          id: data.id,
          front: data.front,
          back: data.back,
          tags: data.tags,
          difficulty: data.difficulty,
          lastReviewed: new Date(data.last_reviewed),
          nextReview: new Date(data.next_review),
          correctCount: data.correct_count,
          incorrectCount: data.incorrect_count,
          createdAt: new Date(data.created_at),
        };
        
        set(state => ({ flashcards: [...state.flashcards, newCard] }));
      }
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  },

  updateFlashcard: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .update({
          front: updates.front,
          back: updates.back,
          tags: updates.tags,
          difficulty: updates.difficulty,
          last_reviewed: updates.lastReviewed?.toISOString(),
          next_review: updates.nextReview?.toISOString(),
          correct_count: updates.correctCount,
          incorrect_count: updates.incorrectCount,
        })
        .eq('id', id);

      if (!error) {
        set(state => ({
          flashcards: state.flashcards.map(card =>
            card.id === id ? { ...card, ...updates } : card
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }
  },

  deleteFlashcard: async (id) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id);

      if (!error) {
        set(state => ({
          flashcards: state.flashcards.filter(card => card.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  },

  getFlashcardsForReview: () => {
    const { flashcards } = get();
    const now = new Date();
    return flashcards.filter(card => card.nextReview <= now);
  },

  loadFlashcards: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const flashcards: Flashcard[] = data.map(item => ({
          id: item.id,
          front: item.front,
          back: item.back,
          tags: item.tags,
          difficulty: item.difficulty,
          lastReviewed: new Date(item.last_reviewed),
          nextReview: new Date(item.next_review),
          correctCount: item.correct_count,
          incorrectCount: item.incorrect_count,
          createdAt: new Date(item.created_at),
        }));
        
        set({ flashcards });
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  },

  addDeadline: async (deadline) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('deadlines')
        .insert({
          user_id: user.id,
          title: deadline.title,
          description: deadline.description,
          due_date: deadline.dueDate.toISOString(),
          category: deadline.category,
          priority: deadline.priority,
          is_completed: deadline.isCompleted,
        })
        .select()
        .single();

      if (!error && data) {
        const newDeadline: Deadline = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          dueDate: new Date(data.due_date),
          category: data.category as any,
          priority: data.priority as any,
          isCompleted: data.is_completed,
          createdAt: new Date(data.created_at),
        };
        
        set(state => ({ deadlines: [...state.deadlines, newDeadline] }));
      }
    } catch (error) {
      console.error('Error adding deadline:', error);
    }
  },

  updateDeadline: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('deadlines')
        .update({
          title: updates.title,
          description: updates.description,
          due_date: updates.dueDate?.toISOString(),
          category: updates.category,
          priority: updates.priority,
          is_completed: updates.isCompleted,
        })
        .eq('id', id);

      if (!error) {
        set(state => ({
          deadlines: state.deadlines.map(deadline =>
            deadline.id === id ? { ...deadline, ...updates } : deadline
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating deadline:', error);
    }
  },

  deleteDeadline: async (id) => {
    try {
      const { error } = await supabase
        .from('deadlines')
        .delete()
        .eq('id', id);

      if (!error) {
        set(state => ({
          deadlines: state.deadlines.filter(deadline => deadline.id !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting deadline:', error);
    }
  },

  loadDeadlines: async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    let deadlines: Deadline[] = [];

    if (!error && data && data.length > 0) {
      deadlines = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        dueDate: new Date(item.due_date),
        category: item.category as any,
        priority: item.priority as any,
        isCompleted: item.is_completed,
        createdAt: new Date(item.created_at),
      }));
    } else {
      // Default deadlines if none exist
      const today = new Date();
      const defaults = [
        {
    title: 'USMLE Step 1 Prep',
    description: 'Start daily Qbank and First Aid review',
    due_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Study',
    priority: 'High',
    is_completed: false,
  },
  {
    title: 'NEET PG 2025 Mock',
    description: 'Finish Grand Test 1 and analyze errors',
    due_date: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Exam',
    priority: 'High',
    is_completed: false,
  },
  {
    title: 'PLAB 1 Final Review',
    description: 'Revise guidelines and high-yield topics',
    due_date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Exam',
    priority: 'High',
    is_completed: false,
  },
  {
    title: 'AMC CAT Practice',
    description: 'Complete 2 full-length timed mock exams',
    due_date: new Date(today.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Study',
    priority: 'Medium',
    is_completed: false,
  },
  {
    title: 'Global Medical Hackathon Submission',
    description: 'Submit prototype, pitch deck, and video demo',
    due_date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Competition',
    priority: 'High',
    is_completed: false,
  },
  {
    title: 'Case Competition Final',
    description: 'Polish slides and rehearse final pitch',
    due_date: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Competition',
    priority: 'Medium',
    is_completed: false,
  },
  {
    title: 'MCCQE Part I Prep',
    description: 'Start reviewing ethics and communication skills section',
    due_date: new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Study',
    priority: 'Medium',
    is_completed: false,
  },
  {
    title: 'FMGE Revision Block 1',
    description: 'Finish 1st half of Rapid Revision notes',
    due_date: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Study',
    priority: 'High',
    is_completed: false,
  }
      ];

      for (const d of defaults) {
        await supabase.from('deadlines').insert({ user_id: user.id, ...d });
      }

      deadlines = defaults.map((d, i) => ({
        id: `default-${i}`,
        title: d.title,
        description: d.description,
        dueDate: new Date(d.due_date),
        category: d.category as any,
        priority: d.priority as any,
        isCompleted: d.is_completed,
        createdAt: new Date(),
      }));
    }

    set({ deadlines });
  } catch (error) {
    console.error('Error loading deadlines:', error);
  }
},


  addMnemonic: async (mnemonic) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mnemonics')
        .insert({
          user_id: user.id,
          term: mnemonic.term,
          mnemonic: mnemonic.mnemonic,
          explanation: mnemonic.explanation,
          category: mnemonic.category,
          tags: mnemonic.tags,
          is_custom: mnemonic.isCustom,
        })
        .select()
        .single();

      if (!error && data) {
        const newMnemonic: Mnemonic = {
          id: data.id,
          term: data.term,
          mnemonic: data.mnemonic,
          explanation: data.explanation || '',
          category: data.category,
          tags: data.tags,
          isCustom: data.is_custom,
          createdAt: new Date(data.created_at),
        };
        
        set(state => ({ mnemonics: [...state.mnemonics, newMnemonic] }));
      }
    } catch (error) {
      console.error('Error adding mnemonic:', error);
    }
  },

  generateMnemonic: (term: string) => {
    // Mock AI mnemonic generation
    const templates = [
      `Remember ${term} with: "Medical Students Always Remember Perfect Examples"`,
      `${term} mnemonic: "Doctors Never Forget Important Medical Knowledge"`,
      `Use this for ${term}: "Students Practice Medicine With Great Dedication"`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  },

  
loadMnemonics: async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('mnemonics')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.eq.00000000-0000-0000-0000-000000000000`)
      .order('created_at', { ascending: false });

    let mnemonics: Mnemonic[] = [];

    if (!error && data && data.length > 0) {
      mnemonics = data.map(item => ({
        id: item.id,
        term: item.term,
        mnemonic: item.mnemonic,
        explanation: item.explanation || '',
        category: item.category,
        tags: item.tags,
        isCustom: item.is_custom,
        createdAt: new Date(item.created_at),
      }));
    } else {
      // Defaults if none exist
      const defaults = [
        {
          term: 'Cranial Nerves',
          mnemonic: 'On Old Olympus Towering Tops A Finn And German Viewed Some Hops',
          explanation: 'Mnemonic for the 12 cranial nerves in order: Olfactory, Optic, Oculomotor, Trochlear, Trigeminal, Abducens, Facial, Auditory/Vestibulocochlear, Glossopharyngeal, Vagus, Spinal Accessory, Hypoglossal',
          category: 'Neurology',
          tags: ['anatomy', 'nerves'],
          is_custom: false
        },
        {
          term: 'Carpal Bones',
          mnemonic: 'Some Lovers Try Positions That They Can\'t Handle',
          explanation: 'Mnemonic for carpal bones: Scaphoid, Lunate, Triquetrum, Pisiform, Trapezium, Trapezoid, Capitate, Hamate',
          category: 'Anatomy',
          tags: ['bones', 'upper limb'],
          is_custom: false
        },
        {
          term: 'Heart Valve Auscultation Points',
          mnemonic: 'All Patients Take Medicine',
          explanation: 'Aortic, Pulmonic, Tricuspid, Mitral locations',
          category: 'Cardiology',
          tags: ['physical exam', 'auscultation'],
          is_custom: false
        },
        {
          term: 'Thyroid Symptoms',
          mnemonic: 'SWEATING',
          explanation: 'Sweating, Weight loss, Emotional lability, Appetite, Tremor, Irritability, Nervousness, Goiter',
          category: 'Endocrinology',
          tags: ['hyperthyroidism', 'symptoms'],
          is_custom: false
        },
        {
          term: 'Risk Factors for Deep Vein Thrombosis',
          mnemonic: 'VIRCHOW',
          explanation: 'Venous stasis, Injury, Reduced flow, Congenital, Hypercoagulability, Obstruction, Women',
          category: 'Hematology',
          tags: ['dvt', 'risk factors'],
          is_custom: false
        },
        {
          term: 'Tarsal Bones',
          mnemonic: 'Tall Centers Never Take Shots From Corners',
          explanation: 'Talus, Calcaneus, Navicular, Cuneiforms, Cuboid',
          category: 'Anatomy',
          tags: ['bones', 'lower limb'],
          is_custom: false
        },
        {
          term: 'Liver Function Tests',
          mnemonic: 'GET LIPID',
          explanation: 'Gamma GT, Enzymes, Total protein, LDH, INR, Platelets, Immunoglobulins, Direct bilirubin',
          category: 'Gastroenterology',
          tags: ['lft', 'blood tests'],
          is_custom: false
        },
        {
          term: 'Causes of Pancreatitis',
          mnemonic: 'I GET SMASHED',
          explanation: 'Idiopathic, Gallstones, Ethanol, Trauma, Steroids, Mumps, Autoimmune, Scorpion sting, Hyperlipidemia/calcemia, ERCP, Drugs',
          category: 'Gastroenterology',
          tags: ['pancreatitis', 'etiology'],
          is_custom: false
        },
        {
          term: 'Heart Murmurs',
          mnemonic: 'MR PASS MVP',
          explanation: 'Mitral Regurgitation, Physiologic, Aortic Stenosis, Systolic. MVP is Mitral Valve Prolapse.',
          category: 'Cardio',
          tags: ['murmurs', 'cardiology'],
          is_custom: false,
        },
        {
          term: 'Causes of Anion Gap Metabolic Acidosis',
          mnemonic: 'MUDPILES',
          explanation: 'Methanol, Uremia, DKA, Propylene glycol, Iron/Isoniazid, Lactic acidosis, Ethylene glycol, Salicylates',
          category: 'Pathology',
          tags: ['acid-base', 'metabolism'],
          is_custom: false,
        },
      ];

      for (const m of defaults) {
        await supabase.from('mnemonics').insert({ user_id: user.id, ...m });
      }

      mnemonics = defaults.map((m, i) => ({
        id: `default-${i}`,
        term: m.term,
        mnemonic: m.mnemonic,
        explanation: m.explanation,
        category: m.category,
        tags: m.tags,
        isCustom: m.is_custom,
        createdAt: new Date(),
      }));
    }

    set({ mnemonics });
  } catch (error) {
    console.error('Error loading mnemonics:', error);
  }
},


  startStudySession: async (type) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return '';

      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          session_type: type,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        const newSession: StudySession = {
          id: data.id,
          type: data.session_type as any,
          startTime: new Date(data.start_time),
          endTime: new Date(),
          correct: 0,
          incorrect: 0,
          totalQuestions: 0,
        };
        
        set(state => ({ studySessions: [...state.studySessions, newSession] }));
        return data.id;
      }
    } catch (error) {
      console.error('Error starting study session:', error);
    }
    
    return '';
  },

  endStudySession: async (id, correct, incorrect) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: new Date().toISOString(),
          correct_answers: correct,
          incorrect_answers: incorrect,
          total_questions: correct + incorrect,
        })
        .eq('id', id);

      if (!error) {
        set(state => ({
          studySessions: state.studySessions.map(session =>
            session.id === id
              ? {
                  ...session,
                  endTime: new Date(),
                  correct,
                  incorrect,
                  totalQuestions: correct + incorrect,
                }
              : session
          ),
        }));
      }
    } catch (error) {
      console.error('Error ending study session:', error);
    }
  },

  loadAllData: async () => {
    const { loadFlashcards, loadDeadlines, loadMnemonics } = get();
    await Promise.all([
      loadFlashcards(),
      loadDeadlines(),
      loadMnemonics(),
    ]);
  },
}));