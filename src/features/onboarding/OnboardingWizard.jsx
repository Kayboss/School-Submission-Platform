import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { GraduationCap, ArrowRight, ArrowLeft, CheckCircle, ClipboardList } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.main};
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 2px 2px, ${({ theme }) => theme.colors.primary}10 1px, transparent 0);
    background-size: 24px 24px;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 80%;
    height: 150%;
    background: radial-gradient(circle, ${({ theme }) => theme.colors.secondary}15 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(100px);
  }
`;

const Card = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 640px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.premium};
  border: 1px solid rgba(179, 90, 56, 0.1);
  padding: 2.5rem;
  animation: ${fadeIn} 0.5s ease;

  @media (max-width: 520px) {
    padding: 1.5rem;
  }
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 2rem;
`;

const ProgressDot = styled.div`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${({ $active, $done, theme }) =>
    $done ? theme.colors.primary :
    $active ? theme.colors.secondary :
    theme.colors.border};
  transition: all 0.4s ease;
`;

const StepContent = styled.div`
  animation: ${slideIn} 0.35s ease;
`;

const IntroLogo = styled.div`
  width: 72px;
  height: 72px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
`;

const SectionBadge = styled.div`
  display: inline-block;
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.main};
  text-align: center;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const IntroText = styled.p`
  color: #55433c;
  font-size: 0.9rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const QuestionGroup = styled.div`
  margin-bottom: 1.75rem;
`;

const QuestionLabel = styled.p`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.75rem;
`;

const OptionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OptionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border: 1.5px solid ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border + '60'};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ $selected, theme }) => $selected ? theme.colors.primary + '10' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.main};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}08;
  }
`;

const Radio = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'};
    transition: all 0.2s ease;
  }
`;

const LikertTable = styled.div`
  overflow-x: auto;
  margin-bottom: 1.5rem;
`;

const LikertRow = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}30;
  gap: 0.5rem;

  &:last-child { border-bottom: none; }
`;

const LikertStatement = styled.p`
  flex: 1;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.main};
  min-width: 180px;
`;

const LikertOptions = styled.div`
  display: flex;
  gap: 4px;
`;

const LikertBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border + '60'};
  background: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'white'};
  color: ${({ $selected }) => $selected ? 'white' : '#55433c'};
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const LikertHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  margin-bottom: 0.25rem;
  gap: 0.5rem;
`;

const LikertHeaderLabel = styled.span`
  flex: 1;
  min-width: 180px;
`;

const LikertHeaderOptions = styled.div`
  display: flex;
  gap: 4px;
`;

const LikertHeaderCell = styled.span`
  width: 36px;
  text-align: center;
  font-size: 0.65rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const BackBtn = styled.button`
  flex: 0 0 auto;
  padding: 0.85rem 1.5rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: white;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.muted};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NextBtn = styled.button`
  flex: 1;
  padding: 0.85rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme, $disabled }) => $disabled ? theme.colors.border : theme.colors.primary};
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  box-shadow: ${({ $disabled, theme }) => $disabled ? 'none' : `0 6px 16px ${theme.colors.primary}40`};

  &:hover {
    transform: ${({ $disabled }) => $disabled ? 'none' : 'translateY(-2px)'};
  }
`;

const CheckIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4a7c59;
  color: white;
  margin: 0 auto 1.5rem;
`;

const CompletionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.main};
  text-align: center;
  margin-bottom: 0.75rem;
`;

