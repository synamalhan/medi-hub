import { PatientCase, Diagnosis, Demographics } from '../types';

// Helper functions for random generation
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomSubset = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Data for random generation
const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 
  'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah',
  'Thomas', 'Karen', 'Charles', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Margaret',
  'Matthew', 'Betty', 'Anthony', 'Sandra', 'Mark', 'Ashley', 'Donald', 'Dorothy',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter'
];

const races = [
  'White', 'Black or African American', 'Asian', 'Hispanic or Latino',
  'American Indian or Alaska Native', 'Native Hawaiian or Other Pacific Islander',
  'Middle Eastern or North African', 'Two or More Races'
];

const occupations = [
  'Teacher', 'Software Developer', 'Nurse', 'Construction Worker', 'Chef',
  'Sales Representative', 'Accountant', 'Electrician', 'Student', 'Retired',
  'Mechanic', 'Doctor', 'Artist', 'Police Officer', 'Lawyer', 'Unemployed',
  'Retail Worker', 'Truck Driver', 'Engineer', 'Marketing Manager', 'Janitor',
  'Office Assistant', 'Waiter/Waitress', 'Business Owner', 'Graphic Designer'
];

const allergies = [
  'Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Shellfish', 'Peanuts',
  'Tree nuts', 'Eggs', 'Milk', 'Wheat', 'Soy', 'Fish', 'Latex', 'Contrast dye',
  'Bee stings', 'Pollen', 'Dust mites', 'Mold', 'Pet dander', 'Grass'
];

const medications = [
  'Lisinopril', 'Atorvastatin', 'Levothyroxine', 'Metformin', 'Amlodipine',
  'Metoprolol', 'Omeprazole', 'Albuterol', 'Gabapentin', 'Hydrochlorothiazide',
  'Sertraline', 'Simvastatin', 'Losartan', 'Fluticasone', 'Montelukast',
  'Escitalopram', 'Furosemide', 'Pantoprazole', 'Tramadol', 'Prednisone'
];

const pastMedicalConditions = [
  'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Hyperlipidemia', 'Depression',
  'Anxiety Disorder', 'GERD', 'Osteoarthritis', 'Hypothyroidism', 'COPD',
  'Heart Attack', 'Stroke', 'Cancer', 'Kidney Disease', 'Chronic Pain',
  'Migraines', 'Fibromyalgia', 'Osteoporosis', 'Rheumatoid Arthritis', 'Sleep Apnea'
];

const familyHistoryConditions = [
  'Heart Disease', 'Diabetes', 'Hypertension', 'Stroke', 'Cancer',
  'Alzheimer\'s Disease', 'Parkinson\'s Disease', 'Rheumatoid Arthritis',
  'Asthma', 'Depression', 'Bipolar Disorder', 'Schizophrenia', 'Multiple Sclerosis',
  'Kidney Disease', 'Hemophilia', 'Cystic Fibrosis', 'Sickle Cell Anemia',
  'Huntington\'s Disease', 'Osteoporosis', 'Autoimmune Disorders'
];

const primarySymptoms = [
  'Chest pain', 'Shortness of breath', 'Abdominal pain', 'Headache', 'Back pain',
  'Fever', 'Cough', 'Fatigue', 'Nausea', 'Vomiting', 'Diarrhea', 'Dizziness',
  'Joint pain', 'Rash', 'Swelling', 'Bleeding', 'Weight loss', 'Loss of appetite',
  'Difficulty swallowing', 'Vision changes', 'Hearing loss', 'Numbness', 'Weakness',
  'Seizures', 'Tremors', 'Memory problems', 'Mood changes', 'Sleep disturbances'
];

const secondarySymptoms = [
  'Sweating', 'Chills', 'Palpitations', 'Muscle aches', 'Itching', 'Dry mouth',
  'Excessive thirst', 'Frequent urination', 'Constipation', 'Bloating', 'Heartburn',
  'Sore throat', 'Runny nose', 'Ear pain', 'Eye redness', 'Blurred vision',
  'Balance problems', 'Confusion', 'Anxiety', 'Irritability', 'Difficulty concentrating',
  'Swollen lymph nodes', 'Sneezing', 'Wheezing', 'Hoarseness', 'Bruising', 'Hair loss'
];

const durations = [
  '1 day', '2 days', '3 days', 'About a week', 'Several days', 
  '2 weeks', '3 weeks', 'About a month', 'Several months', 
  'Over 6 months', 'About a year', 'Several years'
];

const emotionalStates = ['Anxious', 'Calm', 'Irritable', 'Confused', 'Distressed'];

const chiefComplaints = [
  'Chest pain', 'Difficulty breathing', 'Severe headache', 'Abdominal pain',
  'Back pain', 'Dizziness', 'Persistent cough', 'Fever', 'Joint pain',
  'Nausea and vomiting', 'Fatigue', 'Rash', 'Numbness', 'Weakness',
  'Vision changes', 'Hearing problems', 'Swelling', 'Weight loss',
  'Memory problems', 'Mood changes', 'Sleep issues', 'Heart palpitations'
];

