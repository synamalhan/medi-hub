import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Play, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  User, 
  Heart, 
  Thermometer,
  Activity,
  Zap,
  Eye,
  Brain,
  Pause,
  Square, 
  Calendar,
  Globe,
  Briefcase,
  FileText,
  AlertTriangle,
  AlertCircle,
  Pill,
  Clock, Users
} from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { playGeneratedSpeech } from '../lib/elevenlabs';
import toast from 'react-hot-toast';
import { getVoiceId } from '../lib/patientGenerator';

const PatientSimulator: React.FC = () => {
  const { currentCase, generateNewCase, submitDiagnosis } = useDataStore();
  const [userDiagnosis, setUserDiagnosis] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState<'interview' | 'examination' | 'diagnosis'>('interview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentNarrativeIndex, setCurrentNarrativeIndex] = useState(0);

  useEffect(() => {
    if (!currentCase) {
      generateNewCase();
    }
    //console.log('Current Case:', currentCase);
  }, [currentCase, generateNewCase]);

  const handleSubmitDiagnosis = async () => {
  //console.log('Submitting diagnosis:', userDiagnosis); // Debug log
  
  if (!userDiagnosis.trim()) {
    //console.log('Empty diagnosis submitted'); // Debug log
    toast.error('Please enter your diagnosis');
    return;
  }

  if (!currentCase) {
    //console.log('No current case found'); // Debug log
    toast.error('No patient case loaded');
    return;
  }

  try {
    //console.log('Current case diagnosis:', currentCase.diagnosis); // Debug log
    const correct = await submitDiagnosis(userDiagnosis);
    //console.log('Diagnosis result:', correct); // Debug log
    
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      toast.success('Correct diagnosis! Well done!');
    } else {
      toast.error(`Incorrect diagnosis. The correct diagnosis is ${currentCase.diagnosis.condition}`);
    }
  } catch (error) {
    console.error('Error submitting diagnosis:', error);
    toast.error('Failed to submit diagnosis. Please try again.');
  }
};

  const handleNewCase = () => {
    generateNewCase();
    setUserDiagnosis('');
    setShowResult(false);
    setCurrentStep('interview');
    setCurrentNarrativeIndex(0);
    stopAudio();
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  };

  const playNarrative = async (text: string) => {
    if (!isVoiceEnabled || !currentCase) return;

    try {
      stopAudio(); // Stop any currently playing audio
      setIsPlaying(true);

      const voiceId = getVoiceId(currentCase.demographics);
      const audio = await playGeneratedSpeech(text, voiceId);
      
      setCurrentAudio(audio);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      });

      audio.addEventListener('error', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        toast.error('Error playing audio');
      });

    } catch (error) {
      console.error('Error playing narrative:', error);
      setIsPlaying(false);
      toast.error('Voice synthesis not available');
    }
  };

  const playCurrentNarrative = () => {
    if (currentCase && currentCase.narrative[currentNarrativeIndex]) {
      playNarrative(currentCase.narrative[currentNarrativeIndex]);
    }
  };

  const nextNarrative = () => {
    if (currentCase && currentNarrativeIndex < currentCase.narrative.length - 1) {
      setCurrentNarrativeIndex(currentNarrativeIndex + 1);
      stopAudio();
    }
  };

  const prevNarrative = () => {
    if (currentNarrativeIndex > 0) {
      setCurrentNarrativeIndex(currentNarrativeIndex - 1);
      stopAudio();
    }
  };

  if (!currentCase) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-pulse" />
          <p className="text-gray-600">Loading patient case...</p>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Patient Simulator</h1>
          <p className="text-gray-600">Practice clinical reasoning with virtual patients</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`p-3 rounded-lg transition-colors ${
              isVoiceEnabled 
                ? 'bg-primary-100 text-primary-600' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleNewCase}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Case</span>
          </button>
        </div>
      </motion.div>

      {/* Case Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex space-x-1 bg-gray-100 p-1 rounded-lg"
      >
        {[
          { key: 'interview', label: 'Patient Interview', icon: User },
          { key: 'examination', label: 'Physical Exam', icon: Stethoscope },
          { key: 'diagnosis', label: 'Diagnosis', icon: Brain },
        ].map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.key}
              onClick={() => setCurrentStep(step.key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                currentStep === step.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{step.label}</span>
            </button>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Patient Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Patient Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentCase.demographics.firstName} {currentCase.demographics.lastName}
                  </h2>
                  <p className="text-gray-600">
                    {currentCase.demographics.age} years old, {currentCase.demographics.gender}, {currentCase.demographics.race}
                  </p>
                  <p className="text-sm text-gray-500">{currentCase.demographics.occupation}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[currentCase.difficulty || 'medium']}`}>
                  {currentCase.difficulty || 'medium'}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {currentCase.category || 'General'}
                </span>
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Chief Complaint</h3>
              <p className="text-blue-800">"{currentCase.chiefComplaint}"</p>
            </div>

            {/* Step Content */}
            {currentStep === 'interview' && (
              <div className="space-y-6">
                {/* Patient Narrative */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Patient Interview</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {currentNarrativeIndex + 1} of {currentCase.narrative.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-gray-800 leading-relaxed">
                      {currentCase.narrative[currentNarrativeIndex]}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={prevNarrative}
                        disabled={currentNarrativeIndex === 0}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ←
                      </button>
                      <button
                        onClick={nextNarrative}
                        disabled={currentNarrativeIndex === currentCase.narrative.length - 1}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        →
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isVoiceEnabled && (
                        <>
                          {isPlaying ? (
                            <button
                              onClick={stopAudio}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Square className="w-4 h-4" />
                              <span>Stop</span>
                            </button>
                          ) : (
                            <button
                              onClick={playCurrentNarrative}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <Play className="w-4 h-4" />
                              <span>Listen</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Allergies</h4>
                      {currentCase.medicalProfile.allergies.length > 0 ? (
                        currentCase.medicalProfile.allergies.map((allergy, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                            <span className="text-red-700">{allergy}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No known allergies</p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Current Medications</h4>
                      {currentCase.medicalProfile.medications.length > 0 ? (
                        currentCase.medicalProfile.medications.map((medication, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                            <span className="text-blue-700">{medication}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No current medications</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'examination' && (
  <div className="space-y-6">
    {/* Patient Demographics Section */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Demographics</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">Name</span>
          </div>
          <span className="flex text-right text-gray-900 font-semibold">
            {currentCase.demographics.firstName} {currentCase.demographics.lastName}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">Age</span>
          </div>
          <span className="flex text-right text-gray-900 ">{currentCase.demographics.age}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">Gender</span>
          </div>
          <span className="flex text-right text-gray-900">{currentCase.demographics.gender}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">Race</span>
          </div>
          <span className="flex text-right text-gray-900">{currentCase.demographics.race}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">Occupation</span>
          </div>
          <span className="flex text-right text-gray-900">{currentCase.demographics.occupation}</span>
        </div>
      </div>
    </div>

    {/* Medical History Section */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
      <div className="grid md:grid-cols-2 gap-4">
        
        {currentCase.medicalProfile.pastHistory.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-green-500" />
              <span className="font-medium text-gray-700">Past Medical History</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentCase.medicalProfile.pastHistory.map((condition, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {condition}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {currentCase.medicalProfile.familyHistory.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-700">Family History</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentCase.medicalProfile.familyHistory.map((condition, index) => (
                <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  {condition}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Symptoms Section */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptoms</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-gray-700">Chief Complaint</span>
          </div>
          <p className="text-gray-900">{currentCase.chiefComplaint}</p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700">Duration</span>
          </div>
          <p className="text-gray-900">{currentCase.symptoms.duration}</p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-red-500" />
            <span className="font-medium text-gray-700">Primary Symptoms</span>
          </div>
          <div className="space-y-1">
            {currentCase.symptoms.primary.map((symptom, index) => (
              <div key={index} className="flex items-start">
                <span className="text-gray-900">• {symptom}</span>
              </div>
            ))}
          </div>
        </div>
        
        {currentCase.symptoms.secondary.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-gray-700">Secondary Symptoms</span>
            </div>
            <div className="space-y-1">
              {currentCase.symptoms.secondary.map((symptom, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-gray-900">• {symptom}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

  </div>
)}

            {currentStep === 'diagnosis' && (
              <div className="space-y-6">
                {!showResult ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Your Diagnosis</h3>
                    <textarea
                      value={userDiagnosis}
                      onChange={(e) => setUserDiagnosis(e.target.value)}
                      placeholder="Based on the patient's presentation, symptoms, and examination findings, what is your diagnosis?"
                      className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handleSubmitDiagnosis}
                      className="mt-4 btn-primary flex items-center space-x-2"
                    >
                      <Brain className="w-4 h-4" />
                      <span>Submit Diagnosis</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          isCorrect ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {isCorrect ? 'Correct Diagnosis!' : 'Incorrect Diagnosis'}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Your diagnosis: {userDiagnosis}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Correct Diagnosis</h4>
                      <p className="text-blue-800 font-medium mb-3">{currentCase.diagnosis.condition}</p>
                      <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                      <p className="text-blue-700 text-sm leading-relaxed">{currentCase.diagnosis.description}</p>
                      
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-blue-900">Treatment</h4>
                        <p className="text-blue-700 text-sm">{currentCase.diagnosis.treatment}</p>
                        
                        <h4 className="font-semibold text-blue-900">Prognosis</h4>
                        <p className="text-blue-700 text-sm">{currentCase.diagnosis.prognosis}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Side Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Stats
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cases Completed</span>
                <span className="font-semibold text-gray-900">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Accuracy Rate</span>
                <span className="font-semibold text-green-600">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time per Case</span>
                <span className="font-semibold text-gray-900">8m 30s</span>
              </div>
            </div>
          </div> */}

          {/* Tips */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Reasoning Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Consider the patient's age, gender, and risk factors
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Look for patterns in symptoms and physical findings
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Think about the most common diagnoses first
                </p>
              </div>
            </div>
          </div>

          {/* Patient Avatar */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient</h3>
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-16 h-16 text-blue-500" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {currentCase.demographics.firstName} {currentCase.demographics.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {currentCase.demographics.age} years old • {currentCase.demographics.occupation}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientSimulator;