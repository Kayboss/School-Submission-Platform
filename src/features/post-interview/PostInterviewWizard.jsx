import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { ClipboardCheck, ArrowRight, ArrowLeft, CheckCircle, Star } from 'lucide-react';

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
  max-width: 700px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.premium};
  border: 1px solid rgba(179, 90, 56, 0.1);
  padding: 2.5rem;
  animation: ${fadeIn} 0.5s ease;
  max-height: 90vh;
  overflow-y: auto;

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

const LikertLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.2rem;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: 1.25rem;
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const LegendDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.85rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border + '60'};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.main};
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    font-weight: 500;
  }
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

const LIKERT_LABELS = ['SA', 'A', 'N', 'D', 'SD'];

const STUDENT_SECTIONS = {
  A: [
    'The system was easy to learn.',
    'The interface was user-friendly.',
    'Uploading files was easy.',
    'Retrieving files was easy.',
    'Navigation between pages was simple.',
    'The system responded quickly.',
  ],
  B: [
    'The system reduced my dependence on flash drives.',
    'The system improved assignment submission.',
    'The system provides secure storage for assignments.',
    'The system improved my organization of academic files.',
    'I would continue using this system.',
  ],
  C: [
    'The system solved the storage problems I previously experienced.',
    'The system made retrieval of assignments easier.',
    'The system is more convenient than flash drives.',
    'The system should replace existing submission methods.',
    'Overall, the system improved the management of academic files.',
  ],
};

const STUDENT_SATISFACTION_OPTIONS = ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'];
const YES_NO_OPTIONS = ['Yes', 'No'];

const LECTURER_SECTIONS = {
  B: [
    'The system simplified assignment collection.',
    'Organizing student submissions became easier.',
    'Retrieving submitted assignments was efficient.',
    'The system reduced administrative workload.',
    'The dashboard was easy to use.',
    'Student submissions were well organized.',
    'The system is suitable for departmental use.',
    'The system improved the management of students\' academic files.',
    'I would recommend continued use of the system.',
  ],
};

const TEACHING_EXPERIENCE_OPTIONS = ['Less than 5 years', '5–10 years', 'Above 10 years'];