const diagnoses = [
  {
    condition: 'Acute Appendicitis',
    description: 'Inflammation of the appendix causing severe abdominal pain',
    differentials: ['Gastroenteritis', 'Mesenteric Adenitis', 'Ovarian Cyst'],
    treatment: 'Emergency appendectomy',
    prognosis: 'Excellent with early intervention'
  },
  {
    condition: 'Community-Acquired Pneumonia',
    description: 'Infection of the lungs acquired outside of healthcare settings',
    differentials: ['Bronchitis', 'COVID-19', 'Influenza'],
    treatment: 'Antibiotics, rest, and supportive care',
    prognosis: 'Good with appropriate treatment'
  },
  {
    condition: 'Migraine',
    description: 'Severe headache often accompanied by sensitivity to light and sound',
    differentials: ['Tension Headache', 'Cluster Headache', 'Sinusitis'],
    treatment: 'Triptans, preventive medications, lifestyle modifications',
    prognosis: 'Manageable with proper treatment plan'
  },
  {
    condition: 'Acute Bronchitis',
    description: 'Inflammation of the bronchial tubes causing cough',
    differentials: ['Pneumonia', 'Asthma', 'COPD Exacerbation'],
    treatment: 'Supportive care, bronchodilators if needed',
    prognosis: 'Usually resolves within 2-3 weeks'
  },
  {
    condition: 'Gastroesophageal Reflux Disease (GERD)',
    description: 'Chronic acid reflux causing heartburn and chest pain',
    differentials: ['Angina', 'Esophagitis', 'Peptic Ulcer'],
    treatment: 'Proton pump inhibitors, lifestyle modifications',
    prognosis: 'Manageable with medication and lifestyle changes'
  }
];

const generateNarrative = (
  demographics: PatientCase['demographics'],
  symptoms: PatientCase['symptoms'],
  chiefComplaint: string,
  emotionalState: PatientCase['emotionalState']
): string[] => {
  const personaType = Math.floor(Math.random() * 3); // 0 = standard, 1 = confused, 2 = condescending
  switch (personaType) {
    case 0:
      return generateStandardNarrative(demographics, symptoms, chiefComplaint, emotionalState);
    case 1:
      return generateConfusedNarrative(demographics, symptoms, chiefComplaint, emotionalState);
    case 2:
      return generateCondescendingNarrative(demographics, symptoms, chiefComplaint, emotionalState);
    default:
      return generateStandardNarrative(demographics, symptoms, chiefComplaint, emotionalState);
  }
};

const generateStandardNarrative = (
  demographics: PatientCase['demographics'],
  symptoms: PatientCase['symptoms'],
  chiefComplaint: string,
  emotionalState: PatientCase['emotionalState']
): string[] => {
  const { firstName, age, gender, occupation } = demographics;
  const { primary, secondary, duration, severity } = symptoms;

  return [
    `Hi, I'm ${firstName}. I'm a ${age}-year-old ${occupation}.`,
    `I've been feeling ${emotionalState.toLowerCase()} lately because of my ${chiefComplaint.toLowerCase()}.`,
    `It started around ${duration} ago and it's been ${severity.toLowerCase()}.`,
    `The main thing that's bothering me is ${primary[0].toLowerCase()}.`,
    secondary.length > 0 ? `I'm also noticing ${secondary.join(', ')}.` : `There aren't really any other symptoms.`,
    `It's been affecting my ability to do my job as a ${occupation}.`,
    `I haven't taken any medication for it yet.`,
    `I'm here because I want to figure out what's going on and how to treat it.`
  ];
};

const toneWords = {
  'Anxious': ['worried', 'nervous', 'concerned', 'anxious', 'fearful'],
  'Irritable': ['annoyed', 'irritated', 'frustrated', 'bothered', 'upset'],
  'Confused': ['confused', 'unsure', 'disoriented', 'uncertain', 'perplexed'],
  'Distressed': ['distressed', 'suffering', 'uncomfortable', 'pained', 'troubled']
} as const;

const generateConfusedNarrative = (
  demographics: PatientCase['demographics'],
  symptoms: PatientCase['symptoms'],
  chiefComplaint: string,
  emotionalState: PatientCase['emotionalState']
): string[] => {
  const { firstName, age, gender, occupation } = demographics;
  const { primary, secondary, duration, severity } = symptoms;

  const tone =
    emotionalState === 'Calm'
      ? 'calm'
      : getRandomElement(
          Array.from(
            toneWords[
              emotionalState as keyof typeof toneWords
            ]
          )
        );
  return [
    `So, um, I think my name's ${firstName}? Anyway, I've been feeling kind of… ${tone}, I guess. It's been ${duration}, maybe longer, hard to say.`,
    `It started... I think during a work call? Or maybe before that. At first it wasn't a big deal. But now it's, like, ${severity.toLowerCase()}.`,
    `The main issue is ${primary[0].toLowerCase()}, I think? Though sometimes it's also ${primary[1] || 'something else'}? Hard to keep track.`,
    secondary.length > 0 ? `Also I've had ${secondary.join(', maybe ')}... or I'm just imagining it.` : `I think that's it? Unless I forgot something.`,
    `I'm a ${occupation} and it's been messing with that, kind of? Like, I space out or just forget why I opened an email.`,
    `My roommate said I should come in. Or maybe it was my mom. I dunno. I wasn't gonna but here I am.`,
    `I tried ibuprofen? Or was it paracetamol. I took something. Didn't really help.`,
    `Anyway... yeah. So that's been going on.`
  ];
};

