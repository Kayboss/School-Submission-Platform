import { supabase } from './supabase';
import { parseUserAgent, getLocation } from '../utils/deviceInfo';

let cachedLocation = null;

async function getLocationCached() {
  if (cachedLocation) return cachedLocation;
  cachedLocation = await getLocation();
  return cachedLocation;
}

// Log a user action to the activity_log table
export async function logActivity(action, entityType = null, entityId = null, metadata = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  const ua = navigator.userAgent;
  const device = parseUserAgent(ua);
  const location = await getLocationCached();

  supabase.from('activity_log').insert({
    user_id: session.user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: { ...metadata, ...device, ...location },
    user_agent: ua
  }).then(({ error }) => {
    if (error) console.error('Activity log error:', error);
  });
}

// Track login session
export async function startSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const ua = navigator.userAgent;
    const device = parseUserAgent(ua);
    const location = await getLocationCached();

    const { data, error } = await supabase.from('user_sessions').insert({
      user_id: session.user.id,
      user_agent: ua,
      metadata: { ...device, ...location }
    }).select('id').single();

    if (error) return null;
    return data?.id || null;
  } catch (e) {
    return null;
  }
}

// Track logout session
export async function endSession(sessionId) {
  if (!sessionId) return;
  try {
    const duration = 0;
    await supabase
      .from('user_sessions')
      .update({ logout_at: new Date().toISOString(), duration_seconds: duration })
      .eq('id', sessionId);
  } catch (e) {
    // silently fail
  }
}

// Predefined action constants
export const ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PAGE_VIEW: 'page_view',
  SUBMIT_ASSIGNMENT: 'submit_assignment',
  GRADE_SUBMISSION: 'grade_submission',
  CREATE_ASSIGNMENT: 'create_assignment',
  CREATE_COURSE: 'create_course',
  ACCEPT_COURSE: 'accept_course',
  DOWNLOAD_FILE: 'download_file',
  EXPORT_CSV: 'export_csv',
  UPDATE_SETTINGS: 'update_settings',
  VIEW_RUBRIC: 'view_rubric',
  RESUBMIT: 'resubmit'
};
