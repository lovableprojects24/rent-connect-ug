import { supabase } from '@/integrations/supabase/client';

export interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: number;
  steps_completed: {
    system_setup: boolean;
    manager_creation: boolean;
    property_setup: boolean;
    tenant_registration: boolean;
    lease_creation: boolean;
    payment_config: boolean;
  };
  system_name: string | null;
  system_contact: string | null;
  default_rent_due_day: number;
  payment_methods: string[];
  completed_at: string | null;
}

const STEP_KEYS = [
  'system_setup',
  'manager_creation',
  'property_setup',
  'tenant_registration',
  'lease_creation',
  'payment_config',
] as const;

export const onboardingService = {
  async get(userId: string): Promise<OnboardingProgress | null> {
    const { data } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return data as OnboardingProgress | null;
  },

  async create(userId: string): Promise<OnboardingProgress> {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .insert({ user_id: userId } as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as OnboardingProgress;
  },

  async completeStep(
    userId: string,
    stepIndex: number,
    extraUpdates: Record<string, any> = {}
  ): Promise<OnboardingProgress> {
    const current = await this.get(userId);
    if (!current) throw new Error('No onboarding record found');

    const stepKey = STEP_KEYS[stepIndex];
    const updatedSteps = { ...current.steps_completed, [stepKey]: true };
    const allDone = STEP_KEYS.every((k) => updatedSteps[k]);

    const { data, error } = await supabase
      .from('onboarding_progress')
      .update({
        steps_completed: updatedSteps,
        current_step: allDone ? 7 : Math.max(current.current_step, stepIndex + 2),
        completed_at: allDone ? new Date().toISOString() : null,
        ...extraUpdates,
      } as any)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as OnboardingProgress;
  },

  isComplete(progress: OnboardingProgress | null): boolean {
    return progress?.completed_at != null;
  },
};