const generateCondescendingNarrative = (
  demographics: PatientCase['demographics'],
  symptoms: PatientCase['symptoms'],
  chiefComplaint: string,
  emotionalState: PatientCase['emotionalState']
): string[] => {
  const { firstName, age, gender, occupation } = demographics;
  const { primary, secondary, duration, severity } = symptoms;

  return [
    `Okay, so I've done a lot of reading on this already. I'm ${firstName}, ${age}, and I'm a ${occupation}, so I know how to research.`,
    `I'm almost certain it's ${chiefComplaint.toLowerCase()} — everything matches. I found multiple articles and a couple Reddit threads that describe it exactly.`,
    `It started around ${duration} ago. Since then it's been ${severity.toLowerCase()} but I've been managing it myself… mostly.`,
    `The primary symptom is ${primary[0].toLowerCase()}. I know it could be ${getRandomElement(['an autoimmune issue', 'a nerve thing', 'a hormonal imbalance'])}, but I'm leaning toward ${chiefComplaint.toLowerCase()}.`,
    secondary.length > 0 
      ? `There's also ${secondary.join(', ')} — which I know can happen with this condition.` 
      : `Not much else, really. I'm pretty sure those are the key symptoms.`,
    `I've been tracking everything in an app, including sleep, diet, and stress levels. It's all pointing to the same thing.`,
    `Honestly, I just need you to confirm it with a test or scan. I've already narrowed it down.`,
    `No offense, but I probably know more about this specific thing than most people — I've been obsessing over it for weeks.`
  ];
};

// Main generator function
export const generatePatientCase = (): PatientCase => {
  const gender = getRandomElement(['Male', 'Female', 'Non-binary']) as 'Male' | 'Female' | 'Non-binary';
  const firstName = getRandomElement(gender === 'Male' ? 
    firstNames.filter((_, i) => i % 2 === 0) : 
    firstNames.filter((_, i) => i % 2 === 1)
  );
  
  const age = getRandomInt(18, 85);
  const emotionalState = getRandomElement(emotionalStates) as PatientCase['emotionalState'];
  const chiefComplaint = getRandomElement(chiefComplaints);
  
  // Build demographics
  const demographics = {
    firstName,
    lastName: getRandomElement(lastNames),
    age,
    gender,
    race: getRandomElement(races),
    occupation: getRandomElement(occupations)
  };
  
  // Build medical profile
  const hasAllergies = Math.random() > 0.5;
  const hasMedications = Math.random() > 0.3;
  const hasPastHistory = Math.random() > 0.3;
  const hasFamilyHistory = Math.random() > 0.4;
  
  const medicalProfile = {
    allergies: hasAllergies ? getRandomSubset(allergies, getRandomInt(1, 3)) : [],
    medications: hasMedications ? getRandomSubset(medications, getRandomInt(1, 4)) : [],
    pastHistory: hasPastHistory ? getRandomSubset(pastMedicalConditions, getRandomInt(1, 3)) : [],
    familyHistory: hasFamilyHistory ? getRandomSubset(familyHistoryConditions, getRandomInt(1, 3)) : []
  };
  
  // Build symptoms
  const primarySymptomCount = getRandomInt(1, 3);
  const secondarySymptomCount = getRandomInt(0, 4);
  const symptoms = {
    primary: getRandomSubset(primarySymptoms, primarySymptomCount),
    secondary: getRandomSubset(secondarySymptoms, secondarySymptomCount),
    duration: getRandomElement(durations),
    severity: getRandomElement(['Mild', 'Moderate', 'Severe']) as 'Mild' | 'Moderate' | 'Severe'
  };
  
  // Generate narrative
  const narrative = generateNarrative(demographics, symptoms, chiefComplaint, emotionalState);

  // Generate diagnosis
  const diagnosis = getRandomElement(diagnoses) as Diagnosis;
  
  return {
    id: Math.random().toString(36).substring(2, 15),
    demographics,
    medicalProfile,
    symptoms,
    chiefComplaint,
    narrative,
    narrativeDuration: 60,
    emotionalState,
    diagnosis
  };
};

// Voice selection based on demographics
export const getVoiceId = (demographics: Demographics): string => {
  const { gender, age } = demographics;
  
  // Map to ElevenLabs voice IDs based on demographics
  if (gender === 'Female') {
    return age > 65 ? 'pNInz6obpgDQGcFmaJgB' : 'EXAVITQu4vr4xnSDxMaL';
  } else {
    return age > 65 ? '2EiwWnXFnvU5JabPnv8n' : 'ErXwobaYiN019PkySvjV';
  }
};