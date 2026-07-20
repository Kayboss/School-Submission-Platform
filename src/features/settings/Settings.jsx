import React, { useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { User, Bell, Shield, Save, Moon, Sun, Loader } from 'lucide-react';

const Container = styled.div` padding: 1rem; `;

const Header = styled.div` margin-bottom: 2.5rem; `;

const Title = styled.h2`
  font-size: 2.25rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem; letter-spacing: -1px;
  @media (max-width: 600px) { font-size: 1.5rem; }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.muted}; font-size: 1.125rem; font-weight: 500;
`;

const Grid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; @media (max-width: 768px) { grid-template-columns: 1fr; } `;

const Card = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 2rem; box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.border}20;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem; font-weight: 800; margin-bottom: 1.5rem;
  display: flex; align-items: center; gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.main};
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1.25rem;
`;

const Label = styled.label`
  font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Input = styled.input`
  padding: 0.75rem 1rem; border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9rem; font-weight: 600;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const Select = styled.select`
  padding: 0.75rem 1rem; border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9rem; font-weight: 600; background: white; cursor: pointer;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ToggleRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 0; border-bottom: 1px solid ${({ theme }) => theme.colors.background.alt};
  &:last-child { border-bottom: none; }
`;

const ToggleLabel = styled.div`
  font-weight: 700; font-size: 0.9rem; color: ${({ theme }) => theme.colors.text.main};
`;

const ToggleDesc = styled.p`
  font-size: 0.775rem; color: #55433c; font-weight: 600; margin-top: 2px;
`;

const ToggleSwitch = styled.div`
  width: 40px; height: 22px; background: ${({ $on, theme }) => $on ? theme.colors.primary : theme.colors.border};
  border-radius: 11px; position: relative; cursor: pointer; transition: background 0.3s;
  &::after {
    content: ''; width: 18px; height: 18px; border-radius: 50%;
    background: white; position: absolute; top: 2px;
    left: ${({ $on }) => $on ? '20px' : '2px'}; transition: left 0.3s;
  }
`;

const SaveBtn = styled.button`
  background: ${({ theme, disabled }) => disabled ? theme.colors.border : theme.colors.primary}; color: white;
  padding: 0.875rem 2rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 800; font-size: 0.9375rem;
  display: flex; align-items: center; gap: 0.75rem; margin-top: 1.5rem;
  box-shadow: ${({ disabled, theme }) => disabled ? 'none' : `0 6px 16px ${theme.colors.primary}40`};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  &:hover { transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-2px)'}; }
`;

const Badge = styled.span`
  display: inline-block; padding: 0.25rem 0.625rem; border-radius: 6px;
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
`;

const Settings = () => {
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const addToast = useToastStore(s => s.addToast);

  const defaultNotifs = { email: true, sms: false, gradeAlerts: true };
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(user?.notification_preferences || defaultNotifs);
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({ name, email });
    // Save preferences separately so missing columns don't break name/email update
    await supabase.from('profiles').update({ notification_preferences: notifications, theme }).eq('id', user?.id);
    addToast('Settings saved successfully', 'success');
    setTimeout(() => setIsSaving(false), 600);
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      addToast('Please fill in both password fields', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      addToast(error.message || 'Failed to update password', 'error');
    } else {
      addToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
    }
    setIsUpdatingPassword(false);
  };

  return (
    <Container>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Manage your account preferences and notifications.</Subtitle>
      </Header>

      <Grid>
        <div>
          <Card>
            <CardTitle><User size={22} color="#b35a38" /> Profile</CardTitle>
            <FormGroup>
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Institutional Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Role</Label>
              <Input value={user?.role || ''} disabled style={{ opacity: 0.6 }} />
            </FormGroup>
            <FormGroup>
              <Label>Institution</Label>
              <Input value={user?.institution || 'Tamale Technical University'} disabled style={{ opacity: 0.6 }} />
            </FormGroup>
            <SaveBtn onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader className="spin" size={18} /> : <Save size={18} />} Save Changes</SaveBtn>
          </Card>

          <Card style={{ marginTop: '1.5rem' }}>
            <CardTitle><Shield size={22} color="#b35a38" /> Security</CardTitle>
            <FormGroup>
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </FormGroup>
            <SaveBtn onClick={handlePasswordUpdate} disabled={isUpdatingPassword}>
              {isUpdatingPassword ? <Loader className="spin" size={18} /> : <Shield size={18} />} Update Password
            </SaveBtn>
          </Card>
        </div>

        <div>
          <Card>
            <CardTitle><Bell size={22} color="#b35a38" /> Notifications</CardTitle>
            <ToggleRow>
              <div>
                <ToggleLabel>Email Notifications</ToggleLabel>
                <ToggleDesc>Receive submission confirmations via email</ToggleDesc>
              </div>
              <ToggleSwitch $on={notifications.email} onClick={() => { const v = !notifications.email; setNotifications(p => ({ ...p, email: v })); supabase.from('profiles').update({ notification_preferences: { ...notifications, email: v } }).eq('id', user?.id); }} />
            </ToggleRow>
            <ToggleRow>
              <div>
                <ToggleLabel>SMS Alerts</ToggleLabel>
                <ToggleDesc>Get text messages for urgent updates</ToggleDesc>
              </div>
              <ToggleSwitch $on={notifications.sms} onClick={() => { const v = !notifications.sms; setNotifications(p => ({ ...p, sms: v })); supabase.from('profiles').update({ notification_preferences: { ...notifications, sms: v } }).eq('id', user?.id); }} />
            </ToggleRow>
            <ToggleRow>
              <div>
                <ToggleLabel>Grade Alerts</ToggleLabel>
                <ToggleDesc>Notify when submissions are graded</ToggleDesc>
              </div>
              <ToggleSwitch $on={notifications.gradeAlerts} onClick={() => { const v = !notifications.gradeAlerts; setNotifications(p => ({ ...p, gradeAlerts: v })); supabase.from('profiles').update({ notification_preferences: { ...notifications, gradeAlerts: v } }).eq('id', user?.id); }} />
            </ToggleRow>
          </Card>

          <Card style={{ marginTop: '1.5rem' }}>
            <CardTitle>{theme === 'light' ? <Sun size={22} color="#b35a38" /> : <Moon size={22} color="#b35a38" />} Preferences</CardTitle>
            <FormGroup>
              <Label>Theme</Label>
              <Select value={theme} onChange={e => { setTheme(e.target.value); supabase.from('profiles').update({ theme: e.target.value }).eq('id', user?.id); }}>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode (coming soon)</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Language</Label>
              <Select>
                <option value="en">English</option>
              </Select>
            </FormGroup>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Badge>Version 1.0.0</Badge>
              <Badge>Build 2026</Badge>
            </div>
          </Card>
        </div>
      </Grid>
    </Container>
  );
};

export default Settings;