const PostInterviewWizard = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.addToast);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isLecturer = user?.role === 'lecturer';

  const studentSteps = ['intro', 'sectionA', 'sectionB', 'sectionC', 'sectionD', 'sectionE', 'done'];
  const lecturerSteps = ['intro', 'sectionA', 'sectionB', 'sectionC', 'done'];
  const STEPS = isLecturer ? lecturerSteps : studentSteps;

  const [answers, setAnswers] = useState(() => {
    const init = {};
    if (!isLecturer) {
      STUDENT_SECTIONS.A.forEach((_, i) => { init[`sa_${i}`] = ''; });
      STUDENT_SECTIONS.B.forEach((_, i) => { init[`sb_${i}`] = ''; });
      STUDENT_SECTIONS.C.forEach((_, i) => { init[`sc_${i}`] = ''; });
      init.satisfaction = '';
      init.recommend = '';
      init.liked_most = '';
      init.improvements = '';
    } else {
      init.gender = '';
      init.teaching_experience = '';
      LECTURER_SECTIONS.B.forEach((_, i) => { init[`sb_${i}`] = ''; });
      init.strengths = '';
      init.improvements = '';
    }
    return init;
  });

  const set = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));
  const currentStep = STEPS[step];

  const canProceed = () => {
    if (currentStep === 'intro') return true;
    if (!isLecturer) {
      if (currentStep === 'sectionA') return STUDENT_SECTIONS.A.every((_, i) => answers[`sa_${i}`]);
      if (currentStep === 'sectionB') return STUDENT_SECTIONS.B.every((_, i) => answers[`sb_${i}`]);
      if (currentStep === 'sectionC') return STUDENT_SECTIONS.C.every((_, i) => answers[`sc_${i}`]);
      if (currentStep === 'sectionD') return answers.satisfaction && answers.recommend;
      if (currentStep === 'sectionE') return true;
    } else {
      if (currentStep === 'sectionA') return answers.gender && answers.teaching_experience;
      if (currentStep === 'sectionB') return LECTURER_SECTIONS.B.every((_, i) => answers[`sb_${i}`]);
      if (currentStep === 'sectionC') return true;
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
          if (!isLecturer) {
            if (key.startsWith('sa_')) section = 'A';
            else if (key.startsWith('sb_')) section = 'B';
            else if (key.startsWith('sc_')) section = 'C';
            else if (['satisfaction', 'recommend'].includes(key)) section = 'D';
            else section = 'E';
          } else {
            if (['gender', 'teaching_experience'].includes(key)) section = 'A';
            else if (key.startsWith('sb_')) section = 'B';
            else section = 'C';
          }
          return {
            user_id: user.id,
            role: user.role,
            section,
            question_key: key,
            answer: value,
          };
        });

      const { error } = await supabase.from('post_interview_responses').insert(responses);
      if (error) throw error;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ post_interview_completed: true })
        .eq('id', user.id);
      if (profileError) throw profileError;

      useAuthStore.setState({ user: { ...user, post_interview_completed: true } });
      addToast('Thank you for your feedback!', 'success');
      setStep(STEPS.length - 1);
    } catch (err) {
      console.error('Post-interview submit error:', err);
      addToast('Failed to submit. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  const next = () => {
    if (currentStep === STEPS[STEPS.length - 2]) {
      handleSubmit();
    } else {
      setStep(s => s + 1);
    }
  };

  const renderLikertSection = (statements, prefix, sectionLabel, sectionTitle) => (
    <StepContent key={currentStep}>
      <SectionBadge>{sectionLabel}</SectionBadge>
      <Title>{sectionTitle}</Title>
      <Subtitle style={{ marginBottom: '1rem' }}>
        Please indicate your level of agreement with each statement.
      </Subtitle>

      <LikertLegend>
        <LegendItem><LegendDot $color="#4a7c59" /> <strong>SA</strong>&nbsp;= Strongly Agree</LegendItem>
        <LegendItem><LegendDot $color="#6a9f78" /> <strong>A</strong>&nbsp;= Agree</LegendItem>
        <LegendItem><LegendDot $color="#daa520" /> <strong>N</strong>&nbsp;= Neutral</LegendItem>
        <LegendItem><LegendDot $color="#d4856a" /> <strong>D</strong>&nbsp;= Disagree</LegendItem>
        <LegendItem><LegendDot $color="#b35a38" /> <strong>SD</strong>&nbsp;= Strongly Disagree</LegendItem>
      </LikertLegend>

      <LikertTable>
        <LikertHeader>
          <LikertHeaderLabel />
          <LikertHeaderOptions>
            {LIKERT_LABELS.map(l => (
              <LikertHeaderCell key={l}>{l}</LikertHeaderCell>
            ))}
          </LikertHeaderOptions>
        </LikertHeader>
        {statements.map((stmt, i) => (
          <LikertRow key={i}>
            <LikertStatement>{`${i + 1}. ${stmt}`}</LikertStatement>
            <LikertOptions>
              {LIKERT_LABELS.map(label => (
                <LikertBtn
                  key={label}
                  $selected={answers[`${prefix}_${i}`] === label}
                  onClick={() => set(`${prefix}_${i}`, label)}
                >
                  {label}
                </LikertBtn>
              ))}
            </LikertOptions>
          </LikertRow>
        ))}
      </LikertTable>
      <ButtonRow>
        <BackBtn onClick={() => setStep(step - 1)}><ArrowLeft size={18} /> Back</BackBtn>
        <NextBtn $disabled={!canProceed()} onClick={next}>
          Next Section <ArrowRight size={18} />
        </NextBtn>
      </ButtonRow>
    </StepContent>
  );

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
              <ClipboardCheck size={34} strokeWidth={2.5} />
            </IntroLogo>
            <SectionBadge>{isLecturer ? 'Lecturer' : 'Student'} Feedback</SectionBadge>
            <Title>Post-Intervention Questionnaire</Title>
            <Subtitle>
              {isLecturer
                ? 'Please evaluate the Online Submission System based on your experience using it.'
                : 'Please evaluate the Online Submission System based on your experience using it for at least two weeks.'}
            </Subtitle>
            <IntroText>
              Your responses will help us assess the effectiveness of the system and identify areas for improvement.
              All responses are treated with strict confidentiality.
            </IntroText>
            <ButtonRow>
              <NextBtn onClick={next}>
                Begin Questionnaire <ArrowRight size={18} />
              </NextBtn>
            </ButtonRow>
          </StepContent>
        )}

        {!isLecturer && currentStep === 'sectionA' && renderLikertSection(
          STUDENT_SECTIONS.A, 'sa', 'Section A', 'System Usability'
        )}

        {!isLecturer && currentStep === 'sectionB' && renderLikertSection(
          STUDENT_SECTIONS.B, 'sb', 'Section B', 'Perceived Usefulness'
        )}

        {!isLecturer && currentStep === 'sectionC' && renderLikertSection(
          STUDENT_SECTIONS.C, 'sc', 'Section C', 'Effectiveness'
        )}

        {!isLecturer && currentStep === 'sectionD' && (
          <StepContent key="sectionD">
            <SectionBadge>Section D</SectionBadge>
            <Title>Satisfaction</Title>

            <QuestionGroup>
              <QuestionLabel>1. Overall, how satisfied are you with the Online Submission System?</QuestionLabel>
              <OptionsGrid>
                {STUDENT_SATISFACTION_OPTIONS.map(opt => (
                  <OptionBtn key={opt} $selected={answers.satisfaction === opt} onClick={() => set('satisfaction', opt)}>
                    <Radio $selected={answers.satisfaction === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>2. Would you recommend this system for future use?</QuestionLabel>
              <OptionsGrid>
                {YES_NO_OPTIONS.map(opt => (
                  <OptionBtn key={opt} $selected={answers.recommend === opt} onClick={() => set('recommend', opt)}>
                    <Radio $selected={answers.recommend === opt} /> {opt}
                  </OptionBtn>
                ))}
              </OptionsGrid>
            </QuestionGroup>

            <ButtonRow>
              <BackBtn onClick={() => setStep(step - 1)}><ArrowLeft size={18} /> Back</BackBtn>
              <NextBtn $disabled={!canProceed()} onClick={next}>
                Next Section <ArrowRight size={18} />
              </NextBtn>
            </ButtonRow>
          </StepContent>
        )}

        {!isLecturer && currentStep === 'sectionE' && (
          <StepContent key="sectionE">
            <SectionBadge>Section E</SectionBadge>
            <Title>Open-Ended Questions</Title>
            <Subtitle style={{ marginBottom: '1rem' }}>
              Please share your thoughts in your own words.
            </Subtitle>

            <QuestionGroup>
              <QuestionLabel>1. What did you like most about the system?</QuestionLabel>
              <TextArea
                value={answers.liked_most}
                onChange={e => set('liked_most', e.target.value)}
                placeholder="Share what you enjoyed about the system..."
              />
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>2. What improvements would you recommend?</QuestionLabel>
              <TextArea
                value={answers.improvements}
                onChange={e => set('improvements', e.target.value)}
                placeholder="Suggest any improvements..."
              />
            </QuestionGroup>

            <ButtonRow>
              <BackBtn onClick={() => setStep(step - 1)}><ArrowLeft size={18} /> Back</BackBtn>
              <NextBtn $disabled={submitting} onClick={next}>
                {submitting ? 'Submitting...' : 'Submit Questionnaire'} <CheckCircle size={18} />
              </NextBtn>
            </ButtonRow>
          </StepContent>
        )}

        {isLecturer && currentStep === 'sectionA' && (
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
              <QuestionLabel>2. Teaching Experience</QuestionLabel>
              <OptionsGrid>
                {TEACHING_EXPERIENCE_OPTIONS.map(opt => (
                  <OptionBtn key={opt} $selected={answers.teaching_experience === opt} onClick={() => set('teaching_experience', opt)}>
                    <Radio $selected={answers.teaching_experience === opt} /> {opt}
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

        {isLecturer && currentStep === 'sectionB' && renderLikertSection(
          LECTURER_SECTIONS.B, 'sb', 'Section B', 'System Evaluation'
        )}

        {isLecturer && currentStep === 'sectionC' && (
          <StepContent key="sectionC">
            <SectionBadge>Section C</SectionBadge>
            <Title>Open-Ended Questions</Title>
            <Subtitle style={{ marginBottom: '1rem' }}>
              Please share your thoughts in your own words.
            </Subtitle>

            <QuestionGroup>
              <QuestionLabel>1. What are the major strengths of the Online Submission System?</QuestionLabel>
              <TextArea
                value={answers.strengths}
                onChange={e => set('strengths', e.target.value)}
                placeholder="Describe the system's strengths..."
              />
            </QuestionGroup>

            <QuestionGroup>
              <QuestionLabel>2. What improvements would you recommend before full implementation?</QuestionLabel>
              <TextArea
                value={answers.improvements}
                onChange={e => set('improvements', e.target.value)}
                placeholder="Suggest improvements..."
              />
            </QuestionGroup>

            <ButtonRow>
              <BackBtn onClick={() => setStep(step - 1)}><ArrowLeft size={18} /> Back</BackBtn>
              <NextBtn $disabled={submitting} onClick={next}>
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
              Your feedback has been recorded successfully. It will help us improve the system for everyone.
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

export default PostInterviewWizard;