const CompletionText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const GoToDashBtn = styled.button`
  display: block;
  width: 100%;
  padding: 0.95rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 8px 20px ${({ theme }) => theme.colors.primary}40;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const STEPS = ['intro', 'sectionA', 'sectionB', 'sectionC', 'done'];

const LIKERT_STATEMENTS = [
  'Flash drives are my main storage device.',
  'I frequently worry about losing my files.',
  'Managing multiple assignment files is difficult.',
  'Retrieving previously submitted assignments is difficult.',
  'Buying flash drives increases my academic expenses.',
  'CD submission is no longer practical.',
  'There is no centralized repository for students\' work.',
  'Existing submission methods are inefficient.',
  'I would prefer an online submission system.',
  'A centralized online repository would improve academic work management.',
];

const LIKERT_LABELS = ['SA', 'A', 'N', 'D', 'SD'];

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.addToast);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [answers, setAnswers] = useState({
    gender: '',
    age: '',
    level: '',
    submissionFrequency: '',
    storageMethod: '',
    submissionMethod: '',
    lostAssignment: '',
    corruptedFlash: '',
    unableRetrieve: '',
    ...Object.fromEntries(LIKERT_STATEMENTS.map((_, i) => [`likert_${i}`, ''])),
  });

  const set = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));

  const currentStep = STEPS[step];

  const canProceed = () => {
    if (currentStep === 'intro') return true;
    if (currentStep === 'sectionA') {
      return answers.gender && answers.age && answers.level && answers.submissionFrequency;
    }
    if (currentStep === 'sectionB') {
      return answers.storageMethod && answers.submissionMethod &&
        answers.lostAssignment && answers.corruptedFlash && answers.unableRetrieve;
    }
    if (currentStep === 'sectionC') {
      return LIKERT_STATEMENTS.every((_, i) => answers[`likert_${i}`]);
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const responses = Object.entries(answers)
        .filter(([, v]) => v)
        .map(([key, value]) => {
          let section = '';
          if (['gender', 'age', 'level', 'submissionFrequency'].includes(key)) section = 'A';
          else if (['storageMethod', 'submissionMethod', 'lostAssignment', 'corruptedFlash', 'unableRetrieve'].includes(key)) section = 'B';
          else section = 'C';

          return {
            user_id: user.id,
            section,
            question_key: key,
            answer: value,
          };
        });

      const { error } = await supabase.from('research_responses').insert(responses);
      if (error) throw error;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      useAuthStore.setState({ user: { ...user, onboarding_completed: true } });
      localStorage.removeItem('tatu_pending_onboarding');
      addToast('Questionnaire submitted successfully!', 'success');
      setStep(4);
    } catch (err) {
      console.error('Onboarding submit error:', err);
      addToast('Failed to submit. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  const next = () => {
    if (currentStep === 'sectionC') {
      handleSubmit();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <Container>
      <Card>
        <ProgressBar>
          {STEPS.map((_, i) => (
            <ProgressDot key={i} $done={i < step} $active={i === step} />
          ))}
        </ProgressBar>

        {currentStep === 'intro' && (
          <StepContent key="intro">
            <IntroLogo>
              <GraduationCap size={34} strokeWidth={2.5} />
            </IntroLogo>
            <SectionBadge>Research Study</SectionBadge>
            <Title>Welcome, Student</Title>
            <Subtitle>
              Designing an Online Submission System to Improve Storage and Retrieval of Students' Academic Files
            </Subtitle>
            <IntroText>
              This questionnaire collects information about the current methods you use to store
              and submit academic files. Your responses will be treated with strict confidentiality
              and used solely for academic purposes.
            </IntroText>
            <IntroText style={{ fontSize: '0.85rem', color: '#8a7568' }}>
              This questionnaire is <strong>mandatory</strong> and must be completed before you can
              access the platform. It will only take a few minutes.
            </IntroText>
            <ButtonRow>
              <NextBtn onClick={next}>
                Begin Questionnaire <ArrowRight size={18} />
              </NextBtn>
            </ButtonRow>
          </StepContent>
        )}

        {currentStep === 'sectionA' && (
          <StepContent key="sectionA">
            <SectionBadge>Section A</SectionBadge>
            <Title>Demographic Information</Title>

            <QuestionGroup>
              <QuestionLabel>1. Gender</QuestionLabel>
              <OptionsGrid>
                {['Male', 'Female'].map(opt => (
                  <OptionBtn key={opt} $selected={answers.gender === opt} onClick={() => set('gender', opt)}>
                    <Radio $selected={answers.gender === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>2. Age</QuestionLabel>
              <OptionsGrid>
                {['18–20', '21–23', '24–26', 'Above 26'].map(opt => (
                  <OptionBtn key={opt} $selected={answers.age === opt} onClick={() => set('age', opt)}>
                    <Radio $selected={answers.age === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>3. Level</QuestionLabel>
              <OptionsGrid>
                {['Level 100', 'Level 200', 'Level 300', 'Level 400'].map(opt => (
                  <OptionBtn key={opt} $selected={answers.level === opt} onClick={() => set('level', opt)}>
                    <Radio $selected={answers.level === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>4. How often do you submit practical assignments?</QuestionLabel>
              <OptionsGrid>
                {['Weekly', 'Bi-weekly', 'Monthly', 'Occasionally'].map(opt => (
                  <OptionBtn key={opt} $selected={answers.submissionFrequency === opt} onClick={() => set('submissionFrequency', opt)}>
                    <Radio $selected={answers.submissionFrequency === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <ButtonRow>
              <BackBtn onClick={() => setStep(0)}><ArrowLeft size={18} /> Back</BackBtn>
              <NextBtn $disabled={!canProceed()} onClick={next}>
                Next Section <ArrowRight size={18} />
              </NextBtn>
            </ButtonRow>
          </StepContent>
        )}

        {currentStep === 'sectionB' && (
          <StepContent key="sectionB">
            <SectionBadge>Section B</SectionBadge>
            <Title>Current Storage Practices</Title>

            <QuestionGroup>
              <QuestionLabel>5. Which storage method do you use most frequently?</QuestionLabel>
              <OptionsGrid>
                {['Flash Drive', 'Laptop Storage', 'External Hard Drive', 'Google Drive', 'OneDrive', 'Other'].map(opt => (
                  <OptionBtn key={opt} $selected={answers.storageMethod === opt} onClick={() => set('storageMethod', opt)}>
                    <Radio $selected={answers.storageMethod === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>6. How do you usually submit assignments?</QuestionLabel>
              <OptionsGrid>
                {['Flash Drive', 'CD/DVD', 'Email', 'WhatsApp', 'Google Classroom', 'Other'].map(opt => (
                  <OptionBtn key={opt} $selected={answers.submissionMethod === opt} onClick={() => set('submissionMethod', opt)}>
                    <Radio $selected={answers.submissionMethod === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>7. Have you ever lost an assignment or project file?</QuestionLabel>
              <OptionsGrid>
                {['Yes', 'No'].map(opt => (
                  <OptionBtn key={opt} $selected={answers.lostAssignment === opt} onClick={() => set('lostAssignment', opt)}>
                    <Radio $selected={answers.lostAssignment === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>8. Have you ever experienced a corrupted flash drive?</QuestionLabel>
              <OptionsGrid>
                {['Yes', 'No'].map(opt => (
                  <OptionBtn key={opt} $selected={answers.corruptedFlash === opt} onClick={() => set('corruptedFlash', opt)}>
                    <Radio $selected={answers.corruptedFlash === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>9. Have you ever been unable to retrieve an old assignment?</QuestionLabel>
              <OptionsGrid>
                {['Yes', 'No'].map(opt => (
                  <OptionBtn key={opt} $selected={answers.unableRetrieve === opt} onClick={() => set('unableRetrieve', opt)}>
                    <Radio $selected={answers.unableRetrieve === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <ButtonRow>
              <BackBtn onClick={() => setStep(1)}><ArrowLeft size={18} /> Back</BackBtn>
              <NextBtn $disabled={!canProceed()} onClick={next}>
                Next Section <ArrowRight size={18} />
              </NextBtn>
            </ButtonRow>
          </StepContent>
        )}

        {currentStep === 'sectionC' && (
          <StepContent key="sectionC">
            <SectionBadge>Section C</SectionBadge>
            <Title>Challenges</Title>
            <Subtitle style={{ marginBottom: '1rem' }}>
              Please indicate your level of agreement with each statement.
            </Subtitle>

            <LikertTable>
              <LikertHeader>
                <LikertHeaderLabel />
                <LikertHeaderOptions>
                  {LIKERT_LABELS.map(l => (
                    <LikertHeaderCell key={l}>{l}</LikertHeaderCell>
                  ))}
                </LikertHeaderOptions>
              </LikertHeader>

              {LIKERT_STATEMENTS.map((stmt, i) => (
                <LikertRow key={i}>
                  <LikertStatement>{`${i + 1}. ${stmt}`}</LikertStatement>
                  <LikertOptions>
                    {LIKERT_LABELS.map((label, li) => (
                      <LikertBtn
                        key={label}
                        $selected={answers[`likert_${i}`] === label}
                        onClick={() => set(`likert_${i}`, label)}
                        title={label === 'SA' ? 'Strongly Agree' : label === 'A' ? 'Agree' : label === 'N' ? 'Neutral' : label === 'D' ? 'Disagree' : 'Strongly Disagree'}
                      >
                        {label}
                      </LikertBtn>
                    ))}
                  </LikertOptions>
                </LikertRow>
              ))}
            </LikertTable>

            <ButtonRow>
              <BackBtn onClick={() => setStep(2)}><ArrowLeft size={18} /> Back</BackBtn>
              <NextBtn $disabled={!canProceed() || submitting} onClick={next}>
                {submitting ? 'Submitting...' : 'Submit Questionnaire'} <CheckCircle size={18} />
              </NextBtn>
            </ButtonRow>
          </StepContent>
        )}

        {currentStep === 'done' && (
          <StepContent key="done">
            <CheckIcon>
              <CheckCircle size={40} />
            </CheckIcon>
            <CompletionTitle>Thank You!</CompletionTitle>
            <CompletionText>
              Your responses have been recorded successfully. You can now access the full
              platform and begin using the online submission system.
            </CompletionText>
            <GoToDashBtn onClick={() => navigate('/')}>
              Go to Dashboard
            </GoToDashBtn>
          </StepContent>
        )}
      </Card>
    </Container>
  );
};

export default OnboardingWizard;
